import React, { useState, useEffect } from "react";
import { ChatMessage, Theme } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BrowseSection from "./BrowseSection";
import BookingManagementComponent from "./BookingManagementComponent";

interface ChatSectionProps {
  theme: Theme;
  messages: (ChatMessage & {
    type?:
      | "booking"
      | "booking-intro"
      | "booking-loading"
      | "booking-calendar"
      | "booking-management-intro"
      | "booking-management";
  })[];
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
  isBookingConfigured?: boolean;
}

export default function ChatSection({
  theme,
  messages,
  isLoading,
  activeScreen,
  messagesEndRef,
  currentConfig,
  isBookingConfigured = true,
}: ChatSectionProps) {
  const [showBookingCard, setShowBookingCard] = useState(false);

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

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.sender === "user" &&
        containsBookingKeywords(lastMessage.content)
      ) {
        if (isBookingConfigured) {
          setShowBookingCard(true);
        } else {
          setShowBookingCard(false);
        }
      }
    }
  }, [messages, isBookingConfigured]);

  const renderMessage = (msg: ChatMessage & { type?: string }) => {
    if (msg.sender === "agent") {
      // Different message types for agent
      if (
        msg.type === "booking-intro" ||
        msg.type === "booking-management-intro"
      ) {
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={`${msg.id}-intro`}
            textColor={!theme.isDark ? "black" : "white"}
          />
        );
      } else if (msg.type === "booking-loading") {
        return <LoadingBubbles textColor={theme.highlightColor} />;
      } else if (msg.type === "booking-calendar") {
        // Simplified rendering without transformations that can cause issues
        return (
          <div className="w-full">
            <BrowseSection
              theme={theme}
              currentConfig={currentConfig}
              showOnlyBooking={true}
              isBookingConfigured={isBookingConfigured}
            />
          </div>
        );
      } else if (msg.type === "booking-management") {
        // Simplified rendering without transformations that can cause issues
        return (
          <div className="w-full">
            <BookingManagementComponent
              theme={theme}
              agentId={currentConfig?.agentId || ""}
              sessionName={currentConfig?.sessionName || "Consultation"}
              botName={currentConfig?.name || "Assistant"}
            />
          </div>
        );
      } else {
        // Regular text message
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={msg.id}
            textColor={!theme.isDark ? "black" : "white"}
          />
        );
      }
    } else {
      // User message - simplified for consistency
      return (
        <div style={{ color: !theme.isDark ? "black" : "white" }}>
          {msg.content}
        </div>
      );
    }
  };

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
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${
                msg.sender === "agent" ? "justify-start" : "justify-end"
              }`}
            >
              {msg.sender === "agent" &&
              (msg.type === "booking-calendar" ||
                msg.type === "booking-management") ? (
                // Special booking component with simple styling to prevent issues
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: theme.isDark ? "black" : "white",
                    width: "95%",
                    maxWidth: "95%",
                    margin: "0 auto 0 0", // Left align
                  }}
                >
                  {renderMessage(msg)}
                </div>
              ) : (
                // Regular message layout
                <div
                  className={`max-w-[80%] rounded-xl p-3 font-medium`}
                  style={{
                    backgroundColor:
                      msg.sender === "agent"
                        ? theme.isDark
                          ? "black"
                          : "white"
                        : theme.mainDarkColor,
                    color:
                      msg.sender === "agent"
                        ? !theme.isDark
                          ? "black"
                          : "white"
                        : "black", // Ensure user messages have consistent text color
                  }}
                >
                  <div className="prose prose-sm max-w-none text-inherit">
                    {renderMessage(msg)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
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
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
