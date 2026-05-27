"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function Home() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Dynamic Button Feedback State
  const [addingStates, setAddingStates] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(liveProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Featured Banner Product
  const bannerProduct =
    products.find((p) => p.isFeaturedBanner === true) ||
    products[0];

  // Trending Products
  const trendingProducts = products
    .filter((p) => p.id !== bannerProduct?.id)
    .slice(0, 4);

  // 🎯 Add To Cart Feedback Handler
  const handleAddToCartWithFeedback = (product) => {
    setAddingStates((prev) => ({
      ...prev,
      [product.id]: "loading",
    }));

    addToCart(product);

    setTimeout(() => {
      setAddingStates((prev) => ({
        ...prev,
        [product.id]: "success",
      }));

      setTimeout(() => {
        setAddingStates((prev) => ({
          ...prev,
          [product.id]: undefined,
        }));
      }, 1000);
    }, 800);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center">
        <p className="text-xs text-amber-500 uppercase tracking-[0.3em] animate-pulse">
          Streaming Vault...
        </p>
      </div>
    );
  }

  // Banner Button State
  const bannerBtnState = addingStates[bannerProduct?.id];

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 selection:bg-amber-600 selection:text-black">

      {/* ⚡ HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* LEFT CONTENT */}
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
              Explore meticulously curated luxury cotton three-pieces,
              premium soft fabrics, and authentic global cosmetic essentials.
              Designed for the modern tastemaker.
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

          {/* RIGHT BANNER */}
          <div className="lg:col-span-5 flex flex-col">

            <div className="relative w-full aspect-[3/4] bg-[#12110F] border border-stone-900 rounded-t-2xl overflow-hidden group shadow-2xl">

              <img
                src={bannerProduct?.image || "https://placehold.co/600x800"}
                alt={bannerProduct?.name}
                className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[1.2s] opacity-100"
                loading="eager"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x800";
                }}
              />

              {/* TOP BADGES */}
              <div className="absolute top-5 inset-x-5 flex justify-between items-center z-20 pointer-events-none">

                <span className="text-[9px] tracking-[0.2em] text-stone-200 uppercase font-black bg-stone-950/80 backdrop-blur-md px-3 py-1.5 border border-stone-800 rounded shadow-lg">
                  {bannerProduct?.category}
                </span>

                {bannerProduct?.badge && (
                  <span className="text-[9px] text-stone-950 font-black tracking-widest bg-amber-400 px-3 py-1.5 rounded-full shadow-lg uppercase">
                    {bannerProduct?.badge}
                  </span>
                )}

              </div>
            </div>

            {/* SPOTLIGHT CARD */}
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

                <span className="text-lg font-black text-white">
                  ৳{Number(bannerProduct?.price || 0).toLocaleString()}
                </span>

                <button
                  onClick={() =>
                    handleAddToCartWithFeedback(bannerProduct)
                  }
                  disabled={bannerBtnState === "loading"}
                  className={`min-w-[120px] font-black text-[10px] tracking-widest uppercase px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    bannerBtnState === "success"
                      ? "bg-emerald-500 text-white scale-95"
                      : bannerBtnState === "loading"
                      ? "bg-stone-800 text-stone-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/5"
                  }`}
                >
                  {bannerBtnState === "success" ? (
                    <>✓ Added</>
                  ) : bannerBtnState === "loading" ? (
                    <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Quick Add +"
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-stone-900 pb-6">

          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              CURATED PICKS
            </span>

            <h2 className="text-3xl font-serif uppercase tracking-wider text-white mt-1">
              Trending Catalog
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs text-stone-400 hover:text-amber-400 transition-colors uppercase tracking-widest font-bold mt-4 md:mt-0"
          >
            View All Products &rarr;
          </Link>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {trendingProducts.map((product) => {
            const productBtnState = addingStates[product.id];

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-[#12110F] border border-stone-900 rounded-xl overflow-hidden shadow-xl"
              >

                {/* IMAGE */}
                <div className="relative aspect-[3/4] w-full bg-stone-900 overflow-hidden">

                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        product.inStock
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}

                  <img
                    src={product.image || "https://placehold.co/600x800"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x800";
                    }}
                  />

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] border border-zinc-800 px-4 py-1.5 bg-[#060504]">
                        Stock Out
                      </span>
                    </div>
                  )}
                </div>

                {/* PRODUCT INFO */}
                <div className="p-5 flex flex-col justify-between flex-1 space-y-4">

                  <div>
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block">
                      {product.category}
                    </span>

                    <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wide mt-1 truncate group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* PRICE + BUTTON */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-900">

                    <span className="text-lg font-black text-white">
                      ৳{Number(product.price).toLocaleString()}
                    </span>

                    {product.inStock ? (
                      <button
                        onClick={() =>
                          handleAddToCartWithFeedback(product)
                        }
                        disabled={productBtnState === "loading"}
                        className={`min-w-[85px] text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 h-8 ${
                          productBtnState === "success"
                            ? "bg-amber-500 text-stone-950 scale-95 shadow-md shadow-amber-500/10"
                            : productBtnState === "loading"
                            ? "bg-stone-800 text-stone-500 cursor-not-allowed"
                            : "bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950"
                        }`}
                      >
                        {productBtnState === "success" ? (
                          <>✓ Added</>
                        ) : productBtnState === "loading" ? (
                          <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Add +"
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-3 py-2 rounded">
                        Sold Out
                      </span>
                    )}

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </section>
    </div>
  );
}