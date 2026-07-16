// src/app/admin-gate/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { resolveAdminAccessKey, isValidAdminAccessKey } from "@/lib/adminAccess";

export default function AdminGate() {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false); 
  const router = useRouter();

  const handleGateOpen = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);

    try {
     
      const correctKey = await resolveAdminAccessKey(async () => {
        const docRef = doc(db, "settings", "admin_config");
        return getDoc(docRef);
      });

      if (correctKey && isValidAdminAccessKey(accessKey, correctKey)) {
        setError(false);
        document.cookie = "ratri_admin_session=authenticated_luxury_session; path=/; max-age=86400; SameSite=Strict";
        router.push("/admin");
      } else {
        setError(true);
        setAccessKey("");
      }
    } catch (err) {
      console.error("Error fetching access key:", err);
      setError(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060504] flex items-center justify-center p-4 selection:bg-[#C5A880]/30">
      <div className="w-full max-w-sm bg-[#0B0A09] border border-[#1C1A17] p-8 rounded text-center relative overflow-hidden">
        
        {/* Luxury Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

        {/* Brand Identity */}
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.4em] text-[#C5A880] font-light">
            Ratri&apos;s Collection
          </h2>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
            Restricted Vault Gate
          </p>
        </div>

        {/* Secure Form */}
        <form onSubmit={handleGateOpen} className="space-y-6">
          <div className="relative">
            <input 
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder={verifying ? "VERIFYING KEY..." : "ENTER CREATOR ACCESS KEY"}
              disabled={verifying}
              className={`w-full bg-[#12110F] border ${
                error ? "border-rose-900 focus:border-rose-500" : "border-[#1C1A17] focus:border-[#C5A880]"
              } p-3 text-center text-xs tracking-[0.2em] rounded text-zinc-200 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50`}
              required
            />
            {error && (
              <p className="text-[9px] uppercase tracking-widest text-rose-500 mt-2 animate-pulse">
                Access Denied. Signature Invalid.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={verifying}
            className="w-full bg-[#C5A880] text-black text-[10px] uppercase tracking-[0.25em] py-3 font-semibold hover:bg-[#b3956b] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {verifying ? "Verifying..." : "Unlock Suite"}
          </button>
        </form>

        {/* Decorative Minimal Line */}
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-8 font-light">
          Secured via Tokenized Cookie Matrix
        </p>
      </div>
    </div>
  );
}
