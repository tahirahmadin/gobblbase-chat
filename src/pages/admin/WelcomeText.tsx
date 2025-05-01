import React, { useState } from "react";
import { useBotConfig } from "../../store/useBotConfig";
import { updateAgentDetails } from "../../lib/serverActions";
import PublicChat from "../chatbot/PublicChat";
import { toast } from "react-hot-toast";

const welcomeTemplates = [
  {
    id: "default",
    text: "Hi there! How can I help you?",
  },
  {
    id: "support",
    text: "Thank you for reaching out. How can I support you right now?",
  },
  {
    id: "shop",
    text: "Welcome to our shop! Can I help you with recommendations, or track an order?",
  },
  {
    id: "meeting",
    text: "Hello, thanks for reaching out! Can I help you set up a meeting?",
  },
  {
    id: "mission",
    text: "Thank you for supporting our mission! How can I help you today?",
  },
  {
    id: "project",
    text: "Greetings! Looking to kickstart a project? Let's chat!",
  },
];

const WelcomeText = () => {
  const { activeBotData } = useBotConfig();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [customMessage, setCustomMessage] = useState("");
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = welcomeTemplates.find((t) => t.id === templateId);

    if (template && activeBotData) {
      try {
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
          themeColors: activeBotData.themeColors,
          welcomeMessage: template.text,
        });

        setPreviewConfig({
          ...activeBotData,
          welcomeMessage: template.text,
        });

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

    if (activeBotData) {
      try {
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
          themeColors: activeBotData.themeColors,
          welcomeMessage: customMessage,
        });

        setPreviewConfig({
          ...activeBotData,
          welcomeMessage: customMessage,
        });

        toast.success("Custom welcome message updated successfully");
      } catch (error) {
        toast.error("Failed to update welcome message");
        console.error("Error updating welcome message:", error);
      }
    }
  };

  return (
    <div className="container grid grid-cols-5 w-full bg-white">
      <div className="col-span-3 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Welcome Text</h2>
          <p className="text-sm text-gray-600 mt-1">
            Custom design your opening message to your audience
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Templates</h3>
          <div className="space-y-2">
            {welcomeTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all
                  ${
                    selectedTemplate === template.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 flex-shrink-0
                    ${
                      selectedTemplate === template.id
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                  <span className="text-sm text-gray-900">{template.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Custom Message
          </h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <button
              onClick={handleCustomMessageSave}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Custom Message
            </button>
          </div>
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

export default WelcomeText;
