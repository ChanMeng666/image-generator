import { NextResponse } from "next/server";

interface ApiErrorDetail {
  [key: string]: unknown;
}

export function apiError(
  code: string,
  status: number,
  detail?: ApiErrorDetail
) {
  return NextResponse.json(
    {
      error: {
        code,
        status,
        ...(detail ? { detail } : {}),
      },
    },
    { status }
  );
}

// Common errors
export const errors = {
  unauthorized: () => apiError("UNAUTHORIZED", 401),
  promptRequired: () => apiError("PROMPT_REQUIRED", 400),
  insufficientCredits: (balance: number) =>
    apiError("INSUFFICIENT_CREDITS", 402, { balance, required: 1 }),
  generationFailed: () => apiError("GENERATION_FAILED", 500),
  uploadFailed: () => apiError("UPLOAD_FAILED", 500),
  notFound: (resource: string) =>
    apiError("NOT_FOUND", 404, { resource }),
  forbidden: () => apiError("FORBIDDEN", 403),
  invalidPackage: () => apiError("INVALID_PACKAGE", 400),
  webhookError: (reason: string) =>
    apiError("WEBHOOK_ERROR", 400, { reason }),
  internalError: () => apiError("INTERNAL_ERROR", 500),
};
