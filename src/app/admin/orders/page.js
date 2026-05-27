"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { db } from "@/lib/firebase";
import { useAlert } from "@/context/AlertContext"; // 👑 অ্যালার্ট কনটেক্সট যুক্ত করা হলো
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function OrderTracking() {
  const { showAlert } = useAlert(); // 🎯 অ্যালার্ট ট্রিগার
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛡️ কাস্টম প্রিমিয়াম কনফার্মেশন মডাল স্টেট
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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

  // 🪄 কাস্টম ডায়ালগ ওপেন করার হেল্পার ফাংশন
  const openCustomConfirm = (title, message, onConfirmAction) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 🎯 Status Update Handler
  const handleStatusChange = async (orderId, nextStatus) => {
    const performUpdate = async () => {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          status: nextStatus,
        });
        showAlert(
          `📦 METRICS: Order status escalated to [${nextStatus.toUpperCase()}].`,
          "success",
        );
      } catch (error) {
        showAlert(
          "❌ GATEWAY ERROR: Failed to synchronize status to network ledger.",
          "error",
        );
      }
    };

    // যদি স্ট্যাটাস Delivered করা হয়, তবে কাস্টম লাক্সারি মডাল দেখাবে
    if (nextStatus === "Delivered") {
      openCustomConfirm(
        "🚨 CRITICAL FULFILLMENT",
        "Are you absolute sure this package has been successfully handled and delivered to the patron?",
        performUpdate,
      );
    } else {
      performUpdate();
    }
  };

  // 🎯 নতুন যুক্ত: ডাটাবেজ থেকে অর্ডার চিরতরে মুছে ফেলার ফাংশন
  const handleOrderDelete = async (orderId) => {
    openCustomConfirm(
      "🗑️ CRITICAL DATA PURGE",
      "Are you absolute sure to permanently remove this order manifest from the database vault? This action is irreversible.",
      async () => {
        try {
          const { deleteDoc } = await import("firebase/firestore"); // অন-দ্য-ফ্লাই ইমপোর্ট বিল্ড সেফটির জন্য
          await deleteDoc(doc(db, "orders", orderId));
          showAlert(
            "🗑️ PURGE COMPLETE: Order manifest successfully wiped from cloud ledger.",
            "success",
          );
        } catch (error) {
          showAlert(`❌ DELETION FAULT: ${error.message}`, "error");
        }
      },
    );
  };

  // 🎯 নতুন যুক্ত: ১-ক্লিকে ট্র্যাকিং আইডি কপি করার মেকানিজম
  const handleCopyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showAlert(
      `📋 COPIED: Tracking ID [${text}] saved to clipboard.`,
      "success",
    );
  };

  // 📦 Courier CSV Download
  const downloadCourierSheet = () => {
    try {
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

      showAlert(
        "📊 ENTERPRISE MANIFEST: CSV spreadsheet ledger downloaded successfully.",
        "success",
      );
    } catch (error) {
      showAlert(
        "❌ EXPORT FAULT: Failed to generate manifest compilation.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64 antialiased selection:bg-[#C5A880] selection:text-black">
      <AdminSidebar />

      <main className="p-4 sm:p-8 md:pt-20 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
        <header className="mb-10 border-b border-[#1C1A17] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-zinc-100 font-serif">
              Live Order Fulfillment Sheet
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-wider mt-1">
              Ratri&apos;s Live Gateway — Orders sync automatically without
              manual reload.
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
                      <th className="p-4 text-[10px] uppercase text-zinc-500">
                        Firebase UID
                      </th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">
                        Customer
                      </th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">
                        Contact
                      </th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">
                        Destination
                      </th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500">
                        COD Amount
                      </th>
                      <th className="p-4 text-[10px] uppercase text-zinc-500 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1C1A17]/60">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#12110F]/40 transition-colors"
                      >
                        {/* 🎯 ফিক্সড: মাউস আনলে ট্র্যাকিং আইডি দেখাবে এবং ক্লিক করলে অটো কপি হবে */}
                        <td className="p-4 text-[10px] font-mono text-zinc-500">
                          <div
                            onClick={() =>
                              handleCopyToClipboard(order.trackingId)
                            }
                            className="cursor-pointer hover:text-amber-400 transition-colors"
                            title={`Click to copy: ${order.trackingId || "No ID"}`}
                          >
                            <span className="text-[#C5A880] font-black">
                              {order.trackingId || "N/A"}
                            </span>
                            <span className="text-[9px] block text-zinc-600 opacity-60">
                              UID: {order.id.slice(0, 5)}...
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-zinc-200">
                          {order.customerName}
                        </td>
                        <td className="p-4 text-xs text-zinc-400">
                          {order.phone}
                        </td>
                        <td className="p-4 text-xs text-zinc-400">
                          {order.address}
                        </td>
                        <td className="p-4 text-xs text-[#C5A880]">
                          {order.total}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={order.status || "Pending"}
                              disabled={order.status === "Delivered"}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border font-medium bg-transparent cursor-pointer outline-none transition-all ${
                                order.status === "Pending"
                                  ? "text-[#C5A880] border-amber-900/50"
                                  : order.status === "Processing"
                                    ? "text-blue-400 border-blue-900/50"
                                    : "text-zinc-500 border-zinc-800 bg-zinc-950 opacity-60 cursor-not-allowed"
                              }`}
                            >
                              <option
                                value="Pending"
                                className="bg-[#12110F] text-[#C5A880]"
                              >
                                Pending
                              </option>
                              <option
                                value="Processing"
                                className="bg-[#12110F] text-blue-400"
                              >
                                Processing
                              </option>
                              <option
                                value="Delivered"
                                className="bg-[#12110F] text-zinc-500"
                              >
                                Delivered
                              </option>
                            </select>
                            {order.status === "Delivered" && (
                              <button
                                onClick={() => {
                                  openCustomConfirm(
                                    "🔓 SECURITY BREACH CONTROL",
                                    "Do you want to unlock this node and restore status ledger back to Pending?",
                                    () =>
                                      handleStatusChange(order.id, "Pending"),
                                  );
                                }}
                                className="text-[9px] text-[#C5A880] hover:text-white hover:underline transition-all bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800"
                                title="Unlock Status"
                              >
                                Reset
                              </button>
                            )}

                            {/* 🗑️ ডেস্কটপ ভিউ পার্সেল পার্জ বাটন (সবসময় দৃশ্যমান) */}
                            <button
                              type="button"
                              onClick={() => handleOrderDelete(order.id)}
                              className="p-1.5 bg-[#12110F] border border-red-950/50 text-red-500/70 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/60 rounded transition-all duration-200 active:scale-95 inline-flex items-center justify-center h-[27px] w-[27px] ml-1"
                              title="Purge Order Manifest"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📱 MOBILE CARDS */}
            <div className="block lg:hidden space-y-4">
              {orders.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-8">
                  No active orders recorded.
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#0B0A09] border border-[#1C1A17] rounded-xl p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 tracking-wide">
                          {order.customerName}
                        </h3>
                        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                          {order.id}
                        </p>
                      </div>
                      <div className="text-[#C5A880] text-xs font-black bg-[#12110F] px-2.5 py-1 rounded border border-stone-900">
                        {order.total}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <p>
                        <span className="text-zinc-600">⚡ Contact:</span>{" "}
                        {order.phone}
                      </p>
                      <p>
                        <span className="text-zinc-600">📍 Route:</span>{" "}
                        {order.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1C1A17]">
                      <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                        Fulfillment:
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || "Pending"}
                          disabled={order.status === "Delivered"}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`text-[9px] uppercase tracking-widest px-3 py-1.5 rounded border font-bold bg-[#060504] outline-none transition-all ${
                            order.status === "Pending"
                              ? "text-[#C5A880] border-amber-900/50"
                              : order.status === "Processing"
                                ? "text-blue-400 border-blue-900/50"
                                : "text-zinc-500 border-zinc-800 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <option
                            value="Pending"
                            className="bg-[#12110F] text-[#C5A880]"
                          >
                            Pending
                          </option>
                          <option
                            value="Processing"
                            className="bg-[#12110F] text-blue-400"
                          >
                            Processing
                          </option>
                          <option
                            value="Delivered"
                            className="bg-[#12110F] text-zinc-500"
                          >
                            Delivered
                          </option>
                        </select>

                        <div className="flex items-center gap-2">
                          {/* 🔓 ১. রিসেট বাটন (এটি শুধুমাত্র Delivered অর্ডারের পাশেই দেখাবে) */}
                          {order.status === "Delivered" && (
                            <button
                              onClick={() => {
                                openCustomConfirm(
                                  "🔓 SECURITY RESET",
                                  "Restore status back to Pending?",
                                  () => handleStatusChange(order.id, "Pending"),
                                );
                              }}
                              className="text-[9px] text-[#C5A880] bg-stone-900 px-2 py-1.5 rounded border border-stone-800 transition-colors hover:text-white"
                            >
                              Reset
                            </button>
                          )}

                          {/* 🗑️ ২. প্রিমিয়াম ডিলিট বাটন (🎯 কন্ডিশন মুক্ত: এটি এখন সব অর্ডারের পাশে সবসময় দেখা যাবে) */}
                          <button
                            onClick={() => handleOrderDelete(order.id)}
                            className="p-1.5 bg-[#12110F] border border-red-950/50 text-red-500/70 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/60 rounded transition-all duration-200 active:scale-95 flex items-center justify-center h-[27px] w-[27px]"
                            title="Purge Order Manifest"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 👑 PREMIUM CUSTOM DIALOG MODAL UI */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B0A09] border border-[#1C1A17] max-w-md w-full rounded p-6 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold tracking-widest text-[#C5A880] uppercase font-serif">
                {modalConfig.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed tracking-wide">
                {modalConfig.message}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setModalConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="w-1/2 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-[10px] uppercase tracking-widest py-3 font-bold transition-all"
              >
                Abort
              </button>
              <button
                onClick={modalConfig.onConfirm}
                className="w-1/2 bg-[#C5A880] text-black hover:bg-[#b0936d] text-[10px] uppercase tracking-widest py-3 font-bold transition-all"
              >
                Confirm Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
