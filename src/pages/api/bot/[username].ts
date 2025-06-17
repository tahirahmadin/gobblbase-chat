import { NextApiRequest, NextApiResponse } from "next";
import { getAgentDetails } from "../../../lib/serverActions";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  try {
    // Check if this is a bot request
    if (typeof username === "string") {
      // Get agent details with HTML flag
      const agentData = await getAgentDetails(username, true, true);

      if (agentData.html) {
        // Read the index.html file
        const indexPath = path.join(process.cwd(), "dist", "index.html");
        let html = fs.readFileSync(indexPath, "utf8");

        // Replace the meta tags
        html = html.replace(/<title>.*?<\/title>/, agentData.metaTags);

        // Set content type to HTML
        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
      }
    }

    // If not a bot request or no HTML needed, serve the normal SPA
    const indexPath = path.join(process.cwd(), "dist", "index.html");
    const html = fs.readFileSync(indexPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error serving bot page:", error);
    res.status(500).send("Internal Server Error");
  }
}
