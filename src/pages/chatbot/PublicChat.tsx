import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChatMessage, Theme } from "../../types";
import { queryDocument } from "../../lib/serverActions";
import OpenAI from "openai";
import { useBotConfig } from "../../store/useBotConfig";
import { PERSONALITY_TYPES } from "../admin/PersonalityAnalyzer";
import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";
import HeaderSection from "../../components/chatbotComponents/HeaderSection";
import ChatSection from "../../components/chatbotComponents/ChatSection";
import InputSection from "../../components/chatbotComponents/InputSection";
import AboutSection from "../../components/chatbotComponents/AboutSection";
import BrowseSection from "../../components/chatbotComponents/BrowseSection";

interface PersonalityAnalysis {
  dominantTrait: string;
  confidence: number;
  briefDescription: string;
  speechPatterns: string[];
  vocabularyStyle: string;
  sentenceStructure: string;
  emotionalTone: string;
  uniqueMannerisms: string;
  mimicryInstructions?: string;
}

type PersonalityType =
  | "influencer"
  | "professional"
  | "friendly"
  | "expert"
  | "motivational"
  | "casual"
  | "custom-personality";

type ExtendedChatMessage = ChatMessage & { type?: "booking" };

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const QUERY_CUES: string[][] = [
  [
    "Pizza hut se meri call ki sales pitch btao?",
    "Bamboo Spoons kitni stock mein hain abhi?",
  ],
];

type Screen = "about" | "chat" | "browse";

interface PreviewConfig {
  name?: string;
  logo?: string;
  calendlyUrl?: string;
  themeColors?: Theme;
  personalityType?: PersonalityType;
  customPersonalityPrompt?: string;
  personalityAnalysis?: PersonalityAnalysis | null;
}

export default function PublicChat({
  agentUsernamePlayground,
  previewConfig,
}: {
  agentUsernamePlayground: string | null;
  previewConfig?: PreviewConfig;
}) {
  const { botUsername } = useParams();
  const {
    activeBotData: config,
    isLoading: isConfigLoading,
    fetchBotData,
  } = useBotConfig();
  const { products } = useCartStore();
  const { isLoggedIn } = useUserStore();
  const [showSignInOverlay, setShowSignInOverlay] = useState(!isLoggedIn);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: "1",
      content:
        "Hi! Looking to upskill yourself? Let me know how I can help you.",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);

  const [activeScreen, setActiveScreen] = useState<Screen>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [showCues, setShowCues] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Personality
  const [personalityType, setPersonalityType] =
    useState<PersonalityType | null>(null);
  const [isCustomPersonality, setIsCustomPersonality] = useState(false);
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState("");
  const [personalityAnalysis, setPersonalityAnalysis] =
    useState<PersonalityAnalysis | null>(null);

  // use preview or fetched config
  const currentConfig = previewConfig || config;
  const currentIsLoading = previewConfig ? false : isConfigLoading;

  console.log("currentConfig?.themeColors");
  console.log(currentConfig?.themeColors);
  // safe themeColors fallback
  const theme = currentConfig?.themeColors ?? {
    isDark: true,
    mainDarkColor: "#4220cd",
    mainLightColor: "#91a3ff",
    highlightColor: "#ffcc16",
  };

  // Enhanced scroll to bottom function

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when loading state changes (for streaming text)
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // fetch config on mount/params change
  useEffect(() => {
    if (!previewConfig) {
      if (botUsername) fetchBotData(botUsername, true);
      if (agentUsernamePlayground) fetchBotData(agentUsernamePlayground, false);
    }
  }, [botUsername, agentUsernamePlayground, fetchBotData, previewConfig]);

  // Function to handle redirection to admin dashboard
  const handleRedirectToAdmin = () => {
    // Check if we're in the right environment
    if (window.location.pathname.includes("/chatbot/")) {
      // Save agent ID to local storage so admin page knows which agent to focus
      if (config?.agentId) {
        localStorage.setItem("redirectToAgentBooking", config.agentId);
      }

      // Redirect to admin dashboard
      window.location.href = "/"; // This will redirect to dashboard home
    } else {
      // If we're already in admin/playground context, just change the tab
      // Assuming you have a parent function to call
      if (typeof window.parent.setActiveAdminTab === "function") {
        window.parent.setActiveAdminTab("booking");
      } else {
        console.error("Admin redirect function not available");
      }
    }
  };

  // build personality prompt
  const getPersonalityPrompt = () => {
    if (isCustomPersonality && personalityAnalysis?.mimicryInstructions) {
      return personalityAnalysis.mimicryInstructions;
    }
    if (isCustomPersonality && customPersonalityPrompt) {
      return customPersonalityPrompt;
    }
    if (personalityType && !isCustomPersonality) {
      return (
        PERSONALITY_TYPES.find((p) => p.id === personalityType)?.prompt || ""
      );
    }
    return "";
  };

  const handleSendMessage = async (
    inputMessage?: string | React.MouseEvent<HTMLButtonElement>
  ) => {
    let msgToSend = typeof inputMessage === "string" ? inputMessage : message;

    if (!msgToSend.trim() || !config?.agentId) return;

    // user message
    const userMsg: ExtendedChatMessage = {
      id: Date.now().toString(),
      content: msgToSend,
      timestamp: new Date(),
      sender: "user",
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setIsLoading(true);
    setShowCues(false);
    scrollToBottom(); // Scroll immediately after user message

    // detect booking intent
    const text = msgToSend.toLowerCase();
    const isBookingRequest = [
      "book",
      "appointment",
      "meeting",
      "schedule",
    ].some((kw) => text.includes(kw));

    if (isBookingRequest) {
      // inject booking embed
      const bookingMsg: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        timestamp: new Date(),
        sender: "agent",
        type: "booking",
      };
      setMessages((m) => [...m, bookingMsg]);
      setIsLoading(false);
      return;
    }

    try {
      // fetch RAG context
      let productContext = "";
      if (products.length > 0) {
        productContext = `Here are the products available: ${JSON.stringify(
          products
        )}`;
      }
      const context = await queryDocument(config.agentId, msgToSend);
      let basePrompt = `${
        config.systemPrompt
      } and Use context when relevant:\n${JSON.stringify(
        context
      )} and also use product context when relevant:\n${productContext}`;

      let systemPrompt = `You are a concise AI assistant. Use context when relevant:\n${JSON.stringify(
        context
      )}`;
      const personalityPrompt = getPersonalityPrompt();
      if (personalityPrompt) {
        systemPrompt += `\nPERSONALITY INSTRUCTIONS (MUST FOLLOW):\n${personalityPrompt}`;
      }
      basePrompt += `\nRules: 
      - Use markdown formatting for better readability:
        * Use **bold** for emphasis
        * Use *italic* for subtle emphasis
        * Use bullet points (-) for lists
        * Use [link text](url) for links
        * Use \`code\` for code snippets
        * Use > for quotes
      - Keep responses concise (1-2 sentences)
      - No extra greetings or formatting`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: basePrompt },
          { role: "user", content: msgToSend },
        ],
        temperature: 0.6,
      });

      const agentMsg: ExtendedChatMessage = {
        id: (Date.now() + 2).toString(),
        content:
          completion.choices[0].message.content ||
          "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((m) => [...m, agentMsg]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 3).toString(),
          content: "Sorry, there was an error. Please try again.",
          timestamp: new Date(),
          sender: "agent",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCueClick = (cue: string) => {
    setMessage(cue);
    setShowCues(false);
    handleSendMessage(cue);
  };

  if (currentIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-start justify-center">
      {/* Simulated Mobile Frame */}
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col relative"
        style={{
          height: agentUsernamePlayground ? "700px" : "100dvh", // Using dvh for better mobile support
          maxHeight: "100dvh", // Ensure it doesn't exceed viewport height
          backgroundColor: "white",
        }}
      >
        {/* Sign In Overlay */}
        {showSignInOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md mx-4">
              {/* ... Sign In content remains the same ... */}
            </div>
          </div>
        )}

        <HeaderSection
          theme={theme}
          currentConfig={currentConfig || { name: "KiFor Bot" }}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />

        {activeScreen === "about" && (
          <AboutSection
            theme={theme}
            currentConfig={currentConfig || { name: "KiFor Bot" }}
          />
        )}

        {activeScreen === "browse" && (
          <BrowseSection
            currentConfig={currentConfig || { name: "KiFor Bot" }}
          />
        )}

        {activeScreen === "chat" && (
          <>
            <ChatSection
              theme={theme}
              messages={messages}
              isLoading={isLoading}
              activeScreen={activeScreen}
              currentConfig={currentConfig || { name: "KiFor Bot" }}
              messagesEndRef={messagesEndRef}
            />

            {/* cues */}
            {showCues && (
              <div
                className="p-2 grid grid-cols-1 gap-1"
                style={{
                  backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                }}
              >
                {QUERY_CUES.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    {row.map((cue) => (
                      <button
                        key={cue}
                        onClick={() => handleCueClick(cue)}
                        disabled={isLoading}
                        className="px-2 py-1 rounded-xl text-xs font-medium"
                        style={{
                          backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
                          color: theme.isDark ? "white" : "black",
                          border: `1px solid ${
                            theme.isDark ? "white" : "black"
                          }`,
                          borderRadius: "20px",
                        }}
                      >
                        {cue}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <InputSection
              theme={theme}
              message={message}
              isLoading={isLoading}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
            />
          </>
        )}
      </div>
    </div>
  );
}
