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
  isFeatureMessage?: boolean; 
}

const ClickableMessageText: React.FC<ClickableMessageTextProps> = ({
  content,
  theme,
  onFeatureClick,
  isLoading = false,
  isFeatureMessage = false
}) => {
  const clickableFeatures = [
    "booking appointments",
    "browsing our products", 
    "contacting us",
    "answering questions about our knowledge base" 
  ];

  const handleFeatureClick = (feature: string) => {
    if (!isLoading) {
      onFeatureClick(`I need help with ${feature}`);
    }
  };

  if (isFeatureMessage && content.includes('\n')) {
    const lines = content.split('\n');
    const firstLine = lines[0];
    const secondLine = lines[1] || '';
    
    // Extract features from the second line
    const featuresInSecondLine = clickableFeatures.filter(feature => 
      secondLine.includes(feature)
    );
    
    return (
      <div 
        className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
        style={{ 
          color: !theme.isDark ? "black" : "white", 
          fontSize: 13,
          lineHeight: 1.4,
          wordSpacing: 'normal',
          letterSpacing: 'normal'
        }}
      >
        {/* First line - plain text */}
        <div style={{ marginBottom: '8px' }}>
          {firstLine}
        </div>
        
        {/* Second line - feature buttons */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          marginTop: '4px'
        }}>
          {featuresInSecondLine.map((feature, index) => (
            <span
              key={index}
              onClick={() => handleFeatureClick(feature)}
              className="feature-bubble-inline"
              style={{
                background: `linear-gradient(135deg, ${theme.mainLightColor}, ${theme.mainDarkColor})`,
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-block',
                margin: '2px',
                fontSize: '0.85em',
                fontWeight: '600',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease',
                opacity: isLoading ? 0.7 : 1,
                textShadow: 'none',
                border: 'none',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                verticalAlign: 'middle',
                lineHeight: '1.2',
                wordBreak: 'keep-all',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainDarkColor}, ${theme.mainLightColor})`;
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainLightColor}, ${theme.mainDarkColor})`;
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    );
  }

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
                  className="feature-bubble-inline"
                  style={{
                    background: `linear-gradient(135deg, ${theme.mainLightColor}, ${theme.mainDarkColor})`,
                    color: '#ffffff',
                    padding: '0px 3px',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'inline',
                    margin: '0',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s ease',
                    opacity: isLoading ? 0.7 : 1,
                    textShadow: 'none',
                    border: 'none',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'baseline',
                    lineHeight: '1',
                    wordBreak: 'keep-all',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainDarkColor}, ${theme.mainLightColor})`;
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${theme.mainLightColor}, ${theme.mainDarkColor})`;
                      e.currentTarget.style.boxShadow = '0 0.5px 1px rgba(0,0,0,0.1)';
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
    <div 
      className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ 
        color: !theme.isDark ? "black" : "white", 
        fontSize: 13,
        lineHeight: 1.4,
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }}
    >
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
      "contacting us",
      "answering questions about our knowledge base"
    ];
    return clickableFeatures.some(feature => content.includes(feature));
  };

  const isFeatureMessage = (msg: ChatMessage): boolean => {
    return msg.type === "features-combined" || 
           (msg.id && String(msg.id).includes("features")) ||
           (msg.sender === "agent" && 
            (msg.content.includes("I can help you with") ||
             msg.content.includes("I'm here to help with") ||
             msg.content.includes("capabilities include")));
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

  // Render a message without animation
  const renderInstantMessage = (msg: ChatMessage) => {
    if (msg.sender === "agent" && hasClickableFeatures(msg.content) && onFeatureClick) {
      return (
        <ClickableMessageText
          content={msg.content}
          theme={theme}
          onFeatureClick={onFeatureClick}
          isLoading={isLoading}
          isFeatureMessage={isFeatureMessage(msg)}
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
            isFeatureMessage={isFeatureMessage(msg)}
          />
        );
      }
      
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
      return (
        <div style={{ color: !theme.isDark ? "black" : "white", fontSize: 13 }}>
          {msg.content}
        </div>
      );
    }
  };

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