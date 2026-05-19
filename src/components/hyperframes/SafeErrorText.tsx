export function truncateSafeErrorText(input?: string | null, maxLength = 180): string {
  if (!input) return "-";
  const compact = input.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1)}…`;
}

export function SafeErrorText({ message, maxLength = 180 }: { message?: string | null; maxLength?: number }) {
  return <span className="break-words">{truncateSafeErrorText(message, maxLength)}</span>;
}
