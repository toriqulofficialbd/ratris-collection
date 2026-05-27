// src/app/(shop)/layout.js
"use client"; // কারণ কার্ট স্টেট একটি ক্লায়েন্ট-সাইড মেকানিজম

import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext"; // আপনার কার্ট কন্টেক্সট ইমপোর্ট করা হলো

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      {/* এখন কার্ট প্রোভাইডারের ভেতরে থাকায় Navbar এবং সব ইউজার পেজ কার্ট ডেটা অ্যাক্সেস করতে পারবে */}
      <Navbar />
      <main>{children}</main>
    </CartProvider>
  );
}
