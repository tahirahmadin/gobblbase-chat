import React, { useState, useEffect } from "react";
import { Save, Plus, Bot } from "lucide-react";
import { ChatMessage, Theme, ThemeOption } from "../../types";
import {
  queryDocument,
  updateAgentDetails,
  updateUserLogs,
} from "../../lib/serverActions";
import OpenAI from "openai";
import PublicChat from "../chatbot/PublicChat";
import { toast } from "react-hot-toast";
import { useBotConfig } from "../../store/useBotConfig";
import { useAdminStore } from "../../store/useAdminStore";
import {
  AVAILABLE_THEMES,
  SYSTEM_PROMPT_TEMPLATES,
  MODEL_PRESETS,
  TONE_PRESETS,
} from "../../utils/constants";

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
  extractedPlatform: string | null;
}

interface PlaygroundProps {
  agentId: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Playground({ agentId }: PlaygroundProps) {
  const { fetchBotData, activeBotData } = useBotConfig();
  const { adminEmail } = useAdminStore();

  const [activeTab, setActiveTab] = useState("model");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! What can I help you with?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);

  const [agentName, setAgentName] = useState("");
  const [activeAgentUsername, setActiveAgentUsername] = useState("");
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [logo, setLogo] = useState("");

  const [model, setModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant that provides accurate and concise information."
  );
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
    extractedPlatform: null,
  });
  const [theme, setTheme] = useState<Theme>(AVAILABLE_THEMES[0].theme);

  const [sessionId] = useState(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const userId = adminEmail;

  useEffect(() => {
    async function fetchAgentDetails() {
      await fetchBotData(agentId, false);
    }
    fetchAgentDetails();
  }, [agentId]);

  useEffect(() => {
    if (activeBotData) {
      setModel(activeBotData.model);
      setSystemPrompt(activeBotData.systemPrompt);
      setTheme(activeBotData?.themeColors);
      setModel(activeBotData.model);
      setSystemPrompt(activeBotData.systemPrompt);
      setTheme(activeBotData?.themeColors);

      setAgentName(activeBotData.name);

      setLogo(activeBotData.logo || "");
      setActiveAgentUsername(activeBotData.username);
      if (activeBotData.personalityType) {
        setPersonalityData({
          type: activeBotData.personalityType as PersonalityType,
          isCustom: activeBotData.personalityType === "custom-personality",
          customPrompt: activeBotData.customPersonalityPrompt || "",
          analysis: activeBotData.personalityAnalysis,
          lastUrl: activeBotData.lastPersonalityUrl || "",
          lastContent: activeBotData.lastPersonalityContent || "",
          extractedPlatform: null,
        });
      }
    }
  }, [activeBotData]);

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
    lastContent: string,
    extractedPlatform: string | null
  ) => {
    setPersonalityData({
      type: personalityType as PersonalityType,
      isCustom: isCustom,
      customPrompt: customPrompt,
      analysis: analysisResult,
      lastUrl,
      lastContent,
      extractedPlatform,
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
      // Get the predefined prompt from TONE_PRESETS
      const personalityType = TONE_PRESETS.find(
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
      systemPrompt,
      personalityType: personalityData.type,
      isCustomPersonality: personalityData.isCustom,
      customPersonalityPrompt: personalityData.customPrompt,
      personalityAnalysis: personalityData.analysis,
      lastPersonalityUrl: personalityData.lastUrl,
      lastPersonalityContent: personalityData.lastContent,
      themeColors: theme,
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
        themeColors: theme,
      });

      // Show success toast for settings saved
      toast.success("Settings saved successfully", {
        duration: 3000,
        position: "top-right",
      });

      // Show additional toasts for specific changes only if they were modified
      if (activeBotData?.name !== agentName) {
        toast.success(`Agent name updated to ${agentName}`, {
          duration: 3000,
          position: "top-right",
        });
      }

      if (activeBotData?.personalityType !== personalityData.type) {
        toast.success(`Personality set to ${personalityData.type}`, {
          duration: 3000,
          position: "top-right",
        });
      }

      if (
        JSON.stringify(activeBotData?.themeColors) !== JSON.stringify(theme)
      ) {
        toast.success("Theme updated successfully", {
          duration: 3000,
          position: "top-right",
        });
      }

      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <div className="w-full mx-auto h-[calc(100vh-20rem)]">
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* Settings Panel */}
        <div className="col-span-2 flex flex-col h-full">
          {/* Main Settings Card */}
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {["model", "Chatbot Profile", "Tone", "theme"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-black text-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto ">
              <div className="p-6 h-[550px]">
                {/* Model Settings Tab */}
                {activeTab === "model" && (
                  <div className="space-y-6 ">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-900">
                          Select Model
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {MODEL_PRESETS.map((modelOption) => (
                          <button
                            key={modelOption.id}
                            onClick={() => setModel(modelOption.id)}
                            className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                              model === modelOption.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={modelOption.image}
                                  alt={modelOption.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                {model === modelOption.id && (
                                  <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-left">
                                <h3 className="font-medium text-gray-900">
                                  {modelOption.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  {modelOption.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {modelOption.traits.map((trait, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Context: {modelOption.contextWindow}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {modelOption.details}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* System Prompt Tab */}
                {activeTab === "Chatbot Profile" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-900">
                          Chatbot Profile
                        </label>
                        <button
                          onClick={() => setIsCustomPrompt(!isCustomPrompt)}
                          className="text-sm text-black hover:text-gray-700 flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {isCustomPrompt ? "Use Template" : "Custom Prompt"}
                        </button>
                      </div>

                      {!isCustomPrompt ? (
                        <div className="grid grid-cols-2 gap-4">
                          {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => {
                                handleTemplateChange(template.id);
                                setSystemPrompt(template.prompt);
                              }}
                              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                                selectedPromptTemplate === template.id
                                  ? "border-black bg-gray-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <img
                                    src={template.image}
                                    alt={template.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                  {selectedPromptTemplate === template.id && (
                                    <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                                      <span className="text-white text-xs">
                                        ✓
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <h3 className="font-medium text-gray-900">
                                    {template.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-64 resize-none"
                            placeholder="Enter your custom system prompt..."
                          />
                          <p className="text-xs text-gray-500">
                            Write a detailed prompt to define your AI
                            assistant's behavior, knowledge, and tone.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personality Settings Tab */}
                {activeTab === "Tone" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-900">
                          Tone & Personality
                        </label>
                        <button
                          onClick={() => {
                            const customType = TONE_PRESETS.find(
                              (t) => t.id === "custom-personality"
                            );
                            handlePersonalityChange(
                              "custom-personality",
                              true,
                              "",
                              null,
                              "",
                              "",
                              null
                            );
                          }}
                          className="text-sm text-black hover:text-gray-700 flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Custom Tone
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {TONE_PRESETS.map((personality) => (
                          <button
                            key={personality.id}
                            onClick={() => {
                              handlePersonalityChange(
                                personality.id,
                                personality.id === "custom-personality",
                                personality.prompt,
                                null,
                                "",
                                "",
                                null
                              );
                            }}
                            className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                              personalityData.type === personality.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={personality.image}
                                  alt={personality.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                {personalityData.type === personality.id && (
                                  <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-left">
                                <h3 className="font-medium text-gray-900">
                                  {personality.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  {personality.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {personality.traits.map((trait, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {personalityData.type === "custom-personality" && (
                        <div className="mt-4 space-y-3">
                          <textarea
                            value={personalityData.customPrompt}
                            onChange={(e) =>
                              handlePersonalityChange(
                                "custom-personality",
                                true,
                                e.target.value,
                                null,
                                "",
                                "",
                                null
                              )
                            }
                            className="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-32 resize-none"
                            placeholder="Describe your custom tone and personality..."
                          />
                          <p className="text-xs text-gray-500">
                            Define how you want the AI to communicate, including
                            tone, style, and personality traits.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Theme Settings Tab */}
                {activeTab === "theme" && (
                  <div className="space-y-6 ">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-900">
                          Select Theme
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {AVAILABLE_THEMES.map((themeOption) => (
                          <button
                            key={themeOption.id}
                            onClick={() => setTheme(themeOption.theme)}
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                              theme.mainDarkColor ===
                              themeOption.theme.mainDarkColor
                                ? "border-black"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start p-4 space-x-4">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={themeOption.image}
                                  alt={themeOption.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                {theme.mainDarkColor ===
                                  themeOption.theme.mainDarkColor && (
                                  <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-left">
                                  {themeOption.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3 text-left">
                                  {themeOption.description}
                                </p>

                                {/* Color Palette Preview */}
                                <div className="flex space-x-2">
                                  {themeOption.palette.map((color, index) => (
                                    <div
                                      key={index}
                                      className="w-6 h-6 rounded-full shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Theme Preview */}
                            <div className="mt-3 border-t border-gray-100 p-4 bg-gray-50">
                              <div
                                className="rounded-lg overflow-hidden"
                                style={{
                                  backgroundColor:
                                    themeOption.theme.mainDarkColor,
                                }}
                              >
                                {/* Bot Header Preview */}
                                <div className="p-4">
                                  <div className="flex items-center space-x-4">
                                    {logo ? (
                                      <img
                                        src={logo}
                                        alt={`${agentName} logo`}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <Bot className="h-8 w-8 text-black" />
                                    )}
                                    <div>
                                      <h3
                                        className="text-base font-medium"
                                        style={{
                                          color: !themeOption.theme.isDark
                                            ? "black"
                                            : "white",
                                        }}
                                      >
                                        {agentName}
                                      </h3>
                                      <p
                                        className="text-xs text-left"
                                        style={{
                                          color: !themeOption.theme.isDark
                                            ? "black"
                                            : "white",
                                        }}
                                      >
                                        @{activeAgentUsername}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Settings Button - Fixed at bottom */}
          <div className="mt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>

        {/* Chat Preview Panel */}
        <div className="col-span-1 h-full">
          <PublicChat
            agentUsernamePlayground={activeAgentUsername}
            previewConfig={{
              name: agentName,
              logo: logo,
              calendlyUrl: calendlyUrl,
              themeColors: theme,
              personalityType: personalityData.type,
              customPersonalityPrompt: personalityData.customPrompt,
              personalityAnalysis: personalityData.analysis,
            }}
          />
        </div>
      </div>
    </div>
  );
}
