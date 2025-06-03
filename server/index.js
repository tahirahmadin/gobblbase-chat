import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { getBotMeta } from "./metaService.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, "../dist")));

// Handle dynamic bot routes
app.get("/:username", async (req, res) => {
  const username = req.params.username;

  // Skip for admin routes and other special paths
  if (
    username.startsWith("admin") ||
    username === "favicon.ico" ||
    username === "manifest.json" ||
    username === "robots.txt"
  ) {
    return res.sendFile(join(__dirname, "../dist/index.html"));
  }

  try {
    const meta = await getBotMeta(username);
    const htmlTemplate = fs.readFileSync(
      join(__dirname, "../dist/index.html"),
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
          <meta name="robots" content="index, follow" />
        </head>
        `
      );

    res.send(finalHtml);
  } catch (error) {
    console.error("Error handling dynamic route:", error);
    // Send the default index.html on error
    res.sendFile(join(__dirname, "../dist/index.html"));
  }
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
