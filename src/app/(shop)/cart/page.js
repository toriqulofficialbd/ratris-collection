"use client"; // কার্টের আইটেম রিয়েল-টাইমে বাড়ানো/কমানোর জন্য Client Component করলাম

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext'; // গ্লোবাল কার্ট ডাটা ইমপোর্ট করলাম

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();

  // কার্টের সব প্রোডাক্টের মোট মূল্য হিসাব করার লজিক
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#0B0A09] min-h-screen text-stone-100 pb-24 selection:bg-amber-600 selection:text-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-12">
        
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wide font-serif text-white mb-8 border-b border-stone-900 pb-4">
          Shopping Bag ({cart.length})
        </h1>

        {cart.length === 0 ? (
          /* 🛍️ কার্ট খালি থাকলে এই প্রিমিয়াম মেসেজটি দেখাবে */
          <div className="text-center py-24 bg-[#12110F] rounded-2xl border border-stone-900/60 space-y-6">
            <svg className="w-16 h-16 text-stone-600 mx-auto animate-pulse" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            <p className="text-stone-400 font-medium tracking-wide">Your boutique shopping bag is currently empty.</p>
            <Link href="/shop" className="inline-block bg-amber-500 text-stone-950 text-xs font-black tracking-widest uppercase px-8 py-4 rounded-lg">
              Explore Products
            </Link>
          </div>
        ) : (
          /* 🛍️ কার্টে আইটেম থাকলে এই ডাইনামিক গ্রিডটি ওপেন হবে */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: LIVE CART ITEMS LIST */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex bg-[#12110F] border border-stone-900 p-4 rounded-xl items-center justify-between gap-4 animate-in fade-in duration-200">
                  
                  {/* Real Image */}
                  <div className="relative w-20 aspect-[3/4] bg-stone-900 rounded-md overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="100px" className="object-cover" />
                  </div>
                  
                  {/* Real Content Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-white truncate">{item.name}</h3>
                    <p className="text-xs text-amber-500 font-bold mt-1">৳{item.price}</p>
                    
                    {/* Live Quantity Increment / Decrement Buttons */}
                    <div className="flex items-center space-x-3 mt-3 bg-stone-950 w-fit rounded-lg border border-stone-900 px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-stone-400 hover:text-white px-2 font-black text-sm transition-colors">-</button>
                      <span className="text-xs font-black text-white px-1 select-none">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-stone-400 hover:text-white px-2 font-black text-sm transition-colors">+</button>
                    </div>
                  </div>

                  {/* Right Side: Total Price & Live Delete Button */}
                  <div className="text-right flex flex-col justify-between h-20 items-end">
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-stone-500 hover:text-red-400 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span className="text-sm font-black text-white">৳{item.price * item.quantity}</span>
                  </div>

                </div>
              ))}
            </div>

            {/* RIGHT: DYNAMIC CALCULATEDsummary EXPENSE BOX */}
            <div className="lg:col-span-4 bg-[#12110F] border border-stone-900 p-6 rounded-xl space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-stone-900 pb-3">
                Order Summary
              </h3>
              
              <div className="space-y-3 text-xs font-bold uppercase tracking-wide text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-amber-500 font-medium lowercase italic">Calculated next step</span>
                </div>
                <div className="h-[1px] bg-stone-900 my-2"></div>
                <div className="flex justify-between text-sm font-black text-white normal-case">
                  <span>Estimated Total</span>
                  <span className="text-amber-400 text-base font-black">৳{subtotal}</span>
                </div>
              </div>

              <Link href="/checkout" className="block text-center bg-amber-500 text-stone-950 text-xs font-black tracking-[0.2em] uppercase py-4 rounded-lg hover:bg-amber-400 transition-all duration-300 w-full shadow-lg shadow-amber-500/5">
                Proceed To Checkout &rarr;
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
