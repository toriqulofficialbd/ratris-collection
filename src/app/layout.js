// src/app/layout.js (গ্লোবাল রুট লেআউট)
import { AlertProvider } from "@/context/AlertContext"; // 🎯 নতুন যুক্ত: গ্লোবাল লাক্সারি অ্যালার্ট ম্যাট্রিক্স
import "./globals.css"; // অথবা আপনার Tailwind CSS ইমপোর্ট লাইন

export const metadata = {
  title: "Ratri's Collection",
  description: "The Art of Pure Elegance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0A09] text-zinc-100 antialiased">
        {/* 🎯 ফিক্স: পুরো অ্যাপকে প্রিমিয়াম অ্যালার্ট লেয়ার দিয়ে মুড়ে দেওয়া হলো */}
        <AlertProvider>
          {/* এখানে কোনো Navbar বা Footer থাকবে না, এগুলো স্বয়ংক্রিয়ভাবে রেস্পেক্টিভ লেআউট থেকে লোড হবে */}
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
