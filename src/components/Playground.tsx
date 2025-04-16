import React, { useState, useEffect } from "react";
import { RefreshCw, Send, Save, Plus } from "lucide-react";
import { ChatMessage } from "../types";
import {
  queryDocument,
  getAgentDetails,
  updateAgentDetails,
  updateUserLogs,
} from "../lib/serverActions";
import OpenAI from "openai";
import PersonalityAnalyzer from "./PersonalityAnalyzer";

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

type PersonalityType = "influencer" | "professional" | "friendly" | "expert" | "motivational" | "casual" | "custom";

interface PersonalityData {
  type: PersonalityType;
  isCustom: boolean;
  customPrompt: string;
  analysis: PersonalityAnalysis | null;
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
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState("educational");
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [personalityData, setPersonalityData] = useState<PersonalityData>({
    type: "professional",
    isCustom: false,
    customPrompt: "",
    analysis: null,
  });
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        const agentDetails = await getAgentDetails(agentId);
        setModel(agentDetails.model);
        setSystemPrompt(agentDetails.systemPrompt);
        setAgentName(agentDetails.name);
        if (agentDetails.personalityType) {
          setPersonalityData({
            type: agentDetails.personalityType as PersonalityType,
            isCustom: agentDetails.personalityType === "custom",
            customPrompt: agentDetails.personalityPrompt || "",
            analysis: null,
          });
        }
      } catch (error) {
        console.error("Error fetching agent details:", error);
      }
    }
    fetchAgentDetails();
  }, [agentId]);

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
    analysisResult: PersonalityAnalysis | null
  ) => {
    setPersonalityData({
      type: personalityType as PersonalityType,
      isCustom: isCustom,
      customPrompt: customPrompt,
      analysis: analysisResult,
    });
  };

  const getPersonalityPrompt = (): string => {
    if (personalityData.analysis && personalityData.analysis.mimicryInstructions) {
      return personalityData.analysis.mimicryInstructions;
    }
    if (personalityData.isCustom) {
      return personalityData.customPrompt;
    } else {
      const personalities: Record<Exclude<PersonalityType, "custom">, string> = {
        influencer: "Respond like a social media influencer. Use trendy language, be conversational and engaging, add occasional emojis, keep messages concise yet energetic, and focus on creating connection with the user. Make your responses feel like they're coming from someone who is charismatic and knows how to keep an audience engaged. Use phrases like 'you guys', 'literally', 'absolutely love', 'super excited', and 'amazing'. Occasionally use abbreviated words and colloquialisms. Vary sentence length but keep them generally short and impactful.",
        professional: "Respond like a business professional. Use formal language, precise terminology, structured responses, and maintain an authoritative tone. Focus on clarity, accuracy, and demonstrating expertise. Avoid casual expressions and slang. Use complete sentences with proper grammar and punctuation. Structure responses with clear introductions and conclusions. Employ professional phrases like 'I recommend', 'best practice suggests', 'from my assessment', and 'in my professional opinion'. Maintain a confident, measured tone throughout.",
        friendly: "Respond like a friendly helper. Use warm, conversational language, show empathy, ask supportive follow-up questions, and focus on building rapport. Make your responses feel like they're coming from someone who genuinely cares about helping the user in a comfortable, relaxed manner. Use phrases like 'I understand how you feel', 'that's a great question', 'I'm happy to help with that', and 'let me know if there's anything else'. Include personal touches and occasional gentle humor where appropriate.",
        expert: "Respond like a subject matter expert. Use technical terminology appropriate to the topic, provide detailed explanations, cite relevant concepts or principles, and focus on accuracy and depth. Make your responses demonstrate deep domain knowledge while still being accessible. Structure explanations logically, moving from foundational concepts to more complex details. Use phrases like 'research indicates', 'a key principle here is', 'it's important to note that', and 'to understand this fully, consider'. Balance technical precision with clarity.",
        motivational: "Respond like a motivational speaker. Use powerful, persuasive language with conviction and confidence. Include inspirational anecdotes, metaphors, and calls to action. Emphasize possibilities and focus on overcoming challenges. Use phrases like 'imagine what's possible', 'you have the power to', 'take the first step today', 'this is your moment', and 'I believe in you'. Vary sentence lengths dramatically for emphasis, using very short sentences to punctuate important points. Occasionally use rhetorical questions to engage the user in self-reflection.",
        casual: "Respond like a casual friend. Use informal language with occasional slang, keep things light and easygoing, and maintain a conversational tone throughout. Don't worry about perfect grammar or structure - be more natural and spontaneous. Use phrases like 'hey there', 'so anyway', 'kinda', 'pretty much', and 'y'know what I mean?'. Feel free to use contractions, add friendly banter, and show personality through language choices. Respond as if chatting with a friend you've known for years."
      };
      return personalities[personalityData.type as Exclude<PersonalityType, "custom">] || "";
    }
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
      const enhancedSystemPrompt = `${systemPrompt}
      
      ${personalityPrompt ? `PERSONALITY INSTRUCTIONS (MUST FOLLOW THESE EXACTLY):
${personalityPrompt}

The personality instructions above should take precedence over other style guidelines.` : ''}
      
      Context Information:
      ${JSON.stringify(context)}
      
      Additional Rules:
      - For general greetings or conversational queries like "hello" or "how are you", respond naturally in the personality style.
      - Only say "I cannot assist with that" if the query requires specific information not in the context and is not a general greeting.
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
    // Here you can implement saving settings to your backend
    console.log("Saving settings:", { model, temperature, systemPrompt });
    // Add your save logic here

    try {
      await updateAgentDetails(agentId, {
        model,
        systemPrompt,
        personalityType: personalityData.isCustom ? "custom" : personalityData.type,
        personalityPrompt: personalityData.isCustom ? personalityData.customPrompt : getPersonalityPrompt(),
      });
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-3 min-h-[600px]">
      <div className="col-span-1 border-r border-gray-200 p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isLoading ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></span>
                  {isLoading ? "Processing..." : status}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Model</span>
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
                    {modelOption.name} ({modelOption.contextWindow} context)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
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
                    onChange={(e) => handleTemplateChange(e.target.value)}
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
                    className="w-full p-2 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
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
            <PersonalityAnalyzer 
              openaiClient={openai}
              onPersonalityChange={handlePersonalityChange}
              initialPersonality={{
                type: personalityData.type,
                isCustom: personalityData.isCustom,
                customPrompt: personalityData.customPrompt,
              }}
            />
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
        <div className="col-span-2 flex flex-col">
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                {agentName || "Agent"} {new Date().toLocaleString()}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 mb-4 max-h-[550px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-4 ${
                    msg.sender === "agent"
                      ? "bg-gray-50 text-gray-700"
                      : "bg-indigo-50 text-indigo-700 ml-8"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 text-center">
              Processing file: {agentId}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
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
            <div className="mt-2 text-xs text-right text-gray-500">
              Powered By Gobbl.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
