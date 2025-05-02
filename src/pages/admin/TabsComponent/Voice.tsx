import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { updateAgentVoicePersonality } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import toast from "react-hot-toast";

interface PersonalityOption {
  id: string;
  title: string;
  traits: string[];
  isCustom?: boolean;
}

const personalityOptions: PersonalityOption[] = [
  {
    id: "friend",
    title: "FRIEND",
    traits: ["Warm", "Relatable", "Conversational"],
  },
  {
    id: "concierge",
    title: "CONCIERGE",
    traits: ["Polished", "Refined", "Formal"],
  },
  {
    id: "coach",
    title: "COACH",
    traits: ["Upbeat", "Encouraging", "Motivational"],
  },
  {
    id: "professional",
    title: "PROFESSIONAL",
    traits: ["Direct", "Authentic", "Clear"],
  },
  {
    id: "gen_z",
    title: "GEN Z",
    traits: ["Casual", "Witty", "Trendy"],
  },
  {
    id: "techie",
    title: "TECHIE",
    traits: ["Intuitive", "Intelligent", "Resourceful"],
  },
  {
    id: "custom",
    title: "CUSTOM",
    traits: ["Create your own", "custom voice"],
    isCustom: true,
  },
];

const Voice = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedPersonality, setSelectedPersonality] =
    useState<string>("friend");
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [customVoiceCharacteristics, setCustomVoiceCharacteristics] =
    useState("");
  const [customVoiceExamples, setCustomVoiceExamples] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeBotData?.voicePersonality) {
      setSelectedPersonality(activeBotData.voicePersonality);
      if (activeBotData.voicePersonality === "custom") {
        setCustomVoiceName(activeBotData.customVoiceName || "");
        setCustomVoiceCharacteristics(
          activeBotData.customVoiceCharacteristics || ""
        );
        setCustomVoiceExamples(activeBotData.customVoiceExamples || "");
      }
    }
  }, [activeBotData]);

  const handlePersonalitySelect = (personalityId: string) => {
    setSelectedPersonality(personalityId);
  };

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    if (
      selectedPersonality === "custom" &&
      (!customVoiceName || !customVoiceCharacteristics || !customVoiceExamples)
    ) {
      toast.error("Please fill in all custom voice fields");
      return;
    }

    try {
      setIsSaving(true);
      await updateAgentVoicePersonality(
        activeBotId,
        selectedPersonality,
        selectedPersonality === "custom" ? customVoiceName : undefined,
        selectedPersonality === "custom"
          ? customVoiceCharacteristics
          : undefined,
        selectedPersonality === "custom" ? customVoiceExamples : undefined
      );
      setRefetchBotData();
      toast.success("Voice personality updated successfully");
    } catch (error: any) {
      console.error("Error updating voice personality:", error);
      toast.error(error.message || "Failed to update voice personality");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Voice Personality
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define how your AI communicates with customers
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {personalityOptions.map((personality) => (
          <div
            key={personality.id}
            className={`relative rounded-lg p-4 cursor-pointer transition-all
              ${
                selectedPersonality === personality.id
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-[#f4f6ff] border-2 border-transparent"
              }`}
            onClick={() => handlePersonalitySelect(personality.id)}
          >
            {/* Selection Indicator */}
            {selectedPersonality === personality.id && (
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white">
                <img
                  src="/assets/tone-icon.jpg"
                  alt={`${personality.title} personality`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {personality.title}
                </h3>
                <div className="space-y-0.5">
                  {personality.traits.map((trait, index) => (
                    <p key={index} className="text-xs text-gray-600">
                      {trait}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Voice Section - Show only when custom is selected */}
      {selectedPersonality === "custom" && (
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Customize Your Voice
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice Name
              </label>
              <input
                type="text"
                value={customVoiceName}
                onChange={(e) => setCustomVoiceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Give your voice personality a name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice Characteristics
              </label>
              <textarea
                value={customVoiceCharacteristics}
                onChange={(e) => setCustomVoiceCharacteristics(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the characteristics of your custom voice personality..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Responses
              </label>
              <textarea
                value={customVoiceExamples}
                onChange={(e) => setCustomVoiceExamples(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Provide example responses in your desired voice style..."
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Saving...</span>
            </div>
          ) : (
            "SAVE"
          )}
        </button>
      </div>
    </div>
  );
};

export default Voice;
