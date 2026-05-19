type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

export function LoadingSpinner({ label = "กำลังโหลด", className = "", size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-3 text-sm text-slate-600 ${className}`.trim()} role="status" aria-live="polite" aria-label={label}>
      <span className={`${sizeClasses[size]} animate-spin rounded-full border-slate-300 border-t-slate-900`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
