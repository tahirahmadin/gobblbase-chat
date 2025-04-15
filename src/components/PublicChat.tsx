import React from "react";
import { useParams } from "react-router-dom";
import { ChatMessage } from "../types";
import { queryDocument } from "../lib/serverActions";
import OpenAI from "openai";
import { Send } from "lucide-react";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function PublicChat() {
  const { agentId } = useParams();
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! What can I help you with?",
      timestamp: new Date(),
      sender: "agent",
    },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !agentId) return;

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">
              Gobbl.ai Chat
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "agent" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === "agent"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-blue-600 text-white"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className="mt-1 text-xs opacity-70">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              isLoading || !message.trim()
                ? "text-gray-400"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">Powered by Gobbl.ai</span>
        </div>
      </div>
    </div>
  );
}
