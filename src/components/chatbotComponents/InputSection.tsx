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
      style={{ backgroundColor: theme.chatBackgroundColor }}
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
          style={{ backgroundColor: "#4b68ec", color: "white" }}
        />
        <button
          className="absolute right-2 p-2"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          <Mic
            className="h-5 w-5"
            style={{ color: "white", backgroundColor: "#4b68ec" }}
          />
        </button>
      </div>

      {/* Powered by */}
      <div className="text-center text-xs text-gray-500">Powered by Kifor</div>
    </div>
  );
}
