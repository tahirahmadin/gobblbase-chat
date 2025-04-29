import React from "react";
import { Mic } from "lucide-react";
import { Theme } from "../../types";

interface InputSectionProps {
  message: string;
  isLoading: boolean;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  theme: Theme;
}

export default function InputSection({
  theme,
  message,
  isLoading,
  setMessage,
  handleSendMessage,
  handleKeyPress,
}: InputSectionProps) {
  return (
    <div
      className="p-4 space-y-4"
      style={{ backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9" }}
    >
      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          className="w-full pl-4 pr-12 py-3 rounded-full  text-sm focus:outline-none"
          placeholder="Ask away..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          style={{
            backgroundColor: theme.mainLightColor,
            color: theme.isDark ? "white" : "black",
          }}
        />
        <button
          className="absolute right-2 p-2 rounded-full"
          onClick={handleSendMessage}
          disabled={isLoading}
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.isDark ? "white" : "black",
          }}
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>

      {/* Powered by */}
      <div
        className="text-center text-xs"
        style={{ color: theme.highlightColor }}
      >
        Powered by Kifor
      </div>
    </div>
  );
}
