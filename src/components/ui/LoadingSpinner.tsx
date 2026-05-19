type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({ label = "กำลังโหลด", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center gap-3 text-sm text-slate-600 ${className}`.trim()} role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
