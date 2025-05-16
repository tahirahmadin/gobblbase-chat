import React, { useState, useEffect } from "react";

import { useBotConfig } from "../../../../store/useBotConfig";
import PublicChat from "../../../../pages/chatbot/PublicChat";
import { toast } from "react-hot-toast";
import { updateBotTheme } from "../../../../lib/serverActions";
import { AVAILABLE_THEMES } from "../../../../utils/constants";
import { Theme } from "../../../../types";
import { MessageSquare, Mic } from "lucide-react";

const CustomTheme = () => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    AVAILABLE_THEMES[0]
  );
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  // Initialize selected theme from bot data
  useEffect(() => {
    if (activeBotData?.themeColors) {
      const currentTheme = themes.find(
        (t) => t.id === activeBotData.themeColors.id
      );
      if (currentTheme) {
        setSelectedTheme(currentTheme);
      }
    }
  }, [activeBotData]);

  const themes = AVAILABLE_THEMES;

  const handleThemeSelect = async (inputTheme: Theme) => {
    setSelectedTheme(inputTheme);
    const selectedTheme = themes.find((t) => t.id === inputTheme.id);

    if (selectedTheme && activeBotData) {
      try {
        // Update bot config with new theme
        await updateBotTheme(activeBotData.agentId, inputTheme);

        // Update preview
        setPreviewConfig({
          ...activeBotData,
          themeColors: inputTheme,
        });

        setRefetchBotData();

        toast.success("Theme updated successfully");
      } catch (error) {
        toast.error("Failed to update theme");
        console.error("Error updating theme:", error);
      }
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-5 w-full bg-white"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="col-span-1 lg:col-span-3 p-4 lg:p-6 overflow-y-auto h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black">Display Theme</h2>
          <p className="text-sm font-[500] text-black mt-1">
            Select a theme that visually represents your brand's personality
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((currentTheme) => (
            <div
              key={currentTheme.id}
              className="relative w-52 mx-auto cursor-pointer transition-all hover:scale-105"
              onClick={() => handleThemeSelect(currentTheme)}
            >
              {/* Selection Indicator */}
              <div
                className={`border absolute  -left-3 w-7 h-7 rounded-full shadow border-2 border-white bg-gradient-to-br from-gray-300 to-gray-500 z-10 ${
                  selectedTheme.id === currentTheme.id
                    ? "bg-green-500"
                    : "opacity-100"
                }`}
                style={{
                  border: `2px solid black`,
                  background:
                    selectedTheme.id === currentTheme.id
                      ? "#6aff97"
                      : "#bdbdbd",
                }}
              />

              {/* Theme Header Bar */}
              <div
                className="mt-2"
                style={{
                  background: currentTheme.mainDarkColor,
                  height: 40,
                  borderTopRightRadius: 10,
                }}
              />

              <div
                className="flex justify-around"
                style={{
                  backgroundColor: currentTheme.isDark ? "black" : "white",
                }}
              >
                <button
                  onClick={() => null}
                  className={`text-xs font-bold px-4 py-1 relative flex items-center space-x-1`}
                  style={{
                    color: currentTheme.highlightColor,
                    borderBlockEnd: `4px solid ${currentTheme.highlightColor}`,
                  }}
                >
                  <MessageSquare
                    className="h-3.5 w-3.5 font"
                    style={{
                      marginRight: 3,
                      color: currentTheme.highlightColor,
                    }}
                  />{" "}
                  CHAT
                </button>
              </div>

              {/* Chat Window */}
              <div className="bg-gray-100 rounded-xl p-4 space-y-2">
                {/* AI Agent Message */}
                <div className="flex">
                  <div className="bg-white rounded-lg px-3 py-1 text-black text-sm font-medium">
                    AI Agent
                  </div>
                </div>
                {/* User Message */}
                <div className="flex justify-end">
                  <div
                    className="rounded-lg px-3 py-1 text-black text-sm font-medium"
                    style={{ background: currentTheme.mainDarkColor }}
                  >
                    User
                  </div>
                </div>
                {/* Input Bar */}
                <div className="flex items-center mt-2">
                  <div
                    className="flex-1 rounded-lg"
                    style={{
                      background: currentTheme.mainLightColor,
                      height: 32,
                    }}
                  />
                  <div className="ml-2 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <div
                      className=" right-2 p-2 rounded-full"
                      style={{
                        backgroundColor: currentTheme.highlightColor,
                      }}
                    >
                      <Mic
                        className="h-5 w-5"
                        style={{
                          color: !currentTheme.isDark ? "white" : "black",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="hidden lg:block col-span-2 h-full sticky top-0 flex items-center justify-center"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: 400,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PublicChat
            previewConfig={previewConfig || activeBotData}
            chatHeight={null}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomTheme;
