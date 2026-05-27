// src/app/layout.js (গ্লোবাল রুট লেআউট)
import "./globals.css"; // অথবা আপনার Tailwind CSS ইমপোর্ট লাইন

export const metadata = {
  title: "Ratri's Collection",
  description: "The Art of Pure Elegance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0A09] text-zinc-100 antialiased">
        {/* এখানে কোনো Navbar বা Footer থাকবে না, এগুলো স্বয়ংক্রিয়ভাবে রেস্পেক্টিভ লেআউট থেকে লোড হবে */}
        {children}
      </body>
    </html>
  );
}
