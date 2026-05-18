import type { AuthenticatedRequest } from "@/middleware/auth-middleware";

function parseList(value: string | undefined): string[] {
  return (value ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
}

export function isOperatorControlsEnabled(): boolean {
  return process.env.HYPERFRAMES_OPERATOR_CONTROLS_ENABLED === "true";
}

export function canAccessOperatorControls(request: AuthenticatedRequest): boolean {
  const allowedEmails = parseList(process.env.HYPERFRAMES_OPERATOR_ALLOWED_EMAILS);
  const allowedUserIds = parseList(process.env.HYPERFRAMES_OPERATOR_ALLOWED_USER_IDS);
  const userEmail = request.auth.email.toLowerCase();
  const userId = request.auth.userId.toLowerCase();

  return allowedEmails.includes(userEmail) || allowedUserIds.includes(userId);
}
