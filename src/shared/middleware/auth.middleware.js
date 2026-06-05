// src/shared/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../errors/AppError.js";
import { ErrorCodes } from "../errors/ErrorCodes.js";
import { config } from "../../config/app.config.js";
import { UserModel } from "../../modules/auth/auth.model.js";

/**
 * Verifies JWT from Authorization header and attaches user to req.user.
 *
 * Why re-fetch the user from DB on every request instead of trusting the JWT?
 *
 * Because JWT payloads are snapshots. If a user is banned, deleted,
 * or has their role changed, a cached JWT will still pass signature
 * verification and grant stale access until it expires.
 *
 * Trade-off: One extra DB query per request.
 * Mitigation: Cache user in Redis for high-traffic APIs (Phase 8).
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(
      "Authentication required. Please provide a valid token.",
      401,
      ErrorCodes.AUTH_UNAUTHORIZED
    );
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await UserModel.findById(decoded.userId).select("-password -refreshToken");

  if (!user) {
    throw new AppError(
      "User no longer exists.",
      401,
      ErrorCodes.AUTH_UNAUTHORIZED
    );
  }

  req.user = user;
  next();
});