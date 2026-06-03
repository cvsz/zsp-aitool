"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-700">เกิดข้อผิดพลาด</h1>
        <p className="text-slate-600">
          ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
        </p>
        <p className="text-xs text-slate-400">
          Ref: {error.digest ?? "N/A"}
        </p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          ลองอีกครั้ง
        </button>
      </div>
    </main>
  );
}
