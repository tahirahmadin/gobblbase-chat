import React, { useState } from "react";
import { MODEL_PRESETS } from "../../../../utils/constants";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateAgentModel } from "../../../../lib/serverActions";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const AiModel = () => {
  const [selectedModelId, setSelectedModelId] = useState(MODEL_PRESETS[0]?.id);
  const [currentModelId, setCurrentModelId] = useState(MODEL_PRESETS[0]?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { activeBotId, setRefetchBotData } = useBotConfig();

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
    <div className="p-2 lg:p-8 w-full">
      <h2 className="text-xl lg:text-2xl font-bold mb-2">AI Model</h2>
      <p className="text-sm lg:text-base text-gray-600 mb-6">
        Every AI model has its unique DNA — balancing depth, speed, and cost.
        Your selection directly shapes AI performance, impacting insight,
        efficiency, and value. Align the model with your mission.
      </p>
      <div className="flex flex-col gap-4 w-full">
        {/* Model Selection Dropdown */}
        <div className="relative w-full">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {MODEL_PRESETS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors ${
                    selectedModelId === model.id ? "bg-green-50" : ""
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
          <div className="bg-white rounded-lg p-3 border border-gray-200 w-full">
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
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60 text-sm"
                  onClick={handleSave}
                  disabled={selectedModelId === currentModelId || isSaving}
                >
                  {isSaving ? "Saving..." : "SAVE"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Model */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 w-full">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={currentModel?.image}
              alt={currentModel?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-semibold text-green-700 text-sm lg:text-base">
              Current Model
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm lg:text-base">
              {currentModel?.name}
            </span>
            <div className="ml-auto ">
              <Link to="/admin/account/usage">
                <button className="ml-auto bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-semibold hover:bg-green-300 transition">
                  VIEW USAGE
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiModel;
