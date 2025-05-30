import React, { useEffect, useState } from "react";
import { MODEL_PRESETS } from "../../../../utils/constants";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateAgentModel } from "../../../../lib/serverActions";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  white-space: nowrap;
  @media (max-width: 600px) {
    min-width: 120px;
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
    background: #6aff97;
  }

  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
    color: black;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
const AiModel = () => {
  const [selectedModelId, setSelectedModelId] = useState("");
  const [currentModelId, setCurrentModelId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { activeBotId, setRefetchBotData, activeBotData } = useBotConfig();

  useEffect(() => {
    if (activeBotData?.model) {
      const modelFromPresets = MODEL_PRESETS.find(
        (m) => m.name === activeBotData.model
      );
      if (modelFromPresets) {
        setCurrentModelId(modelFromPresets.id);
        setSelectedModelId(modelFromPresets.id);
      } else {
        // If model not found in presets, default to first model
        console.warn(
          `Model ${activeBotData.model} not found in presets, defaulting to first model`
        );
        setCurrentModelId(MODEL_PRESETS[0].id);
        setSelectedModelId(MODEL_PRESETS[0].id);
      }
    } else {
      // If no model is set, default to first model
      setCurrentModelId(MODEL_PRESETS[0].id);
      setSelectedModelId(MODEL_PRESETS[0].id);
    }
  }, [activeBotData?.model]);

  const handleSelect = (id: string) => {
    setSelectedModelId(id);
    setIsDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected.");
      return;
    }
    setIsSaving(true);
    try {
      const selectedModel = MODEL_PRESETS.find((m) => m.id === selectedModelId);
      await updateAgentModel(activeBotId, selectedModel?.name || "");

      setCurrentModelId(selectedModelId);
      toast.success("Model updated successfully!");
      setRefetchBotData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update model");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedModel = MODEL_PRESETS.find((m) => m.id === selectedModelId);
  const currentModel = MODEL_PRESETS.find((m) => m.id === currentModelId);

  return (
    <div className="py-6 px-4 lg:p-8 w-full">
      <div className="upper flex flex-col md:flex-row md:gap-4">
        <span className="content">
          <h2 className="main-font font-bold text-lg sm:text-xl md:text-2xl text-[#000000] mb-2">
            Ai Model
          </h2>
          <p className="para-font text-xs md:sm text-[#0D0D0D] mb-4 font-[500]">
            Every AI model has its unique DNA — balancing depth, speed, and
            cost. Your selection directly shapes AI performance, impacting
            insight, efficiency, and value. Align the model with your mission.
          </p>
        </span>

        {/* Current Model */}
        <div className="lg:pl-6 w-full">
          <span className="para-font text-[#000000] block text-sm sm:text-lg font-medium">
            Current Model
          </span>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2 px-2 py-[1vh] border w-[80%] lg:w-[90%] bg-[#CEFFDC] border-2 border-[#6AFF97] focus:outline-none">
              <img
                src={currentModel?.image}
                alt={currentModel?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-medium text-sm lg:text-base truncate">
                {currentModel?.name}
              </span>
            </div>
            <div style={{ zIndex: "4" }} className="flex justify-end relative">
              <Link to="/admin/account/usage">
                <Button className="transition wordspace-nowrap">
                  VIEW USAGE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
        {/* Model Selection Dropdown */}
        <div className="relative w-full flex h-fit">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 border bg-[#D4DEFF] border-1 border-[#000000] focus:outline-none w-full transition-colors"
          >
            <div className="flex items-center gap-2">
              <img
                src={selectedModel?.image}
                alt={selectedModel?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-medium text-sm lg:text-base">
                  {selectedModel?.name}
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                  Select AI Model
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-16 z-10 w-full mt-1 bg-white border border-[#000000] shadow-lg max-h-100 overflow-y-auto">
              {MODEL_PRESETS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors ${
                    selectedModelId === model.id
                      ? "border bg-[#CEFFDC] focus:outline-none"
                      : ""
                  }`}
                >
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-medium text-sm lg:text-base">
                      {model.name}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500">
                      {model.traits[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Details */}
        {selectedModel && (
          <div className="p-3 border bg-[#EAEFFF] border-1 border-[#000000] focus:outline-none w-full">
            <div>
              <h4 className="text-base lg:text-lg font-semibold mb-2">
                {selectedModel.name}
              </h4>
              <p className="text-sm lg:text-base text-gray-700 mb-3">
                {selectedModel.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedModel.traits.map((trait) => (
                  <span
                    key={trait}
                    className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-700"
                  >
                    {trait}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {selectedModel.details}
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded">
                  Credits Cost: {selectedModel.creditsCost}
                </span>
                <div
                  style={{ zIndex: "4" }}
                  className="flex justify-end relative"
                >
                  <Button
                    className=""
                    onClick={handleSave}
                    disabled={selectedModelId === currentModelId || isSaving}
                  >
                    {isSaving ? "Saving..." : "SAVE"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiModel;
