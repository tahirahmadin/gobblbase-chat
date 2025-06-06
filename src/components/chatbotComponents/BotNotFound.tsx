import React from "react";
import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

interface BotNotFoundProps {
  theme: {
    isDark: boolean;
    mainDarkColor: string;
    mainLightColor: string;
    highlightColor: string;
  };
}

export default function BotNotFound({ theme }: BotNotFoundProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        color: theme.isDark ? "white" : "black",
      }}
    >
      <div className="mb-8">
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
          style={{
            backgroundColor: theme.mainDarkColor,
            border: `2px solid ${theme.isDark ? "white" : "black"}`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Bot
            className="w-12 h-12"
            style={{ color: theme.isDark ? "black" : "white" }}
          />
        </div>
      </div>
      <h1 className="main-font text-3xl font-bold mb-6">Agent not found</h1>
      <p className="para-font text-xl max-w-sm mx-auto mb-12">
        The agent you're looking for doesn't exist. Would you like to create
        your own?
      </p>
      <Link
        to="/"
        className="para-font px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:opacity-90"
        style={{
          backgroundColor: theme.mainDarkColor,
          color: !theme.isDark ? "black" : "white",
          border: `2px solid ${theme.isDark ? "white" : "black"}`,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        Create Your Agent
      </Link>
    </div>
  );
}
