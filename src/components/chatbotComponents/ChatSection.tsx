import React from "react";
import { Theme, ChatMessage } from "../../types";
import StreamingText from "./otherComponents/StreamingText";
import LoadingBubbles from "./otherComponents/LoadingBubbles";
import BookingSection from "./BookingSection";
import BookingManagementComponent from "./chatbotBookingComponents/BookingManagementComponent";
import ChatProductDisplay from "./ChatProductDisplay";
import ReactMarkdown from "react-markdown";

interface ClickableMessageTextProps {
  content: string;
  theme: Theme;
  onFeatureClick: (featureText: string) => void;
  isLoading?: boolean;
}

const ClickableMessageText: React.FC<ClickableMessageTextProps> = ({
  content,
  theme,
  onFeatureClick,
  isLoading = false
}) => {
  const clickableFeatures = [
    "booking appointments",
    "browsing our products", 
    "contacting us directly"
  ];

  const handleFeatureClick = (feature: string) => {
    if (!isLoading) {
      onFeatureClick(`I need help with ${feature}`);
    }
  };

  const renderTextWithBubbles = (text: string) => {
    let parts: (string | JSX.Element)[] = [text];

    clickableFeatures.forEach((feature, index) => {
      const newParts: (string | JSX.Element)[] = [];
      
      parts.forEach((part, partIndex) => {
        if (typeof part === 'string') {
          const segments = part.split(feature);
          
          for (let i = 0; i < segments.length; i++) {
            if (i > 0) {
              newParts.push(
                <span
                  key={`${index}-${partIndex}-${i}`}
                  onClick={() => handleFeatureClick(feature)}
                  className="feature-highlight-inline"
                  style={{
                    background: `linear-gradient(135deg, ${theme.mainLightColor}22, ${theme.mainDarkColor}33)`,
                    color: theme.mainLightColor,
                    padding: '1px 2px',
                    borderRadius: '3px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'inline',
                    margin: '0',
                    fontSize: 'inherit',
                    fontWeight: '700',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1,
                    textShadow: 'none',
                    border: `1px solid ${theme.mainLightColor}44`,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'baseline',
                    lineHeight: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainLightColor}44, ${theme.mainDarkColor}55)`;
                      e.currentTarget.style.color = theme.isDark ? '#ffffff' : theme.mainDarkColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainLightColor}22, ${theme.mainDarkColor}33)`;
                      e.currentTarget.style.color = theme.mainLightColor;
                    }
                  }}
                >
                  {feature}
                </span>
              );
            }
            
            if (segments[i]) {
              newParts.push(segments[i]);
            }
          }
        } else {
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });

    return parts;
  };

  return (
    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
      {renderTextWithBubbles(content)}
    </div>
  );
};

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
  onFeatureClick?: (featureText: string) => void; 
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
  onFeatureClick, 
}: ChatSectionProps) {
  const hasClickableFeatures = (content: string): boolean => {
    const clickableFeatures = [
      "booking appointments",
      "browsing our products", 
      "contacting us directly"
    ];
    return clickableFeatures.some(feature => content.includes(feature));
  };

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


  const renderInstantMessage = (msg: ChatMessage) => {
    if (msg.sender === "agent" && hasClickableFeatures(msg.content) && onFeatureClick) {
      return (
        <ClickableMessageText
          content={msg.content}
          theme={theme}
          onFeatureClick={onFeatureClick}
          isLoading={isLoading}
        />
      );
    }

    return (
      <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
        style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    );
  };

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
      
      if (hasClickableFeatures(msg.content) && onFeatureClick) {
        return (
          <ClickableMessageText
            content={msg.content}
            theme={theme}
            onFeatureClick={onFeatureClick}
            isLoading={isLoading}
          />
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