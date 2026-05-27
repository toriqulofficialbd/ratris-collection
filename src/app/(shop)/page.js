"use client"; 

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from "react";

import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';


export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(liveProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const bannerProduct = products.find(p => p.isFeaturedBanner === true) || products[0];
  const trendingProducts = products.filter(p => p.id !== bannerProduct?.id).slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center">
        <p className="text-xs text-amber-500 uppercase tracking-[0.3em] animate-pulse">Streaming Vault...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 selection:bg-amber-600 selection:text-black">
      
      {/* ⚡ LUXURY FASHION EDITORIAL HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT: EDITORIAL COPY */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-stone-900/60 border border-stone-800 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] tracking-[0.3em] text-amber-500 font-bold uppercase">
                RATRI&apos;S COUTURE & BEAUTY
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight leading-[0.95] uppercase font-serif">
              THE ART OF <br />
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
                PURE ELEGANCE
              </span>
            </h1>
            
            <p className="text-stone-400 font-light max-w-xl text-sm md:text-base leading-relaxed tracking-wide">
              Explore meticulously curated luxury cotton three-pieces, premium soft fabrics, and authentic global cosmetic essentials. Designed for the modern tastemaker.
            </p>

            <div className="flex flex-wrap gap-5 pt-4">
              <Link 
                href="/shop?filter=new" 
                className="bg-amber-500 text-stone-950 text-xs font-black tracking-[0.2em] uppercase px-10 py-5 hover:bg-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/10"
              >
                SHOP NEW ARRIVALS
              </Link>
              <Link 
                href="/shop" 
                className="border border-stone-800 text-stone-300 text-xs font-bold tracking-[0.2em] uppercase px-10 py-5 hover:bg-stone-900 hover:text-white transition-all duration-300"
              >
                THE COLLECTION
              </Link>
            </div>
          </div>

          {/* RIGHT: 🎯 DYNAMIC HIGH-END CRYSTAL CLEAR CANVAS */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative w-full aspect-[3/4] bg-[#12110F] border border-stone-900 rounded-t-2xl overflow-hidden group shadow-2xl">
              
              {/* মেইন ব্যানার ইমেজ */}
              <img 
                src={bannerProduct?.image || "https://placehold.co"} 
                alt={bannerProduct?.name}
                className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-102 transition-transform duration-[1.2s] opacity-100"
                loading="eager"
                onError={(e) => {
                  e.target.src = "https://placehold.co";
                }}
              />

              {/* Top Meta Badges */}
              <div className="absolute top-5 inset-x-5 flex justify-between items-center z-20 pointer-events-none">
                <span className="text-[9px] tracking-[0.2em] text-stone-200 uppercase font-black bg-stone-950/80 backdrop-blur-md px-3 py-1.5 border border-stone-800 rounded shadow-lg">
                  {bannerProduct?.category}
                </span>
                <span className="text-[9px] text-stone-950 font-black tracking-widest bg-amber-400 px-3 py-1.5 rounded-full shadow-lg uppercase">
                  {bannerProduct?.badge}
                </span>
              </div>
            </div>

            {/* Spotlight Card */}
            <div className="bg-[#12110F] border-x border-b border-stone-900 p-6 rounded-b-2xl shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-amber-500 uppercase font-black">
                  ✨ Spotlight Collection
                </p>
                <h3 className="text-sm font-bold uppercase text-white tracking-wide mt-1 font-serif line-clamp-1">
                  {bannerProduct?.name}
                </h3>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-900">
                <span className="text-lg font-black text-white">৳{bannerProduct?.price}</span>
                <button 
                  onClick={() => addToCart(bannerProduct)}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] tracking-widest uppercase px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-amber-500/5"
                >
                  Quick Add +
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🛍️ TRENDY & LUXURY PRODUCT GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-stone-900 pb-6">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">CURATED PICKS</span>
            <h2 className="text-3xl font-serif uppercase tracking-wider text-white mt-1">Trending Catalog</h2>
          </div>
          <Link href="/shop" className="text-xs text-stone-400 hover:text-amber-400 transition-colors uppercase tracking-widest font-bold mt-4 md:mt-0">
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingProducts.map((product) => (
            <div key={product.id} className="group flex flex-col bg-[#12110F] border border-stone-900 rounded-xl overflow-hidden shadow-xl">
              <div className="relative aspect-[3/4] w-full bg-stone-900 overflow-hidden">
                {product.badge && (
                  <span className={`absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    product.inStock ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                  }`}>{product.badge}</span>
                )}
                {/* 🛠️ ফিক্সড: বড় হাতের <Image> ট্যাগ পরিবর্তন করে ক্র্যাশ-ফ্রি স্ট্যান্ডার্ড <img> ট্যাগ বসানো হয়েছে */}
                <img 
                  src={product.image || "https://placehold.co"} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://placehold.co";
                  }}
                />
              </div>

              {/* Product Info Block */}
              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <span className="text-[9px] tracking-widest text-stone-500 uppercase font-bold">{product.category}</span>
                  <h3 className="text-sm font-semibold text-stone-200 mt-1 line-clamp-1">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-900/60">
                  <span className="text-base font-bold text-white">৳{product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-stone-900 hover:bg-amber-500 text-stone-300 hover:text-stone-950 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all duration-200"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
