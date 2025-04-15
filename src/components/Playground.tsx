import React from "react";
import { RefreshCw, Send, Save, Plus } from "lucide-react";
import { ChatMessage } from "../types";
import {
  queryDocument,
  getAgentDetails,
  updateAgentDetails,
  updateUserLogs,
} from "../lib/serverActions";
import OpenAI from "openai";

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
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! What can I help you with?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);
  const [status] = React.useState("Trained");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [temperature, setTemperature] = React.useState(0.5);
  const [systemPrompt, setSystemPrompt] = React.useState(
    "You are a helpful assistant that provides accurate and concise information."
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [agentName, setAgentName] = React.useState("");
  const [selectedPromptTemplate, setSelectedPromptTemplate] =
    React.useState("educational");
  const [isCustomPrompt, setIsCustomPrompt] = React.useState(false);

  // Add session state
  const [sessionId] = React.useState(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [userId, setUserId] = React.useState("");

  // Fetch agent details on component mount
  React.useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const agentDetails = await getAgentDetails(agentId);
        setModel(agentDetails.model);
        setSystemPrompt(agentDetails.systemPrompt);
        setAgentName(agentDetails.name);
      } catch (error) {
        console.error("Error fetching agent details:", error);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  // Get user IP on component mount
  React.useEffect(() => {
    const fetchUserIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserId(data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
        setUserId(`user_${Math.random().toString(36).substr(2, 9)}`);
      }
    };
    fetchUserIP();
  }, []);

  // Add effect to update system prompt when template changes
  React.useEffect(() => {
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

      // Prepare system prompt with context
      const systemPrompt = `You are a concise AI assistant.

      Use only the provided context to answer the user's question:

      ${JSON.stringify(context)}

      Rules:
      - Answer in 1–2 plain sentences only.
      - Do not add extra explanation, greetings, or conclusions.
      - No special characters, markdown, or formatting.
      - If the context doesn't contain relevant information, say so."`;

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

  const handleSaveSettings = async () => {
    // Here you can implement saving settings to your backend
    console.log("Saving settings:", { model, temperature, systemPrompt });
    // Add your save logic here

    try {
      const response = await updateAgentDetails(agentId, {
        model,
        systemPrompt,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-3 min-h-[600px]">
        {/* Left Panel */}
        <div className="col-span-1 border-r border-gray-200 p-4 bg-gray-50">
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
