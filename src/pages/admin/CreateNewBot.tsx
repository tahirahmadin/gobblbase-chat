import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import { useBotConfig } from "../../store/useBotConfig";
import {
  acceptOrRejectInvite,
  createNewAgent,
  getTeamInvites,
} from "../../lib/serverActions";
import toast from "react-hot-toast";
import {
  Check,
  MessageSquare,
  Mic,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AVAILABLE_THEMES, PERSONALITY_OPTIONS } from "../../utils/constants";
import { PersonalityOption } from "../../types";
import PublicChat from "../chatbot/PublicChat";
import styled from "styled-components";
const Card = styled.div`
  position: relative;
  width: calc(100% - 20vw);
  height: 100%;
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
    @media (max-width: 500px){
      margin: 4vh 0
    }
`;
const Button = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6aff97;
  padding: 0.6rem 1rem;
  max-width: 400px;
  border: 1px solid black;
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
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }

  &:disabled {
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
    color: #7D7D7D;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
  }
`;
// Theme options
const themes = AVAILABLE_THEMES;

const personalityOptions: PersonalityOption[] = PERSONALITY_OPTIONS;

const CreateNewBot: React.FC = () => {
  const navigate = useNavigate();
  const { adminId, activeTeamId } = useAdminStore();
  const { clearBotConfig, setActiveBotId } = useBotConfig();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(personalityOptions[0]);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [invites, setInvites] = useState<any[]>([]);
  useEffect(() => {
    const fetchInvites = async () => {
      if (!activeTeamId) return;
      try {
        const res = await getTeamInvites(activeTeamId || "");
        setInvites(res || []);
      } catch (e) {
        setInvites([]);
      }
    };
    fetchInvites();
  }, [activeTeamId]);

  // Accept invite handler (mock)
  const { refetchClientData } = useAdminStore();

  const handleInviteAction = async (
    invite: any,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (!activeTeamId || !adminId) return;
      const res = await acceptOrRejectInvite({
        adminId: adminId,
        teamId: activeTeamId,
        email: invite.email,
        inviteStatus: status,
        teamName: invite.teamName,
      });
      if (!res.error) {
        toast.success(
          `Invite ${status === "accepted" ? "accepted" : "rejected"} for ${
            invite.email
          }`
        );
        // Optionally refresh invites
        const updated = await getTeamInvites(activeTeamId || "");
        refetchClientData();
        setInvites(updated || []);
      } else {
        toast.error(res.result || `Failed to ${status} invite`);
      }
    } catch (err) {
      toast.error(`Failed to ${status} invite`);
    }
  };
  // Stepper UI
  const renderStepper = () => {
    return invites.length > 0 ? (
      <div className="w-full flex min-h-[60vh] bg-white"> 
        <div className="left-content w-[60%] px-16 flex flex-col justify-center border-r-2 border-black">
          {invites.map((invite, idx) => (
            <div className="text-sm text-gray-800 space-y-6">
              <h1 className="main-font font-bold text-[26px]">
                  {invite.teamName || "<TEAM NAME>"} {``}
                  invited you to their team!
              </h1>
              <p className="para-font text-[16px] font-[500]">
                You’ve been added to a team that’s using AI to move faster. Join
                now to catch up and contribute.
              </p>
              <div className="relative z-10">
                <Button
                  className="min-w-[240px]"
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onClick={() => handleInviteAction(invite, "accepted")}
                >
                  <span className="font-[500]">Accept Invites</span>
                  <span>
                    <ChevronRight
                      className="w-4 h-4 text-black"
                      style={{ strokeWidth: "3px" }}
                    />
                  </span>
                </Button>
                <button className="underline" onClick={() => handleInviteAction(invite, "rejected")} >Reject Invitation</button>
              </div>
            </div>
          ))}
        </div>
        <div className="right-img bg-[#FFEDF4] w-[40%] flex items-center">
          <img src="/assets/invite-card-goobl.svg" height={"100%"} width={"100%"} alt="" />
        </div>
      </div>
    ) : (
      <div className="h-full flex flex-col">
        {/* Step Content */}
        {step === 1 && (
          <div>
            <div className="mt-4 ml-4">
              <button
                className="font-bold flex gap-2 items-center "
                onClick={() => navigate("/admin/all-agents")}
              >
                <span className="-rotate-180">
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.07031 2L14.0691 8.99883"
                      stroke="black"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7.07031 16.1406L14.0691 9.1418"
                      stroke="black"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                BACK
              </button>
            </div>

            <div className="w-full flex flex-col items-center py-8 pt-0">
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
                            ? "bg-[#000000] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                            : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                        }`}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                  ${
                    step >= n
                      ? "bg-white border-[#222b5f]"
                      : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                  }
                `}
                    >
                      {n}
                    </div>
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
                <div className="w-[240px] md:w-[380px] btn-container  flex justify-end gap-2">
                  <Button
                    className="font-bold flex gap-2 items-center"
                    disabled={!agentName.trim()}
                    onClick={() => setStep(2)}
                  >
                    NEXT <span className="ml-1">→</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="w-full py-8 px-4">
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
                          ? "bg-[#000000] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                          : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                      }`}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                  ${
                    step >= n
                      ? "bg-white border-[#222b5f]"
                      : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                  }
                `}
                  >
                    {n}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col mx-auto overflow-hidden px-1 sm:px-2 lg:px-16">
              <div className="mb-4 p-4">
                <h2 className="main-font text-xl lg:text-3xl font-[800] text-black">
                  Pick a Voice
                </h2>
                <p className="para-font text-sm font-[400] text-black mt-1">
                  Set the tone for customer conversations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-4">
                {personalityOptions.map((personality) => (
                  <div
                    key={personality.id}
                    className={`relative rounded-xl p-3 cursor-pointer transition-all
              ${
                selectedVoice.id === personality.id
                  ? "bg-[#CEFFDC] border-2 border-black"
                  : "bg-[#f4f6ff] border-2 border-gray-400"
              }`}
                    onClick={() => setSelectedVoice(personality)}
                  >
                    {/* Selection Indicator */}
                    {selectedVoice.id === personality.id ? (
                      <>
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000]"></div>
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                      </>
                    ) : (
                      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center bg-[#EAEFFF] border border-[#7D7D7D] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)]"></div>
                    )}

                    <div className="flex items-start space-x-2 sm:space-x-5">
                      {/* Avatar */}
                      <div className="w-28 h-28  rounded-lg overflow-hidden bg-white">
                        <img
                          src={personality.image}
                          alt={`${personality.title} personality`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="w-[60%]">
                        <h3 className="text-md font-semibold black mb-1">
                          {personality.title}
                        </h3>
                        <hr
                          className="my-3 border-black w-10 "
                          style={{
                            border: "2px solid black",
                            borderRadius: 30,
                          }}
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
              <div className="btn-container flex justify-end gap-4 p-4">
                <Button
                  className="font-bold flex gap-2 items-center"
                  onClick={() => setStep(1)}
                >
                  <span className="-rotate-180">
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 16 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.07031 2L14.0691 8.99883"
                        stroke="black"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.07031 16.1406L14.0691 9.1418"
                        stroke="black"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  BACK
                </Button>
                <Button
                  className="font-bold flex gap-2 items-center"
                  onClick={() => setStep(3)}
                >
                  NEXT
                  <span>
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 16 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.07031 2L14.0691 8.99883"
                        stroke="black"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.07031 16.1406L14.0691 9.1418"
                        stroke="black"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="w-full h-full flex flex-col lg:flex-row gap-0">
            {/* Left: Theme selection */}
            <div className="w-full lg:w-3/5 rounded-lg flex flex-col gap-2 lg:gap-4">
              {/* Stepper Bar */}
              <div className="relative flex items-center justify-center w-[100%]  max-w-sm mx-auto mb-8 mt-8">
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
                            ? "bg-[#000000] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)]"
                            : "bg-[#CDCDCD] shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.25)]"
                        }`}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={`para-font relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 text-black font-bold text-lg
                    ${
                      step >= n
                        ? "bg-white border-[#222b5f]"
                        : "bg-[#CDCDCD] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)] border-[0px] text-[#7D7D7D]"
                    }
                  `}
                    >
                      {n}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pl-4 lg:pl-14">
                <h2 className="main-font text-xl lg:text-3xl font-[800] text-black">
                  Select a Theme
                </h2>
                <p className="para-font text-sm font-[400] text-black mt-1">
                  Choose a look that matches your brand
                </p>
              </div>
              <div className="w-full flex flex-col items-center px-2 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto  p-6 max-h-[320px] lg:max-h-[500px]">
                  {themes.map((currentTheme) => (
                    <div
                      key={currentTheme.id}
                      className="relative w-44 mx-auto cursor-pointer transition-all hover:scale-105"
                      onClick={() => setSelectedTheme(currentTheme)}
                    >
                      {/* Selection Indicator */}

                      {selectedTheme.id === currentTheme.id ? (
                        <>
                          <div className="absolute -top-2 -left-3 w-8 h-8 bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000]"></div>
                          <div className="absolute -top-1 -left-2 w-6 h-6 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                        </>
                      ) : (
                        <div className="absolute -top-1 -left-2 w-6 h-6 rounded-full flex items-center justify-center bg-[#EAEFFF] border border-[#7D7D7D] shadow-[inset_0_6px_6px_0_rgba(0,0,0,0.25)]"></div>
                      )}

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
                                  color: !currentTheme.isDark
                                    ? "white"
                                    : "black",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: PublicChat Preview */}
            <div className="w-full lg:w-2/5 py-2 lg:py-8 flex flex-col items-center justify-center bg-[#d4deff]">
              <div className="w-full flex flex-col items-center">
                <h1 className="main-font mb-4 text-lg lg:text-2xl font-[800] text-black">
                  PREVIEW
                </h1>
                <div className="w-[250px] [@media(min-width:340px)]:w-[280px] [@media(min-width:380px)]:w-[300px]] h-[550px] border  border-gray-300 rounded-xl overflow-hidden shadow bg-white">
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
                <div className="btn-container flex justify-end gap-4 p-4 mt-4">
                  <Button
                    className="font-bold flex gap-2 items-center"
                    onClick={() => setStep(2)}
                  >
                    <span className="-rotate-180">
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.07031 2L14.0691 8.99883"
                          stroke="black"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.07031 16.1406L14.0691 9.1418"
                          stroke="black"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    BACK
                  </Button>
                  <Button
                    className="font-bold flex gap-2 items-center"
                    onClick={handleFinish}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "FINISH"}
                    <span className="">
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.07031 2L14.0691 8.99883"
                          stroke="black"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.07031 16.1406L14.0691 9.1418"
                          stroke="black"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle agent creation
  async function handleFinish() {
    if (!activeTeamId) return;
    setLoading(true);

    try {
      const response = await createNewAgent(
        activeTeamId,
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
      setShowUpgradePopup(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen h-[100%] w-full bg-[#b6baf8] flex flex-col pb-6 pt-2">
      {/* Centered content */}

      <div className="flex-1 flex items-center justify-center z-10 relative">
        <Card className="w-[80%] h-[650px] max-w-6xl  border-2 border-[#222b5f] bg-[#eaefff] rounded-none flex flex-col justify-center items-center p-0">
          <div className="w-full h-full flex flex-col">{renderStepper()}</div>
        </Card>
      </div>

      {/* Upgrade Popup */}
      {showUpgradePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            className="bg-white w-full relative border-[10px] border-[#6AFF97]  w-[90vw] lg:w-[70vw] p-2 md:p-6 flex items-center gap-4"
            style={{ height: "fit-content", minHeight: 600 }}
          >
            {/* cancel button */}
            <div className="absolute right-4 top-4">
              <div className="relative z-10">
                <div className="absolute top-[3px] left-[3px] w-full h-full bg-white border border-black -z-10"></div>
                <button
                  onClick={() => setShowUpgradePopup(false)}
                  className="px-2 py-2 bg-white border border-black z-10"
                >
                  <X
                    className="h-5 w-5 text-black"
                    style={{ strokeWidth: "4px" }}
                  />
                </button>
              </div>
            </div>
            <div className="left-content md:pl-8 flex flex-col gap-4 w-1/1 md:w-1/2 items-center px-4">
              <h2 className="main-font text-[1.5rem] md:text-[2rem] para-font font-bold text-center md:text-left">
                Your AI-mployee needs a Promotion!
              </h2>
              <p className="text-black para-font text-center md:text-left text-[0.9rem] md:text-[1.1rem] font-[500]">
                You've reached the limit of your current plan. Upgrade now to
                unlock more features and keep your AI agent running smoothly.
              </p>
              <div className="right-content 1/2 block md:hidden">
                <img
                  src="/assets/popup-mascot.png"
                  width={1000}
                  height={1000}
                  alt="plain-popup mascot"
                />
              </div>
              <div className="relative z-10 flex gap-4 justify-center md:items-end md:mt-12 w-fit">
                <div className="absolute top-[4px] left-[4px] w-full h-full bg-[#6AFF97] border border-black -z-10"></div>
                <button
                  onClick={() => {
                    navigate("/admin/account/plans");
                  }}
                  className="px-4 py-2 bg-[#6AFF97] border border-black md:w-[280px] flex justify-center md:justify-between"
                >
                  UPGRADE MY PLAN
                  <span className="hidden md:inline-block">
                    <ChevronRight
                      style={{ strokeWidth: "3px" }}
                      className="h-5 w-5 text-black inline-block ml-2"
                    />
                  </span>
                </button>
              </div>
            </div>
            <div className="right-content 1/2 hidden md:block">
              <img
                src="/assets/popup-mascot.png"
                width={1000}
                height={1000}
                alt="plain-popup mascot"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNewBot;
