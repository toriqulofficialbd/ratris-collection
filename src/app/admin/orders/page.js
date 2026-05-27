"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ☁️ Live Firebase Sync
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(liveOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🎯 Status Update Handler
  const handleStatusChange = async (orderId, nextStatus) => {
    if (nextStatus === "Delivered") {
      const confirmDelivery = window.confirm(
        "Are you sure this order is successfully delivered?"
      );
      if (!confirmDelivery) return;
    }

    await updateDoc(doc(db, "orders", orderId), {
      status: nextStatus,
    });
  };

  // 📦 Courier CSV Download
  const downloadCourierSheet = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Order ID,Customer Name,Contact Number,Delivery Address,Amount to Collect\n";

    orders.forEach((order) => {
      const cleanAmount = order.total
        ? order.total.replace(/[^0-9]/g, "")
        : "0";

      csvContent += `${order.id},${order.customerName},${order.phone},"${order.address}",${cleanAmount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "RatriCollection_Live_Manifest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64 antialiased">
      <AdminSidebar />

      <main className="p-4 sm:p-8 md:pt-20 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
        <header className="mb-10 border-b border-[#1C1A17] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-zinc-100 font-serif">
              Live Order Fulfillment Sheet
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-wider mt-1">
              Ratri&apos;s Live Gateway — Orders sync automatically without manual reload.
            </p>
          </div>

          <button
            onClick={downloadCourierSheet}
            className="w-full md:w-auto text-center border border-[#C5A880] text-[#C5A880] text-[10px] sm:text-xs uppercase tracking-[0.15em] px-5 py-3 rounded hover:bg-[#C5A880] hover:text-black transition-all font-medium"
          >
            ↓ Export For Courier ({orders.length} Orders Loaded)
          </button>
        </header>

        {loading ? (
          <p className="text-xs text-[#C5A880] uppercase tracking-widest animate-pulse">
            Establishing Live Sync...
          </p>
        ) : (
          <div>
            {/* 🖥️ DESKTOP TABLE */}
            <div className="hidden lg:block bg-[#0B0A09] border border-[#1C1A17] rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1C1A17] bg-[#12110F]">
                      <th className="p-4 text-[10px] uppercase text-zinc-500">Firebase UID</th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">Customer</th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">Contact</th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">Destination</th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">COD Amount</th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1C1A17]/60">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#12110F]/40 transition-colors">
                        <td className="p-4 text-[10px] font-mono text-zinc-500">
                          {order.id}
                        </td>
                        <td className="p-4 text-xs text-zinc-200">
                          {order.customerName}
                        </td>
                        <td className="p-4 text-xs text-zinc-400">{order.phone}</td>
                        <td className="p-4 text-xs text-zinc-400">{order.address}</td>
                        <td className="p-4 text-xs text-[#C5A880]">{order.total}</td>

                        <td className="p-4 text-right">
  {/* 🎯 প্রিমিয়াম ড্রপডাউন এবং লকিং লজিক এরিয়া */}
  <div className="flex items-center justify-end gap-2">
    <select
      value={order.status || "Pending"}
      disabled={order.status === "Delivered"} // একবার ডেলিভারড হয়ে গেলে লক হয়ে যাবে
      onChange={(e) => handleStatusChange(order.id, e.target.value)}
      className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border font-medium bg-transparent cursor-pointer outline-none transition-all ${
        order.status === "Pending" 
          ? "text-[#C5A880] border-amber-900/50" 
          : order.status === "Processing"
          ? "text-blue-400 border-blue-900/50"
          : "text-zinc-500 border-zinc-800 bg-zinc-950 opacity-60 cursor-not-allowed"
      }`}
    >
      <option value="Pending" className="bg-[#12110F] text-[#C5A880]">Pending</option>
      <option value="Processing" className="bg-[#12110F] text-blue-400">Processing</option>
      <option value="Delivered" className="bg-[#12110F] text-zinc-500">Delivered</option>
    </select>

    {/* 🔄 ভুলবশত ডেলিভারড হয়ে গেলে লক আনলক করার সিক্রেট রিসেট বাটন */}
    {order.status === "Delivered" && (
      <button
        onClick={() => {
          const reset = window.confirm("Do you want to unlock and reset this status back to Pending?");
          if (reset) handleStatusChange(order.id, "Pending");
        }}
        className="text-[9px] text-[#C5A880] hover:text-white hover:underline transition-all bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800"
        title="Unlock Status"
      >
        Reset
      </button>
    )}
  </div>
</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📱 MOBILE CARDS */}
            <div className="block lg:hidden   space-y-4">
              {orders.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-8">
                  No active orders recorded.
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#0B0A09] border border-[#1C1A17] rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm text-zinc-200">
                          {order.customerName}
                        </h3>
                        <p className="text-[10px] text-zinc-500">{order.id}</p>
                      </div>
                      <div className="text-[#C5A880] text-xs">
                        {order.total}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400">
                      <p>{order.phone}</p>
                      <p>{order.address}</p>
                    </div>

                   <div className="w-full space-y-2">
  <select
    value={order.status || "Pending"}
    disabled={order.status === "Delivered"} // একবার ডেলিভারড হয়ে গেলে লক হয়ে যাবে
    onChange={(e) => handleStatusChange(order.id, e.target.value)}
    className={`w-full text-xs uppercase tracking-widest p-2 rounded border font-medium bg-transparent cursor-pointer outline-none transition-all ${
      order.status === "Pending" 
        ? "text-[#C5A880] border-amber-900/50" 
        : order.status === "Processing"
        ? "text-blue-400 border-blue-900/50"
        : "text-zinc-500 border-zinc-800 bg-zinc-950 opacity-60 cursor-not-allowed"
    }`}
  >
    <option value="Pending" className="bg-[#12110F] text-[#C5A880]">Pending</option>
    <option value="Processing" className="bg-[#12110F] text-blue-400">Processing</option>
    <option value="Delivered" className="bg-[#12110F] text-zinc-500">Delivered</option>
  </select>

  {/* 🔄 মোবাইল স্ক্রিনের জন্য ফুল-উইথ রিসেট বাটন (শুধুমাত্র Delivered হলে দেখাবে) */}
  {order.status === "Delivered" && (
    <button
      onClick={() => {
        const reset = window.confirm("Do you want to unlock and reset this status back to Pending?");
        if (reset) handleStatusChange(order.id, "Pending");
      }}
      className="w-full text-[10px] text-center uppercase tracking-wider text-[#C5A880] hover:text-white bg-stone-900 py-1.5 rounded border border-stone-800 transition active:scale-95 block"
    >
      Unlock & Reset Status
    </button>
  )}
</div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}