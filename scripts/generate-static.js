import Prerenderer from "@prerenderer/prerenderer";
import PuppeteerRenderer from "@prerenderer/renderer-puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prerender = new Prerenderer({
  staticDir: path.join(__dirname, "../dist"),
  renderer: new PuppeteerRenderer({
    renderAfterTime: 5000,
    headless: true,
  }),
});

async function generateStaticPages() {
  try {
    // Get all bot usernames from your database or API
    const botUsernames = ["bot1", "bot2"]; // Replace with actual bot usernames

    const routes = [
      "/",
      "/pricing",
      "/privacy",
      ...botUsernames.map((username) => `/${username}`),
    ];

    const { renderedRoutes } = await prerender.render(routes);

    // Process each rendered route
    renderedRoutes.forEach((route) => {
      const outputPath = path.join(
        __dirname,
        "../dist",
        route.route,
        "index.html"
      );
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, route.html);
    });

    console.log("Static pages generated successfully!");
  } catch (err) {
    console.error("Error generating static pages:", err);
    process.exit(1);
  }
}

generateStaticPages();
