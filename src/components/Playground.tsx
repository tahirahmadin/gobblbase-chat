import React from "react";
import { RefreshCw, Send } from "lucide-react";
import { ChatMessage } from "../types";
import { queryDocument } from "../lib/serverActions";
import OpenAI from "openai";

interface PlaygroundProps {
  agentId: string;
}

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
  const [model] = React.useState("GPT-4o Mini");
  const [temperature] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

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
      const systemPrompt = `You are a helpful assistant that has access to the following context from:
      ${JSON.stringify(context)}
      
      Use this context to answer the user's question. If the context doesn't contain relevant information, say so.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: temperature,
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

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-3 min-h-[600px]">
        {/* Left Panel */}
        <div className="col-span-1 border-r border-gray-200 p-4">
          <div className="space-y-6">
            <div>
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Model</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">{model}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Temperature
                </span>
                <span className="text-sm text-gray-600">{temperature}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full w-0 bg-blue-600 rounded-full"></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                AI Actions
              </h3>
              <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No actions found
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-2 flex flex-col">
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                Agent {new Date().toLocaleString()}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
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
