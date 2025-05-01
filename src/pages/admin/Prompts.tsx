import React, { useState } from "react";
import { X } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import { updateAgentDetails } from "../../lib/serverActions";
import PublicChat from "../chatbot/PublicChat";
import { toast } from "react-hot-toast";

const defaultPrompts = [
  { id: "bestsellers", text: "View Bestsellers" },
  { id: "booking", text: "Book a Meeting" },
  { id: "demo", text: "Schedule Demo" },
  { id: "collection", text: "View Latest Collection" },
  { id: "contact", text: "Submit Contact Details" },
  { id: "offers", text: "Current Offers" },
  { id: "returns", text: "Shipping & Returns Policy" },
  { id: "more", text: "Tell me more" },
];

const Prompts = () => {
  const { activeBotData } = useBotConfig();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([
    "bestsellers",
    "booking",
  ]);
  const [customPrompts, setCustomPrompts] = useState<string[]>(["query"]);
  const [newPrompt, setNewPrompt] = useState("");
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  const allPrompts = [...selectedPrompts, ...customPrompts];
  const canAddMore = allPrompts.length < 4;

  const handlePromptSelect = async (promptId: string) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter((id) => id !== promptId));
    } else if (canAddMore) {
      setSelectedPrompts([...selectedPrompts, promptId]);
    } else {
      toast.error("You can only select up to 4 prompts");
      return;
    }

    if (activeBotData) {
      try {
        const updatedPrompts = selectedPrompts.includes(promptId)
          ? selectedPrompts.filter((id) => id !== promptId)
          : canAddMore
          ? [...selectedPrompts, promptId]
          : selectedPrompts;

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
          prompts: [...updatedPrompts, ...customPrompts],
        });

        setPreviewConfig({
          ...activeBotData,
          prompts: [...updatedPrompts, ...customPrompts],
        });

        toast.success("Prompts updated successfully");
      } catch (error) {
        toast.error("Failed to update prompts");
        console.error("Error updating prompts:", error);
      }
    }
  };

  const handleAddCustomPrompt = async () => {
    if (!newPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!canAddMore) {
      toast.error("You can only have up to 4 prompts");
      return;
    }

    if (activeBotData) {
      try {
        const updatedCustomPrompts = [...customPrompts, newPrompt];

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
          prompts: [...selectedPrompts, ...updatedCustomPrompts],
        });

        setCustomPrompts(updatedCustomPrompts);
        setNewPrompt("");

        setPreviewConfig({
          ...activeBotData,
          prompts: [...selectedPrompts, ...updatedCustomPrompts],
        });

        toast.success("Custom prompt added successfully");
      } catch (error) {
        toast.error("Failed to add custom prompt");
        console.error("Error adding custom prompt:", error);
      }
    }
  };

  const handleRemovePrompt = async (promptId: string, isCustom: boolean) => {
    if (activeBotData) {
      try {
        let updatedSelected = [...selectedPrompts];
        let updatedCustom = [...customPrompts];

        if (isCustom) {
          updatedCustom = customPrompts.filter((prompt) => prompt !== promptId);
          setCustomPrompts(updatedCustom);
        } else {
          updatedSelected = selectedPrompts.filter((id) => id !== promptId);
          setSelectedPrompts(updatedSelected);
        }

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
          prompts: [...updatedSelected, ...updatedCustom],
        });

        setPreviewConfig({
          ...activeBotData,
          prompts: [...updatedSelected, ...updatedCustom],
        });

        toast.success("Prompt removed successfully");
      } catch (error) {
        toast.error("Failed to remove prompt");
        console.error("Error removing prompt:", error);
      }
    }
  };

  return (
    <div className="container grid grid-cols-5 w-full bg-white">
      <div className="col-span-3 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Opening Prompts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Curate AI interaction prompts to appear on chat initiation
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Select upto 4 Prompts
            </h3>
            <button
              onClick={() => setSelectedPrompts([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              REMOVE
            </button>
          </div>

          <div className="space-y-2">
            {defaultPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptSelect(prompt.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all relative
                  ${
                    selectedPrompts.includes(prompt.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 flex-shrink-0
                    ${
                      selectedPrompts.includes(prompt.id)
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                  <span className="text-sm text-gray-900">{prompt.text}</span>
                </div>
                {selectedPrompts.includes(prompt.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePrompt(prompt.id, false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CUSTOM</h3>
          <div className="space-y-2">
            {customPrompts.map((prompt) => (
              <div
                key={prompt}
                className="flex items-center px-4 py-3 rounded-lg bg-green-50 border border-green-500"
              >
                <div className="w-4 h-4 rounded-full mr-3 bg-green-500" />
                <span className="text-sm text-gray-900">{prompt}</span>
                <button
                  onClick={() => handleRemovePrompt(prompt, true)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            ADD NEW PROMPT
          </h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Type your prompt..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomPrompt}
                disabled={!canAddMore}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ENTER
              </button>
            </div>
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

export default Prompts;
