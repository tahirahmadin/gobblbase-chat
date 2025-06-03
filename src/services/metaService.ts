import { BotConfig } from "../types";
import { backendApiUrl } from "../utils/constants";

const API_URL = backendApiUrl;

export async function getBotMeta(username: string): Promise<{
  title: string;
  description: string;
  image: string;
  url: string;
}> {
  try {
    // Replace this with your actual API call to fetch bot data
    const response = await fetch(
      `${API_URL}/client/getAgentDetails?inputParam=${username}&isfetchByUsername=true`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Add cache control
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const botData: BotConfig = await response.json();

    // Validate required fields
    if (!botData) {
      throw new Error("Invalid bot data received");
    }

    return {
      title: `${botData.name || "AI Assistant"} | Sayy.ai chatbot`,
      description: botData.bio || "Chat with our AI assistant",
      image: botData.logo || "https://sayy.ai/images/default-bot.jpg",
      url: `https://sayy.ai/${username}`,
    };
  } catch (error) {
    console.error("Error fetching bot meta:", error);
    // Return default meta for better SEO
    return {
      title: "Sayy.ai – AI Chatbots",
      description: "Discover and chat with AI assistants powered by Sayy.ai",
      image: "https://sayy.ai/images/default-bot.jpg",
      url: `https://sayy.ai/${username}`,
    };
  }
}
