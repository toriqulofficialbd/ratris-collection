// src/app/(shop)/layout.js
"use client"; // কারণ কার্ট স্টেট একটি ক্লায়েন্ট-সাইড মেকানিজম

import { Suspense } from "react"; // 🎯 প্রোডাকশন বিল্ড ফিক্সের জন্য Suspense যুক্ত করা হলো
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext"; // আপনার কার্ট কন্টেক্সট ইমপোর্ট করা হলো

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      {/* 🎯 ফিক্স: Navbar-এর searchParams যেন প্রোডাকশন বিল্ড ক্র্যাশ না করে, তাই এটিকে Suspense দিয়ে মুড়ে দেওয়া হলো */}
      <Suspense fallback={
        <div className="bg-[#0B0A09] h-20 w-full border-b border-stone-900/60 animate-pulse" />
      }>
        <Navbar />
      </Suspense>
      
      <main>{children}</main>
    </CartProvider>
  );
}
