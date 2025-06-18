import React, { useState, useEffect } from "react";
import { updateAgentVoicePersonality } from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { PERSONALITY_OPTIONS } from "../../../../utils/constants";
import { PersonalityOption } from "../../../../types";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 600px) {
    min-width: 120px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }

  &:disabled {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
    color: #7d7d7d;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #cdcdcd;
    border: 1px solid #7d7d7d;
  }
`;
const personalityOptions: PersonalityOption[] = PERSONALITY_OPTIONS;

const Voice = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [selectedPersonality, setSelectedPersonality] =
    useState<PersonalityOption>(personalityOptions[0]);
  const [initialPersonality, setInitialPersonality] =
    useState<PersonalityOption>(personalityOptions[0]);
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [customVoiceCharacteristics, setCustomVoiceCharacteristics] =
    useState("");
  const [customVoiceExamples, setCustomVoiceExamples] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeBotData?.personalityType) {
      const personality = personalityOptions.find(
        (option) => option.title === activeBotData.personalityType.name
      );
      if (personality) {
        setSelectedPersonality(personality);
        setInitialPersonality(personality);
      }
    }
  }, [activeBotData]);

  const hasChanges = () => {
    return selectedPersonality.id !== initialPersonality.id;
  };

  const handlePersonalitySelect = (personality: PersonalityOption) => {
    setSelectedPersonality(personality);
  };

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    if (
      selectedPersonality.id === "custom" &&
      (!customVoiceName || !customVoiceCharacteristics || !customVoiceExamples)
    ) {
      toast.error("Please fill in all custom voice fields");
      return;
    }

    try {
      setIsSaving(true);
      await updateAgentVoicePersonality(activeBotId, {
        name: selectedPersonality.title,
        value: selectedPersonality.traits,
      });
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
    <div className="max-w-7xl mx-auto p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-[1000] text-black">Voice Personality</h2>
        <p className="text-sm font-[500] text-black mt-1">
          Define how your AI communicates with customers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-4">
        {personalityOptions.map((personality) => (
          <div
            key={personality.id}
            className={`relative rounded-xl p-4 cursor-pointer transition-all
              ${
                selectedPersonality.id === personality.id
                  ? "bg-[#CEFFDC] border-2 border-black"
                  : "bg-[#EAEFFF] border-2 border-gray-400"
              }`}
            onClick={() => handlePersonalitySelect(personality)}
          >
            {/* Selection Indicator */}
            {selectedPersonality.id === personality.id ? (
              <>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000]"></div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
              </>
            ) : (
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center bg-[#EAEFFF] border border-[#7D7D7D] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)]"></div>
            )}

            <div className="flex items-start space-x-5">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-white">
                <img
                  src={personality.image}
                  alt={`${personality.title} personality`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 ">
                <h3 className="text-md font-semibold black mb-1">
                  {personality.title}
                </h3>
                <hr
                  className="my-3 border-black w-10 "
                  style={{ border: "2px solid black", borderRadius: 30 }}
                />

                <div className="space-y-0.5">
                  {personality.traits.map((trait, index) => (
                    <p key={index} className="text-sm text-black">
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
      {/* {selectedPersonality === "custom" && (
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
      )} */}

      <div className="flex justify-end relative z-10">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges()}
          className={`${isSaving || !hasChanges() ? "cursor-not-allowed" : ""}`}
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Saving...</span>
            </div>
          ) : (
            "SAVE"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Voice;
