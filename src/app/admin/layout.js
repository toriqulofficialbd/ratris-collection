// src/app/admin/layout.js
export const metadata = {
  title: "Ratri's Collection - Admin Dashboard",
  description: "Luxury Back-Office Control Panel",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 antialiased selection:bg-[#C5A880]/30">
      {/* এই লেআউটটি কাস্টমার প্যানেলের Navbar ও Footer কে ব্লক করে সম্পূর্ণ ফ্রেশ ব্যাক-অফিস স্ক্রিন দিবে */}
      {children}
    </div>
  );
}
