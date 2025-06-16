import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateAgentWelcomeMessage } from "../../../../lib/serverActions";
import PublicChat from "../../../chatbot/PublicChat";
import { toast } from "react-hot-toast";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;
  background: #6aff97;
  @media (max-width: 600px) {
    min-width: 120px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }

  &:disabled {
    background: #6aff97;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #6aff97;
  }
`;
const welcomeTemplates = [
  "Hi there! How can I help you?",
  "Thank you for reaching out. How can I support you right now?",
  "Welcome to our shop! Can I help you with recommendations, or track an order?",
  "Hello, thanks for reaching out! Can I help you set up a meeting?",
  "Thank you for supporting our mission! How can I help you today?",
  "Greetings! Looking to kickstart a project? Let's chat!",
];

const WelcomeText = () => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    welcomeTemplates[0]
  );
  const [customMessage, setCustomMessage] = useState("");
  const [isCustomMessageSaved, setIsCustomMessageSaved] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<any>(null);
  const [previewKey, setPreviewKey] = useState<number>(Date.now());

  useEffect(() => {
    if (activeBotData) {
      setSelectedTemplate(activeBotData.welcomeMessage);
    }
  }, [activeBotData]);

  const clearMessageAnimationStates = () => {
    if (typeof window !== "undefined") {
      (window as any).welcomeMessageAnimated = false;
      (window as any).featureMessageAnimated = false;
      (window as any).featuresMessageShown = false;
      (window as any).featuresMessageContent = "";
      (window as any).featuresMessageId = "";

      if (window.hasOwnProperty("shouldShowFeaturesAfterWelcome")) {
        (window as any).shouldShowFeaturesAfterWelcome = false;
      }

      if ((window as any).allAnimatedMessages) {
        (window as any).allAnimatedMessages.clear();
      }
    }
  };

  const handleTemplateSelect = async (templateText: string) => {
    if (templateText === selectedTemplate) {
      return;
    }
    setSelectedTemplate(templateText);
    setIsCustomMessageSaved(false);

    if (templateText && activeBotData) {
      try {
        await updateAgentWelcomeMessage(activeBotData.agentId, templateText);

        clearMessageAnimationStates();

        setPreviewKey(Date.now());

        const refreshedConfig = {
          ...activeBotData,
          welcomeMessage: templateText,
        };

        setPreviewConfig(refreshedConfig);
        setRefetchBotData();
        toast.success("Welcome message updated successfully");
      } catch (error) {
        toast.error("Failed to update welcome message");
        console.error("Error updating welcome message:", error);
      }
    }
  };

  const handleCustomMessageSave = async () => {
    if (!customMessage.trim()) {
      toast.error("Please enter a custom message");
      return;
    }

    if (customMessage.trim() === selectedTemplate) {
      return;
    }

    if (activeBotData) {
      try {
        await updateAgentWelcomeMessage(activeBotData.agentId, customMessage);

        clearMessageAnimationStates();

        setPreviewKey(Date.now());

        const refreshedConfig = {
          ...activeBotData,
          welcomeMessage: customMessage,
        };

        setPreviewConfig(refreshedConfig);
        setRefetchBotData();
        toast.success("Custom welcome message updated successfully");

        setIsCustomMessageSaved(true); // ✅ Set saved status
      } catch (error) {
        toast.error("Failed to update welcome message");
        console.error("Error updating welcome message:", error);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden">
      {/* side content */}
      <div className="w-full lg:w-3/5 rounded-lg flex flex-col gap-2 lg:gap-4 lg:overflow-y-auto">
        <div className="px-4 mt-8">
          <h2 className="main-font font-bold text-lg sm:text-xl md:text-2xl text-[#000000] mb-1">
            Welcome Text
          </h2>
          <p className="para-font text-xs md:text-sm text-[#0D0D0D] mb-2 font-[500]">
            Custom design your opening message to your audience
          </p>
        </div>

        <div className="px-4">
          <h3 className="para-font text-[#000000] block text-[16px] sm:text-lg font-medium mb-4">
            Templates
          </h3>
          <div className="space-y-2">
            {welcomeTemplates.map((template) => (
              <div key={template} className="flex gap-4 items-center">
                {selectedTemplate === template ? (
                  <>
                    <div className="relative w-[25px] h-[25px] bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3">
                      <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                    </div>
                  </>
                ) : (
                  <button onClick={() => handleTemplateSelect(template)} className="relative w-[25px] h-[25px] bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3 curser-pointer"></button>
                )}
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className={`px-2 py-1 border w-[100%] transition-all text-start
                  ${
                    selectedTemplate === template
                      ? "bg-[#CEFFDC] border-2 border-[#6AFF97] focus:outline-none"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {template}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 my-8">
          <div className="custom-msg flex items-center gap-5 mb-4">
            {isCustomMessageSaved ? (
              <>
                <div className="relative w-[25px] h-[25px] bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                </div>
              </>
            ) : (
              <div  onClick={handleCustomMessageSave} className="relative w-[25px] h-[25px] bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3"></div>
            )}

            <h3 className="para-font text-md md:text-lg text-[#0D0D0D] font-[500]">
              Custom Message
            </h3>
          </div>
          <div
            className={`p-4 rounded-lg ${
              isCustomMessageSaved ? "bg-[#CEFFDC]" : "bg-[#CDCDCD]"
            }`}
          >
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end relative z-10">
              <Button onClick={handleCustomMessageSave} className="">
                ENTER
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: PublicChat Preview */}
      <div
        className="w-full lg:w-2/5 py-2 lg:py-8 flex flex-col items-center justify-center bg-[#d4deff]"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div
          className="w-[300px] xs:w-[320px] py-6 lg:py-4 lg:px-6 lg:w-[350px] xlg:w-[380px] xl:w-[410px]"
          style={{
            maxWidth: 600,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {previewConfig && (
            <PublicChat
              key={previewKey}
              previewConfig={previewConfig}
              chatHeight={null}
              isPreview={true}
            />
          )}
          {!previewConfig && activeBotData && (
            <PublicChat
              key={`initial-${previewKey}`}
              previewConfig={activeBotData}
              chatHeight={null}
              isPreview={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeText;
