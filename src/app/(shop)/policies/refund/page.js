"use client";

export default function RefundPolicy() {
  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 p-6 ">
      <div className="max-w-2xl mx-auto space-y-8 font-light leading-relaxed tracking-wide text-sm">
        
        <header className="border-b border-stone-900 pb-6 text-center sm:text-left">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-1">COUTURE SATISFACTION</span>
          <h1 className="text-3xl font-serif uppercase tracking-wider text-white">Returns & Exchange</h1>
          <p className="text-stone-500 text-xs mt-1">Last Updated: May 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">1. Return Validation Timeline</h2>
          <p className="text-stone-400">
            Ratri&apos;s Collection guarantees premium craftsmanship. If any three-piece garment or beauty compound demonstrates manufacturer discrepancies or damage upon arrival, the patron must escalate a claim within <strong className="text-amber-500">24 hours of successful delivery manifest log</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">2. Eligibility Matrix</h2>
          <p className="text-stone-400">
            To authorize an exchange, items must remain completely unwashed, unaltered, and equipped with original luxury tag seals. Due to clinical sanitation and hygiene criteria, <strong className="text-amber-500">authentic cosmetics items cannot be returned</strong> once the secure container foil is breached.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">3. Refund Compensation</h2>
          <p className="text-stone-400">
            Approved assertions are evaluated via the original Cash On Delivery parameters or processed as digital vault store credits for your subsequent premium wardrobe acquisition. Exchange logistics delivery charges are allocated depending on the audit verdict.
          </p>
        </section>

      </div>
    </div>
  );
}
