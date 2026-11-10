"use strict";
const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

const SESSION_HOURS = 8;

/**
 * Builds the Express app.
 * sessionStore is optional (server.js passes a MongoDB-backed store).
 */
function createApp({
  adminUsername,
  adminPassword,
  sessionSecret,
  sessionStore,
  frontendDist,
}) {
  const app = express();
  app.use(
    cors({
      origin: ["https://laundryvibes.com", "https://www.laundryvibes.com"],
      credentials: true,
    }),
  );

  // Hosting platforms (Render, Railway, etc.) sit behind a proxy
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          // App.css imports Google Fonts
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
          // Service images are admin-supplied URLs, and the site uses Unsplash
          "img-src": ["'self'", "data:", "https:"],
          "connect-src": ["'self'"],
          "upgrade-insecure-requests": null,
        },
      },
    }),
  );

  app.use(express.json({ limit: "20kb" }));

  // ---------- API ----------
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests. Please slow down." },
    }),
  );

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api", publicRoutes);

  // Sessions are only needed for the admin area
  app.use(
    "/api/admin",
    session({
      name: "lv.sid",
      secret: sessionSecret,
      store: sessionStore, // undefined -> in-memory (tests only)
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: "auto", // secure cookie automatically when served over HTTPS
        maxAge: SESSION_HOURS * 60 * 60 * 1000,
      },
    }),
    adminRoutes({ adminUsername, adminPassword }),
  );

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

  // ---------- Frontend (built React app) ----------
  const dist = frontendDist || path.join(__dirname, "..", "frontend", "dist");
  if (fs.existsSync(path.join(dist, "index.html"))) {
    app.use(
      "/assets",
      express.static(path.join(dist, "assets"), {
        maxAge: "1y",
        immutable: true,
      }),
    );
    app.use(express.static(dist, { maxAge: "1h", index: false }));
    app.get("/*splat", (req, res) => {
      res.set("Cache-Control", "no-cache");
      res.sendFile(path.join(dist, "index.html"));
    });
  } else {
    app.get("/", (req, res) =>
      res
        .type("text")
        .send(
          "Laundry Vibes API is running. Build the frontend to serve the website here.",
        ),
    );
  }

  // ---------- Errors ----------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON." });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "Request is too large." });
    }
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors || {})[0];
      return res
        .status(400)
        .json({ error: (first && first.message) || "Invalid data." });
    }
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ error: `Invalid value for "${err.path}".` });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "A service with that slug already exists." });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  });

  return app;
}

module.exports = { createApp };
