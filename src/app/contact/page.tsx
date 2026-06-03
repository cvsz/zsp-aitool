import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-cyber-bg text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-2xl text-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan to-cyber-violet" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact & Support</h1>
        <p className="text-slate-400 mb-8">Enterprise support and partnership inquiries.</p>
        <Link href="/" className="cyber-button-secondary inline-block">
          Return Home
        </Link>
      </div>
    </main>
  );
}
