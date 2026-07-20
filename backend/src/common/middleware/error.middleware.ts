import type { ErrorRequestHandler } from "express";

interface BodyParserError extends Error {
  type?: string;
}

function isBodyParserError(error: unknown, type: string): error is BodyParserError {
  return error instanceof Error && "type" in error && error.type === type;
}

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
): void => {
  void _next;

  if (isBodyParserError(error, "entity.parse.failed")) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
    return;
  }

  if (isBodyParserError(error, "entity.too.large")) {
    response.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds the 1mb limit",
      },
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
    },
  });
};
