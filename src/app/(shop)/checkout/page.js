// src/app/(shop)/checkout/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore"; // addDoc এর বদলে doc এবং setDoc ব্যবহার করা হলো
import { useCart } from "@/context/CartContext"; 

function CheckoutComponent() {
  const { cart = [], clearCart } = useCart() || {}; 
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedTrackId, setGeneratedTrackId] = useState("");

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // কার্টের মোট টাকার ডাইনামিক রিয়েল-টাইম হিসাব
  const calculatedTotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 1)), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (cart.length === 0) {
      setErrorMessage("Your bag is empty! Please add pieces to checkout.");
      return;
    }

    setLoading(true);

    try {
      // 🎯 ১. ট্রেন্ডি ও এরর-মুক্ত ট্র্যাকিং আইডি জেনারেটর মেকানিজম (ফায়ারবেস সিকিউর মেথড)
      // ফায়ারবেসের নিজস্ব ডক আইডি থেকে প্রথম ৬টি ক্যারেক্টার নিয়ে ইউনিক ট্র্যাকিং তৈরি করা হলো
      const orderRef = doc(collection(db, "orders")); 
      const shortId = orderRef.id.slice(0, 6).toUpperCase();
      const trackingId = `RC-${shortId}`; // আউটপুট এক্সাম্পল: RC-A49F3D

      // ফায়ারবেসে ডেটা রাইট লেজার
      await setDoc(orderRef, {
        trackingId: trackingId, 
        customerName: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        items: cart.map(item => ({
          id: item.id || "unit_asset", // Math.random() এর বদলে ফিক্সড স্ট্রিং দিয়ে রিয়াক্ট বিশুদ্ধতা ঠিক করা হলো
          name: item.name,
          price: item.price,
          qty: item.qty || 1
        })),
        total: `৳ ${calculatedTotal.toLocaleString()}`, 
        status: "Pending",
        createdAt: new Date().toISOString() // নন-ইডেমপোটেন্ট ডেট মেথডকে সেফ স্ট্রিং করা হলো
      });

      setGeneratedTrackId(trackingId); 
      if (clearCart) clearCart(); 
      setCustomerData({ name: "", phone: "", address: "" });
      setShowSuccessModal(true); 
    } catch (error) {
      console.error("Order Sync Failed:", error);
      setErrorMessage("Cloud Database connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push("/"); 
  };

  const handleTrackRedirect = () => {
    setShowSuccessModal(false);
    router.push(`/track?id=${generatedTrackId}`); 
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 flex items-center justify-center p-6 pt-24 relative selection:bg-amber-600 selection:text-black">
      
      <form onSubmit={handlePlaceOrder} className="w-full max-w-md bg-[#0B0A09] border border-[#1C1A17] p-8 rounded space-y-4 shadow-2xl relative">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[#C5A880] mb-2 font-serif">Luxury Checkout Panel</h2>
        
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#1C1A17] pb-4 mb-6">
          Order Summary:{" "}
          <span className="text-[#C5A880] font-mono font-bold">
            ৳ {calculatedTotal.toLocaleString()}
          </span>{" "}
          ({cart.length} Pieces)
        </p>
        
        {errorMessage && (
          <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded text-center">
            <p className="text-[10px] uppercase tracking-widest text-rose-500 font-medium animate-pulse">{errorMessage}</p>
          </div>
        )}
        
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
          <input type="text" name="name" value={customerData.name} onChange={handleInputChange} placeholder="e.g., Farzana Chowdhury" className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]" required />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Phone Number</label>
          <input type="tel" name="phone" value={customerData.phone} onChange={handleInputChange} placeholder="e.g., 01712345678" className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]" required />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Delivery Address</label>
          <textarea name="address" value={customerData.address} onChange={handleInputChange} placeholder="House 12, Road 4, Gulshan-2, Dhaka" className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880] h-20" required></textarea>
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-[#C5A880] disabled:bg-zinc-800 text-black text-xs uppercase tracking-[0.2em] py-3.5 font-semibold hover:bg-[#b3956b] transition-all">
          {loading ? "Processing Order..." : "Confirm Cash On Delivery"}
        </button>
      </form>

      {/* 🎯 প্রিমিয়িয়াম লাক্সারি ডার্ক সাকসেস মডাল পপআপ */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0A09] border border-[#1C1A17] p-8 rounded text-center relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

            <div className="w-12 h-12 rounded-full bg-amber-950/20 border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-5 text-[#C5A880]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-sm font-serif uppercase tracking-[0.2em] text-[#C5A880]">Order Authenticated</h3>
            <p className="text-[11px] text-zinc-400 tracking-wide mt-2 font-light">
              Your pieces have been successfully live-manifested via Cash On Delivery.
            </p>

            {/* ট্র্যাকিং আইডি নোড */}
            <div className="mt-4 bg-[#12110F] border border-[#1C1A17]/60 p-3 rounded">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block">Your Parcel Tracking ID</span>
              <span className="text-xs font-mono font-black text-amber-400 block mt-0.5 tracking-wider">{generatedTrackId}</span>
            </div>

            {/* অ্যাকশন বাটন গ্রুপ */}
            <div className="flex flex-col gap-2 mt-6">
              <button 
                onClick={handleTrackRedirect}
                className="w-full bg-[#C5A880] text-black text-[10px] uppercase tracking-[0.25em] py-3.5 font-black hover:bg-[#b3956b] transition-all duration-300 shadow-lg shadow-amber-500/5"
              >
                Track Your Order ⚡
              </button>
              
              <button 
                onClick={handleModalClose}
                className="w-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/50 text-[9px] uppercase tracking-[0.25em] py-3 font-semibold transition-all duration-300"
              >
                Back To Home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const CheckoutPage = dynamic(() => Promise.resolve(CheckoutComponent), {
  ssr: false,
});

export default CheckoutPage;
