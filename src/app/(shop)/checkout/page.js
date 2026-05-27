// src/app/(shop)/checkout/page.js
"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // Next.js-এর অফিশিয়াল হাইড্রেশন সেফগার্ড
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useCart } from "@/context/CartContext"; 

function CheckoutComponent() {
  const { cart = [], clearCart } = useCart() || {}; 
  const [loading, setLoading] = useState(false);
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
    
    if (cart.length === 0) {
      alert("Your bag is empty! Please add pieces to checkout.");
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

      alert("🎉 Order Placed Successfully via Cash on Delivery!");
      if (clearCart) clearCart(); 
      setCustomerData({ name: "", phone: "", address: "" });
    } catch (error) {
      console.error("Order Sync Failed:", error);
      alert("Cloud Database connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 flex items-center justify-center p-6 pt-24">
      <form onSubmit={handlePlaceOrder} className="w-full max-w-md bg-[#0B0A09] border border-[#1C1A17] p-8 rounded space-y-4 shadow-2xl">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[#C5A880] mb-2 font-serif">Luxury Checkout Panel</h2>
        
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#1C1A17] pb-4 mb-6">
          Order Summary:{" "}
          <span className="text-[#C5A880] font-mono font-bold">
            ৳ {calculatedTotal.toLocaleString()}
          </span>{" "}
          ({cart.length} Pieces)
        </p>
        
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
    </div>
  );
}

// 👑 100% EXPORT SAFEGUARD: এটিকে ডিফল্ট এক্সপোর্ট হিসেবে পাস করায় Next.js হাইড্রেশন এরর উধাও করে দিবে
const CheckoutPage = dynamic(() => Promise.resolve(CheckoutComponent), {
  ssr: false,
});

export default CheckoutPage;
