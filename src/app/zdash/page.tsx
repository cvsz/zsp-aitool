import Link from "next/link";

const features = [
  {
    title: "AI Command Center",
    description: "Orchestrate specialized sub-agents with a unified intelligence plane.",
    icon: "🧠",
  },
  {
    title: "Marketplace Plugins",
    description: "Extensible architecture natively supporting zVeO, zWallet, and more.",
    icon: "🔌",
  },
  {
    title: "Risk Guardian",
    description: "Automated compliance checks, policy enforcement, and audit logs.",
    icon: "🛡️",
  },
  {
    title: "HyperFrames rendering",
    description: "Safely composite and generate promotional video assets at scale.",
    icon: "🎬",
  },
  {
    title: "Cloudflare Operator",
    description: "Direct Zero-Trust edge routing and tunnel management.",
    icon: "☁️",
  },
  {
    title: "Trading Simulation",
    description: "Integrated lab for backtesting strategies safely.",
    icon: "📈",
  },
];

export default function ZDashProductPage() {
  return (
    <main className="min-h-screen bg-cyber-bg text-slate-100 p-4 md:p-8 lg:p-12">
      <nav className="flex justify-between items-center mb-16 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-widest text-white hover:text-cyber-cyan transition-colors">
          ZEAZ.DEV
        </Link>
        <Link href="/dashboard" className="cyber-button-secondary text-sm">
          Launch Dashboard
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-block rounded-full bg-cyber-violet/10 border border-cyber-violet/30 px-4 py-1.5 text-sm font-semibold text-cyber-violet tracking-wide uppercase">
            Core Application
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-violet">zDash</span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed">
            The ultimate productivity and operational dashboard.
            zDash unites advanced AI content generation, system administration,
            and specialized workflows under a single, highly secure, Dark Cyber interface.
          </p>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-cyan/20 text-cyber-cyan">✓</span>
              <span className="text-slate-300">Team Workspaces & RBAC</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-cyan/20 text-cyber-cyan">✓</span>
              <span className="text-slate-300">Live Backend Observability</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-cyan/20 text-cyber-cyan">✓</span>
              <span className="text-slate-300">Automated Terraform Intent Generation</span>
            </li>
          </ul>

          <div className="pt-4">
            <Link href="/dashboard" className="cyber-button-primary text-lg px-8 py-4 inline-block">
              Start Using zDash
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Mockup visual representation */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyber-cyan/50 to-cyber-violet/50 blur opacity-30" />
          <div className="glass-panel relative aspect-square md:aspect-[4/3] w-full p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="text-xs text-slate-500 font-mono">zdash.zeaz.dev</div>
            </div>
            <div className="flex-1 rounded-xl border border-white/5 bg-cyber-surface2 p-4 font-mono text-sm text-cyber-cyan overflow-hidden">
              <p>{">"} Initialize zDash core modules...</p>
              <p className="text-emerald-400">{"[OK]"} Cloudflare operator online</p>
              <p className="text-emerald-400">{"[OK]"} HyperFrames worker connected</p>
              <p className="text-emerald-400">{"[OK]"} IAM policies verified</p>
              <p className="mt-4 animate-pulse">_</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-32 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="cyber-card p-6 flex flex-col gap-4">
              <div className="text-4xl">{feat.icon}</div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-sm text-slate-400">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
