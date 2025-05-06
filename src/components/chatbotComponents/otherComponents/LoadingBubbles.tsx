import React from "react";

interface LoadingBubblesProps {
  textColor: string;
}

const LoadingBubbles: React.FC<LoadingBubblesProps> = ({ textColor }) => {
  return (
    <div className="flex space-x-1 items-center">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: textColor,
            animationDelay: "0ms",
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: textColor,
            animationDelay: "150ms",
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: textColor,
            animationDelay: "300ms",
          }}
        />
      </div>
    </div>
  );
};

export default LoadingBubbles;
