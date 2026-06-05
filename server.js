// src/server.js

import app from "./app.js";
import { config } from "./src/config/app.config.js";
import { connectDatabase } from "./src/database/db.js";
import { logger } from "./src/shared/utils/logger.js";

/**
 * Server entry point.
 *
 * Why separate app.js from server.js?
 * app.js exports the Express app for testing (you can import it without starting a server).
 * server.js handles the actual TCP port binding and process lifecycle.
 */
const startServer = async () => {
  // 1. Connect DB before accepting any requests
  await connectDatabase();

  // 2. Bind to port
  const server = app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
  });

  // 3. Graceful shutdown — critical for zero-downtime deployments
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("HTTP server closed. Exiting.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM")); // Docker/Kubernetes sends this
  process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C in terminal

  // Catch unhandled promise rejections — never let these fail silently
  process.on("unhandledRejection", (reason) => {
    logger.error("UNHANDLED REJECTION:", reason);
    shutdown("UNHANDLED_REJECTION");
  });
};

startServer();