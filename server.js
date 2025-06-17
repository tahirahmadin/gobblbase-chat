import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(join(__dirname, "dist")));

// Function to generate meta tags
function generateMetaTags(botConfig) {
  const title = botConfig?.name
    ? `${botConfig.name} | Sayy.ai Agent`
    : "Sayy.ai Agent";
  const description =
    botConfig?.bio || "Chat with an AI agent powered by Sayy.ai";
  const image =
    botConfig?.logo ||
    "https://gobbl-restaurant-bucket.s3.ap-south-1.amazonaws.com/banner.jpg";
  const url = botConfig?.username
    ? `https://sayy.ai/${botConfig.username}`
    : "https://sayy.ai";

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Sayy.ai" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@sayyai" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${title}" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />
    <meta name="author" content="Sayy.ai" />
    <link rel="canonical" href="${url}" />
  `;
}

// Handle bot routes
app.get("/:botUsername", async (req, res) => {
  try {
    const { botUsername } = req.params;

    // Here you would typically fetch the bot config from your database
    // For now, we'll use a mock config
    const botConfig = {
      name: "Test Bot",
      bio: "This is a test bot",
      logo: "https://gobbl-restaurant-bucket.s3.ap-south-1.amazonaws.com/banner.jpg",
      username: botUsername,
    };

    // Read the index.html file
    const indexPath = join(__dirname, "dist", "index.html");
    let html = fs.readFileSync(indexPath, "utf8");

    // Replace the meta tags
    const metaTags = generateMetaTags(botConfig);
    html = html.replace(/<title>.*?<\/title>/, metaTags);

    res.send(html);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
