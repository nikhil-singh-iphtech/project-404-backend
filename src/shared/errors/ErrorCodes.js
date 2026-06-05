// src/shared/errors/ErrorCodes.js

/**
 * Centralized error codes.
 *
 * Why machine-readable codes alongside HTTP status codes?
 *
 * HTTP 400 can mean: validation failed, bad input, malformed JSON...
 * The frontend needs to know WHICH type of 400 to show the right message.
 *
 * Frontend example:
 * if (errorCode === "AUTH_001") showEmailExistsError();
 * if (errorCode === "AUTH_002") showInvalidCredentialsError();
 */
export const ErrorCodes = {
  // ─── Auth ──────────────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS:   "AUTH_001",
  AUTH_EMAIL_ALREADY_EXISTS:  "AUTH_002",
  AUTH_TOKEN_EXPIRED:         "AUTH_003",
  AUTH_TOKEN_INVALID:         "AUTH_004",
  AUTH_UNAUTHORIZED:          "AUTH_005",
  AUTH_FORBIDDEN:             "AUTH_006",

  // ─── Workspace ─────────────────────────────────────────────
  WORKSPACE_NOT_FOUND:        "WORKSPACE_001",
  WORKSPACE_SLUG_CONFLICT:    "WORKSPACE_002",

  // ─── Project ───────────────────────────────────────────────
  PROJECT_NOT_FOUND:          "PROJECT_001",

  // ─── Member ────────────────────────────────────────────────
  MEMBER_NOT_FOUND:           "MEMBER_001",
  MEMBER_ALREADY_EXISTS:      "MEMBER_002",

  // ─── Invitation ────────────────────────────────────────────
  INVITATION_NOT_FOUND:       "INVITE_001",
  INVITATION_EXPIRED:         "INVITE_002",
  INVITATION_ALREADY_ACCEPTED:"INVITE_003",

  // ─── General ───────────────────────────────────────────────
  NOT_FOUND:                  "GENERAL_001",
  VALIDATION_ERROR:           "GENERAL_002",
  INTERNAL_SERVER_ERROR:      "GENERAL_003",


  AUTH_INVALID_CREDENTIALS:   "AUTH_001",
  AUTH_EMAIL_ALREADY_EXISTS:  "AUTH_002",
  AUTH_TOKEN_EXPIRED:         "AUTH_003",
  AUTH_TOKEN_INVALID:         "AUTH_004",
  AUTH_UNAUTHORIZED:          "AUTH_005",
  AUTH_FORBIDDEN:             "AUTH_006",
  AUTH_PROVIDER_MISMATCH:     "AUTH_007", 
};