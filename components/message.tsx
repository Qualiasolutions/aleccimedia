"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { BOT_PERSONALITIES, type BotType } from "@/lib/bot-personalities";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { EnhancedChatMessage } from "./enhanced-chat-message";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
  selectedBotType,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  selectedBotType: BotType;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  // Get bot type from message metadata if available
  // For old messages without botType, default to 'alexandria' to preserve history
  const messageBotType =
    message.metadata?.botType ??
    (message.role === "assistant" ? "alexandria" : selectedBotType);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <motion.div
            animate={{ scale: 1, rotate: 0 }}
            className="-mt-1 flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white shadow-rose-200/50 shadow-xl ring-3 ring-white/70 backdrop-blur-sm"
            initial={{ scale: 0, rotate: -180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05 }}
          >
            <SparklesIcon size={18} />
          </motion.div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                if (message.role === "assistant") {
                  // Get executive-specific styling
                  const getExecutiveStyling = () => {
                    switch (messageBotType) {
                      case "alexandria":
                        return {
                          gradient: "from-rose-50 via-pink-50/30 to-rose-50/20",
                          border: "border-rose-200/40",
                          shadow: "shadow-rose-200/30",
                        };
                      case "kim":
                        return {
                          gradient:
                            "from-blue-50 via-indigo-50/30 to-blue-50/20",
                          border: "border-blue-200/40",
                          shadow: "shadow-blue-200/30",
                        };
                      case "collaborative":
                        return {
                          gradient:
                            "from-rose-50 via-purple-50/30 to-indigo-50/20",
                          border: "border-purple-200/40",
                          shadow: "shadow-purple-200/30",
                        };
                      default:
                        return {
                          gradient: "from-white via-rose-50 to-white",
                          border: "border-white/20",
                          shadow: "shadow-rose-200/30",
                        };
                    }
                  };

                  const styling = getExecutiveStyling();

                  return (
                    <motion.div
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      className="w-full"
                      initial={{ opacity: 0, x: -20, y: 10 }}
                      key={key}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      }}
                    >
                      <div className="relative">
                        {/* Executive-specific gradient background */}
                        <div
                          className={cn(
                            "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-50",
                            styling.gradient
                          )}
                        />
                        <div
                          className={cn(
                            "relative rounded-3xl border bg-white/90 p-6 shadow-2xl backdrop-blur-xl",
                            styling.border,
                            styling.shadow
                          )}
                        >
                          <EnhancedChatMessage
                            botType={messageBotType}
                            content={sanitizeText(part.text)}
                            isTyping={isLoading}
                            role="assistant"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex justify-end"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    key={key}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <MessageContent
                      className="w-fit max-w-[min(400px,85vw)] break-words rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 text-right text-sm text-white shadow-2xl shadow-slate-900/40 backdrop-blur-sm"
                      data-testid="message-content"
                    >
                      <div className="relative">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                        <Response className="relative">
                          {sanitizeText(part.text)}
                        </Response>
                      </div>
                    </MessageContent>
                  </motion.div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return false;
  }
);

export const ThinkingMessage = ({
  botType = "alexandria",
}: {
  botType?: BotType;
}) => {
  const role = "assistant";
  const personality =
    BOT_PERSONALITIES[botType] ?? BOT_PERSONALITIES.alexandria;

  const getThinkingText = () => {
    switch (botType) {
      case "alexandria":
        return "Alexandria is crafting a strategy...";
      case "kim":
        return "Kim is analyzing...";
      case "collaborative":
        return "Alexandria & Kim are collaborating...";
      default:
        return "Thinking...";
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-start justify-start gap-3 sm:gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          className="-mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-rose-200/50 ring-2 ring-white/70 sm:size-12"
          transition={{
            duration: botType === "kim" ? 1.2 : 1.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <SparklesIcon size={16} />
        </motion.div>

        <div className="flex w-full flex-col gap-2 sm:gap-3">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            className="rounded-xl border border-white/20 bg-gradient-to-r from-white/90 to-white/80 px-4 py-3 shadow-lg backdrop-blur-sm sm:rounded-2xl sm:px-5 sm:py-4"
            transition={{
              duration: botType === "kim" ? 1.2 : 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 sm:h-2 sm:w-2"
                    key={i}
                    transition={{
                      duration: botType === "kim" ? 0.6 : 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              <span className="font-medium text-slate-600 text-xs sm:text-sm">
                {getThinkingText()}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
