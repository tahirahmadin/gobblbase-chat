import React, { useState, useEffect } from "react";

import { useBotConfig } from "../../../store/useBotConfig";
import PublicChat from "../../chatbot/PublicChat";
import { toast } from "react-hot-toast";
import { updateAgentDetails } from "../../../lib/serverActions";

const Theme = () => {
  const { activeBotData } = useBotConfig();
  const [selectedTheme, setSelectedTheme] = useState<string>("yellow");
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  // Initialize selected theme from bot data
  useEffect(() => {
    if (activeBotData?.themeColors) {
      const currentTheme = themes.find(
        (t) => t.color === activeBotData.themeColors.mainDarkColor
      );
      if (currentTheme) {
        setSelectedTheme(currentTheme.id);
      }
    }
  }, [activeBotData]);

  const themes = [
    { id: "yellow", color: "#EFC715", textColor: "#000000" },
    { id: "green", color: "#C2E539", textColor: "#000000" },
    { id: "orange", color: "#FF975F", textColor: "#000000" },
    { id: "pink", color: "#d16bd7", textColor: "#000000" },
    { id: "blue", color: "#ABC3FF", textColor: "#000000" },
    { id: "gray", color: "#808080", textColor: "#FFFFFF" },
    { id: "dark-blue", color: "#4220cd", textColor: "#FFFFFF" },
    { id: "navy", color: "#16598F", textColor: "#FFFFFF" },
    { id: "dark-green", color: "#004F4A", textColor: "#FFFFFF" },
  ];

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    const selectedTheme = themes.find((t) => t.id === themeId);

    if (selectedTheme && activeBotData) {
      const newTheme = {
        isDark: selectedTheme.textColor === "#FFFFFF",
        mainDarkColor: selectedTheme.color,
        mainLightColor:
          selectedTheme.textColor === "#FFFFFF" ? "#FFFFFF" : "#000000",
        highlightColor: selectedTheme.textColor,
      };

      try {
        // Update bot config with new theme
        await updateAgentDetails(activeBotData.agentId, {
          model: activeBotData.model,
          systemPrompt: activeBotData.systemPrompt,
          username: activeBotData.username,
          name: activeBotData.name,
          logo: activeBotData.logo,
          personalityType: activeBotData.personalityType,
          isCustomPersonality: activeBotData.isCustomPersonality,
          customPersonalityPrompt: activeBotData.customPersonalityPrompt,
          personalityAnalysis: activeBotData.personalityAnalysis,
          lastPersonalityUrl: activeBotData.lastPersonalityUrl,
          lastPersonalityContent: activeBotData.lastPersonalityContent,
          themeColors: newTheme,
        });

        // Update preview
        setPreviewConfig({
          ...activeBotData,
          themeColors: newTheme,
        });

        toast.success("Theme updated successfully");
      } catch (error) {
        toast.error("Failed to update theme");
        console.error("Error updating theme:", error);
      }
    }
  };

  return (
    <div className="container grid grid-cols-5 w-full bg-white">
      <div className="col-span-3 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Display Theme</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a theme that visually represents your brand's personality
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative cursor-pointer transition-all hover:scale-105`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {/* Selection Circle */}
              <div
                className={`absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10
                ${selectedTheme === theme.id ? "bg-green-500" : "bg-gray-300"}`}
              />

              {/* Chat Container */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                {/* Chat Header */}
                <div
                  className="p-2 border-b"
                  style={{ backgroundColor: theme.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: theme.textColor }}
                      >
                        CHAT
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3"
                      style={{ color: theme.textColor }}
                      fill="currentColor"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="bg-gray-50 p-2 space-y-2">
                  {/* AI Message */}
                  <div className="flex items-start space-x-1">
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="text-[11px] bg-white px-2 py-1.5 rounded-lg shadow-sm max-w-[80%]">
                      AI Agent
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div
                      className="text-[11px] px-2 py-1.5 rounded-lg shadow-sm max-w-[80%]"
                      style={{
                        backgroundColor: theme.color,
                        color: theme.textColor,
                      }}
                    >
                      User
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="p-2 bg-white border-t">
                  <div className="flex items-center justify-between bg-gray-50 rounded-full px-3 py-1.5">
                    <div className="text-[10px] text-gray-400">
                      Type a message...
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-3 h-3 text-gray-400"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2 pt-6" style={{ backgroundColor: "#eaefff" }}>
        <div className="mx-auto" style={{ maxWidth: 440 }}>
          <PublicChat
            agentUsernamePlayground={null}
            previewConfig={previewConfig || activeBotData}
          />
        </div>
      </div>
    </div>
  );
};

export default Theme;
