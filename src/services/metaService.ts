import { BotConfig } from "../types";

export async function getBotMeta(username: string): Promise<{
  title: string;
  description: string;
  image: string;
  url: string;
}> {
  try {
    // Replace this with your actual API call to fetch bot data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bots/${username}`
    );
    const botData: BotConfig = await response.json();

    return {
      title: `${botData.name} | Sayy.ai chatbot`,
      description: botData.bio || "Chat with our AI assistant",
      image: botData.logo || "https://sayy.ai/images/default-bot.jpg",
      url: `https://sayy.ai/${username}`,
    };
  } catch (error) {
    console.error("Error fetching bot meta:", error);
    return {
      title: "Sayy.ai – AI Chatbots",
      description: "Discover and chat with AI assistants powered by Sayy.ai",
      image: "https://sayy.ai/images/default-bot.jpg",
      url: `https://sayy.ai/${username}`,
    };
  }
}
