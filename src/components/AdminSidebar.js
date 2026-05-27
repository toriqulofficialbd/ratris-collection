// src/components/AdminSidebar.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 🎯 নতুন যুক্ত: মেনু আইটেম লিস্টে Vault Settings অ্যাড করা হলো
  const menuItems = [
    { name: "Analytics Dashboard", path: "/admin" },
    { name: "Product Manager", path: "/admin/products" },
    { name: "Order Tracking", path: "/admin/orders" },
    { name: "Vault Settings", path: "/admin/settings" }, // 🔐 ডাইনামিক পাসওয়ার্ড চেঞ্জ করার লিংক
    { name: "Back to Shop", path: "/" },
  ];

  const handleSignOut = () => {
    // কুকি সেশন ডিলিট করার ট্রেন্ডি মেকানিজম
    document.cookie = "ratri_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Top Navbar (শুধু মোবাইল ও ট্যাবলেটে দেখাবে) */}
      <div className="lg:hidden w-full bg-[#0B0A09] border-b border-[#1C1A17] p-4 fixed top-0 left-0 z-50 flex justify-between items-center">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-light">Ratri&apos;s Suite</h2>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-xs uppercase tracking-widest text-[#C5A880] bg-[#1C1A17] px-3 py-1.5 rounded border border-[#C5A880]/20"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Main Sidebar (মোবাইলে ড্রয়ার হিসেবে আসবে, ডেক্সটপে ফিক্সড থাকবে) */}
      <aside className={`w-64 h-screen fixed left-0 top-0 bg-[#0B0A09] border-r border-[#1C1A17] flex flex-col justify-between p-6 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Brand Header */}
          <div className="mb-12 pt-4 hidden lg:block">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#C5A880] font-light">
              Ratri&apos;s Collection
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Control Panel v1.0
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 mt-16 lg:mt-0">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-xs uppercase tracking-widest transition-all duration-300 rounded ${
                    isActive
                      ? "bg-[#1C1A17] text-[#C5A880] border-l-2 border-[#C5A880] font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#12110F]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Summary & Sign Out Section */}
        <div className="border-t border-[#1C1A17] pt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1A17] border border-[#C5A880]/30 flex items-center justify-center text-xs text-[#C5A880]">
              R
            </div>
            <div>
              <p className="text-xs text-zinc-300 font-medium">Sumaiya Tabassum Ratri </p>
              <p className="text-[10px] text-zinc-500 tracking-wider">Owner / Admin</p>
            </div>
          </div>
          
          {/* স্লিক লাক্সারি সাইন আউট বাটন */}
          <button 
            onClick={handleSignOut}
            className="w-full bg-[#12110F] hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 border border-[#1C1A17] text-[10px] uppercase tracking-widest py-2 rounded transition-all duration-300"
          >
            Sign Out Suite
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
