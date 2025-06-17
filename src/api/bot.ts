import { getHmacMessageFromBody } from "../lib/serverActions";

export async function getBotData(username: string) {
  try {
    const requestParams = `inputParam=${encodeURIComponent(
      username
    )}&isfetchByUsername=true`;

    // Generate HMAC headers
    const hmacResponse = getHmacMessageFromBody(requestParams);
    if (!hmacResponse) {
      throw new Error("Failed to generate HMAC headers");
    }

    // Make the API request with HMAC headers
    const response = await fetch(
      `/api/agent/getAgentDetails?${requestParams}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          HMAC: hmacResponse.hmacHash,
          Timestamp: hmacResponse.currentTimestamp,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.error) {
      throw new Error(data.result || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("Error fetching bot data:", error);
    throw error;
  }
}

export function generateMetaTags(botData: any) {
  if (!botData) return "";

  const title = botData.name || "AI Chatbot";
  const description = botData.bio || "Chat with our AI assistant";
  const imageUrl =
    botData.profilePicture || "https://seo.sayy.ai/default-og-image.png";

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://seo.sayy.ai/${botData.username}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://seo.sayy.ai/${botData.username}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${imageUrl}" />
  `;
}
