// src/shared/validators/validate.js

import { AppError } from "../errors/AppError.js";
import { ErrorCodes } from "../errors/ErrorCodes.js";

/**
 * Generic Joi schema validation middleware factory.
 *
 * Usage in any route file:
 *   router.post("/", validate(createWorkspaceSchema), workspaceController.create);
 *
 * Why centralize this?
 * Each module defines its own Joi schemas (domain knowledge lives in the module),
 * but the mechanics of "validate and return a 400 on failure" live here once.
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,       // Return ALL validation errors, not just the first
    stripUnknown: true,      // Remove fields not in the schema (prevents injection of extra fields)
  });

  if (error) {
    const message = error.details.map((d) => d.message.replace(/['"]/g, "")).join("; ");
    return next(new AppError(message, 400, ErrorCodes.VALIDATION_ERROR));
  }

  // Replace req.body with the validated + sanitized value
  req.body = value;
  next();
};