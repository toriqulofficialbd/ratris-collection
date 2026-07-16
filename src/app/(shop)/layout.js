
"use client"; 

import { Suspense } from "react"; 
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext"; 
import Footer from "@/components/Footer";

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      
      <Suspense fallback={
        <div className="bg-[#0B0A09] h-20 w-full border-b border-stone-900/60 animate-pulse" />
      }>
        <Navbar />
      </Suspense>
      
      <main>{children}</main>
      <Footer/>
    </CartProvider>
  );
}
