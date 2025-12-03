"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useWindowSize } from "usehooks-ts";
import { ExecutiveSwitch } from "@/components/executive-switch";
import { SidebarToggle } from "@/components/sidebar-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { BOT_PERSONALITIES, type BotType } from "@/lib/bot-personalities";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { ExecutiveLanding } from "./executive-landing";
import { PlusIcon } from "./icons";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
  initialBotType = "alexandria",
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
  initialBotType?: BotType;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const [selectedBot, setSelectedBot] = useState<BotType>(initialBotType);
  const currentModelIdRef = useRef(currentModelId);
  const selectedBotRef = useRef(initialBotType);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  useEffect(() => {
    selectedBotRef.current = selectedBot;
  }, [selectedBot]);

  // Handler for bot switching with toast notification
  const handleBotChange = (newBot: BotType) => {
    if (newBot !== selectedBot) {
      const personality = BOT_PERSONALITIES[newBot];
      setSelectedBot(newBot);
      toast({
        type: "success",
        description: `Now consulting with ${personality.name} - ${personality.role}`,
      });
    }
  };

  // Create a stable reference to the current bot type for message sending
  const getCurrentBotType = () => selectedBotRef.current;

  // Track the botType that was active when the last message was sent
  // This ensures assistant responses show the correct executive even during streaming
  const [activeBotTypeForStreaming, setActiveBotTypeForStreaming] = useState<BotType>(initialBotType);

  const {
    messages,
    setMessages,
    sendMessage: originalSendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest: (request) => {
        // Capture the current bot type at the exact moment of sending
        const currentBotType = selectedBot;
        // Store this for use during streaming
        setActiveBotTypeForStreaming(currentBotType);
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            selectedBotType: currentBotType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });

  // Wrap sendMessage to capture the botType at send time
  const sendMessage = (message: Parameters<typeof originalSendMessage>[0]) => {
    setActiveBotTypeForStreaming(selectedBot);
    return originalSendMessage(message);
  };

  // Sync selectedBot with incoming assistant messages
  useEffect(() => {
    const lastAssistantMessage = messages
      .filter((msg) => msg.role === "assistant")
      .at(-1);

    if (lastAssistantMessage?.metadata?.botType) {
      const messageBotType = lastAssistantMessage.metadata.botType as BotType;
      if (messageBotType !== selectedBot) {
        setSelectedBot(messageBotType);
      }
    }
  }, [messages, selectedBot]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/80">
        {/* Subtle ambient gradient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-rose-100/30 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-amber-50/40 blur-[100px]" />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col">
          {/* Refined Header */}
          <header className="flex-shrink-0 border-stone-200/60 border-b bg-white/95 backdrop-blur-sm">
            <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:h-18 sm:px-6">
              {/* Left: Brand + Navigation */}
              <div className="flex items-center gap-3 sm:gap-4">
                <SidebarToggle />
                <div className="hidden items-center gap-2 sm:flex">

                </div>
                {(!open || windowWidth < 768) && (
                  <Button
                    className="h-9 gap-2 rounded-lg border-stone-200 bg-white px-3 font-medium text-stone-600 text-sm shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50"
                    onClick={() => {
                      router.push("/");
                      router.refresh();
                    }}
                    variant="outline"
                  >
                    <PlusIcon />
                    <span className="hidden sm:inline">New Chat</span>
                  </Button>
                )}
              </div>

              {/* Center: Executive Selector - More Prominent */}
              <div className="flex flex-1 items-center justify-center">
                <ExecutiveSwitch
                  onExecutiveChange={handleBotChange}
                  selectedExecutive={selectedBot}
                />
              </div>

              {/* Right: Visibility */}
              <div className="flex items-center gap-2">
                {!isReadonly && (
                  <VisibilitySelector
                    chatId={id}
                    selectedVisibilityType={visibilityType}
                  />
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="h-full overflow-auto">
                <ExecutiveLanding
                  onSelect={handleBotChange}
                  selectedBot={selectedBot}
                />
              </div>
            ) : (
              <div className="h-full w-full overflow-hidden">
                <Messages
                  chatId={id}
                  className="h-full"
                  isArtifactVisible={isArtifactVisible}
                  isReadonly={isReadonly}
                  messages={messages}
                  regenerate={regenerate}
                  selectedBotType={selectedBot}
                  selectedModelId={initialChatModel}
                  setMessages={setMessages}
                  status={status}
                  votes={votes}
                />
              </div>
            )}
          </main>

          {/* Input Area - Floating */}
          {!isReadonly && (
            <div className="flex-shrink-0 border-stone-200/40 border-t bg-gradient-to-t from-white via-white to-transparent px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
              <div className="w-full">
                <MultimodalInput
                  attachments={attachments}
                  chatId={id}
                  input={input}
                  messages={messages}
                  onModelChange={setCurrentModelId}
                  selectedModelId={currentModelId}
                  selectedVisibilityType={visibilityType}
                  sendMessage={sendMessage}
                  setAttachments={setAttachments}
                  setInput={setInput}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                  usage={usage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedBotType={selectedBot}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
