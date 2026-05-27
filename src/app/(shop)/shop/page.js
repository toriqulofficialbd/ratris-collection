// src/app/(shop)/shop/page.js
"use client";

import { useState, useEffect, Suspense } from "react"; // 🎯 প্রোডাকশন বিল্ড ফিক্সের জন্য Suspense যুক্ত করা হলো
import { useSearchParams } from "next/navigation"; 
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCart } from "@/context/CartContext"; 

// 🎯 ১. ইন্টারনাল কোর কন্টেন্ট উপাদান (সব অরিজিনাল লজিক ও UI হুবহু এর ভেতর সংরক্ষিত)
function ShopContent() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat"); 
  const currentFilter = searchParams.get("filter");

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(liveProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  let filteredProducts = [...products];

  if (currentCat) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category?.toLowerCase() === currentCat.toLowerCase()
    );
  }

  if (currentFilter === "new") {
    filteredProducts = filteredProducts.slice(0, 4); 
  }

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 selection:bg-amber-600 selection:text-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto pt-24">
        
        {/* EDITORIAL HERO CANVAS HEADER */}
        <header className="mb-16 border-b border-stone-900 pb-8">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">THE VAULT</span>
          <h1 className="text-4xl font-serif uppercase tracking-wider text-white mt-1">
            {currentCat ? currentCat.replace('-', ' ') : currentFilter === 'new' ? 'New Arrivals ⚡' : 'All Products'}
          </h1>
          <p className="text-stone-500 text-xs tracking-wide mt-2 font-light">Explore meticulously curated luxury couture and beauty items live from the cloud.</p>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-amber-500 uppercase tracking-[0.3em] animate-pulse">Streaming Luxury Vault...</p>
          </div>
        ) : filteredProducts.length === 0 ? ( 
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-stone-500 uppercase tracking-widest font-light">No active pieces currently live in this category.</p>
          </div>
        ) : (
          /* 💎 YOUR ORIGINAL FULL-WIDTH RESPONSIVE 4-COLUMN GRID ARCHITECTURE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col bg-[#12110F] border border-stone-900 rounded-xl overflow-hidden shadow-xl justify-between">
                
                {/* Image Aspect Box */}
                <div className="relative aspect-[3/4] w-full bg-stone-900 overflow-hidden">
                  {product.badge && (
                    <span className={`absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      product.inStock ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  )}
                  
                  {/* Stock Out Mask */}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] border border-zinc-800 px-4 py-1.5 bg-[#060504]">
                        Stock Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Information Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block">{product.category}</span>
                    <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wide mt-1 truncate group-hover:text-amber-400 transition-colors">{product.name}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900/60">
                    <span className="text-base font-black text-white">৳{Number(product.price).toLocaleString()}</span>
                    {product.inStock ? (
                      <button 
                        onClick={() => addToCart(product)} 
                        className="bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-md transition-all duration-300"
                      >
                        Add +
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sold Out</span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 🎯 ২. মেইন রুট এক্সপোর্ট (প্রোডাকশন বিল্ড সাকসেস করার সিকিউর সাসপেন্স গেটওয়ে)
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center">
        <p className="text-xs text-amber-500 uppercase tracking-[0.3em] animate-pulse">Streaming Luxury Vault...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
