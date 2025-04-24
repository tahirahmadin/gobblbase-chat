import React, { useState, useEffect } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length - 1) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default StreamingText;
