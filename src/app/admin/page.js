// src/app/admin/page.js
"use client";

import { useMemo, useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboard() {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        const { category = "unknown", amount = 0, status = "Pending" } = doc.data();
        orders.push({
          id: doc.id,
          category,
          amount: Number(amount),
          status,
        });
      });
      setOrderHistory(orders);
      setLoading(false);
    }, (error) => {
      console.error("Firestore stream error:", error);
      setError("Failed to load orders. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    const categorySales = {};

    orderHistory.forEach(({ status, category = "unknown", amount }) => {
      if (status === "Pending") pendingCount++;
      if (status === "Delivered") deliveredCount++;
      if (status === "Cancelled") cancelledCount++;

      if (status !== "Cancelled") {
        totalRevenue += amount;
      }

      categorySales[category] = (categorySales[category] || 0) + amount;
    });

    const totalTransactions = orderHistory.length;
    const defectionRate = totalTransactions > 0 
      ? Math.round((cancelledCount / totalTransactions) * 100) 
      : 0;

    return { 
      totalRevenue, 
      pendingCount, 
      deliveredCount, 
      categorySales, 
      totalTransactions, 
      defectionRate 
    };
  }, [orderHistory]);

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64">
      <AdminSidebar />
      <main className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
        <header className="mb-10 border-b border-[#1C1A17] pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-zinc-100 font-serif">
              Vanguard Analytics
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-wider mt-1">
              Automated data parsing for Ratri&apos;s Collection ecosystem.
            </p>
          </div>
          <div className="text-[10px] text-[#C5A880] uppercase tracking-[0.2em] bg-[#12110F] border border-[#1C1A17] px-3 py-1.5 rounded self-start sm:self-auto flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Sync Active
          </div>
        </header>

        {loading ? (
          <div className="text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-mono">
            Synchronizing live database matrices...
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Gross Revenue</p>
                <p className="text-2xl sm:text-3xl font-light tracking-wide text-zinc-100 mt-4 mb-2 font-mono">
                  ৳ {analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#C5A880] uppercase tracking-wider">Active Portfolio Value</p>
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#C5A880]/50 to-transparent" />
              </div>

              <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Awaiting Dispatch</p>
                <p className="text-2xl sm:text-3xl font-light tracking-wide text-zinc-100 mt-4 mb-2 font-mono">
                  {analytics.pendingCount} <span className="text-xs text-zinc-600 font-sans uppercase tracking-widest">Orders</span>
                </p>
                <p className="text-[10px] text-amber-500 uppercase tracking-wider">Requires Courier Action</p>
              </div>

              <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Completed Orders</p>
                <p className="text-2xl sm:text-3xl font-light tracking-wide text-zinc-100 mt-4 mb-2 font-mono">
                  {analytics.deliveredCount} <span className="text-xs text-zinc-600 font-sans uppercase tracking-widest">Settled</span>
                </p>
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider">100% Cash Confirmed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 sm:p-8 rounded">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#C5A880] mb-6 font-medium">
                  Category Revenue Dominance
                </h3>
                
                {Object.keys(analytics.categorySales).length === 0 ? (
                  <p className="text-xs text-zinc-600 uppercase tracking-wider font-mono">No data found in categories.</p>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(analytics.categorySales).map(([category, value]) => {
                      const percentage = analytics.totalRevenue > 0 
                        ? Math.min(Math.round((value / analytics.totalRevenue) * 100), 100) 
                        : 0;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-xs uppercase tracking-widest">
                            <span className="text-zinc-400 font-light">{category.replace("-", " ")}</span>
                            <span className="text-zinc-200 font-mono">৳ {value.toLocaleString()} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-[3px] bg-[#12110F] border border-[#1C1A17] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#C5A880] transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 sm:p-8 rounded flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-6 font-medium">
                    Operational Ledger
                  </h3>
                  <div className="divide-y divide-[#1C1A17] text-xs">
                    <div className="py-3 flex justify-between tracking-wide">
                      <span className="text-zinc-500">Database Stream Status</span>
                      <span className="text-emerald-500 uppercase tracking-widest text-[10px] font-medium">Operational</span>
                    </div>
                    <div className="py-3 flex justify-between tracking-wide">
                      <span className="text-zinc-500">Total Logged Interactions</span>
                      <span className="text-zinc-300 font-mono">{analytics.totalTransactions} Transactions</span>
                    </div>
                    <div className="py-3 flex justify-between tracking-wide">
                      <span className="text-zinc-500">Order Defection Rate</span>
                      <span className="text-rose-500 font-mono">
                        {analytics.defectionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
