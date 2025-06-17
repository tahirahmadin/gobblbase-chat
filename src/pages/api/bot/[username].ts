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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check dist directory first
  if (!checkDistDirectory()) {
    return res
      .status(500)
      .send("Build files not found. Please run the build process first.");
  }

  const { username } = req.query;

  try {
    // Check if this is a bot request
    if (typeof username === "string") {
      console.log(`[Bot Route] Fetching details for bot: ${username}`);

      // Get agent details with HTML flag
      const agentData = await getAgentDetails(username, true, true);
      console.log(
        "[Bot Route] Agent data received:",
        agentData ? "Success" : "Failed"
      );

      if (agentData?.html) {
        try {
          // Read the index.html file
          const indexPath = path.join(process.cwd(), "dist", "index.html");
          console.log("[Bot Route] Reading index.html from:", indexPath);

          let html = fs.readFileSync(indexPath, "utf8");
          console.log("[Bot Route] Successfully read index.html");

          // Replace the meta tags
          html = html.replace(/<title>.*?<\/title>/, agentData.metaTags);
          console.log("[Bot Route] Meta tags replaced successfully");

          // Set content type to HTML
          res.setHeader("Content-Type", "text/html");
          return res.status(200).send(html);
        } catch (fileError) {
          console.error("[Bot Route] Error reading index.html:", fileError);
          throw fileError;
        }
      } else {
        console.error("[Bot Route] No agent data found for:", username);
        // If no agent data, serve the normal SPA
        try {
          const indexPath = path.join(process.cwd(), "dist", "index.html");
          const html = fs.readFileSync(indexPath, "utf8");
          res.setHeader("Content-Type", "text/html");
          return res.status(200).send(html);
        } catch (fallbackError) {
          console.error("[Bot Route] Error serving fallback:", fallbackError);
          throw fallbackError;
        }
      }
    }

    // If not a bot request, serve the normal SPA
    try {
      const indexPath = path.join(process.cwd(), "dist", "index.html");
      const html = fs.readFileSync(indexPath, "utf8");
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (error) {
      console.error("[Bot Route] Error serving SPA:", error);
      throw error;
    }
  } catch (error) {
    console.error("[Bot Route] Error in handler:", error);
    // Serve the SPA even on error
    try {
      const indexPath = path.join(process.cwd(), "dist", "index.html");
      const html = fs.readFileSync(indexPath, "utf8");
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (fallbackError) {
      console.error("[Bot Route] Error serving fallback page:", fallbackError);
      res.status(500).send("Internal Server Error");
    }
  }
}
