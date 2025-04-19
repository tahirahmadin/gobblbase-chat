import React from "react";
import { useParams } from "react-router-dom";
import { ChatMessage } from "../types";
import { queryDocument } from "../lib/serverActions";
import OpenAI from "openai";
import { Send, MessageSquare, Calendar, Search, MenuIcon } from "lucide-react";
import { InlineWidget } from "react-calendly";
import { useBotConfig } from "../store/useBotConfig";
import { PERSONALITY_TYPES } from "./PersonalityAnalyzer";

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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Define query cues in pairs for 2x2 grid
const QUERY_CUES = [
  ["Tell me about you ?", "Most popular items ?"],
  ["Best courses available?", "Your education ?"],
];

type Screen = "chat" | "book" | "browse";

export default function PublicChat() {
  const { botUsername } = useParams();
  const { config, isLoading: isConfigLoading, fetchConfig } = useBotConfig();
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hi! Cozy weather today calls for something delicious. Let me know what you're craving?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);
  const [activeScreen, setActiveScreen] = React.useState<Screen>("chat");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showCues, setShowCues] = React.useState(true);
  const [showCalendly, setShowCalendly] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [personalityType, setPersonalityType] =
    React.useState<PersonalityType | null>(null);
  const [isCustomPersonality, setIsCustomPersonality] = React.useState(false);
  const [customPersonalityPrompt, setCustomPersonalityPrompt] =
    React.useState("");
  const [personalityAnalysis, setPersonalityAnalysis] =
    React.useState<PersonalityAnalysis | null>(null);

  let themeSettings = config?.themeColors || {
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

  React.useEffect(() => {
    if (botUsername) {
      fetchConfig(botUsername);
    }
  }, [botUsername, fetchConfig]);

  // Update personality settings when config changes
  React.useEffect(() => {
    if (config) {
      if (config.personalityType) {
        setPersonalityType(config.personalityType as PersonalityType);
        setIsCustomPersonality(config.personalityType === "custom-personality");
        setCustomPersonalityPrompt(config.customPersonalityPrompt || "");
        setPersonalityAnalysis(config.personalityAnalysis || null);
      }
    }
  }, [config]);

  const getPersonalityPrompt = (): string => {
    if (isCustomPersonality && personalityAnalysis?.mimicryInstructions) {
      return personalityAnalysis.mimicryInstructions;
    } else if (isCustomPersonality && customPersonalityPrompt) {
      return customPersonalityPrompt;
    } else if (personalityType && !isCustomPersonality) {
      const personalityTypeInfo = PERSONALITY_TYPES.find(
        (p) => p.id === personalityType
      );
      if (personalityTypeInfo) {
        return personalityTypeInfo.prompt;
      }
    }

    return "";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !config?.agentId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);
    setShowCues(false);

    try {
      // Call RAG API to get context using the server action
      const context = await queryDocument(config?.agentId, message);

      // Check if the message is about booking
      const isBookingRequest =
        message.toLowerCase().includes("book") ||
        message.toLowerCase().includes("appointment") ||
        message.toLowerCase().includes("meeting") ||
        message.toLowerCase().includes("schedule");

      let calendlyUrl = config.calendlyUrl;
      if (isBookingRequest && calendlyUrl) {
        setShowCalendly(true);
        const agentResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content:
            "I can help you book an appointment. Please use the calendar below to schedule a time that works for you.",
          timestamp: new Date(),
          sender: "agent",
        };
        setMessages((prev) => [...prev, agentResponse]);
        setIsLoading(false);
        return;
      }

      const personalityPrompt = getPersonalityPrompt();
      console.log(
        "Using personality prompt:",
        personalityPrompt ? "Yes" : "No"
      );

      const systemPrompt = `You are a concise AI assistant.
     Use the provided context to answer the user's question when relevant:
     ${JSON.stringify(context)}
     
     ${
       personalityPrompt
         ? `PERSONALITY INSTRUCTIONS (MUST FOLLOW THESE EXACTLY):
${personalityPrompt}

The personality instructions above should take precedence over other style guidelines.`
         : ""
     }
     
     Rules:
     - Answer in 1-2 plain sentences only.
     - Do not add extra explanation, greetings, or conclusions.
     - No special characters, markdown, or formatting.
     - For general greetings or conversational queries like "hello" or "how are you", respond naturally and briefly.
     - Only say "I cannot assist with that" if the query requires specific information not in the context and is not a general greeting.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.6,
      });

      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          completion.choices[0].message.content ||
          "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        sender: "agent",
      };

      setMessages((prev) => [...prev, agentResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
        sender: "agent",
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (isConfigLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div
        className="shadow-sm"
        style={{ backgroundColor: themeSettings.headerColor }}
      >
        <div className="px-4 pt-3  flex items-center justify-between mb-2">
          <div
            className="flex items-center space-x-3"
            style={{ color: themeSettings.headerTextColor }}
          >
            {config?.logo && (
              <img
                src={config.logo}
                alt="Profile image"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex items-start text-lg font-bold transition-colors duration-300">
              {config?.name || "KiFor Bot"}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className="text-xs"
              style={{ color: themeSettings.headerIconColor }}
            >
              <MenuIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
        {/* Navigation */}
        <div className="border-t border-gray-200">
          <div className="flex justify-around py-1 text-xs">
            <button
              onClick={() => setActiveScreen("chat")}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-[13px] font-medium`}
              style={{
                color:
                  activeScreen === "chat"
                    ? themeSettings.headerTextColor
                    : themeSettings.headerNavColor,
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveScreen("book")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[13px] font-medium `}
              style={{
                color:
                  activeScreen === "book"
                    ? themeSettings.headerTextColor
                    : themeSettings.headerNavColor,
              }}
            >
              <Calendar className="h-4 w-4" />
              <span>BOOK</span>
            </button>
            <button
              onClick={() => setActiveScreen("browse")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[13px] font-medium`}
              style={{
                color:
                  activeScreen === "browse"
                    ? themeSettings.headerTextColor
                    : themeSettings.headerNavColor,
              }}
            >
              <Search className="h-4 w-4" />
              <span>BROWSE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto p-2"
        style={{ backgroundColor: themeSettings.chatBackgroundColor }}
      >
        {activeScreen === "chat" && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "agent" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-2`}
                  style={{
                    backgroundColor:
                      msg.sender === "agent"
                        ? themeSettings.bubbleAgentBgColor
                        : themeSettings.bubbleUserBgColor,
                    color:
                      msg.sender === "agent"
                        ? themeSettings.bubbleAgentTextColor
                        : themeSettings.bubbleUserTextColor,
                  }}
                >
                  <div className="flex items-start space-x-2">
                    {config?.logo && (
                      <img
                        src={config.logo}
                        alt="Bot Logo"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-[13px]">{msg.content}</p>
                    </div>
                  </div>
                  <div
                    className="mt-1 text-xs opacity-70"
                    style={{
                      color:
                        msg.sender === "agent"
                          ? themeSettings.bubbleAgentTimeTextColor
                          : themeSettings.bubbleUserTimeTextColor,
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeScreen === "book" && config?.calendlyUrl && (
          <div className="bg-white rounded-lg p-4">
            <InlineWidget
              url={config?.calendlyUrl || ""}
              styles={{ height: "600px" }}
            />
          </div>
        )}
        {activeScreen === "browse" && (
          <div className="rounded-lg p-4">
            <p
              className="text-sm mt-8 text-center w-[75%] mx-auto"
              style={{ color: themeSettings.headerTextColor }}
            >
              Currently, I am not offering any product/services. Please check
              back later.
            </p>
            {/* Add restaurant browsing content here */}
          </div>
        )}
      </div>

      {/* Query Cues - 2x2 Grid */}
      {showCues && activeScreen === "chat" && (
        <div
          className="p-2 grid grid-cols-1 gap-1"
          style={{ backgroundColor: themeSettings.inputCardColor }}
        >
          {QUERY_CUES.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-2">
              {row.map((cue, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCueClick(cue)}
                  disabled={isLoading}
                  className="w-full px-2 py-1  text-gray-800 rounded-xl text-xs font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: themeSettings.headerTextColor,
                    color: themeSettings.headerColor,
                  }}
                >
                  {cue}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className="p-2"
        style={{ backgroundColor: themeSettings.inputCardColor }}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask here..."
            onKeyPress={handleKeyPress}
            className="flex-1 pl-4 pr-12 py-3 rounded-full text-sm focus:outline-none"
            style={{
              backgroundColor: themeSettings.inputBackgroundColor,
              color: themeSettings.inputTextColor,
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="absolute right-2 p-2"
          >
            <Send
              className="h-5 w-5"
              style={{
                color:
                  isLoading || !message.trim()
                    ? themeSettings.headerNavColor
                    : themeSettings.headerIconColor,
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
