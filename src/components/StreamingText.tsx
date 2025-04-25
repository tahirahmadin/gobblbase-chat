import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface StreamingTextProps {
  text: string;
  speed?: number;
  messageId: string;
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 15,
  messageId,
}) => {
  const [displayedText, setDisplayedText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(0);
  const animatedKey = `animated_${messageId}`;
  const hasAnimated = localStorage.getItem(animatedKey) === "true";

  useEffect(() => {
    // If already animated, just show the full text
    if (hasAnimated) {
      setDisplayedText(text);
      return;
    }

    // Reset state when text changes and hasn't animated yet
    setDisplayedText("");
    currentIndexRef.current = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
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

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, hasAnimated, messageId, animatedKey]);

  return (
    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>blockquote]:m-0 [&>pre]:m-0 [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

export default StreamingText;
