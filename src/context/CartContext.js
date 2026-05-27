"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // ১. ইনিশিয়াল স্টেটেই লোকাল স্টোরেজ চেক করার সেফ মেথড (যাতে ইফেক্টের ভেতর লুপ না হয়)
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("ratris_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // ২. কার্টে আসলেই কোনো আইটেম চেঞ্জ হলে শুধুমাত্র তখনই লোকাল স্টোরেজে পুশ হবে
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ratris_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // ৩. কার্টে প্রোডাক্ট যোগ করার ফাংশন
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // ৪. কার্ট থেকে প্রোডাক্ট রিমুভ করার ফাংশন
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // ৫. প্রোডাক্টের কোয়ান্টিটি বাড়ানোর/কমানোর ফাংশন
  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  // ৬. অর্ডার শেষে কার্ট খালি করার ফাংশন
  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ratris_cart");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
