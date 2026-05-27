"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";

import { useCart } from "@/context/CartContext";

function ShopContent() {
  const { addToCart } = useCart();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Add To Cart Button State
  const [addingStates, setAddingStates] = useState({});

  // GLOBAL SETTINGS
  const [globalSettings, setGlobalSettings] = useState({
    enableSearch: true,
    enablePriceSorting: true,
    enableStockFilter: true,
  });

  // FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  const searchParams = useSearchParams();

  const currentCat = searchParams.get("cat");
  const currentFilter = searchParams.get("filter");

  // LIVE SYNC
  useEffect(() => {
    // PRODUCTS
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const liveProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(liveProducts);
      setLoading(false);
    });

    // SETTINGS
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "shop_page"),
      (docSnap) => {
        if (docSnap.exists()) {
          setGlobalSettings(docSnap.data());
        }
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  // 🎯 Add To Cart Feedback
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

  // FILTER PROCESS
  let filteredProducts = [...products];

  // CATEGORY FILTER
  if (currentCat) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category?.toLowerCase() ===
        currentCat.toLowerCase()
    );
  }

  // NEW FILTER
  if (currentFilter === "new") {
    const hasNewBadge = filteredProducts.some(
      (p) =>
        p.badge?.toLowerCase() === "new" ||
        p.isNewArrival
    );

    if (hasNewBadge) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.badge?.toLowerCase() === "new" ||
          product.isNewArrival === true
      );
    } else {
      filteredProducts = filteredProducts.slice(0, 4);
    }
  }

  // OFFER FILTER
  if (currentFilter === "offer") {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.isOffer === true ||
        product.badge?.toLowerCase() === "sale" ||
        product.badge?.toLowerCase() === "offer"
    );
  }

  // SEARCH FILTER
  if (
    globalSettings.enableSearch &&
    searchQuery.trim() !== ""
  ) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.category
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  // STOCK FILTER
  if (
    globalSettings.enableStockFilter &&
    hideOutOfStock
  ) {
    filteredProducts = filteredProducts.filter(
      (product) => product.inStock === true
    );
  }

  // SORTING
  if (globalSettings.enablePriceSorting) {
    if (sortBy === "price-low") {
      filteredProducts.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sortBy === "price-high") {
      filteredProducts.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }
  }

  // RESET FILTERS
  const clearUrlFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setHideOutOfStock(false);

    router.push("/shop");
  };

  // SHOW TOOLBAR
  const showFilterToolbar =
    globalSettings.enableSearch ||
    globalSettings.enableStockFilter ||
    globalSettings.enablePriceSorting;

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 selection:bg-amber-600 selection:text-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto pt-24">

        {/* HEADER */}
        <header className="mb-10 border-b border-stone-900 pb-8">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            THE VAULT
          </span>

          <h1 className="text-4xl font-serif uppercase tracking-wider text-white mt-1">
            {currentCat
              ? currentCat.replace("-", " ")
              : currentFilter === "new"
              ? "New Arrivals ⚡"
              : currentFilter === "offer"
              ? "Private Sale 🏷️"
              : "All Products"}
          </h1>

          <p className="text-stone-500 text-xs tracking-wide mt-2 font-light">
            Explore meticulously curated luxury couture and beauty items live from the cloud.
          </p>
        </header>

        {/* FILTER TOOLBAR */}
        {showFilterToolbar && (
          <div className="mb-12 bg-[#12110F] border border-stone-900 rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-xl">

            {/* SEARCH */}
            {globalSettings.enableSearch ? (
              <div className="w-full lg:w-80 relative">
                <input
                  type="text"
                  placeholder="Search the vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0A09] border border-stone-800 text-xs uppercase tracking-wider text-stone-300 placeholder-stone-600 rounded-lg pl-9 pr-4 py-3 outline-none focus:border-amber-500/50 transition-all"
                />

                <svg
                  className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            ) : (
              <div className="hidden lg:block w-80" />
            )}

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-auto flex flex-wrap items-center justify-between lg:justify-end gap-4">

              {/* STOCK FILTER */}
              {globalSettings.enableStockFilter && (
                <label
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-[11px] uppercase tracking-wider font-bold cursor-pointer transition-all duration-300 ${
                    hideOutOfStock
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                      : "bg-[#0B0A09] border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hideOutOfStock}
                    onChange={(e) =>
                      setHideOutOfStock(e.target.checked)
                    }
                    className="hidden"
                  />

                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hideOutOfStock
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-stone-700"
                    }`}
                  />

                  In Stock Only
                </label>
              )}

              {/* SORT */}
              {globalSettings.enablePriceSorting && (
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                    className="w-full sm:w-auto bg-[#0B0A09] border border-stone-800 text-[11px] uppercase tracking-widest font-bold text-stone-300 rounded-lg px-4 py-3 outline-none cursor-pointer focus:border-amber-500/50 transition-all appearance-none pr-10"
                  >
                    <option value="default">
                      Sort: Default Order
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* RESET */}
              {(currentCat ||
                currentFilter ||
                searchQuery ||
                sortBy !== "default" ||
                hideOutOfStock) && (
                <button
                  onClick={clearUrlFilters}
                  className="text-[10px] uppercase font-black tracking-widest text-amber-500 hover:text-amber-400 transition-colors py-2 pl-2"
                >
                  Reset Filters ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-amber-500 uppercase tracking-[0.3em] animate-pulse">
              Streaming Luxury Vault...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-stone-500 uppercase tracking-widest font-light">
              No active pieces currently live in this category.
            </p>
          </div>
        ) : (
          /* 💎 PRODUCT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const buttonState =
                addingStates[product.id];

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-[#12110F] border border-stone-900 rounded-xl overflow-hidden shadow-xl justify-between"
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

                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* STOCK OUT */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] border border-zinc-800 px-4 py-1.5 bg-[#060504]">
                          Stock Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="p-5 flex flex-col gap-4">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-2">
                        {product.category}
                      </p>

                      <h2 className="text-sm uppercase tracking-wide font-semibold text-white line-clamp-2 min-h-[40px]">
                        {product.name}
                      </h2>

                      <p className="mt-3 text-lg font-light text-amber-400">
                        ৳{Number(product.price).toLocaleString()}
                      </p>
                    </div>

                    {/* BUTTON */}
                    {product.inStock ? (
                      <button
                        onClick={() =>
                          handleAddToCartWithFeedback(product)
                        }
                        disabled={buttonState === "loading"}
                        className={`min-w-[85px] text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 h-8 ${
                          buttonState === "success"
                            ? "bg-amber-500 text-stone-950 scale-95 shadow-md shadow-amber-500/10"
                            : buttonState === "loading"
                            ? "bg-stone-800 text-stone-500 cursor-not-allowed"
                            : "bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950"
                        }`}
                      >
                        {buttonState === "success" ? (
                          <>✓ Added</>
                        ) : buttonState === "loading" ? (
                          <div className="w-3 h-3 border border-stone-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Add +"
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-stone-900 text-stone-600 text-[11px] font-black tracking-wider uppercase px-4 py-2 rounded-md cursor-not-allowed h-8"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN EXPORT
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center text-amber-500 text-xs uppercase tracking-[0.3em]">
          Streaming Luxury Vault...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}