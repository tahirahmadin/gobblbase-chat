import React from "react";
import { ModelOption } from "./types";
import { MODEL_PRESETS } from "./constants";

interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-900">
            Select Model
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {MODEL_PRESETS.map((modelOption) => (
            <button
              key={modelOption.id}
              onClick={() => setModel(modelOption.id)}
              className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                model === modelOption.id
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={modelOption.image}
                    alt={modelOption.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {model === modelOption.id && (
                    <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">
                    {modelOption.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {modelOption.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {modelOption.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Context: {modelOption.contextWindow}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      {modelOption.details}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
