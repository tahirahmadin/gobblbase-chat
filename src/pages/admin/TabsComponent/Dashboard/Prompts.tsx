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
import styled from "styled-components";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
const Icon = styled.button`
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #aeb8ff;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #aeb8ff;
  }

  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #aeb8ff;
  }
`;
const Button = styled.button`
  position: relative;
  background: #4d65ff;
  padding: 1vh 2vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  background: #6aff97;
  font-weight: bold;
  @media (max-width: 600px) {
    min-width: 120px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 6px;
    right: -6px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }

  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
const Card = styled.div`
  position: relative;

  height: 100%;
  min-height: 500px
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #BFBFBF;
  @media (max-width: 600px) {
    width: 90%;
  }
  &::before {
    box-sizing: border-box;
    content: "";
    position: absolute;
    top: 8px;
    right: -8px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1;
    background: #BFBFBF;
  }

  .btn-container {
    z-index: 2;
  }
    @media (max-width: 500px){
      margin: 4vh 0
    }
`;
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
    <div className="w-full h-full flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden">
      {/* side content */}
      <div className="w-full lg:w-3/5 rounded-lg flex flex-col gap-2 lg:gap-4 lg:overflow-y-auto">
        <div className="px-4 mt-8 lg:pl-14">
          <h2 className="main-font font-bold text-lg sm:text-xl md:text-2xl text-[#000000] mb-1">
            Opening Prompts
          </h2>
          <p className="para-font text-xs md:text-sm text-[#0D0D0D] mb-2 font-[500]">
            Choose from predefined prompts or add custom ones (max 4 total)
          </p>
        </div>
        {activeBotData?.isQueryable === false && (
          <div className="w-full flex items-center z-10 relative px-4 my-8 lg:pl-14">
            <Card className="w-[90%] h-[650px] border-2 border-[#222b5f] rounded-none flex flex-col justify-center items-center gap-4 py-14 px-8">
              <h2 className="main-font font-semibold text-md sm:text-md text-[#000000] mb-1 text-center">
                Prompts are generated by the activation of your AI Agent's
                brain.
              </h2>
              <div className="mb-4">
                <img
                  src="/assets/ai-model-activate.png"
                  alt="AI Brain"
                  className=""
                />
              </div>
              <div className="flex justify-end relative z-10">
                <Button
                  className=""
                  onClick={() => navigate("/admin/dashboard/brain")}
                >
                  ACTIVATE AI BRAIN
                </Button>
              </div>
            </Card>
          </div>
        )}
        {activeBotData?.isQueryable === true && (
          <div className="px-4 mt-8 lg:pl-14">
          <div className="flex justify-end relative z-10 mb-4">
              <Button
                onClick={handleGeneratePrompts}
                className="disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate New Prompts"}
              </Button>
            </div>

            <div className="">
              <div className="flex items-center justify-between mb-3">
                <h3 className="para-font text-[#000000] block text-[16px] sm:text-lg font-medium">
                  Predefined Prompts
                </h3>
                <button
                  onClick={() => setSelectedPrompts([])}
                  className="para-font border border-[#7D7D7D] text-[#7D7D7D] px-2 py-0.5 xs:px-4 rounded-xl "
                >  
                Remove
                </button>
              </div>

              <div className="space-y-2">
                {generatedPrompts.map((prompt) => (
                  <div key={prompt} className="flex gap-4 items-center">
                    {activeBotData?.prompts?.includes(prompt) ? (
                      <>
                        <div className="relative w-[25px] h-[25px] bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3">
                          <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                        </div>
                      </>
                    ) : (
                      <div className="relative w-[25px] h-[25px] bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3"></div>
                    )}
                    <button
                      onClick={() => handlePromptSelect(prompt)}
                      className={`w-full text-left pl-4 pr-1 py-2 border transition-all relative
                      ${
                        activeBotData?.prompts?.includes(prompt)
                          ? "bg-[#CEFFDC] border-2 border-[#6AFF97] focus:outline-none"
                          : "border-[#7D7D7D] hover:border-gray-300"
                      }`}
                    >
                     
                     {prompt}
                    </button>
                    {activeBotData?.prompts?.includes(prompt) && (
                        <div style={{ zIndex: "4" }} className="icon relative">
                      <Icon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePrompt(prompt, false);
                        }}
                        className=""
                      >
                        <X className="w-4 h-4 stroke-[4px]" />
                      </Icon>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


            <div className="px-4 pt-8 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="para-font text-[#000000] block text-[16px] sm:text-lg font-medium">
                  CUSTOM PROMPTS
                </h3>
              </div>

              <div className="space-y-2">
                {customPrompts.map((prompt) => (

                  <div
                    key={prompt}
                    className="flex gap-4 items-center"
                  >
                  {activeBotData?.prompts?.includes(prompt) ? (
                      <>
                        <div className="relative w-[25px] h-[25px] bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3">
                          <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                        </div>
                      </>
                    ) : (
                      <div className="relative w-[25px] h-[25px] bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3"></div>
                    )}
                     <button
                      onClick={() => handlePromptSelect(prompt)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all relative
                      ${
                        activeBotData?.prompts?.includes(prompt)
                          ? "bg-[#CEFFDC] border-2 border-[#6AFF97] focus:outline-none"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                     
                     {prompt}
                    </button>

                       {activeBotData?.prompts?.includes(prompt) && (
                        <div style={{ zIndex: "4" }} className="icon relative">
                        <Icon
                          onClick={() => handleRemovePrompt(prompt, true)}
                          className=""
                        >
                          <X className="w-4 h-4 stroke-[4px]" />
                        </Icon>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pb-12 pt-8">
              <h3 className="para-font text-[#000000] block text-[16px] sm:text-lg font-medium">
                  ADD CUSTOM PROMPTS
                </h3>
              <div className="p-4 rounded-lg bg-[#CDCDCD]">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Type your custom prompt..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                   <div className="flex justify-end relative z-10 mt-2">
                  <Button
                    onClick={handleAddCustomPrompt}
                    disabled={!canAddMore}
                    className="disabled:cursor-not-allowed"
                  >
                    ENTER
                  </Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: PublicChat Preview */}
      <div
        className="w-full lg:w-2/5 py-2 lg:py-8 flex flex-col items-center justify-center bg-[#d4deff]"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div
          className="w-[300px] xs:w-[320px] py-6 lg:py-4 lg:px-6 lg:w-[350px] xlg:w-[380px] xl:w-[410px]"
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
