import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useBotConfig } from "../../../../store/useBotConfig";
import {
  updateAgentPrompts,
  queryDocument,
  updateGeneratedPrompts,
} from "../../../../lib/serverActions";
import PublicChat from "../../../chatbot/PublicChat";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const GENERIC_LLM_SYSTEM_PROMPT = (context: string) =>
  `You are an AI assistant helping to engage users for a business or service. Based on the following context, generate 8 engaging, concise, and friendly opening prompts (cues) that encourage users to interact, ask questions, or explore the agent's capabilities. Make sure to never use kifor related text while genrating prompts. Return only array of strings of max 3-4 words each.\n Context:\n${context}. Output format should be a JSON array of strings as example: ["Return policy?","Best Products?","Summarise the business!","Need support?","Consltation fees?","Book live call","Explore our features!"]`;

const Prompts = () => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [previewConfig, setPreviewConfig] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // To set backend generated prompts
  useEffect(() => {
    if (activeBotData && activeBotData?.generatedPrompts?.length > 0) {
      setGeneratedPrompts(activeBotData.generatedPrompts);
    }
  }, [activeBotData]);

  // To generate new prompts
  useEffect(() => {
    if (activeBotData?.generatedPrompts?.length === 0) {
      handleGeneratePrompts();
    }
  }, [activeBotData]);

  useEffect(() => {
    if (activeBotData?.prompts && generatedPrompts?.length > 0) {
      // Split prompts into default and custom
      const generatedSelected = activeBotData.prompts.filter((prompt) =>
        generatedPrompts.includes(prompt)
      );
      const customSelected = activeBotData.prompts.filter(
        (prompt) => !generatedPrompts.includes(prompt)
      );
      setSelectedPrompts(generatedSelected);
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

  const handleGeneratePrompts = async () => {
    if (!activeBotData?.agentId) {
      toast.error("No agent selected.");
      return;
    }
    setIsGenerating(true);
    try {
      // Fetch context from backend
      const contextResult = await queryDocument(
        activeBotData.agentId,
        "Give me a summary of this agent's business, offerings, and user goals so that I can generate cues/prompts for the agent."
      );
      const context = contextResult.toString() || "";
      // Compose LLM system prompt
      const systemPrompt = GENERIC_LLM_SYSTEM_PROMPT(context);
      // LLM Call
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.6,
      });

      let output = completion.choices[0].message.content;
      let cleanOutput = JSON.parse(output || "[]");
      console.log(cleanOutput);

      let llmPrompts: string[] = [];
      try {
        llmPrompts = JSON.parse(output || "[]");
      } catch {
        toast.error("Failed to parse LLM response");
        setIsGenerating(false);
        return;
      }

      // Update generated prompts to backend
      const success = await updateGeneratedPrompts(
        activeBotData.agentId,
        llmPrompts
      );
      setRefetchBotData();
      console.log(success);
      if (!success) {
        toast.error("Failed to update generated prompts to backend");
        setIsGenerating(false);
        return;
      }

      // Update UI state after successful backend update
      setGeneratedPrompts(llmPrompts);
      setSelectedPrompts(llmPrompts.slice(0, 4));
      toast.success("Prompts generated and updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate prompts");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-5 w-full bg-white"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="col-span-1 lg:col-span-3 p-4 lg:p-6 overflow-y-auto h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black">Opening Prompts</h2>
          <p className="text-sm font-[500] text-gray-600 mt-1">
            Choose from predefined prompts or add custom ones (max 4 total)
          </p>
        </div>

        {activeBotData?.isQueryable === false && (
          <div className="flex items-start justify-start h-full bg-white px-4">
            <div className="flex flex-col items-center justify-center bg-gray-200 rounded-lg p-8 mb-4">
              <div className="mb-4">
                <img
                  src="/assets/ai-model-activate.png"
                  alt="AI Brain"
                  className="w-16 h-16 mx-auto rounded-full"
                />
              </div>
              <div className="text-center text-gray-700 mb-4">
                Prompts are generated by the activation of your AI Agent's
                brain.
              </div>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                onClick={() => navigate("/admin/dashboard/brain")}
              >
                ACTIVATE AI BRAIN
              </button>
            </div>
          </div>
        )}
        {activeBotData?.isQueryable === true && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleGeneratePrompts}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate New Prompts"}
              </button>
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
                {generatedPrompts.map((prompt) => (
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
        )}
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

export default Prompts;
