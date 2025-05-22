import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import LoadingBubbles from "./LoadingBubbles";

// Initialize global animation tracking
if (typeof window !== 'undefined') {
  if (!window.hasOwnProperty('allAnimatedMessages')) {
    (window as any).allAnimatedMessages = new Map();
  }
}

interface StreamingTextProps {
  text: string;
  speed?: number;
  messageId: string;
  textColor?: string;
  loadingTime?: number;
  forceAnimation?: boolean;
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 15,
  messageId,
  textColor = "inherit",
  loadingTime = 1000,
  forceAnimation = false,
}) => {
  // Determine if this is a special message type
  const isWelcomeMessage = messageId === "1" || messageId === "welcome";
  const isFeatureMessage = messageId.includes("features");
  
  // Determine if animation should be skipped
  const skipAnimation = !forceAnimation && (
    isWelcomeMessage || 
    isFeatureMessage ||
    ((window as any).allAnimatedMessages?.has(messageId)) ||
    localStorage.getItem(`animated_${messageId}`) === "true"
  );
  
  // Set up component state
  const [displayedText, setDisplayedText] = useState(skipAnimation ? text : "");
  const [isLoading, setIsLoading] = useState(!skipAnimation);
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(skipAnimation ? text.length : 0);
  
  // Immediately show full text if animation should be skipped
  useEffect(() => {
    if (skipAnimation) {
      setIsLoading(false);
      setDisplayedText(text);
    }
  }, [skipAnimation, text]);

  // Handle animation if not skipped
  useEffect(() => {
    if (skipAnimation) return;

    setIsLoading(true);
    setDisplayedText("");
    currentIndexRef.current = 0;
    
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);

      intervalRef.current = setInterval(() => {
        if (currentIndexRef.current < text.length) {
          setDisplayedText(text.substring(0, currentIndexRef.current + 1));
          currentIndexRef.current++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            
            // Store animation state
            if (typeof window !== 'undefined') {
              (window as any).allAnimatedMessages?.set(messageId, true);
              
              if (!isWelcomeMessage && !isFeatureMessage) {
                localStorage.setItem(`animated_${messageId}`, "true");
              }
            }
          }
        }
      }, speed);
    }, loadingTime);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(intervalRef.current);
    };
  }, [text, speed, skipAnimation, messageId, loadingTime, isWelcomeMessage, isFeatureMessage]);

  // Render the message
  return (
    <div
      className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ color: textColor, fontSize: 13 }}
    >
      {isLoading ? <LoadingBubbles textColor={textColor} /> : <ReactMarkdown>{displayedText}</ReactMarkdown>}
    </div>
  );
};

export default StreamingText;
