// src/app/(shop)/checkout/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 🎯 নতুন যুক্ত: হোমপেইজে রিডাইরেক্ট করার জন্য
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useCart } from "@/context/CartContext"; 

function CheckoutComponent() {
  const { cart = [], clearCart } = useCart() || {}; 
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // 🎯 নতুন যুক্ত: রাউটার ইনস্ট্যান্স
  
  // 🎯 নতুন যুক্ত: কাস্টম লাক্সারি অ্যালার্ট মডালের স্টেট কন্ট্রোল
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      await addDoc(collection(db, "orders"), {
        customerName: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        items: cart.map(item => ({
          id: item.id || Math.random().toString(),
          name: item.name,
          price: item.price,
          qty: item.qty || 1
        })),
        total: `৳ ${calculatedTotal.toLocaleString()}`, 
        status: "Pending",
        createdAt: new Date()
      });

      // 🎯 ফিক্স: পুরানো alert বাদ দিয়ে কাস্টম সাকসেস মডাল ট্রিগার করা হলো
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

  // 🎯 নতুন যুক্ত: অর্ডার সফল হওয়ার পর মডালের বাটন হ্যান্ডেলার
  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push("/"); // 🎯 ইউজারকে সরাসরি হোমপেইজে পাঠিয়ে দেওয়া হবে
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 flex items-center justify-center p-6 pt-24 relative">
      
      <form onSubmit={handlePlaceOrder} className="w-full max-w-md bg-[#0B0A09] border border-[#1C1A17] p-8 rounded space-y-4 shadow-2xl relative">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[#C5A880] mb-2 font-serif">Luxury Checkout Panel</h2>
        
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#1C1A17] pb-4 mb-6">
          Order Summary:{" "}
          <span className="text-[#C5A880] font-mono font-bold">
            ৳ {calculatedTotal.toLocaleString()}
          </span>{" "}
          ({cart.length} Pieces)
        </p>
        
        {/* ইন-লাইন কাস্টম এরর ডিসপ্লে (যদি ব্যাগ খালি থাকে বা ডাটাবেজ ফেইল হয়) */}
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

      {/* 🎯 নতুন যুক্ত: প্রিমিয়াম লাক্সারি ডার্ক সাকসেস মডাল পপআপ */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0A09] border border-[#1C1A17] p-8 rounded text-center relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

            {/* Premium Animated Icon Box */}
            <div className="w-12 h-12 rounded-full bg-amber-950/20 border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-5 text-[#C5A880]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Modal Heading */}
            <h3 className="text-sm font-serif uppercase tracking-[0.2em] text-[#C5A880]">Order Authenticated</h3>
            <p className="text-[11px] text-zinc-400 tracking-wide mt-2 font-light">
              Your pieces have been successfully live-manifested via Cash On Delivery.
            </p>

            {/* Trendy Redirect CTA Button */}
            <button 
              onClick={handleModalClose}
              className="mt-6 w-full bg-[#C5A880] text-black text-[10px] uppercase tracking-[0.25em] py-3 font-semibold hover:bg-[#b3956b] transition-all duration-300"
            >
              Back To Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// 👑 100% EXPORT SAFEGUARD
const CheckoutPage = dynamic(() => Promise.resolve(CheckoutComponent), {
  ssr: false,
});

export default CheckoutPage;
