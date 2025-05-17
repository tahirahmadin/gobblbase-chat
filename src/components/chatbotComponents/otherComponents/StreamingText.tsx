import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import LoadingBubbles from "./LoadingBubbles";

interface StreamingTextProps {
  text: string;
  speed?: number;
  messageId: string;
  textColor?: string;
  loadingTime?: number; // Time in ms to show loading bubbles
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 15,
  messageId,
  textColor = "inherit",
  loadingTime = 1000, // Default to 1 second
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(0);
  const animatedKey = `animated_${messageId}`;
  const hasAnimated = localStorage.getItem(animatedKey) === "true";

  useEffect(() => {
    // If already animated, just show the full text immediately without loading
    if (hasAnimated) {
      setIsLoading(false);
      setDisplayedText(text);
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
            localStorage.setItem(animatedKey, "true");
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
  }, [text, speed, hasAnimated, messageId, animatedKey, loadingTime]);

  return (
    <div
      className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
      style={{ color: textColor }}
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
