import React from "react";
import { useParams } from "react-router-dom";
import { ChatMessage } from "../types";
import { queryDocument } from "../lib/serverActions";
import OpenAI from "openai";
import { Send } from "lucide-react";
import { InlineWidget } from "react-calendly";
import { useBotConfig } from "../store/useBotConfig";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Define query cues
const QUERY_CUES = [
  "Book an Appointment",
  "What services do you offer?",
  "How can I contact support?",
];

export default function PublicChat() {
  const { botUsername } = useParams();
  const { config, isLoading: isConfigLoading, fetchConfig } = useBotConfig();
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
  const [showCues, setShowCues] = React.useState(true);
  const [showCalendly, setShowCalendly] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (botUsername) {
      fetchConfig(botUsername);
    }
  }, [botUsername, fetchConfig]);

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

      // Check if the message is about booking
      const isBookingRequest =
        message.toLowerCase().includes("book") ||
        message.toLowerCase().includes("appointment") ||
        message.toLowerCase().includes("meeting") ||
        message.toLowerCase().includes("schedule");

      let calendlyUrl =
        "https://calendly.com/tahirahmadin/30min?preview_source=et_card&month=2025-04";
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

      // Prepare system prompt with context
      const systemPrompt = `You are a concise AI assistant.
     Use the provided context to answer the user's question when relevant:
     ${JSON.stringify(context)}
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
    // Small delay to ensure the message is set before sending
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {config?.logo && (
              <img
                src={config.logo}
                alt="Bot Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                {config?.username || "Gobbl.ai Chat"}
              </span>
            </div>
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
        {showCalendly && (
          <div className="mt-4">
            <InlineWidget
              url={
                "https://calendly.com/tahirahmadin/30min?preview_source=et_card&month=2025-04"
              }
              styles={{
                height: "450px",
              }}
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Cues */}
      {showCues && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex flex-wrap gap-2 justify-start">
            {QUERY_CUES.map((cue, index) => (
              <button
                key={index}
                onClick={() => handleCueClick(cue)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cue}
              </button>
            ))}
          </div>
        </div>
      )}

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
