export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;

  // If it's not a bot URL, pass through to the main app
  if (!path || path === "/" || path.startsWith("/api/")) {
    return fetch(url.toString());
  }

  try {
    // Extract bot username from URL
    const botUsername = path.split("/")[1];

    if (botUsername) {
      // Fetch bot data from your API
      const apiUrl = process.env.BACKEND_API_URL || "https://api.sayy.ai";
      const response = await fetch(
        `${apiUrl}/client/getAgentDetails?inputParam=${botUsername}&isfetchByUsername=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bot data");
      }

      const botData = await response.json();

      // Get the main app's HTML
      const mainAppResponse = await fetch(url.toString());
      let html = await mainAppResponse.text();

      if (botData) {
        // Replace meta tags with bot-specific data
        html = html.replace(
          /<title>.*?<\/title>/,
          `<title>${botData.name} | Sayy.ai chatbot</title>`
        );
        html = html.replace(
          /<meta name="description".*?>/,
          `<meta name="description" content="${
            botData.bio || "Chat with our AI assistant"
          }" />`
        );
        html = html.replace(
          /<meta property="og:title".*?>/,
          `<meta property="og:title" content="${botData.name} | Sayy.ai chatbot" />`
        );
        html = html.replace(
          /<meta property="og:description".*?>/,
          `<meta property="og:description" content="${
            botData.bio || "Chat with our AI assistant"
          }" />`
        );
        html = html.replace(
          /<meta property="og:image".*?>/,
          `<meta property="og:image" content="${botData.logo}" />`
        );
        html = html.replace(
          /<meta name="twitter:title".*?>/,
          `<meta name="twitter:title" content="${botData.name} | Sayy.ai chatbot" />`
        );
        html = html.replace(
          /<meta name="twitter:description".*?>/,
          `<meta name="twitter:description" content="${
            botData.bio || "Chat with our AI assistant"
          }" />`
        );
        html = html.replace(
          /<meta name="twitter:image".*?>/,
          `<meta name="twitter:image" content="${botData.logo}" />`
        );
      }

      return new Response(html, {
        headers: {
          "content-type": "text/html",
          "cache-control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }

  // If anything fails, just return the main app
  return fetch(url.toString());
}
