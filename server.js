const express = require("express");
const { createServer: createViteServer } = require("vite");
const path = require("path");
const fs = require("fs");

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8"
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Extract bot username from URL
      const botUsername = url.split("/")[1];

      if (botUsername && botUsername !== "") {
        try {
          // Fetch bot data from your API
          const response = await fetch(
            `${process.env.BACKEND_API_URL}/agent/get-agent/${botUsername}`
          );
          const botData = await response.json();

          if (botData) {
            // Replace meta tags with bot-specific data
            template = template.replace(
              /<title>.*?<\/title>/,
              `<title>${botData.name} | Sayy.ai chatbot</title>`
            );
            template = template.replace(
              /<meta name="description".*?>/,
              `<meta name="description" content="${
                botData.bio || "Chat with our AI assistant"
              }" />`
            );
            template = template.replace(
              /<meta property="og:title".*?>/,
              `<meta property="og:title" content="${botData.name} | Sayy.ai chatbot" />`
            );
            template = template.replace(
              /<meta property="og:description".*?>/,
              `<meta property="og:description" content="${
                botData.bio || "Chat with our AI assistant"
              }" />`
            );
            template = template.replace(
              /<meta property="og:image".*?>/,
              `<meta property="og:image" content="${botData.logo}" />`
            );
            template = template.replace(
              /<meta name="twitter:title".*?>/,
              `<meta name="twitter:title" content="${botData.name} | Sayy.ai chatbot" />`
            );
            template = template.replace(
              /<meta name="twitter:description".*?>/,
              `<meta name="twitter:description" content="${
                botData.bio || "Chat with our AI assistant"
              }" />`
            );
            template = template.replace(
              /<meta name="twitter:image".*?>/,
              `<meta name="twitter:image" content="${botData.logo}" />`
            );
          }
        } catch (error) {
          console.error("Error fetching bot data:", error);
        }
      }

      // Send the transformed HTML
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
}

createServer();
