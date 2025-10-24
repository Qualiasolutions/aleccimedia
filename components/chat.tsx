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
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
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
  const [selectedBot, setSelectedBot] = useState<BotType>("alexandria");
  const currentModelIdRef = useRef(currentModelId);
  const selectedBotRef = useRef(selectedBot);

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

  const {
    messages,
    setMessages,
    sendMessage,
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
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            selectedBotType: selectedBotRef.current,
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
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#fce7f3_0%,_#f9f6ff_35%,_#f6f9ff_70%,_#f3f4ff_100%)]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[-16%] h-[28rem] w-[28rem] rounded-full bg-rose-200/50 blur-[160px]" />
          <div className="absolute top-[-12%] right-[-10%] h-[24rem] w-[24rem] rounded-full bg-amber-200/40 blur-[150px]" />
          <div className="-translate-x-1/2 absolute bottom-[-20%] left-[30%] h-[26rem] w-[26rem] rounded-full bg-rose-300/30 blur-[160px]" />
          <div className="absolute right-[25%] bottom-[-22%] h-[28rem] w-[28rem] translate-x-1/3 rounded-full bg-sky-200/30 blur-[180px]" />
        </div>

        <div className="flex h-full w-full flex-col">
          {/* Chat Controls - Sticky Header */}
          <div className="z-10 flex h-auto min-h-[44px] flex-shrink-0 items-center bg-gradient-to-b from-white/95 to-transparent px-2 py-1.5 backdrop-blur-xl transition-shadow duration-300 sm:min-h-[52px] sm:px-4 sm:py-2 lg:px-6">
            <div className="w-full">
              <div className="rounded-xl border border-white/60 bg-white/80 p-1.5 shadow-md shadow-rose-200/40 backdrop-blur-xl sm:rounded-[16px] sm:p-2 lg:p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                  {/* Left side - Sidebar and controls */}
                  <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                    <SidebarToggle />

                    {/* New Chat Button */}
                    {(!open || windowWidth < 768) && (
                      <Button
                        className="hover:-translate-y-0.5 h-6 rounded-full border border-white/70 bg-white/85 px-2 font-medium text-[10px] text-slate-600 shadow-rose-100/40 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md sm:h-7 sm:px-3 sm:text-xs"
                        onClick={() => {
                          router.push("/");
                          router.refresh();
                        }}
                        variant="outline"
                      >
                        <PlusIcon />
                        <span className="ml-2 hidden md:inline">New Chat</span>
                        <span className="md:sr-only">New Chat</span>
                      </Button>
                    )}

                    {!isReadonly && (
                      <VisibilitySelector
                        chatId={id}
                        selectedVisibilityType={visibilityType}
                      />
                    )}
                  </div>

                  {/* Right side - Executive selector */}
                  <div className="min-w-0 max-w-[110px] flex-1 sm:max-w-[180px] lg:max-w-md">
                    <ExecutiveSwitch
                      onExecutiveChange={handleBotChange}
                      selectedExecutive={selectedBot}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="h-full overflow-auto px-2 pb-1 sm:px-4 lg:px-6">
                <ExecutiveLanding
                  onSelect={handleBotChange}
                  selectedBot={selectedBot}
                />
              </div>
            ) : (
              <div className="h-full overflow-hidden px-2 pb-1 sm:px-3 lg:px-4">
                <div className="mx-auto h-full w-full max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
                  <Messages
                    chatId={id}
                    className="h-full px-1 py-2 sm:px-3 lg:px-4"
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
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 px-2 pt-1 pb-1.5 sm:px-3 sm:pt-1 sm:pb-2 lg:px-4">
            {!isReadonly && (
              <div className="mx-auto max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
                <MultimodalInput
                  attachments={attachments}
                  chatId={id}
                  className="rounded-2xl border border-white/70 bg-white/95 p-2 shadow-lg shadow-rose-200/40 backdrop-blur-xl sm:rounded-[18px] sm:p-2.5 lg:p-3"
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
            )}
          </div>
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
