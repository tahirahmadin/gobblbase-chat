import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { updateAgentWelcomeMessage } from "../../../lib/serverActions";
import PublicChat from "../../chatbot/PublicChat";
import { toast } from "react-hot-toast";

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
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  useEffect(() => {
    if (activeBotData) {
      setSelectedTemplate(activeBotData.welcomeMessage);
    }
  }, [activeBotData]);

  const handleTemplateSelect = async (templateText: string) => {
    setSelectedTemplate(templateText);

    if (templateText && activeBotData) {
      try {
        await updateAgentWelcomeMessage(activeBotData.agentId, templateText);

        setPreviewConfig({
          ...activeBotData,
          welcomeMessage: templateText,
        });
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

    if (activeBotData) {
      try {
        await updateAgentWelcomeMessage(activeBotData.agentId, customMessage);

        setPreviewConfig({
          ...activeBotData,
          welcomeMessage: customMessage,
        });
        setRefetchBotData();
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
                key={template}
                onClick={() => handleTemplateSelect(template)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all
                  ${
                    selectedTemplate === template
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 flex-shrink-0
                    ${
                      selectedTemplate === template
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                  <span className="text-sm text-gray-900">{template}</span>
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
