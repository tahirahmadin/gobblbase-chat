import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChatMessage } from "../types";
import { queryDocument, signUpUser } from "../lib/serverActions";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
import {
  Send,
  MessageSquare,
  Calendar,
  Search,
  MenuIcon,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { useBotConfig } from "../store/useBotConfig";
import { PERSONALITY_TYPES } from "./PersonalityAnalyzer";
import CustomerBookingWrapper from "./CustomerBookingWrapper";
import Browse from "./BrowseComponent/Browse";
import { useCartStore } from "../store/useCartStore";
import Drawer from "./BrowseComponent/Drawer";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import StreamingText from "./StreamingText";
import LoadingPhrases from "./LoadingPhrases";

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
  ["Tell me about you ?", "Summarise your services ?"],
  ["Book meeting", "Free services"],
];

type Screen = "chat" | "book" | "browse" | "cart";

interface PreviewConfig {
  name?: string;
  logo?: string;
  calendlyUrl?: string;
  themeColors?: {
    headerColor: string;
    headerTextColor: string;
    headerNavColor: string;
    headerIconColor: string;
    chatBackgroundColor: string;
    bubbleAgentBgColor: string;
    bubbleAgentTextColor: string;
    bubbleAgentTimeTextColor: string;
    bubbleUserBgColor: string;
    bubbleUserTextColor: string;
    bubbleUserTimeTextColor: string;
    inputCardColor: string;
    inputBackgroundColor: string;
    inputTextColor: string;
  };
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
    activeBotId,
  } = useBotConfig();
  const {
    isLoggedIn,
    handleGoogleLoginSuccess: storeHandleGoogleLoginSuccess,
    handleGoogleLoginError: storeHandleGoogleLoginError,
  } = useUserStore();
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Personality
  const [personalityType, setPersonalityType] =
    useState<PersonalityType | null>(null);
  const [isCustomPersonality, setIsCustomPersonality] = useState(false);
  const [customPersonalityPrompt, setCustomPersonalityPrompt] = useState("");
  const [personalityAnalysis, setPersonalityAnalysis] =
    useState<PersonalityAnalysis | null>(null);

  const { getTotalItems } = useCartStore();

  // use preview or fetched config
  const currentConfig = previewConfig || config;
  const currentIsLoading = previewConfig ? false : isConfigLoading;

  // safe themeColors fallback
  const theme = currentConfig?.themeColors ?? {
    headerColor: "#000000",
    headerTextColor: "#F0B90A",
    headerNavColor: "#bdbdbd",
    headerIconColor: "#F0B90A",
    chatBackgroundColor: "#313131",
    bubbleAgentBgColor: "#1E2026",
    bubbleAgentTextColor: "#ffffff",
    bubbleAgentTimeTextColor: "#F0B90A",
    bubbleUserBgColor: "#F0B90A",
    bubbleUserTextColor: "#000000",
    bubbleUserTimeTextColor: "#000000",
    inputCardColor: "#27282B",
    inputBackgroundColor: "#212121",
    inputTextColor: "#ffffff",
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

  const handleSendMessage = async (inputMessage?: string) => {
    let msgToSend = inputMessage ? inputMessage : message;

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
      const context = await queryDocument(config.agentId, msgToSend);
      let systemPrompt = `You are a concise AI assistant. Use context when relevant:\n${JSON.stringify(
        context
      )}`;
      const personalityPrompt = getPersonalityPrompt();
      if (personalityPrompt) {
        systemPrompt += `\nPERSONALITY INSTRUCTIONS (MUST FOLLOW):\n${personalityPrompt}`;
      }
      systemPrompt += `\nRules: 
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
          { role: "system", content: systemPrompt },
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
    // setTimeout(handleSendMessage, 500);
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      await storeHandleGoogleLoginSuccess(credentialResponse);
      setShowSignInOverlay(false);
      toast.success("Successfully signed in!");
    } catch (error) {
      console.error("Error during Google login:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleGoogleLoginError = () => {
    storeHandleGoogleLoginError();
    toast.error("Google login failed. Please try again.");
  };

  // Add scroll effect when switching tabs
  useEffect(() => {
    if (activeScreen === "chat") {
      scrollToBottom();
    }
  }, [activeScreen]);

  // Add scroll effect when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add scroll effect when loading state changes
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Add scroll effect when component mounts
  useEffect(() => {
    scrollToBottom();
  }, []);

  if (currentIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col relative"
      style={{
        height: agentUsernamePlayground ? "100%" : "100vh",
        backgroundColor: agentUsernamePlayground
          ? "transparent"
          : theme.headerColor,
      }}
    >
      {/* Sign In Overlay */}
      {showSignInOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <img
                  src={
                    config?.logo ||
                    "https://gobbl-bucket.s3.ap-south-1.amazonaws.com/gobbl_token.png"
                  }
                  alt="Bot Logo"
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Sign In Required
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Please sign in to start chatting and ordering with us.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full flex items-center justify-center">
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs">
                      <GoogleOAuthProvider
                        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                      >
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
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="shadow-sm"
        style={{
          backgroundColor: theme.headerColor,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <div className="px-4 pt-3 flex items-center justify-between mb-2">
          <div
            className="flex items-center space-x-3"
            style={{ color: theme.headerTextColor }}
          >
            <img
              src={
                currentConfig?.logo ||
                "https://thumbs.dreamstime.com/b/generative-ai-young-smiling-man-avatar-man-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-d-vector-people-279560903.jpg"
              }
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-lg font-bold">
              {currentConfig?.name || "KiFor Bot"}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" onClick={() => setActiveScreen("cart")}>
              <ShoppingCart
                className="h-5 w-5"
                style={{ color: theme.headerIconColor }}
              />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <MenuIcon
                className="h-5 w-5"
                style={{ color: theme.headerIconColor }}
              />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="flex justify-around py-1 text-xs">
            <button
              onClick={() => setActiveScreen("chat")}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium"
              style={{
                color:
                  activeScreen === "chat"
                    ? theme.headerTextColor
                    : theme.headerNavColor,
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </button>
            {/* <button
              onClick={() => setActiveScreen("book")}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium"
              style={{
                color:
                  activeScreen === "book"
                    ? theme.headerTextColor
                    : theme.headerNavColor,
              }}
            >
              <Calendar className="h-4 w-4" />
              <span>BOOK</span>
            </button> */}
            <button
              onClick={() => setActiveScreen("browse")}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium"
              style={{
                color:
                  activeScreen === "browse"
                    ? theme.headerTextColor
                    : theme.headerNavColor,
              }}
            >
              <Search className="h-4 w-4" />
              <span>BROWSE</span>
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div
        className="flex-1 overflow-y-auto p-2"
        style={{
          backgroundColor: theme.chatBackgroundColor,
          paddingBottom: "150px",
        }}
      >
        {activeScreen === "chat" &&
          messages.map((msg) =>
            msg.type === "booking" ? (
              <div key={msg.id} className="w-full">
                <CustomerBookingWrapper
                  businessId={config?.agentId}
                  serviceName={currentConfig?.name || "Consultation"}
                  onRedirectToAdmin={handleRedirectToAdmin}
                />
              </div>
            ) : (
              <div
                key={msg.id}
                className={`mb-2 flex ${
                  msg.sender === "agent" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className="max-w-[90%] rounded-lg p-2"
                  style={{
                    backgroundColor:
                      msg.sender === "agent"
                        ? theme.bubbleAgentBgColor
                        : theme.bubbleUserBgColor,
                    color:
                      msg.sender === "agent"
                        ? theme.bubbleAgentTextColor
                        : theme.bubbleUserTextColor,
                  }}
                >
                  <div className="flex items-start space-x-2">
                    {msg.sender === "agent" && currentConfig?.logo && (
                      <img
                        src={currentConfig.logo}
                        alt="Bot Logo"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <div
                      className="prose prose-sm max-w-none [&>*]:text-inherit prose-headings:text-inherit prose-ul:text-inherit prose-li:text-inherit prose-li:marker:text-inherit prose-strong:text-inherit"
                      style={{
                        color:
                          msg.sender === "agent"
                            ? theme.bubbleAgentTextColor
                            : theme.bubbleUserTextColor,
                      }}
                    >
                      {msg.sender === "agent" ? (
                        <StreamingText
                          text={msg.content}
                          speed={15}
                          messageId={msg.id}
                        />
                      ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                  <div
                    className="mt-1 text-xs text-left"
                    style={{
                      color:
                        msg.sender === "agent"
                          ? theme.bubbleAgentTimeTextColor
                          : theme.bubbleUserTimeTextColor,
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )
          )}

        {isLoading && (
          <div className="mb-4 flex justify-start px-2">
            <div className="flex items-start space-x-2">
              {currentConfig?.logo && (
                <img
                  src={currentConfig.logo}
                  alt="Bot Logo"
                  className="w-6 h-6 rounded-full object-cover opacity-70"
                />
              )}
              <div className="mt-1">
                <LoadingPhrases textColor="#9ca3af" />
              </div>
            </div>
          </div>
        )}

        {activeScreen === "book" && (
          <CustomerBookingWrapper
            businessId={config?.agentId}
            serviceName={currentConfig?.name || "Consultation"}
            onRedirectToAdmin={handleRedirectToAdmin}
          />
        )}

        {activeScreen === "browse" && (
          <Browse
            showCart={false}
            onShowCart={() => setActiveScreen("cart")}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === "cart" && (
          <Browse
            showCart={true}
            onShowCart={() => setActiveScreen("browse")}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            setActiveScreen={setActiveScreen}
          />
        )}

        <div style={{ minHeight: "100px" }} />
        <div ref={messagesEndRef} />
      </div>

      {/* cues */}
      {showCues && activeScreen === "chat" && (
        <div
          className="p-2 grid grid-cols-1 gap-1"
          style={{ backgroundColor: theme.inputCardColor }}
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
                    backgroundColor: theme.headerTextColor,
                    color: theme.headerColor,
                  }}
                >
                  {cue}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* input */}
      {activeScreen === "chat" && (
        <div className="p-2" style={{ backgroundColor: theme.inputCardColor }}>
          <div className="relative flex items-center">
            <input
              className="flex-1 pl-4 pr-12 py-3 rounded-full text-sm focus:outline-none"
              style={{
                backgroundColor: theme.inputBackgroundColor,
                color: theme.inputTextColor,
              }}
              placeholder="Ask here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="absolute right-2 p-2"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
            >
              <Send
                className="h-5 w-5"
                style={{
                  color:
                    isLoading || !message.trim()
                      ? theme.headerNavColor
                      : theme.headerIconColor,
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Drawer component */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
