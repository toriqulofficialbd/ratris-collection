"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext"; 
import { db } from "@/lib/firebase"; 
import { doc, onSnapshot } from "firebase/firestore"; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // নোটিশ বারের লাইভ ডাটা
  const [announcement, setAnnouncement] = useState({
    text: "✨ FREE SHIPPING ON ORDERS OVER ৳২০০০ | USE CODE: RATRI10",
    show: true,
  });
  
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const currentCat = searchParams.get("cat");
  const currentFilter = searchParams.get("filter");
  const { cart } = useCart(); 

  // 🎯 হাইড্রেশন ফিক্স এবং ফায়ারবেস নোটিশ লাইভ সিঙ্ক
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const docRef = doc(db, "settings", "notice_bar");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAnnouncement(docSnap.data());
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const isShopAllActive = pathname === "/shop" && !currentCat && !currentFilter;

  return (
    <div className="w-full sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* 👑 Luxury Top Announcement Bar */}
      {mounted && announcement.show && announcement.text && (
        <div className="bg-[#141211] text-stone-400 text-[10px] tracking-[0.25em] uppercase py-2.5 text-center font-medium border-b border-stone-900 transition-all duration-300">
          <div dangerouslySetInnerHTML={{ __html: announcement.text }} />
        </div>
      )}

      {/* 🪄 Sleek Premium Dark Navbar */}
      <nav className="bg-[#0B0A09]/90 backdrop-blur-xl border-b border-stone-900/60 transition-all duration-300 relative z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Mobile Hamburger Trigger */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-stone-300 hover:text-amber-400 focus:outline-none transition-colors p-2"
                aria-label="Toggle Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="group flex flex-col">
                <span className="text-2xl font-black tracking-[0.15em] text-white uppercase font-serif group-hover:text-amber-400 transition-colors duration-300">
                  RATRI<span className="text-amber-500">&apos;</span>S
                </span>
                <span className="text-[9px] tracking-[0.4em] text-stone-500 uppercase -mt-1 font-bold group-hover:text-stone-300 transition-colors duration-300">
                  COLLECTION
                </span>
              </Link>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-7 text-[12px] font-bold tracking-wider uppercase">
              
              <Link href="/shop" className={`transition-all duration-200 relative py-2 group ${isShopAllActive ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
                Shop All
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-300 origin-left ${isShopAllActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              <Link href="/shop?filter=new" className={`transition-all duration-200 relative py-2 group ${currentFilter === 'new' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
                New In ⚡
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-300 origin-left ${currentFilter === 'new' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              <Link href="/shop?cat=three-piece" className={`transition-all duration-200 relative py-2 group ${currentCat === 'three-piece' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
                Three-Piece
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-300 origin-left ${currentCat === 'three-piece' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              <Link href="/shop?cat=lungi" className={`transition-all duration-200 relative py-2 group ${currentCat === 'lungi' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
                Lungi
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-300 origin-left ${currentCat === 'lungi' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

              <Link href="/shop?cat=cosmetics" className={`transition-all duration-200 relative py-2 group ${currentCat === 'cosmetics' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
                Cosmetics
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-300 origin-left ${currentCat === 'cosmetics' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>

            </div>

            {/* Right Icons with Hydration-Safe Badge Count */}
            <div className="flex items-center space-x-2 md:space-x-4 text-stone-300">
              <Link href="/cart" className="relative p-2 hover:bg-stone-900 rounded-full transition-all duration-200 flex items-center justify-center group hover:text-amber-400">
                <svg className="w-5 h-5 text-stone-200 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center border border-[#0B0A09] shadow-sm">
                  {mounted ? totalItems : 0}
                </span>
              </Link>
            </div>

          </div>
        </div>

        {/* 📱 Mobile Luxury Drawer Canvas Menu */}
        <div className={`md:hidden fixed inset-x-0 top-20 bg-[#0B0A09]/95 backdrop-blur-2xl border-b border-stone-900 transition-all duration-300 origin-top overflow-hidden z-50 ${
          isOpen ? "max-h-screen opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}>
          <div className="flex flex-col space-y-4 px-6 text-sm font-bold tracking-widest uppercase">
            
            <Link href="/shop" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${isShopAllActive ? 'text-amber-400' : 'text-stone-400'}`}>
              Shop All
            </Link>

            <Link href="/shop?filter=new" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${currentFilter === 'new' ? 'text-amber-400' : 'text-stone-400'}`}>
              New In ⚡
            </Link>

            <Link href="/shop?cat=three-piece" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${currentCat === 'three-piece' ? 'text-amber-400' : 'text-stone-400'}`}>
              Three-Piece
            </Link>

            <Link href="/shop?cat=lungi" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${currentCat === 'lungi' ? 'text-amber-400' : 'text-stone-400'}`}>
              Lungi
            </Link>

            <Link href="/shop?cat=cosmetics" onClick={() => setIsOpen(false)} className={`py-2 transition-colors ${currentCat === 'cosmetics' ? 'text-amber-400' : 'text-stone-400'}`}>
              Cosmetics
            </Link>

          </div>
        </div>
      </nav>

      {/* 🎯 নতুন যুক্ত: আউটসাইড ক্লিক লেয়ার (মেনু খোলা থাকলে ব্যাকগ্রাউন্ডে ক্লিক করলে মেনু অফ হবে) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}
      
    </div>
  );
}
