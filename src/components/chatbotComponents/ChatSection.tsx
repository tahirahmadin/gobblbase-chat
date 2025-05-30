import React from "react";
import { Theme, ChatMessage } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BookingSection from "./BookingSection";
import BookingManagementComponent from "./chatbotBookingComponents/BookingManagementComponent";
import ChatProductDisplay from "./ChatProductDisplay";
import ReactMarkdown from "react-markdown";

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
  // Separate messages by type
  const welcomeAndFeatureMessages = messages.filter(
    msg => (msg.type === "welcome" || msg.id === "1" || 
           msg.type === "features-combined" || 
           (msg.id && String(msg.id).includes("features"))) && 
           msg.sender === "agent"
  );
  
  const otherMessages = messages.filter(
    msg => !(msg.type === "welcome" || msg.id === "1" || 
           msg.type === "features-combined" || 
           (msg.id && String(msg.id).includes("features"))) || 
           msg.sender !== "agent"
  );

  // Render a message without animation
  const renderInstantMessage = (msg: ChatMessage) => (
    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
      <ReactMarkdown>{msg.content}</ReactMarkdown>
    </div>
  );

  // Render a regular message with possible animation
  const renderMessage = (msg: ChatMessage) => {
    if (msg.sender === "agent") {
      // Component types
      if (["booking-loading", "products-loading", "contact-loading", "features-loading"].includes(msg.type || "")) {
        return <LoadingBubbles textColor={theme.highlightColor} />;
      } 
      
      if (msg.type === "booking-calendar") {
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
      } 
      
      if (msg.type === "products-display") {
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
      } 
      
      if (msg.type === "booking-management") {
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
      }
      
      // Regular text message with animation
      return (
        <StreamingText
          text={msg.content}
          speed={15}
          messageId={String(msg.id)}
          textColor={!theme.isDark ? "black" : "white"}
          loadingTime={1000}
          forceAnimation={false}
        />
      );
    } else {
      // User message
      return (
        <div style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
          {msg.content}
        </div>
      );
    }
  };

  // Create a message container with appropriate styling
  const createMessageContainer = (msg: ChatMessage, content: React.ReactNode) => {
    const isSpecialLayout = msg.sender === "agent" && 
      ["booking-calendar", "booking-management", "products-display", "contact-form"].includes(msg.type || "");
    
    return (
      <div
        key={msg.id}
        className={`mb-4 flex ${msg.sender === "agent" ? "justify-start" : "justify-end"}`}
      >
        {isSpecialLayout ? (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: theme.isDark ? "black" : "white",
              width: "80%",
              maxWidth: "600px",
              margin: "0 auto 0 0",
            }}
          >
            {content}
          </div>
        ) : (
          <div
            className={`max-w-[80%] rounded-xl p-2 font-medium`}
            style={{
              backgroundColor: msg.sender === "agent"
                ? theme.isDark ? "black" : "white"
                : theme.mainDarkColor,
              color: msg.sender === "agent"
                ? !theme.isDark ? "black" : "white"
                : "black"
            }}
          >
            <div className="prose prose-sm max-w-none text-inherit">
              {content}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Only render if chat screen is active
  if (activeScreen !== "chat") {
    return null;
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-2"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        paddingBottom: "50px",
      }}
    >
      {/* Render welcome and feature messages first without animation */}
      {welcomeAndFeatureMessages.map(msg => 
        createMessageContainer(msg, renderInstantMessage(msg))
      )}
      
      {/* Then render all other messages */}
      {otherMessages.map(msg => 
        createMessageContainer(msg, renderMessage(msg))
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
