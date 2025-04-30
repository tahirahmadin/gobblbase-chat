import React from "react";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, Theme } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingPhrases from "./otherComponents/LoadingPhrases";

interface ChatSectionProps {
  theme: Theme;
  messages: (ChatMessage & { type?: "booking" })[];
  isLoading: boolean;
  activeScreen: "about" | "chat" | "browse";
  currentConfig: {
    logo?: string;
    name?: string;
  };
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatSection({
  theme,
  messages,
  isLoading,
  activeScreen,
  currentConfig,
  messagesEndRef,
}: ChatSectionProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-2"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        paddingBottom: "150px",
      }}
    >
      {activeScreen === "chat" && (
        <>
          {/* Date Header */}
          <div
            className="text-xs text-center my-4"
            style={{ color: theme.highlightColor }}
          >
            JAN 01, 2025 AT 09:00
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${
                msg.sender === "agent" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 font-medium`}
                style={{
                  backgroundColor:
                    msg.sender === "agent"
                      ? theme.isDark
                        ? "black"
                        : "white"
                      : theme.mainDarkColor,
                  color: !theme.isDark ? "black" : "white",
                }}
              >
                <div className="prose prose-sm max-w-none text-inherit">
                  {msg.sender === "agent" ? (
                    <StreamingText
                      text={msg.content}
                      speed={15}
                      messageId={msg.id}
                    />
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start px-2">
              <div className="rounded-2xl p-3">
                <LoadingPhrases textColor="currentColor" />
              </div>
            </div>
          )}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
