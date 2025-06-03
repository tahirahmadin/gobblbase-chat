import fetch from "node-fetch";

const API_BASE_URL = "https://kifortestapi.gobbl.ai";

export async function getBotMeta(username) {
  try {
    // Fetch bot data from your API
    const response = await fetch(
      `${API_BASE_URL}/client/getAgentDetails?inputParam=${username}&isfetchByUsername=true`
    );
    const botConfig = await response.json();

    if (!botConfig || !botConfig.data) {
      return {
        title: "Sayy.ai – AI Chatbot Platform",
        description:
          "Create and deploy AI chatbots for your business with Sayy.ai",
        image: "https://sayy.ai/images/default-bot.jpg",
        url: "https://sayy.ai",
      };
    }

    const botData = botConfig.data;

    return {
      title: `${botData.name || "AI Chatbot"} | Sayy.ai chatbot`,
      description: `${
        botData.bio || "Chat with our AI assistant"
      } | Sayy.ai chatbot`,
      image: botData.logo || "https://sayy.ai/images/default-bot.jpg",
      url: `https://sayy.ai/${username}`,
    };
  } catch (error) {
    console.error("Error fetching bot meta:", error);
    return {
      title: "Sayy.ai – AI Chatbot Platform",
      description:
        "Create and deploy AI chatbots for your business with Sayy.ai",
      image: "https://sayy.ai/images/default-bot.jpg",
      url: "https://sayy.ai",
    };
  }
}
