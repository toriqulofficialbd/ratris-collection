"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

import { db } from "@/lib/firebase";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

export default function AdminSettings() {

  // SECURITY STATES
  const [newKey, setNewKey] = useState("");

  const [updatingKey, setUpdatingKey] = useState(false);

  const [keySuccess, setKeySuccess] = useState(false);

  // NOTICE BAR STATES
  const [noticeText, setNoticeText] = useState("");

  const [showNotice, setShowNotice] = useState(true);

  const [updatingNotice, setUpdatingNotice] = useState(false);

  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // SHOP FILTER STATES
  const [shopSettings, setShopSettings] = useState({
    enableSearch: true,
    enablePriceSorting: true,
    enableStockFilter: true,
  });

  const [filterSuccess, setFilterSuccess] = useState(false);

  // INITIAL LOAD
  useEffect(() => {
    const fetchConfigurationData = async () => {

      // NOTICE BAR DATA
      const noticeSnap = await getDoc(
        doc(db, "settings", "notice_bar")
      );

      if (noticeSnap.exists()) {
        const data = noticeSnap.data();

        setNoticeText(data.text || "");

        setShowNotice(data.show !== false);
      }

      // SHOP SETTINGS DATA
      const filterSnap = await getDoc(
        doc(db, "settings", "shop_page")
      );

      if (filterSnap.exists()) {
        setShopSettings(filterSnap.data());
      }
    };

    fetchConfigurationData();
  }, []);

  // CHANGE PASSWORD
  const changeAdminPassword = async (e) => {
    e.preventDefault();

    setUpdatingKey(true);

    setKeySuccess(false);

    try {
      await setDoc(
        doc(db, "settings", "admin_config"),
        {
          accessKey: newKey,
        },
        { merge: true }
      );

      setKeySuccess(true);

      setNewKey("");

    } catch (error) {
      console.error(error);

      alert("Failed to update access key.");

    } finally {
      setUpdatingKey(false);
    }
  };

  // UPDATE NOTICE BAR
  const updateNoticeBar = async (e) => {
    e.preventDefault();

    setUpdatingNotice(true);

    setNoticeSuccess(false);

    try {
      await setDoc(
        doc(db, "settings", "notice_bar"),
        {
          text: noticeText,
          show: showNotice,
        },
        { merge: true }
      );

      setNoticeSuccess(true);

    } catch (error) {
      console.error(error);

      alert("Failed to update announcement bar.");

    } finally {
      setUpdatingNotice(false);
    }
  };

  // TOGGLE FILTER SETTINGS
  const toggleFilterNode = async (
    field,
    currentStatus
  ) => {

    setFilterSuccess(false);

    try {

      const nextStatus = !currentStatus;

      // LOCAL UPDATE
      setShopSettings((prev) => ({
        ...prev,
        [field]: nextStatus,
      }));

      // FIREBASE UPDATE
      await setDoc(
        doc(db, "settings", "shop_page"),
        {
          [field]: nextStatus,
        },
        { merge: true }
      );

      setFilterSuccess(true);

    } catch (error) {
      console.error(error);

      alert(
        "Failed to update storefront filter schema."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64 antialiased selection:bg-amber-600 selection:text-black">

      <AdminSidebar />

      <main className="p-4 sm:p-8 lg:p-10 max-w-2xl mx-auto pt-24 lg:pt-10 grid grid-cols-1 gap-8">

        {/* ANNOUNCEMENT BAR */}
        <div className="bg-[#0B0A09] border border-[#1C1A17] p-8 rounded relative overflow-hidden shadow-2xl">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          <div className="mb-6 border-b border-[#1C1A17] pb-4">
            <h1 className="text-lg font-serif uppercase tracking-widest text-zinc-100">
              Announcement Matrix
            </h1>

            <p className="text-[10px] text-zinc-500 tracking-wider mt-1 uppercase">
              Control live navbar announcement notice bar
            </p>
          </div>

          <form
            onSubmit={updateNoticeBar}
            className="space-y-6"
          >

            {/* VISIBILITY */}
            <div className="flex items-center justify-between bg-[#12110F] border border-[#1C1A17] p-4 rounded">

              <div>
                <span className="text-[11px] uppercase tracking-widest text-zinc-300 block">
                  Visibility Toggle
                </span>

                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
                  Turn on/off top banner on website
                </span>
              </div>

              <input
                type="checkbox"
                checked={showNotice}
                onChange={(e) =>
                  setShowNotice(e.target.checked)
                }
                className="w-4 h-4 accent-amber-500 bg-[#060504] border-[#1C1A17] rounded cursor-pointer"
              />
            </div>

            {/* NOTICE TEXT */}
            <div className="space-y-2">

              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium block">
                Banner Content (HTML Support)
              </label>

              <textarea
                value={noticeText}
                onChange={(e) =>
                  setNoticeText(e.target.value)
                }
                placeholder="✨ FREE SHIPPING | USE CODE: RATRI10"
                rows="2"
                className="w-full bg-[#12110F] border border-[#1C1A17] focus:border-amber-500 p-3 text-xs tracking-wider rounded text-zinc-200 focus:outline-none transition-all placeholder:text-zinc-800 resize-none font-mono"
                required
              />

              {noticeSuccess && (
                <p className="text-[9px] uppercase tracking-widest text-amber-500 mt-2 text-center animate-pulse">
                  ✓ Broadcast Live on Client Gateway
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingNotice}
              className="w-full bg-amber-500 text-black text-[10px] uppercase tracking-[0.25em] py-3 font-semibold hover:bg-amber-400 transition-all duration-300 disabled:opacity-50"
            >
              {updatingNotice
                ? "Broadcasting..."
                : "Publish Live Notice"}
            </button>
          </form>
        </div>

        {/* FILTER ENGINE */}
        <div className="bg-[#0B0A09] border border-[#1C1A17] p-8 rounded relative overflow-hidden shadow-2xl">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          <div className="mb-6 border-b border-[#1C1A17] pb-4">
            <h1 className="text-lg font-serif uppercase tracking-widest text-zinc-100">
              Filter Schema Engine
            </h1>

            <p className="text-[10px] text-zinc-500 tracking-wider mt-1 uppercase">
              Control client-side filtering utilities live
            </p>
          </div>

          <div className="space-y-4">

            {/* SEARCH */}
            <button
              onClick={() =>
                toggleFilterNode(
                  "enableSearch",
                  shopSettings.enableSearch
                )
              }
              className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all duration-300 ${
                shopSettings.enableSearch
                  ? "bg-amber-500/5 border-amber-500/30 text-amber-400"
                  : "bg-[#12110F] border-[#1C1A17] text-zinc-500"
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-widest font-bold block">
                  🔍 Live Search Input
                </span>

                <span className="text-[9px] text-zinc-600 uppercase tracking-wider block">
                  Enable real-time product search box
                </span>
              </div>

              <div
                className={`w-2 h-2 rounded-full ${
                  shopSettings.enableSearch
                    ? "bg-amber-400 animate-pulse"
                    : "bg-zinc-800"
                }`}
              />
            </button>

            {/* PRICE SORT */}
            <button
              onClick={() =>
                toggleFilterNode(
                  "enablePriceSorting",
                  shopSettings.enablePriceSorting
                )
              }
              className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all duration-300 ${
                shopSettings.enablePriceSorting
                  ? "bg-blue-500/5 border-blue-500/30 text-blue-400"
                  : "bg-[#12110F] border-[#1C1A17] text-zinc-500"
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-widest font-bold block">
                  📊 Price Sorting Filter
                </span>

                <span className="text-[9px] text-zinc-600 uppercase tracking-wider block">
                  Enable price low-high / high-low dropdown
                </span>
              </div>

              <div
                className={`w-2 h-2 rounded-full ${
                  shopSettings.enablePriceSorting
                    ? "bg-blue-400 animate-pulse"
                    : "bg-zinc-800"
                }`}
              />
            </button>

            {/* STOCK FILTER */}
            <button
              onClick={() =>
                toggleFilterNode(
                  "enableStockFilter",
                  shopSettings.enableStockFilter
                )
              }
              className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all duration-300 ${
                shopSettings.enableStockFilter
                  ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                  : "bg-[#12110F] border-[#1C1A17] text-zinc-500"
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-widest font-bold block">
                  📦 Warehouse Stock Mask
                </span>

                <span className="text-[9px] text-zinc-600 uppercase tracking-wider block">
                  Enable in-stock only check filter
                </span>
              </div>

              <div
                className={`w-2 h-2 rounded-full ${
                  shopSettings.enableStockFilter
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-zinc-800"
                }`}
              />
            </button>

            {filterSuccess && (
              <p className="text-[9px] uppercase tracking-widest text-amber-500 pt-2 text-center animate-pulse">
                ✓ Configuration Matrix Deployed to Cloud
              </p>
            )}
          </div>
        </div>

        {/* SECURITY CORE */}
        <div className="bg-[#0B0A09] border border-[#1C1A17] p-8 rounded relative overflow-hidden shadow-2xl">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          <div className="mb-6 border-b border-[#1C1A17] pb-4">
            <h1 className="text-lg font-serif uppercase tracking-widest text-zinc-100">
              Security Vault Core
            </h1>

            <p className="text-[10px] text-zinc-500 tracking-wider mt-1 uppercase">
              Update Admin Gateway Authorization Key
            </p>
          </div>

          <form
            onSubmit={changeAdminPassword}
            className="space-y-5"
          >

            <div className="space-y-2">

              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium block">
                New Access Key
              </label>

              <input
                type="text"
                value={newKey}
                onChange={(e) =>
                  setNewKey(e.target.value)
                }
                placeholder="ENTER NEW MASTER SIGNATURE"
                className="w-full bg-[#12110F] border border-zinc-800 focus:border-[#C5A880] p-3 text-center text-xs tracking-[0.2em] rounded text-zinc-200 focus:outline-none transition-all placeholder:text-zinc-800"
                required
              />

              {keySuccess && (
                <p className="text-[9px] uppercase tracking-widest text-amber-500 mt-2 text-center animate-pulse">
                  ✓ Master Key Synchronized with Cloud
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingKey}
              className="w-full bg-zinc-100 text-black text-[10px] uppercase tracking-[0.25em] py-3 font-semibold hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50"
            >
              {updatingKey
                ? "Encrypting Key..."
                : "Update Master Access"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}