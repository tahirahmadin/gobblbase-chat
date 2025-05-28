import { useState, useEffect } from "react";
import { updateUserLogs } from "../lib/serverActions";
import { useBotConfig } from "../store/useBotConfig";

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export function useChatLogs() {
  const { activeBotId } = useBotConfig();
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to get existing session ID from localStorage
    const existingSessionId = localStorage.getItem("chatSessionId");
    if (existingSessionId) {
      return existingSessionId;
    }
    // Generate new session ID if none exists
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("chatSessionId", newSessionId);
    return newSessionId;
  });
  const [userId, setUserId] = useState<string>(() => {
    // Try to get existing user ID from localStorage
    const existingUserId = localStorage.getItem("chatUserId");
    if (existingUserId) {
      return existingUserId;
    }
    return "";
  });
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);

  // Initialize user ID if not already set
  useEffect(() => {
    if (!userId) {
      const fetchUserIP = async () => {
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          const newUserId = data.ip;
          setUserId(newUserId);
          localStorage.setItem("chatUserId", newUserId);
        } catch (error) {
          console.error("Error fetching IP:", error);
          // Fallback to a random ID if IP fetch fails
          const fallbackId = `user_${Math.random().toString(36).substr(2, 9)}`;
          setUserId(fallbackId);
          localStorage.setItem("chatUserId", fallbackId);
        }
      };

      fetchUserIP();
    }
  }, [userId]);

  const addMessages = async (userMsg: string, agentMsg: string) => {
    let userBubble = {
      role: "user",
      content: userMsg,
      timestamp: new Date().toISOString(),
    };
    let agentBubble = {
      role: "agent",
      content: agentMsg,
      timestamp: new Date().toISOString(),
    };
    const newLogs = [...chatLogs, userBubble, agentBubble];
    setChatLogs(newLogs);
    if (activeBotId && userId && sessionId) {
      try {
        await updateUserLogs({
          userId,
          sessionId,
          agentId: activeBotId,
          newUserLogs: [userBubble, agentBubble],
        });
      } catch (error) {
        console.error("Error updating chat logs:", error);
      }
    }
  };

  const clearChatLogs = () => {
    setChatLogs([]);
    // Clear session ID from localStorage when clearing logs
    localStorage.removeItem("chatSessionId");
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("chatSessionId", newSessionId);
    setSessionId(newSessionId);
  };

  return {
    chatLogs,
    addMessages,
    clearChatLogs,
    sessionId,
    userId,
  };
}
