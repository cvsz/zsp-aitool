import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 tracking-wide uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
          ZSP AI Studio · Thai-First Shopee Affiliate & Video Platform
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Shopee Affiliate & <br className="hidden sm:block"/>
          <span className="text-sky-600 dark:text-sky-400">HyperFrames Video Studio</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ระบบผู้ช่วย AI เขียนคอนเทนต์รีวิวสินค้า Shopee ภาษาไทยอัตโนมัติ สร้างวิดีโอโปรโมตสินค้า HyperFrames และจัดการลิงก์ Affiliate ครบวงจร
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link 
            href="/dashboard" 
            className="rounded-xl bg-slate-900 dark:bg-sky-500 dark:text-slate-950 text-white font-semibold text-base px-6 py-3.5 shadow-sm transition hover:bg-slate-800 dark:hover:bg-sky-400"
          >
            เข้าสู่ระบบ ZSP AI Studio ⚡
          </Link>
          <Link 
            href="/dashboard/generator" 
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-base px-6 py-3.5 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            สร้างคอนเทนต์รีวิว AI ✍️
          </Link>
          <Link 
            href="/dashboard/hyperframes" 
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-base px-6 py-3.5 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            เปิด Video Studio 🎬
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <Link href="/dashboard/generator" className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500/40">
            <span className="text-2xl mb-2 block">✍️</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">AI Hooks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shopee Review Copy</p>
          </Link>
          <Link href="/dashboard/hyperframes" className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500/40">
            <span className="text-2xl mb-2 block">🎬</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Video Gen</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">HyperFrames Engine</p>
          </Link>
          <Link href="/dashboard/ocr" className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500/40">
            <span className="text-2xl mb-2 block">🔍</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Product OCR</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spec Extractor</p>
          </Link>
          <Link href="/dashboard/shopee-affiliate" className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500/40">
            <span className="text-2xl mb-2 block">🛒</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Affiliate Link</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ingestion Pipeline</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
