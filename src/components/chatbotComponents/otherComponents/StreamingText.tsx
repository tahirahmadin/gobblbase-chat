import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import LoadingBubbles from "./LoadingBubbles";

// Create a global variable to track message animation states
// This will persist until page refresh
if (typeof window !== 'undefined') {
  // For welcome message
  if (!window.hasOwnProperty('welcomeMessageAnimated')) {
    (window as any).welcomeMessageAnimated = false;
  }
  
  // For feature notification messages
  if (!window.hasOwnProperty('featureMessageAnimated')) {
    (window as any).featureMessageAnimated = false;
  }
  
  // Track all animated messages in a Map
  if (!window.hasOwnProperty('allAnimatedMessages')) {
    (window as any).allAnimatedMessages = new Map();
  }
}

interface StreamingTextProps {
  text: string;
  speed?: number;
  messageId: string;
  textColor?: string;
  loadingTime?: number; // Time in ms to show loading bubbles
  forceAnimation?: boolean; // New prop to force animation regardless of animation state
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 15,
  messageId,
  textColor = "inherit",
  loadingTime = 1000, // Default to 1 second
  forceAnimation = false, // Default to respecting animation state
}) => {
  // Check if this is a special message type FIRST before useState
  const isWelcomeMessage = messageId === "1" || messageId === "welcome";
  const isFeatureMessage = messageId.includes("features") || (typeof messageId === 'string' && messageId.indexOf("features") !== -1);
  
  // Check global animation state first and most aggressively
  const isAlreadyAnimated = () => {
    if (typeof window === 'undefined') return false;
    
    // Check if this specific message is already in our global map
    if ((window as any).allAnimatedMessages && (window as any).allAnimatedMessages.has(messageId)) {
      return true;
    }
    
    // Check special types
    if (isWelcomeMessage && (window as any).welcomeMessageAnimated) {
      return true;
    }
    
    if (isFeatureMessage && (window as any).featureMessageAnimated) {
      return true;
    }
    
    // Check localStorage for regular messages
    return localStorage.getItem(`animated_${messageId}`) === "true";
  };
  
  // Initial state based on animation status - critical for preventing flicker
  const skipAnimation = !forceAnimation && isAlreadyAnimated();
  const [displayedText, setDisplayedText] = useState(skipAnimation ? text : "");
  const [isLoading, setIsLoading] = useState(!skipAnimation);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(skipAnimation ? text.length : 0);
  
  // IMMEDIATE EFFECT: Set text immediately on mount if already animated
  useEffect(() => {
    if (skipAnimation) {
      setIsLoading(false);
      setDisplayedText(text);
      currentIndexRef.current = text.length;
    }
  }, []);

  // ANIMATION EFFECT: Only run if not skipping animation
  useEffect(() => {
    // Exit immediately if we're skipping animation
    if (skipAnimation) {
      return;
    }

    // Show loading bubbles first
    setIsLoading(true);
    setDisplayedText("");
    currentIndexRef.current = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start with loading bubbles for specified time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);

      // Then start text streaming
      intervalRef.current = setInterval(() => {
        if (currentIndexRef.current < text.length) {
          setDisplayedText(text.substring(0, currentIndexRef.current + 1));
          currentIndexRef.current++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            
            // Store animation state globally
            if (typeof window !== 'undefined') {
              // Store in appropriate place based on message type
              if (isWelcomeMessage) {
                (window as any).welcomeMessageAnimated = true;
              } 
              
              if (isFeatureMessage) {
                (window as any).featureMessageAnimated = true;
              }
              
              // Always store in the global map for all messages
              if ((window as any).allAnimatedMessages) {
                (window as any).allAnimatedMessages.set(messageId, true);
              }
              
              // Also store in localStorage for regular messages
              if (!isWelcomeMessage && !isFeatureMessage) {
                localStorage.setItem(`animated_${messageId}`, "true");
              }
            }
          }
        }
      }, speed);
    }, loadingTime);

    // Cleanup
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, skipAnimation, messageId, loadingTime, forceAnimation, isWelcomeMessage, isFeatureMessage]);

  return (
    <div
      className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ color: textColor, fontSize: 13 }}
    >
      {isLoading ? (
        <LoadingBubbles textColor={textColor} />
      ) : (
        <ReactMarkdown>{displayedText}</ReactMarkdown>
      )}
    </div>
  );
};

export default StreamingText;
