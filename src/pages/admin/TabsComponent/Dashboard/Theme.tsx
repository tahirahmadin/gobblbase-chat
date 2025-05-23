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
      className="w-full h-full flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden"
     
    >
      <div className="w-full lg:w-3/5 rounded-lg flex flex-col gap-2 lg:gap-4 lg:overflow-y-auto ">
        <div className="pl-4 lg:pl-14 mt-8">
          <h2 className="text-xl font-bold text-black">Display Theme</h2>
          <p className="text-sm font-[500] text-black mt-1">
            Select a theme that visually represents your brand's personality
          </p>
        </div>

        <div className="w-full flex flex-col items-center px-2 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-12 p-6 overflow-y-auto  max-h-[320px] lg:max-h-[100%]">
            {themes.map((currentTheme) => (
              <div
                key={currentTheme.id}
                className="relative w-52 mx-auto cursor-pointer transition-all hover:scale-105"
                onClick={() => handleThemeSelect(currentTheme)}
              >
                {/* Selection Indicator */}
                {selectedTheme.id === currentTheme.id ? (
                  <>
                    <div className="absolute -top-2 -left-3 w-8 h-8 bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000]"></div>
                    <div className="absolute -top-1 -left-2 w-6 h-6 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                  </>
                ) : (
                  <div className="absolute -top-1 -left-2 w-6 h-6 rounded-full flex items-center justify-center bg-[#EAEFFF] border border-[#7D7D7D] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)]"></div>
                )}

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
      </div>


          {/* Right: PublicChat Preview */}
      <div
        className="w-full lg:w-2/5 py-2 lg:py-8 flex flex-col items-center justify-center bg-[#d4deff]"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div
          className="w-[300px] xs:w-[320px] py-6 lg:py-4 lg:px-4 xlg:w-[400px]"
          style={{
            maxWidth: 600,
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
