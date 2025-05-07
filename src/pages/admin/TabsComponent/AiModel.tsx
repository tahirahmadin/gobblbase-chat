import React, { useState } from "react";
import { MODEL_PRESETS } from "../../../utils/constants";
import { useBotConfig } from "../../../store/useBotConfig";
import { updateAgentModel } from "../../../lib/serverActions";
import toast from "react-hot-toast";

const AiModel = () => {
  const [selectedModelId, setSelectedModelId] = useState(MODEL_PRESETS[0]?.id);
  const [currentModelId, setCurrentModelId] = useState(MODEL_PRESETS[0]?.id);
  const [isSaving, setIsSaving] = useState(false);
  const { activeBotId } = useBotConfig();

  const handleSelect = (id: string) => setSelectedModelId(id);

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
    } catch (err: any) {
      toast.error(err?.message || "Failed to update model");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedModel = MODEL_PRESETS.find((m) => m.id === selectedModelId);
  const currentModel = MODEL_PRESETS.find((m) => m.id === currentModelId);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">AI Model</h2>
      <p className="text-gray-600 mb-6 max-w-2xl">
        Every AI model has its unique DNA — balancing depth, speed, and cost.
        Your selection directly shapes AI performance, impacting insight,
        efficiency, and value. Align the model with your mission.
      </p>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Browse Models */}
        <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold mb-3">Browse Models</h3>
          <div className="flex">
            {/* Model List */}
            <div className="w-56 overflow-y-auto max-h-80 pr-2 border-r border-gray-200">
              {MODEL_PRESETS.map((model) => (
                <button
                  key={model.id}
                  className={`w-full text-left px-3 py-2 mb-2 rounded-lg transition-colors border ${
                    selectedModelId === model.id
                      ? "bg-green-100 border-green-400 text-green-900"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(model.id)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{model.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Model Details */}
            <div className="flex-1 pl-6">
              {selectedModel && (
                <div className="bg-white rounded-lg p-5 border border-gray-200 min-h-[200px] flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {selectedModel.name}
                    </h4>
                    <p className="text-gray-700 mb-2">
                      {selectedModel.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedModel.traits.map((trait) => (
                        <span
                          key={trait}
                          className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-700"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {selectedModel.details}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded">
                      Credits Cost: 1
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Current Model & Actions */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={currentModel?.image}
                alt={currentModel?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-semibold text-green-700">
                Current Model
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{currentModel?.name}</span>
              <button className="ml-auto bg-green-200 text-green-900 px-3 py-1 rounded text-xs font-semibold hover:bg-green-300 transition">
                VIEW USAGE
              </button>
            </div>
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
            onClick={handleSave}
            disabled={selectedModelId === currentModelId || isSaving}
          >
            {isSaving ? "Saving..." : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiModel;
