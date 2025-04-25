import React, { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(0);

  useEffect(() => {
    // Reset state when text changes
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
        }
      }
    }, speed);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default StreamingText;
