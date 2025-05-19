import React, { useEffect, useRef } from "react";
import { Theme, ChatMessage } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BookingSection from "./BookingSection";
import BookingManagementComponent from "./BookingManagementComponent";
import ContactFormComponent from "./ContactFormComponent";
import ChatProductDisplay from "./ChatProductDisplay";

interface ChatSectionProps {
  theme: Theme;
  messages: ChatMessage[];
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
  const prevActiveScreenRef = useRef<string | null>(null);

  // Effect to handle screen transition
  useEffect(() => {
    // We only care about transitions to the chat screen
    if (activeScreen === "chat" && prevActiveScreenRef.current !== "chat") {
      // No need to do anything special, the StreamingText component will handle animation state
    }
    
    // Update the previous screen reference
    prevActiveScreenRef.current = activeScreen;
  }, [activeScreen]);
  
  // Render different message types
  const renderMessage = (msg: ChatMessage) => {
    if (msg.sender === "agent") {
      // Check if this is a welcome message (either by type or by ID)
      const isWelcome = msg.type === "welcome" || msg.id === "1";
      const isFeatureMessage = msg.type === "features-combined" || 
                              (msg.id && (msg.id.includes("features-") || msg.id.includes("features")));

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
            textColor={!theme.isDark ? "black" : "white"}
            loadingTime={1000}
            forceAnimation={false} // Never force animation for better tab switching
          />
        );
      } else if (msg.type === "features-combined" || isFeatureMessage) {
        // Feature notification message with the same styling as regular messages
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={`${msg.id}`}
            textColor={!theme.isDark ? "black" : "white"}
            loadingTime={1000}
            forceAnimation={false}
          />
        );
      } else if (
        msg.type === "booking-loading" ||
        msg.type === "products-loading" ||
        msg.type === "contact-loading" ||
        msg.type === "features-loading"
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
        // Regular text message or welcome message
        return (
          <StreamingText
            text={msg.content}
            speed={15}
            messageId={msg.id}
            textColor={!theme.isDark ? "black" : "white"}
            loadingTime={1000}
            forceAnimation={false} // Never force animation for better tab switching
          />
        );
      }
    } else {
      // User message - simplified for consistency
      return (
        <div style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
          {msg.content}
        </div>
      );
    }
  };

  // Style logic for messages - REMOVED THE BORDER STYLING FOR FEATURE MESSAGES
  const getMessageStyle = (msg: ChatMessage) => {
    // No special styling for any message types
    return {};
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-2"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        paddingBottom: "50px",
      }}
    >
      {activeScreen === "chat" && (
        <>
          {messages.map((msg) => (
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
                  className={`max-w-[80%] rounded-xl p-2 font-medium`}
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
                        : "black",
                    ...getMessageStyle(msg)
                  }}
                >
                  <div className="prose prose-sm max-w-none text-inherit">
                    {renderMessage(msg)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
