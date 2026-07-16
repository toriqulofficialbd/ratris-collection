import { AlertProvider } from "@/context/AlertContext";
import "./globals.css";

export const metadata = {
  title: "Ratri's Collection — Luxury Couture & Beauty",
  description: "The Art of Pure Elegance",
 icons: {
    icon: "/favicon.png", 
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0A09] text-zinc-100 antialiased">
        {/* Wrap the app with the global alert layer */}
        <AlertProvider>
          {/* এখানে কোনো Navbar বা Footer থাকবে না, এগুলো স্বয়ংক্রিয়ভাবে রেস্পেক্টিভ লেআউট থেকে লোড হবে */}
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
