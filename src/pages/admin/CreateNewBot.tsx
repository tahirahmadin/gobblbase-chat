import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import { useBotConfig } from "../../store/useBotConfig";
import { createNewAgent } from "../../lib/serverActions";
import toast from "react-hot-toast";
import { Check, MessageSquare, Mic } from "lucide-react";
import { AVAILABLE_THEMES, PERSONALITY_OPTIONS } from "../../utils/constants";
import { PersonalityOption } from "../../types";
import PublicChat from "../chatbot/PublicChat";
import styled from "styled-components";
const Card = styled.div`
  position: relative;
  width: calc(100% - 30vw);
  height: 100%;
  padding: 4vh 0;
  min-height: 500px
  background: #eaefff;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (max-width: 600px) {
    width: 90%;
  }
  &::before {
    box-sizing: border-box;
    content: "";
    position: absolute;
    top: 17px;
    right: -17px;
    width: 100%;
    height: 100%;
    border: 8px solid #000000;
    z-index: -1;
    background: #ffffff;
  }

  .btn-container {
    z-index: 2;
  }
`;
const Button = styled.button`
  position: relative;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6aff97;
  padding: 0.75rem 1rem;
  border: 2px solid black;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #6ee7b7;
  }

  @media (max-width: 600px) {
    max-width: 200px;
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
// Theme options
const themes = AVAILABLE_THEMES;

const personalityOptions: PersonalityOption[] = PERSONALITY_OPTIONS;

const CreateNewBot: React.FC = () => {
  const navigate = useNavigate();
  const { adminId } = useAdminStore();
  const { clearBotConfig, setActiveBotId } = useBotConfig();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(personalityOptions[0]);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  // Stepper UI
  const renderStepper = () => (
    <div className="h-full flex flex-col">
      {/* Step Content */}
      {step === 1 && (
        <div className="w-full flex flex-col items-center">
          {/* Stepper Bar */}
          <div className="relative flex items-center justify-center w-[100%] mx-auto max-w-sm mb-16 mt-10">
            {[1, 2, 3].map((n, idx) => (
              <div
                key={n}
                className="relative flex items-center w-full justify-center"
              >
                {/* Red or gray connecting line */}
                {idx !== 0 && (
                  <div
                    className={`absolute top-1/2 left-[-50px] w-full h-1 z-0 ${
                      step > idx
                        ? "bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                        : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                    }`}
                  />
                )}

                {/* Step Circle */}
                <button
                  type="button"
                  className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                  ${
                    step >= n
                      ? "bg-white border-[#222b5f]"
                      : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                  }
                `}
                >
                  {n}
                </button>
              </div>
            ))}
          </div>
          <div className="main-font text-lg md:text-2xl lg:text-3xl font-bold text-black mb-2">
            Name your Agent
          </div>
          <div className="para-font text-sm md:text-lg text-black font-medium mb-4 mx-2">
            Your Brand Name, Social Handle or Name
          </div>
          <div className="w-full input-and-btn flex flex-col items-center mt-8 z-4">
            <input
              className="w-[240px] md:w-[380px] rounded-md px-4 py-3 border-[0px] bg-[#CEFFDC] shadow-[inset_0_9px_9px_0_rgba(0,0,0,0.40)] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-green-300 transition mb-2 shadow"
              maxLength={30}
              placeholder="Type here..."
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <div className="w-[240px] md:w-[380px] flex justify-between text-sm text-gray-500 mb-4">
              <span>{agentName.length}/30</span>
              {/* Empty for alignment */}
            </div>
            <div className="w-[240px] md:w-[380px] btn-container  flex justify-end">
              <Button
                className="items-end w-[120px] py-2 bg-[#aaffc6] text-black font-bold"
                disabled={!agentName.trim()}
                onClick={() => setStep(2)}
              >
                NEXT <span className="ml-1">→</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="w-full">
          {/* Stepper Bar */}
          <div className="relative flex items-center justify-center w-[100%] mx-auto max-w-sm mb-8 mt-8">
            {[1, 2, 3].map((n, idx) => (
              <div
                key={n}
                className="relative flex items-center w-full justify-center"
              >
                {/* Red or gray connecting line */}
                {idx !== 0 && (
                  <div
                    className={`absolute top-1/2 left-[-50px] w-full h-1 z-0 ${
                      step > idx
                        ? "bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                        : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                    }`}
                  />
                )}

                {/* Step Circle */}
                <button
                  type="button"
                  className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                  ${
                    step >= n
                      ? "bg-white border-[#222b5f]"
                      : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                  }
                `}
                >
                  {n}
                </button>
              </div>
            ))}
          </div>
          <div className="mb-4 pl-14">
            <h2 className="text-xl font-bold text-black">Pick a Voice</h2>
            <p className="text-sm font-[500] text-black mt-1">
              Set the tone for customer conversations
            </p>
          </div>
          <div className="w-full flex flex-col items-center">
            <div className="grid grid-cols-3 gap-4 overflow-y-auto p-3">
              {personalityOptions.map((personality) => (
                <div
                  key={personality.id}
                  className={`relative rounded-xl p-3 cursor-pointer transition-all
              ${
                selectedVoice.id === personality.id
                  ? "bg-green-50 border-2 border-black"
                  : "bg-[#f4f6ff] border-2 border-gray-400"
              }`}
                  onClick={() => setSelectedVoice(personality)}
                >
                  {/* Selection Indicator */}
                  {selectedVoice.id === personality.id && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
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
        </div>
      )}
      {step === 3 && (
        <div className="w-full h-full flex flex-row gap-0">
          {/* Left: Theme selection */}
          <div className="w-3/5 rounded-lg flex flex-col gap-4">
            {/* Stepper Bar */}
            <div className="relative flex items-center justify-center w-[100%] mx-auto max-w-sm mb-8 mt-8">
              {[1, 2, 3].map((n, idx) => (
                <div
                  key={n}
                  className="relative flex items-center w-full justify-center"
                >
                  {/* Red or gray connecting line */}
                  {idx !== 0 && (
                    <div
                      className={`absolute top-1/2 left-[-50px] w-full h-1 z-0 ${
                        step > idx
                          ? "bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                          : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                      }`}
                    />
                  )}

                  {/* Step Circle */}
                  <button
                    type="button"
                    className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                  ${
                    step >= n
                      ? "bg-white border-[#222b5f]"
                      : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                  }
                `}
                  >
                    {n}
                  </button>
                </div>
              ))}
            </div>
            <div className="pl-14">
              <h2 className="text-xl font-bold text-black">Select a Theme</h2>
              <p className="text-sm font-[500] text-black mt-1">
                Choose a look that matches your brand
              </p>
            </div>
            <div className="w-full flex flex-col items-center px-2">
              <div className="grid grid-cols-3 gap-4 overflow-y-auto p-3 max-h-[400px]">
                {themes.map((currentTheme) => (
                  <div
                    key={currentTheme.id}
                    className="relative w-44 mx-auto cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedTheme(currentTheme)}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={`border absolute  -left-3 w-7 h-7 rounded-full shadow border-2 border-white bg-gradient-to-br from-gray-300 to-gray-500 z-10 ${
                        selectedTheme.id === currentTheme.id
                          ? "bg-green-500"
                          : "opacity-100"
                      }`}
                      style={{
                        border: `2px solid black`,
                        background:
                          selectedTheme.id === currentTheme.id
                            ? "#6aff97"
                            : "#bdbdbd",
                      }}
                    />

                    {/* Theme Header Bar */}
                    <div
                      className="mt-2"
                      style={{
                        background: currentTheme.mainDarkColor,
                        height: 40,
                        borderTopRightRadius: 10,
                      }}
                    />

                    <div
                      className="flex justify-around"
                      style={{
                        backgroundColor: currentTheme.isDark
                          ? "black"
                          : "white",
                      }}
                    >
                      <button
                        onClick={() => null}
                        className={`text-xs font-bold px-4 py-1 relative flex items-center space-x-1`}
                        style={{
                          color: currentTheme.highlightColor,
                          borderBlockEnd: `4px solid ${currentTheme.highlightColor}`,
                        }}
                      >
                        <MessageSquare
                          className="h-3.5 w-3.5 font"
                          style={{
                            marginRight: 3,
                            color: currentTheme.highlightColor,
                          }}
                        />{" "}
                        CHAT
                      </button>
                    </div>

                    {/* Chat Window */}
                    <div className="bg-gray-100 rounded-xl p-4 space-y-2">
                      {/* AI Agent Message */}
                      <div className="flex">
                        <div className="bg-white rounded-lg px-3 py-1 text-black text-sm font-medium">
                          AI Agent
                        </div>
                      </div>
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div
                          className="rounded-lg px-3 py-1 text-black text-sm font-medium"
                          style={{ background: currentTheme.mainDarkColor }}
                        >
                          User
                        </div>
                      </div>
                      {/* Input Bar */}
                      <div className="flex items-center mt-2">
                        <div
                          className="flex-1 rounded-lg"
                          style={{
                            background: currentTheme.mainLightColor,
                            height: 32,
                          }}
                        />
                        <div className="ml-2 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                          <div
                            className=" right-2 p-2 rounded-full"
                            style={{
                              backgroundColor: currentTheme.highlightColor,
                            }}
                          >
                            <Mic
                              className="h-5 w-5"
                              style={{
                                color: !currentTheme.isDark ? "white" : "black",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
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
          </div>
          {/* Right: PublicChat Preview */}
          <div className="w-2/5 flex flex-col items-center justify-center h-full bg-[#d4deff]">
            <div className="w-full flex flex-col items-center">
              <div className="text-lg font-bold mb-2 mt-4">PREVIEW</div>
              <div className="w-[300px] h-[550px] border  border-gray-300 rounded-xl overflow-hidden shadow bg-white">
                <PublicChat
                  chatHeight={"550px"}
                  previewConfig={{
                    agentId: "1234",
                    username: "preview-username",
                    name: agentName || "Agent Name",
                    bio: "This is a preview agent bio section.",

                    prompts: [],
                    promotionalBanner: null,
                    isPromoBannerEnabled: false,
                    isQueryable: false,
                    logo: "",
                    sessionName: "Consultation",
                    stripeAccountId: "",
                    currency: "USD",
                    systemPrompt: "",
                    model: "",
                    themeColors: selectedTheme,
                    personalityType: {
                      name: selectedVoice.title,
                      value: selectedVoice.traits,
                    },
                    welcomeMessage: `Hi! I'm ${
                      agentName || "your agent"
                    }. How can I help you?`,
                    language: "en",
                    smartenUpAnswers: [],
                    customerLeadFlag: false,
                    preferredPaymentMethod: "",
                    paymentMethods: {
                      stripe: { enabled: false, accountId: "" },
                      razorpay: { enabled: false, accountId: "" },
                      usdt: { enabled: false, walletAddress: "", chains: [] },
                      usdc: { enabled: false, walletAddress: "", chains: [] },
                    },
                  }}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
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

        // Set the new bot as active and navigate
        setActiveBotId(response.result.agentId);
        navigate("/admin/dashboard/profile");
      } else {
        toast.error("Failed to create agent");
      }
    } catch (e) {
      toast.error("Bot limit reached, Upgrade your plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#b6baf8] flex flex-col">
      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center z-10 relative">
        <Card className="w-[80%] h-[650px] max-w-6xl  border-2 border-[#222b5f] bg-[#eaefff] rounded-none flex flex-col justify-center items-center p-0">
          <div className="w-full h-full flex flex-col">{renderStepper()}</div>
        </Card>
      </div>
    </div>
  );
};

export default CreateNewBot;
