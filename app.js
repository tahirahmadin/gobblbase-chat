const express = require("express");
const cors = require("cors");
const app = express();

// CORS configuration
const allowedOrigins = [
  "https://gobblbase-chat-git-next-onerare.vercel.app",
  "https://sayy.ai",
  "https://seo.sayy.ai",
  "http://localhost:3000",
  // Add any other domains you need
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "HMAC", "Timestamp"],
  })
);

// ... rest of your app configuration ...
