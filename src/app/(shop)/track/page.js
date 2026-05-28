"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const trackingIdInput = searchParams.get("id") || "";

  // SAFE STATE INITIALIZATION
  const [searchId, setSearchId] = useState(trackingIdInput);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!trackingIdInput);
  const [hasSearched, setHasSearched] = useState(!!trackingIdInput);

  // RECENT ORDERS (LOCAL STORAGE)
  const [recentOrders, setRecentOrders] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ratri_order_vault");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // FIREBASE LIVE TRACKING
  useEffect(() => {
    if (!trackingIdInput) return;

    const q = query(
      collection(db, "orders"),
      where("trackingId", "==", trackingIdInput.trim().toUpperCase())
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const orderData = { id: doc.id, ...doc.data() };

          setOrder(orderData);

          // SAVE TO LOCAL STORAGE (RECENT ORDERS)
          if (typeof window !== "undefined") {
            const current = JSON.parse(
              localStorage.getItem("ratri_order_vault") || "[]"
            );

            const exists = current.some(
              (o) => o.id === orderData.trackingId
            );

            if (!exists) {
              const updated = [
                {
                  id: orderData.trackingId,
                  date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  name: orderData.customerName,
                },
                ...current,
              ].slice(0, 3);

              localStorage.setItem(
                "ratri_order_vault",
                JSON.stringify(updated)
              );
              setRecentOrders(updated);
            }
          }
        } else {
          setOrder(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [trackingIdInput]);

  // SEARCH HANDLER
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    if (
      searchId.trim().toUpperCase() ===
      trackingIdInput.trim().toUpperCase()
    ) {
      return;
    }

    setHasSearched(true);
    setLoading(true);
    router.push(`/track?id=${searchId.trim().toUpperCase()}`);
  };

  // STEPS
  const steps = ["Pending", "Processing", "Delivered"];
  const currentStatus = order?.status || "Pending";
  const currentStepIndex = steps.indexOf(currentStatus);

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 selection:bg-amber-600 selection:text-black p-6 md:p-12 ">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="text-center space-y-2">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block">
            LIVE MANIFEST GATEWAY
          </span>
          <h1 className="text-3xl font-serif uppercase tracking-wider text-white">
            Track Your Parcel
          </h1>
          <p className="text-stone-500 text-xs max-w-md mx-auto font-light leading-relaxed">
            Enter your signature Ratri&apos;s Collection tracking node to monitor your luxury cargo in real-time.
          </p>
        </header>

        {/* SEARCH FORM */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="ENTER ID (e.g., RC-A4B9)"
            className="flex-1 bg-[#12110F] border border-stone-800 text-center font-mono text-xs uppercase tracking-[0.2em] text-amber-400 placeholder-stone-700 rounded-lg px-4 py-3.5 outline-none focus:border-amber-500/50 transition-all"
            required
          />
          <button
            type="submit"
            className="bg-stone-800 border border-stone-700 hover:bg-amber-500 hover:text-stone-950 text-[10px] font-black tracking-widest uppercase px-6 py-3.5 rounded-lg transition-all duration-300"
          >
            Query
          </button>
        </form>

        {/* LOADING / ERROR / RESULT */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[10px] text-amber-500 uppercase tracking-[0.25em] animate-pulse">
              Interrogating Database Nodes...
            </p>
          </div>
        ) : hasSearched && !order ? (
          <div className="bg-[#12110F] border border-stone-900/60 p-8 rounded-xl text-center space-y-4 shadow-xl">
            <p className="text-stone-400 text-xs">
              No live manifest found for{" "}
              <span className="font-mono text-red-400">{trackingIdInput}</span>
            </p>
          </div>
        ) : order ? (
          <div className="space-y-6">

            {/* STEP UI */}
            <div className="bg-[#12110F] border border-stone-900 p-8 rounded-xl space-y-8">

              <div className="flex justify-between border-b border-stone-900 pb-4">
                <div>
                  <p className="text-[9px] text-stone-500">Tracking</p>
                  <p className="text-amber-400 font-mono text-xs">{order.trackingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-stone-500">Customer</p>
                  <p className="text-stone-200 text-xs">{order.customerName}</p>
                </div>
              </div>

              <div className="relative flex justify-between pt-4">
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-stone-900" />
                <div
                  className="absolute top-3 left-0 h-[2px] bg-amber-500 transition-all"
                  style={{
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  }}
                />

                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;

                  return (
                    <div key={idx} className="text-center z-10">
                      <div className="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] border">
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <p className="text-[9px] mt-2">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ITEMS */}
            <div className="bg-[#12110F]/60 border border-stone-900/60 p-6 rounded-xl space-y-3">
              <h4 className="text-xs text-stone-400 uppercase">
                Manifest Contents
              </h4>

              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-xs border-b border-stone-900 py-2"
                >
                  <span>{item.name}</span>
                  <span>৳{Number(item.price).toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between pt-2 text-amber-400 font-bold">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>

            {/* RECENT ORDERS */}
            {recentOrders.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs text-stone-500 uppercase">
                  Recent Orders
                </h4>

                {recentOrders.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/track?id=${o.id}`)}
                    className="w-full text-left p-3 bg-[#12110F] border border-stone-900 rounded-lg text-xs"
                  >
                    {o.id} — {o.name}
                  </button>
                ))}
              </div>
            )}

          </div>
        ) : (
          <p className="text-center text-xs text-stone-600 uppercase">
            Awaiting Tracking Signal Matrix...
          </p>
        )}

      </div>
    </div>
  );
}

// SAFE SUSPENSE WRAPPER
export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0B0A09] text-amber-500">
        Loading...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}