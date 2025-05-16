import React, { useState, useEffect } from "react";
import { ChatMessage, Theme } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BookingSection from "./BookingSection";
import BookingManagementComponent from "./BookingManagementComponent";
import ContactFormComponent from "./ContactFormComponent";
import ChatProductDisplay from "./ChatProductDisplay";

interface ChatSectionProps {
  theme: Theme;
  messages: (ChatMessage & {
    type?:
      | "booking"
      | "booking-intro"
      | "booking-loading"
      | "booking-calendar"
      | "booking-management-intro"
      | "booking-management"
      | "products-intro" 
      | "products-loading" 
      | "products-display"
      | "contact-intro" 
      | "contact-loading" 
      | "contact-form";  
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
  setActiveScreen?: (screen: "about" | "chat" | "browse") => void;
}

export default function ChatSection({
  theme,
  messages,
  isLoading,
  activeScreen,
  messagesEndRef,
  currentConfig,
  isBookingConfigured = true,
  setActiveScreen,
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
        msg.type === "booking-management-intro" ||
        msg.type === "products-intro" ||
        msg.type === "contact-intro" 
      ) {
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={`${msg.id}-intro`}
            textColor={!theme.isDark ? "black" : "white"}\
            loadingTime={1000}
          />
        );
      } else if (
        msg.type === "booking-loading" ||
        msg.type === "products-loading" ||
        msg.type === "contact-loading"
      ) {
        return <LoadingBubbles textColor={theme.highlightColor} />;
      } else if (msg.type === "contact-form") {  
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={msg.id}
            textColor={!theme.isDark ? "black" : "white"}
            loadingTime={1000}
          />
        );
      } else if (msg.type === "booking-calendar") {
        return (
          <div className="w-full">
            <BookingSection
              theme={theme}
              businessId={currentConfig?.agentId || ""}
              sessionName={currentConfig?.sessionName || "Consultation"}
              isBookingConfigured={isBookingConfigured}
              showOnlyBooking={true}
            />
          </div>
        );
      } else if (msg.type === "products-display") { 
        return (
          <div className="w-full">
            <ChatProductDisplay
              theme={theme}
              currentConfig={currentConfig}
              messageId={msg.id}
              setActiveScreen={setActiveScreen}
            />
          </div>
        );
      } else if (msg.type === "booking-management") {
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
            loadingTime={1000}
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
                msg.type === "booking-management" ||
                msg.type === "products-display" ||
                msg.type === "contact-form") ? ( 
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: theme.isDark ? "black" : "white",
                    width: "80%",
                    maxWidth: "600px",
                    margin: "0 auto 0 0", 
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

          {/* {isLoading && (
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
          )} */}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
