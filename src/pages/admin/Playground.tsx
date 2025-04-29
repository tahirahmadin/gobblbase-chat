import React, { useState, useEffect } from "react";
import { Save, Plus, Bot } from "lucide-react";
import { ChatMessage } from "../../types";
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

interface Theme {
  id: string;
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
}

interface PlaygroundProps {
  agentId: string;
}

// Define available models with details and images
const MODEL_PRESETS = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    image:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&q=80",
    contextWindow: "128K",
    description: "Our recommended model for best performance",
    traits: ["Fast", "Powerful", "Reliable"],
    details: "Best balance of performance and efficiency",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    image:
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200&h=200&q=80",
    contextWindow: "16K",
    description: "Fast and cost-effective",
    traits: ["Quick", "Affordable", "Efficient"],
    details: "Great for most everyday tasks",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&q=80",
    contextWindow: "200K",
    description: "Balanced performance at lower cost",
    traits: ["Smart", "Economic", "Versatile"],
    details: "Excellent value for money",
  },
];

// Define system prompt templates with profile images
const SYSTEM_PROMPT_TEMPLATES = [
  {
    id: "medical",
    name: "Medical Professional",
    description: "Healthcare consultation and patient support",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&q=80",
    prompt: `You are a professional medical assistant providing healthcare information and support. Follow these guidelines:

1. Always maintain HIPAA compliance and patient confidentiality
2. Provide accurate medical information from verified sources
3. Use clear, non-technical language when explaining medical terms
4. Never diagnose or prescribe medication
5. Direct emergency cases to seek immediate medical attention
6. Focus on:
   - General health information
   - Appointment scheduling
   - Basic symptom guidance
   - Healthcare facility information
   - Insurance and billing queries

Remember: You are an assistant, not a replacement for professional medical advice.`,
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Social media and content management",
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=200&h=200&q=80",
    prompt: `You are a content creation assistant helping with social media and digital content. Follow these guidelines:

1. Provide creative content ideas and strategies
2. Offer platform-specific best practices
3. Help with:
   - Content calendar planning
   - Engagement strategies
   - Trend analysis
   - Audience growth tips
   - Analytics interpretation
4. Suggest content formats and posting schedules
5. Provide SEO and hashtag recommendations

Focus on actionable, practical advice for content creators.`,
  },
  {
    id: "bakery",
    name: "Bakery Owner",
    description: "Bakery business and customer service",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&q=80",
    prompt: `You are a bakery assistant helping customers and managing operations. Follow these guidelines:

1. Provide information about:
   - Menu items and ingredients
   - Special orders and customization
   - Pricing and promotions
   - Store hours and locations
   - Delivery and pickup options
2. Handle:
   - Order inquiries
   - Event catering requests
   - Dietary restrictions
   - Product availability
   - Customer feedback

Maintain a warm, friendly tone while being professional.`,
  },
  {
    id: "education",
    name: "Educational Institution",
    description: "Student and parent support",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&q=80",
    prompt: `You are an educational institution assistant supporting students and parents. Follow these guidelines:

1. Provide information about:
   - Course offerings and schedules
   - Admission requirements
   - Tuition and financial aid
   - Campus facilities
   - Academic policies
2. Assist with:
   - Application processes
   - Registration procedures
   - Student services
   - Event information
   - Parent communication

Maintain a professional yet approachable tone.`,
  },
  {
    id: "automotive",
    name: "Car Dealership",
    description: "Vehicle sales and service support",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&q=80",
    prompt: `You are a car dealership assistant helping customers with vehicle-related queries. Follow these guidelines:

1. Provide information about:
   - Available inventory
   - Vehicle specifications
   - Pricing and financing
   - Service schedules
   - Warranty details
2. Handle:
   - Test drive requests
   - Service appointments
   - Trade-in inquiries
   - Vehicle comparisons
   - Customer feedback

Maintain a professional, knowledgeable tone while being helpful.`,
  },
  {
    id: "custom",
    name: "Custom Profile",
    description: "Create your own custom profile",
    image:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&q=80",
    prompt: "",
  },
];

// Define available themes
const AVAILABLE_THEMES = [
  {
    id: "crypto",
    name: "Crypto Theme",
    image:
      "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/A218/production/_118569414_bitcoin2.jpg.webp",
    description: "Modern crypto-inspired design",
    palette: ["#000000", "#F0B90A", "#1E2026", "#FFFFFF"],
    theme: {
      id: "crypto",
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
    },
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    image:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&q=80",
    description: "Sleek dark theme with high contrast",
    palette: ["#000000", "#1A1A1A", "#333333", "#FFFFFF"],
    theme: {
      id: "modern-dark",
      headerColor: "#000000",
      headerTextColor: "#FFFFFF",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#FFFFFF",
      chatBackgroundColor: "#1A1A1A",
      bubbleAgentBgColor: "#333333",
      bubbleAgentTextColor: "#FFFFFF",
      bubbleAgentTimeTextColor: "#999999",
      bubbleUserBgColor: "#FFFFFF",
      bubbleUserTextColor: "#000000",
      bubbleUserTimeTextColor: "#666666",
      inputCardColor: "#000000",
      inputBackgroundColor: "#333333",
      inputTextColor: "#FFFFFF",
    },
  },
  {
    id: "light-minimal",
    name: "Light Minimal",
    image:
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?w=200&h=200&q=80",
    description: "Clean, minimal light design",
    palette: ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#111827"],
    theme: {
      id: "light-minimal",
      headerColor: "#FFFFFF",
      headerTextColor: "#111827",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#111827",
      chatBackgroundColor: "#F3F4F6",
      bubbleAgentBgColor: "#FFFFFF",
      bubbleAgentTextColor: "#111827",
      bubbleAgentTimeTextColor: "#6B7280",
      bubbleUserBgColor: "#111827",
      bubbleUserTextColor: "#FFFFFF",
      bubbleUserTimeTextColor: "#E5E7EB",
      inputCardColor: "#FFFFFF",
      inputBackgroundColor: "#F3F4F6",
      inputTextColor: "#111827",
    },
  },
  {
    id: "forest",
    name: "Forest",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=200&h=200&q=80",
    description: "Natural green color scheme",
    palette: ["#064E3B", "#065F46", "#059669", "#ECFDF5"],
    theme: {
      id: "forest",
      headerColor: "#064E3B",
      headerTextColor: "#ECFDF5",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#ECFDF5",
      chatBackgroundColor: "#065F46",
      bubbleAgentBgColor: "#064E3B",
      bubbleAgentTextColor: "#ECFDF5",
      bubbleAgentTimeTextColor: "#34D399",
      bubbleUserBgColor: "#ECFDF5",
      bubbleUserTextColor: "#064E3B",
      bubbleUserTimeTextColor: "#059669",
      inputCardColor: "#064E3B",
      inputBackgroundColor: "#065F46",
      inputTextColor: "#ECFDF5",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&q=80",
    description: "Calm blue ocean-inspired design",
    palette: ["#0C4A6E", "#0369A1", "#0EA5E9", "#E0F2FE"],
    theme: {
      id: "ocean",
      headerColor: "#0C4A6E",
      headerTextColor: "#E0F2FE",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#E0F2FE",
      chatBackgroundColor: "#0369A1",
      bubbleAgentBgColor: "#0C4A6E",
      bubbleAgentTextColor: "#E0F2FE",
      bubbleAgentTimeTextColor: "#0EA5E9",
      bubbleUserBgColor: "#E0F2FE",
      bubbleUserTextColor: "#0C4A6E",
      bubbleUserTimeTextColor: "#0369A1",
      inputCardColor: "#0C4A6E",
      inputBackgroundColor: "#0369A1",
      inputTextColor: "#E0F2FE",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200&h=200&q=80",
    description: "Warm sunset-inspired color palette",
    palette: ["#7C2D12", "#C2410C", "#EA580C", "#FFEDD5"],
    theme: {
      id: "sunset",
      headerColor: "#7C2D12",
      headerTextColor: "#FFEDD5",
      headerNavColor: "#bdbdbd",
      headerIconColor: "#FFEDD5",
      chatBackgroundColor: "#C2410C",
      bubbleAgentBgColor: "#7C2D12",
      bubbleAgentTextColor: "#FFEDD5",
      bubbleAgentTimeTextColor: "#EA580C",
      bubbleUserBgColor: "#FFEDD5",
      bubbleUserTextColor: "#7C2D12",
      bubbleUserTimeTextColor: "#C2410C",
      inputCardColor: "#7C2D12",
      inputBackgroundColor: "#C2410C",
      inputTextColor: "#FFEDD5",
    },
  },
];

// Define personality types with images and descriptions
const TONE_PRESETS = [
  {
    id: "humorous",
    name: "Humorous & Witty",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&q=80",
    description: "Funny, engaging, with a touch of humor",
    traits: ["Witty", "Playful", "Engaging"],
    prompt:
      "Communicate in a lighthearted, humorous way. Use witty remarks, clever wordplay, and casual language. Keep the tone fun and engaging while still being helpful. Feel free to use appropriate jokes and playful examples to make the conversation enjoyable.",
  },
  {
    id: "professional",
    name: "Professional & Direct",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&q=80",
    description: "Serious, authentic, straight to the point",
    traits: ["Direct", "Clear", "Formal"],
    prompt:
      "Maintain a professional, straightforward communication style. Be concise and direct, focusing on delivering accurate information efficiently. Use formal language and clear explanations without unnecessary elaboration.",
  },
  {
    id: "friendly",
    name: "Friendly & Supportive",
    image:
      "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=200&h=200&q=80",
    description: "Warm, encouraging, approachable",
    traits: ["Supportive", "Warm", "Patient"],
    prompt:
      "Adopt a warm, friendly tone that makes users feel comfortable and supported. Use encouraging language, show empathy, and maintain a helpful, patient approach. Make the conversation feel personal while remaining professional.",
  },
  {
    id: "expert",
    name: "Expert & Analytical",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=200&h=200&q=80",
    description: "Technical, detailed, thorough",
    traits: ["Analytical", "Detailed", "Technical"],
    prompt:
      "Communication should be detailed and analytical, demonstrating deep expertise. Use technical terminology when appropriate, provide comprehensive explanations, and back statements with logical reasoning.",
  },
  {
    id: "motivational",
    name: "Motivational & Inspiring",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&q=80",
    description: "Energetic, inspiring, encouraging",
    traits: ["Inspiring", "Energetic", "Positive"],
    prompt:
      "Take an energetic, inspiring approach to communication. Use motivational language, positive reinforcement, and encouraging statements. Focus on possibilities and growth while maintaining enthusiasm.",
  },
  {
    id: "custom-personality",
    name: "Custom Tone",
    image:
      "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&q=80",
    description: "Create your own custom tone",
    traits: ["Customizable", "Flexible", "Unique"],
    prompt: "",
  },
];

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
                              theme.id === themeOption.theme.id
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
                                {theme === themeOption.theme && (
                                  <div className="absolute -top-1 -right-1 bg-black rounded-full p-1">
                                    <span className="text-white text-xs">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                  {themeOption.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
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
                                    themeOption.theme.headerColor,
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
                                          color:
                                            themeOption.theme.headerTextColor,
                                        }}
                                      >
                                        {agentName}
                                      </h3>
                                      <p
                                        className="text-xs text-left"
                                        style={{
                                          color:
                                            themeOption.theme.headerTextColor,
                                        }}
                                      >
                                        @{activeAgentUsername}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status Bar */}
                                  <div
                                    className="mt-3 flex items-center justify-between text-xs"
                                    style={{
                                      color: themeOption.theme.headerNavColor,
                                    }}
                                  >
                                    <div
                                      className="flex items-center justify-between space-x-2"
                                      style={{
                                        color:
                                          themeOption.theme.headerTextColor,
                                      }}
                                    >
                                      Chat
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                      Book
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                      Browse
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
