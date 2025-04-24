import React, { useState, useEffect } from "react";

const LOADING_PHRASES = [
  "Finding best options",
  "Thinking it through",
  "Cooking up ideas",
  "Searching recipes",
  "Almost ready",
  "Processing request",
];

interface LoadingPhrasesProps {
  textColor?: string;
}

const LoadingPhrases: React.FC<LoadingPhrasesProps> = ({
  textColor = "#9ca3af",
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2000); // Change phrase every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center" style={{ color: textColor }}>
      <span className="italic">{LOADING_PHRASES[currentPhraseIndex]}</span>
      <span className="ml-1">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse delay-100">.</span>
        <span className="animate-pulse delay-200">.</span>
      </span>
    </div>
  );
};

export default LoadingPhrases;
