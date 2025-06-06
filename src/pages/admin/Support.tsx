import React, { useState, useEffect, useRef } from "react";
import { Send, Circle } from "lucide-react";
import {
  getAdminSupportLogs,
  updateAdminChatLog,
} from "../../lib/serverActions";
import { useAdminStore } from "../../store/useAdminStore";

interface Message {
  id: number;
  content: string;
  sender: "admin" | "support";
  timestamp: Date;
}

const Support = () => {
  const { adminId } = useAdminStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchLogs = async () => {
    if (!adminId) return;
    try {
      const messagesArr = await getAdminSupportLogs(adminId);
      setMessages(messagesArr);
    } catch (err) {
      // Optionally show error
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchLogs(); // Initial fetch

    // Set up polling every 10 seconds
    const pollInterval = setInterval(fetchLogs, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [adminId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId) return;

    // Add user message optimistically
    const adminMessage: Message = {
      id: Date.now(),
      content: newMessage,
      sender: "admin",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, adminMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      await updateAdminChatLog({
        newUserLog: [
          {
            sender: "admin",
            content: adminMessage.content,
            timestamp: adminMessage.timestamp.toISOString(),
          },
        ],
        clientId: adminId,
      });
      // Simulate support response (replace with actual API call if needed)
      // setTimeout(() => {
      //   setIsTyping(false);

      //   // Optionally, also call updateAdminChatLog for support reply
      // }, 2000);
    } catch (err) {
      setIsTyping(false);
      // Optionally show error
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Support Chat</h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Circle
                  className={`w-2 h-2 ${
                    isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                  fill={isOnline ? "currentColor" : "none"}
                />
                <span className="text-sm text-gray-500 ml-1">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="flex justify-center">
            <div className="bg-white border rounded-lg p-4 max-w-[80%] text-center">
              <h2 className="font-semibold mb-2">Welcome to Support Chat!</h2>
              <p className="text-gray-600">
                Our support team is here to help you. How can we assist you
                today?
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "admin" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span
                className={`text-xs mt-1 block ${
                  message.sender === "admin" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg p-3">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              newMessage.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Support;
