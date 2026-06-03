import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyber-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyber-violet/10 blur-[120px] pointer-events-none" />
      
      <div className="z-10 max-w-4xl text-center space-y-8">
        <div className="inline-block rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 px-4 py-1.5 text-sm font-semibold text-cyber-cyan tracking-wide uppercase mb-4">
          Welcome to Zeaz.dev
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Enterprise Cloud <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-violet">Operator Plane</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Zeaz Platform is the next-generation control plane combining zero-trust security,
          infrastructure-as-code, and AI-native application management in one unified hub.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <Link 
            href="/zdash" 
            className="cyber-button-primary text-lg px-8 py-4 w-full sm:w-auto text-center"
          >
            Explore zDash
          </Link>
          <Link 
            href="/dashboard" 
            className="cyber-button-secondary text-lg px-8 py-4 w-full sm:w-auto text-center"
          >
            Enter Control Panel
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
          <div className="glass-panel p-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">99.9%</h3>
            <p className="text-xs text-cyber-cyan uppercase tracking-wider">Uptime</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">0 Trust</h3>
            <p className="text-xs text-cyber-cyan uppercase tracking-wider">Architecture</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">Edge</h3>
            <p className="text-xs text-cyber-cyan uppercase tracking-wider">Deployments</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-1">24/7</h3>
            <p className="text-xs text-cyber-cyan uppercase tracking-wider">Observability</p>
          </div>
        </div>
      </div>
    </main>
  );
}
