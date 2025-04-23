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
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);

  // Initialize session and user ID
  useEffect(() => {
    // Generate a unique session ID
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);

    // Get user's IP address
    const fetchUserIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserId(data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
        // Fallback to a random ID if IP fetch fails
        setUserId(`user_${Math.random().toString(36).substr(2, 9)}`);
      }
    };

    fetchUserIP();
  }, []);

  const addMessage = async (message: ChatMessage) => {
    const newLogs = [...chatLogs, message];
    setChatLogs(newLogs);

    if (activeBotId && userId && sessionId) {
      try {
        await updateUserLogs({
          userId,
          sessionId,
          agentId: activeBotId,
          newUserLogs: newLogs,
        });
      } catch (error) {
        console.error("Error updating chat logs:", error);
      }
    }
  };

  const clearChatLogs = () => {
    setChatLogs([]);
  };

  return {
    chatLogs,
    addMessage,
    clearChatLogs,
    sessionId,
    userId,
  };
}
