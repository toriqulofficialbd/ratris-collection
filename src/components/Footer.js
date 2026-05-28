export default function Footer() {
  return (
    <footer className="w-full bg-[#060504]/80 backdrop-blur-md border-t border-stone-900/60 py-4 sm:py-5 text-stone-500 mt-auto selection:bg-amber-600 selection:text-black md:sticky md:bottom-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        
        {/* Left Side: Editorial Brand Name */}
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase font-serif">
            RATRI<span className="text-amber-500">&apos;</span>S COLLECTION
          </p>
          <p className="text-[9px] tracking-wider text-stone-600 uppercase font-light hidden sm:block">
            Meticulously Curated Luxury Couture & Beauty Asset
          </p>
        </div>

        {/* Center: Legal Micro Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[9px] uppercase tracking-widest font-black text-stone-400">
          <a href="/policies/privacy" className="hover:text-amber-400 transition-colors">Privacy</a>
          <a href="/policies/terms" className="hover:text-amber-400 transition-colors">Terms</a>
          <a href="/policies/refund" className="hover:text-amber-400 transition-colors">Returns</a>
        </div>

        {/* Right Side: High-End Copyright Ledger */}
        <div className="text-[9px] uppercase tracking-widest font-mono text-stone-600 font-bold">
          &copy; {new Date().getFullYear()} — Vault Registered
        </div>

      </div>
    </footer>
  );
}
