// src/context/AlertContext.js
"use client";

import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
    type: "success", // 'success' অথবা 'error'
    onConfirm: null  // যদি ক্লিক করার পর কোনো কাজ (যেমন রিডাইরেক্ট) করতে চান
  });

  const showAlert = (message, type = "success", onConfirm = null) => {
    setAlertState({ isOpen: true, message, type, onConfirm });
  };

  const closeAlert = () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* 👑 GLOBAL LUXURY ALERT MODAL MATRIX */}
      {alertState.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0B0A09] border border-[#1C1A17] p-8 rounded text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Top Premium Accent Line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${
              alertState.type === "success" ? "via-[#C5A880]" : "via-rose-500"
            } to-transparent`} />

            {/* Premium Animated Icon Box */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 border ${
              alertState.type === "success" 
                ? "bg-amber-950/20 border-[#C5A880]/40 text-[#C5A880]" 
                : "bg-rose-950/20 border-rose-500/40 text-rose-500"
            }`}>
              {alertState.type === "success" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            {/* Content Header */}
            <h3 className={`text-sm font-serif uppercase tracking-[0.2em] ${
              alertState.type === "success" ? "text-[#C5A880]" : "text-rose-500"
            }`}>
              {alertState.type === "success" ? "Signature Verified" : "System Interrupted"}
            </h3>
            
            <p className="text-[11px] text-zinc-400 tracking-wide mt-2 font-light uppercase">
              {alertState.message}
            </p>

            {/* Premium Action CTA Button */}
            <button 
              onClick={closeAlert}
              className={`mt-6 w-full text-black text-[10px] uppercase tracking-[0.25em] py-3 font-semibold transition-all duration-300 ${
                alertState.type === "success" ? "bg-[#C5A880] hover:bg-[#b3956b]" : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              Acknowledge Suite
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
