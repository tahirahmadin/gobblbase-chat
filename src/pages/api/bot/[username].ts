import { NextApiRequest, NextApiResponse } from "next";
import { getAgentDetails } from "../../../lib/serverActions";
import fs from "fs";
import path from "path";

// Add this function to check dist directory
function checkDistDirectory() {
  const distPath = path.join(process.cwd(), "dist");
  console.log("[Bot Route] Checking dist directory at:", distPath);

  if (!fs.existsSync(distPath)) {
    console.error("[Bot Route] dist directory does not exist!");
    return false;
  }

  const indexPath = path.join(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("[Bot Route] index.html does not exist in dist directory!");
    return false;
  }

  console.log("[Bot Route] dist directory and index.html exist");
  return true;
}

function serveIndexHtml(res: NextApiResponse, metaTags?: string) {
  try {
    const indexPath = path.join(process.cwd(), "dist", "index.html");
    let html = fs.readFileSync(indexPath, "utf8");

    if (metaTags) {
      // Insert meta tags before the closing head tag
      html = html.replace("</head>", `${metaTags}\n</head>`);
    }

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store, must-revalidate");
    return res.status(200).send(html);
  } catch (error) {
    console.error("[Bot Route] Error serving index.html:", error);
    return res.status(500).send("Error loading page");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(
    "[Bot Route] Request received:",
    req.url,
    "Accept:",
    req.headers.accept
  );

  // Check if this is an API request
  const isApiRequest = req.headers.accept?.includes("application/json");

  if (isApiRequest) {
    try {
      const { username } = req.query;
      console.log("[Bot Route] API request for bot:", username);
      const agentData = await getAgentDetails(username as string, true, false);

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(agentData);
    } catch (error) {
      console.error("[Bot Route] API error:", error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Failed to fetch bot data" });
    }
  }

  // Handle static file requests
  if (req.url?.includes(".")) {
    try {
      const filePath = path.join(process.cwd(), "dist", req.url);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        const contentType =
          {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".gif": "image/gif",
          }[ext] || "text/plain";

        res.setHeader("Content-Type", contentType);
        return res.status(200).send(content);
      }
    } catch (error) {
      console.error("[Bot Route] Static file error:", error);
    }
  }

  // Check dist directory for HTML serving
  if (!checkDistDirectory()) {
    return res
      .status(500)
      .send("Build files not found. Please run the build process first.");
  }

  const { username } = req.query;

  try {
    console.log("[Bot Route] Fetching bot data for HTML:", username);
    const agentData = await getAgentDetails(username as string, true, true);
    console.log("[Bot Route] Agent data received:", !!agentData);

    if (!agentData) {
      console.log("[Bot Route] No agent data found, serving default HTML");
      return serveIndexHtml(res);
    }

    if (agentData.error) {
      console.error("[Bot Route] Error in agent data:", agentData.error);
      return serveIndexHtml(res);
    }

    // Generate meta tags if we have agent data
    const metaTags = agentData.metaTags || "";
    console.log("[Bot Route] Serving HTML with meta tags");
    return serveIndexHtml(res, metaTags);
  } catch (error) {
    console.error("[Bot Route] Error in handler:", error);
    return serveIndexHtml(res);
  }
}
