import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBotMeta } from "../src/services/metaService";

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

    // Basic HTML template with meta tags
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

          <!-- Redirect to the actual app -->
          <script>
            window.location.href = "${meta.url}";
          </script>
        </head>
        <body>
          <h1>${meta.title}</h1>
          <p>${meta.description}</p>
          <p>If you are not redirected automatically, <a href="${meta.url}">click here</a>.</p>
        </body>
      </html>
    `;

    // Send the HTML
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Error handling request:", error);
    // Send a basic error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - Sayy.ai</title>
          <meta name="robots" content="noindex">
        </head>
        <body>
          <h1>Something went wrong</h1>
          <p>Please try again later.</p>
        </body>
      </html>
    `);
  }
}
