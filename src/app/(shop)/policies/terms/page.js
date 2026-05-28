"use client";

export default function TermsOfService() {
  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 p-6 ">
      <div className="max-w-2xl mx-auto space-y-8 font-light leading-relaxed tracking-wide text-sm">
        
        <header className="border-b border-stone-900 pb-6 text-center sm:text-left">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-1">LEGAL BLUEPRINT</span>
          <h1 className="text-3xl font-serif uppercase tracking-wider text-white">Terms of Service</h1>
          <p className="text-stone-500 text-xs mt-1">Last Updated: May 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">1. Commercial Manifest Integrity</h2>
          <p className="text-stone-400">
            By authenticating an transaction on this premium portal, you certify that all information logged into the Cash On Delivery ledger is legally validated and precise. We reserve the absolute right to terminate order dispatch nodes showing volatile or fraudulent metrics.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">2. Pricing & Currency Matrix</h2>
          <p className="text-stone-400">
            All premium assets, unstitched cotton ensembles, and global cosmetics listed in the catalog are calculated in Bangladeshi Taka (BDT). Prices are subject to real-time adjustments without prior warning based on luxury distribution constraints.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 font-serif">3. Delivery Governance</h2>
          <p className="text-stone-400">
            Estimated dispatch timelines are mapped live upon checkout. Ratri&apos;s Collection holds clear sovereignty over logistics manifests. Delays emerging from extraneous seasonal weather disruptions or national freight complications are handled via automated notification updates.
          </p>
        </section>

      </div>
    </div>
  );
}
