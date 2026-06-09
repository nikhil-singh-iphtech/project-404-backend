// src/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { mongoSanitizeMiddleware } from "./src/shared/middleware/mongoSanitize.js";

import { config } from "./src/config/app.config.js";
import { globalErrorHandler } from "./src/shared/errors/errorHandler.js";
import { notFound } from "./src/shared/middleware/notFound.js";
import { logger } from "./src/shared/utils/logger.js";
import passport from "passport";
import { initializePassport } from "./src/config/passport.config.js";

import { invitationRouter } from "./src/modules/invitation/invitation.routes.js";
import { workspaceRouter } from "./src/modules/workspace/workspace.routes.js";
import { projectRouter } from "./src/modules/project/project.routes.js";


// ── Module routes ─────────────────────────────────────────────────────────────
import { authRouter } from "./src/modules/auth/index.js";
// Future: import { workspaceRouter } from "./modules/workspace/index.js";

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────

// Sets security-related HTTP headers (XSS, clickjacking protection, etc.)
app.use(helmet());

// Sanitize request data against MongoDB operator injection
// e.g., { email: { "$gt": "" } } gets stripped
app.use(mongoSanitizeMiddleware);

// CORS — only allow our frontend origin
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 * Auth endpoints get a stricter separate limiter (defined in auth routes).
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

app.use(globalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));   // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

initializePassport();
app.use(passport.initialize());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter);

app.use("/api/workspaces/:workspaceId/projects",    projectRouter);
app.use("/api/workspaces/:workspaceId/invitations", invitationRouter);

// ── Error Handling ────────────────────────────────────────────────────────────
// Order matters: notFound must come before globalErrorHandler
app.use(notFound);
app.use(globalErrorHandler);

export default app;