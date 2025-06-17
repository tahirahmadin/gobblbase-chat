import { BotConfig } from "../types";

export const generateMetaTags = (config: BotConfig | null) => {
  const title = config?.name
    ? `${config.name} | Sayy.ai Agent`
    : "Sayy.ai Agent";
  const description = config?.bio || "Chat with an AI agent powered by Sayy.ai";
  const image =
    config?.logo ||
    "https://gobbl-restaurant-bucket.s3.ap-south-1.amazonaws.com/banner.jpg";
  const url = config?.username
    ? `https://sayy.ai/${config.username}`
    : "https://sayy.ai";

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Sayy.ai" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@sayyai" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${title}" />
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />
    <meta name="author" content="Sayy.ai" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}" />
  `;
};
