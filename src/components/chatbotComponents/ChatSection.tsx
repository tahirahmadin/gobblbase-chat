import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, Theme } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BrowseSection from "./BrowseSection";

interface ChatSectionProps {
  theme: Theme;
  messages: (ChatMessage & { type?: "booking" })[];
  isLoading: boolean;
  activeScreen: "about" | "chat" | "browse";
  messagesEndRef: React.RefObject<HTMLDivElement>;
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
  };
}

export default function ChatSection({
  theme,
  messages,
  isLoading,
  activeScreen,
  messagesEndRef,
  currentConfig,
}: ChatSectionProps) {
  const [showBookingCard, setShowBookingCard] = useState(false);

  // Function to check if message contains booking-related keywords
  const containsBookingKeywords = (message: string): boolean => {
    const bookingKeywords = [
      "book",
      "appointment",
      "meeting",
      "call",
      "schedule",
      "reserve",
      "booking",
      "appointments",
      "meetings",
      "calls",
      "scheduling",
      "reservation",
    ];

    const lowerMessage = message.toLowerCase();
    return bookingKeywords.some((keyword) => lowerMessage.includes(keyword));
  };

  // Check for booking keywords in the last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.sender === "user" &&
        containsBookingKeywords(lastMessage.content)
      ) {
        console.log("Booking keywords detected, showing booking card");
        setShowBookingCard(true);
      }
    }
  }, [messages]);

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
          {/* <div
            className="text-xs text-center my-4"
            style={{ color: theme.highlightColor }}
          >
            JAN 01, 2025 AT 09:00
          </div> */}

          {messages.map((msg, index) => (
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
                    msg.type === "booking" ? (
                      <BrowseSection
                        theme={theme}
                        currentConfig={currentConfig}
                        showOnlyBooking={true}
                      />
                    ) : (
                      <StreamingText
                        text={msg.content}
                        speed={15}
                        messageId={msg.id}
                        textColor={!theme.isDark ? "black" : "white"}
                      />
                    )
                  ) : (
                    <div
                      style={{
                        color: !theme.isDark ? "black" : "white",
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start px-2">
              <div
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: theme.isDark ? "black" : "white",
                }}
              >
                <LoadingBubbles textColor={theme.highlightColor} />
              </div>
            </div>
          )}

          {/* Show Booking Card when triggered */}
          {showBookingCard && currentConfig && (
            <div className="mb-4 px-2">
              <BrowseSection
                theme={theme}
                currentConfig={currentConfig}
                showOnlyBooking={true}
              />
            </div>
          )}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
