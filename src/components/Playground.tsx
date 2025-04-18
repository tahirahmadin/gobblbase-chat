import React, { useState, useEffect } from "react";
import { RefreshCw, Send, Save, Plus, Bot } from "lucide-react";
import { ChatMessage } from "../types";
import {
  queryDocument,
  getAgentDetails,
  updateAgentDetails,
  updateUserLogs,
} from "../lib/serverActions";
import OpenAI from "openai";
import PersonalityAnalyzer, { PERSONALITY_TYPES } from "./PersonalityAnalyzer";
import { useUserStore } from "../store/useUserStore";

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

interface PersonalityData {
  type: PersonalityType;
  isCustom: boolean;
  customPrompt: string;
  analysis: PersonalityAnalysis | null;
  lastUrl: string;
  lastContent: string;
}

interface PlaygroundProps {
  agentId: string;
}

// Define available models with their context window sizes
const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", contextWindow: "128K" },
  { id: "gpt-4", name: "GPT-4", contextWindow: "8K" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", contextWindow: "16K" },
  { id: "claude-3-opus", name: "Claude 3 Opus", contextWindow: "200K" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet", contextWindow: "200K" },
];

// Define system prompt templates
const SYSTEM_PROMPT_TEMPLATES = [
  {
    id: "educational",
    name: "Educational Institute",
    prompt:
      "You are an AI teaching assistant for an educational institution. Your role is to help students understand complex concepts, provide study guidance, and answer academic questions clearly and concisely. Always maintain a professional and supportive tone. If the provided context contains relevant information, use it to answer the question. If the context doesn't contain the answer or if the query is conversational (like greetings or general questions), respond appropriately in a helpful and friendly manner.",
  },
  {
    id: "youtuber",
    name: "Course Creator",
    prompt:
      "You are an AI assistant for a course creator. Your role is to help potential students understand the value of the courses, answer questions about course content, and provide information about enrollment and pricing. Be engaging and persuasive while maintaining honesty. If the provided context contains relevant information, use it to answer the question. If the context doesn't contain the answer or if the query is conversational, still engage with the user in a friendly, helpful manner.",
  },
  {
    id: "customer-service",
    name: "Customer Service",
    prompt:
      "You are a customer service AI assistant. Your role is to help customers with their inquiries, provide information about products/services, and resolve common issues. Always be polite, professional, and solution-oriented. If the provided context contains relevant information, use it to answer the question. For general queries or greetings without context, respond as a helpful customer service representative would.",
  },
  {
    id: "technical",
    name: "Technical Support",
    prompt:
      "You are a technical support AI assistant. Your role is to help users troubleshoot technical issues, explain technical concepts in simple terms, and guide them through solutions step by step. Be patient and thorough in your explanations. Use the provided context when relevant. For general questions or conversational queries, respond in a friendly technical support manner.",
  },
  {
    id: "sales",
    name: "Sales Assistant",
    prompt:
      "You are a sales AI assistant. Your role is to help potential customers understand product features, benefits, and pricing. Be persuasive but honest, and always focus on how the product can solve the customer's specific needs. Use the provided context when available and relevant. For general inquiries or conversational messages without context, engage naturally as a sales professional would.",
  },
  {
    id: "custom",
    name: "Custom Prompt",
    prompt: "",
  },
];

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Playground({ agentId }: PlaygroundProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! What can I help you with?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [status] = useState("Trained");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.5);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant that provides accurate and concise information."
  );
  const [agentName, setAgentName] = useState("");
  const [logo, setLogo] = useState("");
  const {
    activeAgentUsername,
    setActiveAgentUsername,
    calendlyUrl,
    setCalendlyUrl,
  } = useUserStore();
  const [selectedPromptTemplate, setSelectedPromptTemplate] =
    useState("educational");
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [personalityData, setPersonalityData] = useState<PersonalityData>({
    type: "professional",
    isCustom: false,
    customPrompt: "",
    analysis: null,
    lastUrl: "",
    lastContent: "",
  });
  const [sessionId] = useState(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("model");
  const [theme, setTheme] = useState({
    botColor: "#ffffff",
    botText: "#000000",
    bubbleBackground: "#ffffff",
    bubbleColor: "#e5e5e5",
    bubbleTextColor: "#000000",
  });

  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        const agentDetails = await getAgentDetails(agentId, null);
        setModel(agentDetails.model);
        setSystemPrompt(agentDetails.systemPrompt);
        setTheme({
          botColor: agentDetails.themeColors.botColor,
          botText: agentDetails.themeColors.botText,
          bubbleBackground: agentDetails.themeColors.bubbleBackground,
          bubbleColor: agentDetails.themeColors.bubbleColor,
          bubbleTextColor: agentDetails.themeColors.bubbleTextColor,
        });
        setAgentName(agentDetails.name);
        setActiveAgentUsername(agentDetails.username || null);
        setLogo(agentDetails.logo || "");
        setCalendlyUrl(agentDetails.calendlyUrl || "");
        if (agentDetails.personalityType) {
          setPersonalityData({
            type: agentDetails.personalityType as PersonalityType,
            isCustom: agentDetails.personalityType === "custom-personality",
            customPrompt: agentDetails.customPersonalityPrompt || "",
            analysis: agentDetails.personalityAnalysis,
            lastUrl: agentDetails.lastPersonalityUrl || "",
            lastContent: agentDetails.lastPersonalityContent || "",
          });
        }
      } catch (error) {
        console.error("Error fetching agent details:", error);
      }
    }
    fetchAgentDetails();
  }, [agentId, setActiveAgentUsername, setCalendlyUrl]);

  useEffect(() => {
    async function fetchUserIP() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserId(data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
        setUserId(`user_${Math.random().toString(36).substr(2, 9)}`);
      }
    }
    fetchUserIP();
  }, []);

  useEffect(() => {
    if (!isCustomPrompt) {
      const template = SYSTEM_PROMPT_TEMPLATES.find(
        (t) => t.id === selectedPromptTemplate
      );
      if (template) {
        setSystemPrompt(template.prompt);
      }
    }
  }, [selectedPromptTemplate, isCustomPrompt]);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "custom") {
      setIsCustomPrompt(true);
    } else {
      setIsCustomPrompt(false);
      setSelectedPromptTemplate(templateId);
    }
  };

  const handlePersonalityChange = (
    personalityType: string,
    isCustom: boolean,
    customPrompt: string,
    analysisResult: PersonalityAnalysis | null,
    lastUrl: string,
    lastContent: string
  ) => {
    setPersonalityData({
      type: personalityType as PersonalityType,
      isCustom: isCustom,
      customPrompt: customPrompt,
      analysis: analysisResult,
      lastUrl,
      lastContent,
    });
  };

  const getPersonalityPrompt = (): string => {
    // If using custom personality with analysis result that has mimicry instructions
    if (
      personalityData.isCustom &&
      personalityData.analysis?.mimicryInstructions
    ) {
      return personalityData.analysis.mimicryInstructions;
    }
    // If using custom personality with custom prompt
    else if (personalityData.isCustom && personalityData.customPrompt) {
      return personalityData.customPrompt;
    }
    // If using a predefined personality type
    else if (!personalityData.isCustom) {
      // Get the predefined prompt from PERSONALITY_TYPES
      const personalityType = PERSONALITY_TYPES.find(
        (p) => p.id === personalityData.type
      );
      if (personalityType) {
        return personalityType.prompt;
      }
    }

    return "";
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Call RAG API to get context using the server action
      const context = await queryDocument(agentId, message);
      const personalityPrompt = getPersonalityPrompt();
      console.log(
        "Using personality prompt:",
        personalityPrompt ? "Yes" : "No"
      );

      const enhancedSystemPrompt = `${systemPrompt}
      
      ${
        personalityPrompt
          ? `PERSONALITY INSTRUCTIONS (MUST FOLLOW THESE EXACTLY):
${personalityPrompt}

The personality instructions above should take precedence over other style guidelines.`
          : ""
      }
      
      Context Information:
      ${JSON.stringify(context)}
      
      Additional Rules:
      - For general greetings or conversational queries like "hello" or "how are you", respond naturally in the personality style.
      - Always maintain the specified personality speech patterns throughout your response.
      - If mimicking a specific person's style, use their vocabulary choices, sentence structures, and speech patterns consistently.`;
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: enhancedSystemPrompt },
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

      // Update chat logs in backend
      if (userId) {
        const newUserLogs = [
          {
            role: "user",
            content: message,
            timestamp: newMessage.timestamp.toISOString(),
          },
          {
            role: "assistant",
            content: agentResponse.content,
            timestamp: agentResponse.timestamp.toISOString(),
          },
        ];

        await updateUserLogs({
          userId,
          sessionId,
          agentId,
          newUserLogs,
        });
      }
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

  const handleSaveSettings = async () => {
    console.log("Saving settings:", {
      model,
      temperature,
      systemPrompt,
      personalityType: personalityData.type,
      isCustomPersonality: personalityData.isCustom,
      customPersonalityPrompt: personalityData.customPrompt,
      personalityAnalysis: personalityData.analysis,
      lastPersonalityUrl: personalityData.lastUrl,
      lastPersonalityContent: personalityData.lastContent,
      themeColors: {
        botColor: theme.botColor,
        botText: theme.botText,
        bubbleBackground: theme.bubbleBackground,
        bubbleColor: theme.bubbleColor,
        bubbleTextColor: theme.bubbleTextColor,
      },
    });

    try {
      await updateAgentDetails(agentId, {
        model,
        systemPrompt,
        logo,
        calendlyUrl,
        personalityType: personalityData.type,
        isCustomPersonality: personalityData.isCustom,
        customPersonalityPrompt: personalityData.customPrompt,
        personalityAnalysis: personalityData.analysis,
        lastPersonalityUrl: personalityData.lastUrl,
        lastPersonalityContent: personalityData.lastContent,
        themeColors: {
          botColor: theme.botColor,
          botText: theme.botText,
          bubbleBackground: theme.bubbleBackground,
          bubbleColor: theme.bubbleColor,
          bubbleTextColor: theme.bubbleTextColor,
        },
      });
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="max-w-xxl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-3 min-h-[600px]">
        <div className="col-span-2 border-r border-gray-200 p-1 bg-gray-50 max-h-[650px] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex">
                {/* Vertical Tab Navigation */}
                <div className="w-1/3 border-r border-gray-200">
                  <nav className="space-y-1 p-2">
                    <button
                      onClick={() => setActiveTab("model")}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === "model"
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Model
                    </button>
                    <button
                      onClick={() => setActiveTab("system")}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === "system"
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      System Prompt
                    </button>
                    <button
                      onClick={() => setActiveTab("personality")}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === "personality"
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Personality
                    </button>
                    <button
                      onClick={() => setActiveTab("theme")}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === "theme"
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Theme
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="w-2/3 p-4 min-h-[500px]">
                  {/* Model Settings Tab */}
                  {activeTab === "model" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Model
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {AVAILABLE_MODELS.map((modelOption) => (
                          <option key={modelOption.id} value={modelOption.id}>
                            {modelOption.name} ({modelOption.contextWindow}{" "}
                            context)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* System Prompt Tab */}
                  {activeTab === "system" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          System Prompt
                        </span>
                        <button
                          onClick={() => setIsCustomPrompt(!isCustomPrompt)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {isCustomPrompt ? "Use Template" : "Custom Prompt"}
                        </button>
                      </div>

                      {!isCustomPrompt ? (
                        <div className="space-y-2">
                          <select
                            value={selectedPromptTemplate}
                            onChange={(e) =>
                              handleTemplateChange(e.target.value)
                            }
                            className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-64 resize-none"
                            placeholder="Modify the selected template..."
                          />
                        </div>
                      ) : (
                        <textarea
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                          placeholder="Enter custom system prompt..."
                        />
                      )}
                    </div>
                  )}

                  {/* Personality Settings Tab */}
                  {activeTab === "personality" && (
                    <div className="space-y-4">
                      <PersonalityAnalyzer
                        openaiClient={openai}
                        onPersonalityChange={handlePersonalityChange}
                        initialPersonality={{
                          type: personalityData.type,
                          isCustom: personalityData.isCustom,
                          customPrompt: personalityData.customPrompt,
                        }}
                        initialAnalysis={personalityData.analysis}
                        initialUrl={personalityData.lastUrl}
                        initialContent={personalityData.lastContent}
                      />
                    </div>
                  )}

                  {/* Theme Settings Tab */}
                  {activeTab === "theme" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme color:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.botColor}
                              onChange={(e) =>
                                setTheme({
                                  ...theme,
                                  botColor: e.target.value,
                                })
                              }
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {theme.botColor}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme text:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.botText}
                              onChange={(e) =>
                                setTheme({
                                  ...theme,
                                  botText: e.target.value,
                                })
                              }
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {theme.botText}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chat background:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.bubbleBackground}
                              onChange={(e) =>
                                setTheme({
                                  ...theme,
                                  bubbleBackground: e.target.value,
                                })
                              }
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {theme.bubbleBackground}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bubble color:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.bubbleColor}
                              onChange={(e) =>
                                setTheme({
                                  ...theme,
                                  bubbleColor: e.target.value,
                                })
                              }
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {theme.bubbleColor}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bubble text color:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={theme.bubbleTextColor}
                              onChange={(e) =>
                                setTheme({
                                  ...theme,
                                  bubbleTextColor: e.target.value,
                                })
                              }
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                              {theme.bubbleTextColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => {
                            // Reset to default theme
                            setTheme({
                              botColor: "#FFFFFF",
                              botText: "#000000",
                              bubbleBackground: "#ffffff",
                              bubbleColor: "#e5e5e5",
                              bubbleTextColor: "#000000",
                            });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <button
                onClick={handleSaveSettings}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="col-span-1 flex flex-col"
          style={{
            backgroundColor: theme.botColor,
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-3">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${agentName} logo`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <Bot className="h-8 w-8 text-indigo-600" />
                )}
                <div style={{ color: theme.botText }}>
                  <span className="text-sm font-medium">{agentName}</span>
                  {activeAgentUsername && (
                    <span className="text-xs block">
                      @{activeAgentUsername}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className="space-y-4 h-[450px] overflow-y-auto pt-2 pb-2"
              style={{ backgroundColor: theme.bubbleBackground }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor:
                      msg.sender != "agent" ? theme.bubbleColor : "#f9f9f9",
                    color:
                      msg.sender != "agent" ? theme.bubbleTextColor : "#000000",
                    border: "1px solid #e5e5e5",
                  }}
                  className={`rounded-lg p-2 ${
                    msg.sender === "agent" ? "mr-8 ml-1" : `ml-8 mr-1`
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div
            className="border-t border-gray-200 p-4"
            style={{ backgroundColor: theme.bubbleBackground }}
          >
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                onKeyPress={handleKeyPress}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div
              className="mt-2 text-xs text-right"
              style={{ color: theme.botText }}
            >
              Powered By KiFor.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
