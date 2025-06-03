import { promises as fs } from "fs";
import path from "path";

const API_BASE_URL = "https://kifortestapi.gobbl.ai";

export default async function handler(req, res) {
  // Get the username from the URL
  const { username } = req.query;

  // Fetch bot data from your API
  let botData = null;
  try {
    const response = await fetch(
      `${API_BASE_URL}/client/getAgentDetails?inputParam=${username}&isfetchByUsername=true`
    );
    const botConfig = await response.json();
    if (botConfig && botConfig.data) {
      botData = botConfig.data.result;
    }
  } catch (e) {
    // fallback to null
  }

  // Prepare meta tags
  const meta = {
    title: `${
      botData?.name || "Sayy.ai – AI Chatbot Platform"
    } | Sayy.ai chatbot`,
    description: `${
      botData?.bio ||
      "Create and deploy AI chatbots for your business with Sayy.ai"
    } | Sayy.ai chatbot`,
    image: botData?.logo || "https://sayy.ai/images/default-bot.jpg",
    url: `https://sayy.ai/${username}`,
  };

  // Read the static index.html
  const htmlTemplate = await fs.readFile(
    path.join(process.cwd(), "dist", "index.html"),
    "utf8"
  );

  // Inject meta tags
  const finalHtml = htmlTemplate
    .replace("<title>Sayy.ai</title>", `<title>${meta.title}</title>`)
    .replace(
      "</head>",
      `
        <meta property="og:title" content="${meta.title}" />
        <meta property="og:description" content="${meta.description}" />
        <meta property="og:image" content="${meta.image}" />
        <meta property="og:url" content="${meta.url}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${meta.title}" />
        <meta name="twitter:description" content="${meta.description}" />
        <meta name="twitter:image" content="${meta.image}" />
      </head>
      `
    );

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(finalHtml);
}
