import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import { useBotConfig } from "../../store/useBotConfig";
import { createNewAgent } from "../../lib/serverActions";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { AVAILABLE_THEMES, PERSONALITY_OPTIONS } from "../../utils/constants";
import { PersonalityOption } from "../../types";

// Theme options
const themes = AVAILABLE_THEMES;

const personalityOptions: PersonalityOption[] = PERSONALITY_OPTIONS;

const stepLabels = ["Agent Name", "Choose Voice", "Choose Theme"];

const CreateNewBot: React.FC = () => {
  const navigate = useNavigate();
  const { adminId } = useAdminStore();
  const { clearBotConfig } = useBotConfig();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(personalityOptions[0]);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  // Stepper UI
  const renderStepper = () => (
    <div className="h-full  flex flex-col">
      {/* Centered card with stepper and content */}
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg flex flex-row p-0 h-full">
          {/* Vertical Stepper */}
          <div className="flex flex-col justify-center items-start bg-[#e7eaff] rounded-l-lg py-12 px-8 min-w-[220px] gap-6">
            {[1, 2, 3].map((n, idx) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-lg border-2 ${
                    step === n
                      ? "bg-[#000000] border-[#222b5f]"
                      : "bg-gray-300 border-gray-300"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`font-semibold text-base ${
                    step === n ? "text-[#4d66ff]" : "text-gray-400"
                  }`}
                >
                  {stepLabels[idx]}
                </span>
              </div>
            ))}
          </div>
          {/* Step Content */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 px-4 h-full w-full">
            {step === 1 && (
              <div className="w-full max-w-lg  rounded-lg p-8 shadow  flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold text-lg">
                    Name your Agent
                  </label>
                  <div className="flex gap-2">
                    <button className="p-1" title="Edit">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                          fill="#222b5f"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-1"
                      title="Clear"
                      onClick={() => setAgentName("")}
                    >
                      {" "}
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="#d32f2f"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Type your name or brand"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <button
                    className="px-8 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-500 transition"
                    disabled={!agentName.trim()}
                    onClick={() => setStep(2)}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="w-full max-w-lg  rounded-lg flex flex-col gap-4 ">
                <label className="block font-semibold text-lg mb-2">
                  Give your Agent a personality
                </label>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto h-[400px]">
                  {personalityOptions.map((v) => (
                    <div
                      key={v.id}
                      className={`relative rounded-lg p-4 cursor-pointer transition-all flex items-start gap-3
                        ${
                          selectedVoice.id === v.id
                            ? "bg-green-50 border-2 border-green-500"
                            : "bg-[#f4f6ff] border-2 border-transparent"
                        }`}
                      onClick={() => setSelectedVoice(v)}
                    >
                      {/* Selection Indicator */}
                      {selectedVoice.id === v.id && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white">
                        <img
                          src="/assets/tone-icon.jpg"
                          alt={`${v.title} personality`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {v.title}
                        </div>
                        <div className="space-y-0.5">
                          {v.traits.map((trait, idx) => (
                            <p key={idx} className="text-xs text-gray-600">
                              {trait}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-8 py-2 bg-gray-200 rounded font-bold"
                    onClick={() => setStep(1)}
                  >
                    BACK
                  </button>
                  <button
                    className="px-8 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-500 transition"
                    onClick={() => setStep(3)}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="w-full  rounded-lg  flex flex-col gap-4">
                <label className="block font-semibold text-lg mb-4">
                  Select a custom Theme for your Chatbot
                </label>
                <div className="grid grid-cols-3 gap-6">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      className={`relative cursor-pointer transition-all hover:scale-105 rounded-lg border-2
                        ${
                          selectedTheme.id === t.id
                            ? "border-green-500 ring-2 ring-green-400"
                            : "border-black"
                        }`}
                      onClick={() => setSelectedTheme(t)}
                      style={{ background: "#fff" }}
                    >
                      {/* Selection Circle */}
                      <div
                        className={`absolute -top-3 -left-3 w-5 h-5 rounded-full border-2 border-white shadow-sm z-10
                          ${
                            selectedTheme.id === t.id
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                      />
                      {/* Chat Preview Card */}
                      <div className="border rounded-lg overflow-hidden shadow-sm">
                        {/* Chat Header */}
                        <div
                          className="p-2 border-b"
                          style={{ backgroundColor: t.mainDarkColor }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: t.highlightColor }}
                              >
                                CHAT
                              </span>
                            </div>
                            <svg
                              viewBox="0 0 24 24"
                              className="w-3 h-3"
                              style={{ color: t.highlightColor }}
                              fill="currentColor"
                            >
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </div>
                        </div>
                        {/* Messages Container */}
                        <div className="bg-gray-50 p-2 space-y-2">
                          {/* AI Message */}
                          <div className="flex items-start space-x-1">
                            <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div className="text-[11px] bg-white px-2 py-1.5 rounded-lg shadow-sm max-w-[80%]">
                              AI Agent
                            </div>
                          </div>
                          {/* User Message */}
                          <div className="flex justify-end">
                            <div
                              className="text-[11px] px-2 py-1.5 rounded-lg shadow-sm max-w-[80%]"
                              style={{
                                backgroundColor: t.mainDarkColor,
                                color: t.highlightColor,
                              }}
                            >
                              User
                            </div>
                          </div>
                        </div>
                        {/* Input Bar */}
                        <div className="p-2 bg-white border-t">
                          <div className="flex items-center justify-between bg-gray-50 rounded-full px-3 py-1.5">
                            <div className="text-[10px] text-gray-400">
                              Type a message...
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-3 h-3 text-gray-400"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-8 py-2 bg-gray-200 rounded font-bold"
                    onClick={() => setStep(2)}
                  >
                    BACK
                  </button>
                  <button
                    className="px-8 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-500 transition"
                    onClick={handleFinish}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "FINISH"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Handle agent creation
  async function handleFinish() {
    if (!adminId) return;
    setLoading(true);

    try {
      const response = await createNewAgent(
        adminId,
        agentName,
        { name: selectedVoice.title, value: selectedVoice.traits },
        selectedTheme
      );
      if (!response.error) {
        toast.success("Agent created successfully!");
        // Clear any existing bot config before redirecting
        clearBotConfig();
        // Redirect to dashboard
        navigate("/admin/dashboard/profile");
      } else {
        toast.error("Failed to create agent");
      }
    } catch (e) {
      toast.error("An error occurred while creating agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="w-[70%] h-full mx-auto pt-14">
        <h2 className="text-2xl font-bold mb-6 ml-2">
          Set up your Agent Profile
        </h2>
        <div className="h-[600px] border-2 border-[#222b5f] bg-[#dbe4ff] shadow-[4px_4px_0_0_#222b5f] rounded-none flex flex-col justify-center items-center">
          <div className="w-full h-full flex flex-col">{renderStepper()}</div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewBot;
