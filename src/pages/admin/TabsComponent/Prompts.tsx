import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import { updateAgentPrompts } from "../../../lib/serverActions";
import PublicChat from "../../chatbot/PublicChat";
import { toast } from "react-hot-toast";

const defaultPrompts = [
  "View Bestsellers",
  "Book a Meeting",
  "Schedule Demo",
  "View Latest Collection",
  "Submit Contact Details",
  "Current Offers",
  "Shipping & Returns Policy",
  "Tell me more",
];

const Prompts = () => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [previewConfig, setPreviewConfig] = useState<any>(null);

  useEffect(() => {
    if (activeBotData?.prompts) {
      // Split prompts into default and custom
      const defaultSelected = activeBotData.prompts.filter((prompt) =>
        defaultPrompts.includes(prompt)
      );
      const customSelected = activeBotData.prompts.filter(
        (prompt) => !defaultPrompts.includes(prompt)
      );
      setSelectedPrompts(defaultSelected);
      setCustomPrompts(customSelected);
    }
  }, [activeBotData]);

  const allPrompts = [...selectedPrompts, ...customPrompts];
  const canAddMore = allPrompts.length < 4;

  const handlePromptSelect = async (prompt: string) => {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts(selectedPrompts.filter((p) => p !== prompt));
    } else if (canAddMore) {
      setSelectedPrompts([...selectedPrompts, prompt]);
    } else {
      toast.error("You can only have up to 4 prompts in total");
      return;
    }

    if (activeBotData) {
      try {
        const updatedPrompts = selectedPrompts.includes(prompt)
          ? selectedPrompts.filter((p) => p !== prompt)
          : canAddMore
          ? [...selectedPrompts, prompt]
          : selectedPrompts;

        await updateAgentPrompts(activeBotData.agentId, [
          ...updatedPrompts,
          ...customPrompts,
        ]);

        setPreviewConfig({
          ...activeBotData,
          prompts: [...updatedPrompts, ...customPrompts],
        });

        setRefetchBotData();
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
      toast.error("You can only have up to 4 prompts in total");
      return;
    }

    if (activeBotData) {
      try {
        const updatedCustomPrompts = [...customPrompts, newPrompt];

        await updateAgentPrompts(activeBotData.agentId, [
          ...selectedPrompts,
          ...updatedCustomPrompts,
        ]);

        setCustomPrompts(updatedCustomPrompts);
        setNewPrompt("");

        setPreviewConfig({
          ...activeBotData,
          prompts: [...selectedPrompts, ...updatedCustomPrompts],
        });

        setRefetchBotData();
        toast.success("Custom prompt added successfully");
      } catch (error) {
        toast.error("Failed to add custom prompt");
        console.error("Error adding custom prompt:", error);
      }
    }
  };

  const handleRemovePrompt = async (prompt: string, isCustom: boolean) => {
    if (activeBotData) {
      try {
        let updatedSelected = [...selectedPrompts];
        let updatedCustom = [...customPrompts];

        if (isCustom) {
          updatedCustom = customPrompts.filter((p) => p !== prompt);
          setCustomPrompts(updatedCustom);
        } else {
          updatedSelected = selectedPrompts.filter((p) => p !== prompt);
          setSelectedPrompts(updatedSelected);
        }

        await updateAgentPrompts(activeBotData.agentId, [
          ...updatedSelected,
          ...updatedCustom,
        ]);

        setPreviewConfig({
          ...activeBotData,
          prompts: [...updatedSelected, ...updatedCustom],
        });

        setRefetchBotData();
        toast.success("Prompt removed successfully");
      } catch (error) {
        toast.error("Failed to remove prompt");
        console.error("Error removing prompt:", error);
      }
    }
  };

  return (
    <div
      className="grid grid-cols-5 w-full bg-white"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="col-span-3 p-6 overflow-y-auto h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black">Opening Prompts</h2>
          <p className="text-sm font-[500] text-gray-600 mt-1">
            Choose from predefined prompts or add custom ones (max 4 total)
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Predefined Prompts
            </h3>
            <button
              onClick={() => setSelectedPrompts([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              CLEAR ALL
            </button>
          </div>

          <div className="space-y-2">
            {defaultPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptSelect(prompt)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all relative
                  ${
                    activeBotData?.prompts?.includes(prompt)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 flex-shrink-0
                    ${
                      activeBotData?.prompts?.includes(prompt)
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                  <span className="text-sm text-gray-900">{prompt}</span>
                </div>
                {activeBotData?.prompts?.includes(prompt) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePrompt(prompt, false);
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
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Custom Prompts
          </h3>
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
            Add Custom Prompt
          </h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Type your custom prompt..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomPrompt}
                disabled={!canAddMore}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="col-span-2 h-full sticky top-0 flex items-center justify-center"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div className="mx-auto" style={{ maxWidth: 400 }}>
          <PublicChat previewConfig={previewConfig || activeBotData} />
        </div>
      </div>
    </div>
  );
};

export default Prompts;
