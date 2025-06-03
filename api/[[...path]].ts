import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBotMeta } from "../src/services/metaService";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path: pathSegments } = req.query;

  // If no path segments or it's an API route, let Vercel handle it
  if (
    !pathSegments ||
    (Array.isArray(pathSegments) && pathSegments[0] === "api")
  ) {
    return res.status(404).send("Not found");
  }

  // Get the username from the path
  const username = Array.isArray(pathSegments) ? pathSegments[0] : pathSegments;

  try {
    // Get bot metadata
    const meta = await getBotMeta(username);

    // Read the index.html template
    const indexPath = path.join(process.cwd(), "dist", "index.html");
    let html = fs.readFileSync(indexPath, "utf8");

    // Inject meta tags
    const metaTags = `
      <title>${meta.title}</title>
      <meta name="description" content="${meta.description}" />
      
      <!-- Open Graph Meta Tags -->
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}" />
      <meta property="og:image" content="${meta.image}" />
      <meta property="og:url" content="${meta.url}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Sayy.ai" />
      
      <!-- Twitter Card Meta Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}" />
      <meta name="twitter:image" content="${meta.image}" />
    `;

    // Replace the default title and inject meta tags
    html = html.replace(/<title>.*?<\/title>/, metaTags);

    // Send the modified HTML
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).send("Internal Server Error");
  }
}
