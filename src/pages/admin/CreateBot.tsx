import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../../store/useUserStore";
import { fetchClientAgents, createNewAgent } from "../../lib/serverActions";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Theme options (reuse from Theme.tsx)
const themes = [
  { id: "yellow", color: "#EFC715", textColor: "#000000" },
  { id: "green", color: "#C2E539", textColor: "#000000" },
  { id: "orange", color: "#FF975F", textColor: "#000000" },
  { id: "pink", color: "#d16bd7", textColor: "#000000" },
  { id: "blue", color: "#ABC3FF", textColor: "#000000" },
  { id: "gray", color: "#808080", textColor: "#FFFFFF" },
];

const voices = [
  {
    id: "friend",
    label: "FRIEND",
    desc: "Warm\nRelatable\nConversational",
    icon: "🧑‍🤝‍🧑",
  },
  {
    id: "coach",
    label: "COACH",
    desc: "Upbeat\nEncouraging\nMotivational",
    icon: "💪",
  },
  {
    id: "genz",
    label: "GEN Z",
    desc: "Casual\nWitty\nTrendy",
    icon: "🧢",
  },
  {
    id: "techie",
    label: "TECHIE",
    desc: "Intuitive\nIntelligent\nResourceful",
    icon: "🤖",
  },
  {
    id: "concierge",
    label: "CONCIERGE",
    desc: "Polished\nRefined\nFormal",
    icon: "🎩",
  },
  {
    id: "professional",
    label: "PROFESSIONAL",
    desc: "Direct\nAuthentic\nClear",
    icon: "🗂️",
  },
];

const stepLabels = ["Agent Name", "Choose Voice", "Choose Theme"];

const CreateBot: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    userId,
    userEmail,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    userDetails,
  } = useUserStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasAgents, setHasAgents] = useState<boolean | null>(null);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [voice, setVoice] = useState(voices[0].id);
  const [theme, setTheme] = useState(themes[0].id);

  // Check if user has agents after login
  useEffect(() => {
    const checkAgents = async () => {
      if (isLoggedIn && userId) {
        setLoading(true);
        try {
          const agents = await fetchClientAgents(userId);
          setHasAgents(agents && agents.length > 0);
        } catch (e) {
          setHasAgents(false);
        } finally {
          setLoading(false);
        }
      }
    };
    checkAgents();
  }, [isLoggedIn, userId]);

  // If user is logged in and already has agents, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn && hasAgents) {
      navigate("/admin/dashboard");
    }
  }, [isLoggedIn, hasAgents, navigate]);

  // Stepper UI
  const renderStepper = () => (
    <div className="min-h-screen bg-[#dbe6fd] flex flex-col">
      {/* Black top strip */}
      <div className="w-full bg-black py-3 px-8 flex items-center">
        <span className="text-white text-2xl font-bold tracking-tight">
          kifor
        </span>
      </div>
      {/* Centered card with stepper and content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border-2 border-[#222b5f] flex flex-row p-0">
          {/* Vertical Stepper */}
          <div className="flex flex-col justify-center items-start bg-[#e7eaff] rounded-l-lg py-12 px-8 min-w-[220px] gap-6">
            {[1, 2, 3].map((n, idx) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-lg border-2 ${
                    step === n
                      ? "bg-[#222b5f] border-[#222b5f]"
                      : "bg-gray-300 border-gray-300"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`font-semibold text-base ${
                    step === n ? "text-[#222b5f]" : "text-gray-400"
                  }`}
                >
                  {stepLabels[idx]}
                </span>
              </div>
            ))}
          </div>
          {/* Step Content */}
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-8">
            <h2 className="text-2xl font-bold mb-6 text-left w-full">
              Set up your Agent Profile
            </h2>
            {step === 1 && (
              <div className="w-full max-w-lg bg-white rounded-lg p-8 shadow border border-gray-200 flex flex-col gap-4">
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
              <div className="w-full max-w-lg bg-white rounded-lg p-8 shadow border border-gray-200 flex flex-col gap-4">
                <label className="block font-semibold text-lg mb-2">
                  Give your Agent a personality
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {voices.map((v) => (
                    <div
                      key={v.id}
                      className={`border-2 rounded-lg p-4 flex flex-col items-center cursor-pointer transition ${
                        voice === v.id
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                      onClick={() => setVoice(v.id)}
                    >
                      <div className="text-3xl mb-2">{v.icon}</div>
                      <div className="font-bold">{v.label}</div>
                      <div className="text-xs text-gray-600 whitespace-pre-line text-center mt-1">
                        {v.desc}
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
              <div className="w-full max-w-lg bg-white rounded-lg p-8 shadow border border-gray-200 flex flex-col gap-4">
                <label className="block font-semibold text-lg mb-2">
                  Select a custom Theme for your Chatbot
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      className={`border-2 rounded-lg p-2 cursor-pointer flex flex-col items-center transition ${
                        theme === t.id
                          ? "border-green-400 ring-2 ring-green-400"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: t.color, color: t.textColor }}
                      onClick={() => setTheme(t.id)}
                    >
                      <div className="font-bold mb-1">
                        {t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-white mt-2" />
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
    if (!userId) return;
    setLoading(true);
    try {
      const response = await createNewAgent(userId, agentName, "");
      if (!response.error) {
        toast.success("Agent created successfully!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Failed to create agent");
      }
    } catch (e) {
      toast.error("An error occurred while creating agent");
    } finally {
      setLoading(false);
    }
  }

  // Main render
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              theme="filled_blue"
              size="large"
              width="100%"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    );
  }

  if (loading && hasAgents === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If user is logged in and has no agents, show stepper
  if (isLoggedIn && hasAgents === false) {
    return renderStepper();
  }

  // Otherwise, show nothing (or a redirect will happen)
  return null;
};

export default CreateBot;
