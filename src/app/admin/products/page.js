"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import * as XLSX from "xlsx";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [editingId, setEditingId] = useState(null); // কোন প্রোডাক্টটি এডিট হচ্ছে তা ট্র্যাক করার জন্য

  const initialFormData = {
    name: "",
    price: "",
    category: "three-piece",
    image: "",
    inStock: true,
    badge: "",
    isNewArrival: false,
    isFeaturedBanner: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  // ☁️ Live Product Fetch
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(liveProducts);
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📸 Cloudinary Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploadingImage(true);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "product_upload");

      // ✅ আপনার Cloudinary cloud name বসান
      const cloudName = "dwrhdbdt6";

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );

      const resData = await response.json();

      if (resData.secure_url) {
        setFormData((prev) => ({
          ...prev,
          image: resData.secure_url,
        }));

        alert("📸 Image uploaded successfully!");
      } else {
        throw new Error(resData.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // ➕ Publish Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image.trim()) {
      alert("Please upload an image first.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        inStock: formData.inStock,
        badge: formData.badge || "New",
        isNewArrival: formData.isNewArrival,
        isFeaturedBanner: formData.isFeaturedBanner,
        createdAt: new Date().toISOString(),
      });

      alert("🎉 Product Published!");

      setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Excel Upload
  const handleBulkExcelUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setBulkUploading(true);

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data);

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;

      for (const row of jsonData) {
        if (row.name && row.price) {
          await addDoc(collection(db, "products"), {
            name: String(row.name),
            price: Number(row.price),
            category: String(row.category || "three-piece").toLowerCase(),
            image: String(row.image || "https://placehold.co/600x600"),
            badge: String(row.badge || "New"),
            inStock:
              row.inStock === undefined
                ? true
                : String(row.inStock).toLowerCase() === "true",
            isNewArrival:
              row.isNewArrival === undefined
                ? false
                : String(row.isNewArrival).toLowerCase() === "true",
            isFeaturedBanner:
              row.isFeaturedBanner === undefined
                ? false
                : String(row.isFeaturedBanner).toLowerCase() === "true",
            createdAt: new Date().toISOString(),
          });

          successCount++;
        }
      }

      alert(`Bulk Sync Complete! ${successCount} products added.`);
    } catch (error) {
      console.error("Excel Error:", error);

      alert("Failed to upload excel sheet.");
    } finally {
      setBulkUploading(false);

      e.target.value = "";
    }
  };

  // ❌ Delete
  const handleDelete = async (productId) => {
    if (confirm("Are you absolute sure to delete this piece from vault?")) {
      await deleteDoc(doc(db, "products", productId));
    }
  };

  // 🔄 Stock Toggle
  const toggleStock = async (productId, currentStatus) => {
    await updateDoc(doc(db, "products", productId), {
      inStock: !currentStatus,
    });
  };

  // ১. এডিট বাটনে ক্লিক করলে ডেটা ফর্মে পাঠানোর ফাংশন
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: product.inStock ?? true,
      badge: product.badge || "",
      isNewArrival: product.isNewArrival ?? false,
      isFeaturedBanner: product.isFeaturedBanner ?? false,
    });
    // স্ক্রল করে স্মুথলি ফর্মে নিয়ে যাওয়ার জন্য
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ২. এডিট করা প্রোডাক্টটি ফায়ারবেসে সেভ করার ফাংশন
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload an image first.");

    setLoading(true);
    try {
      await updateDoc(doc(db, "products", editingId), {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image,
        inStock: formData.inStock,
        badge: formData.badge || "New",
        isNewArrival: formData.isNewArrival,
        isFeaturedBanner: formData.isFeaturedBanner,
      });
      alert("✨ Product Updated Successfully!");
      // ফর্ম রিসেট করা
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        category: "three-piece",
        image: "",
        inStock: true,
        badge: "",
        isNewArrival: false,
        isFeaturedBanner: false,
      });
    } catch (error) {
      alert("Update Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64">
      <AdminSidebar />

      <main className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
        <header className="mb-10 border-b border-[#1C1A17] pb-6">
          <h1 className="text-2xl font-light uppercase tracking-widest text-zinc-100 font-serif">
            Product Portfolio Manager
          </h1>

          <p className="text-xs text-zinc-500 tracking-wider mt-1">
            Connected Live with Firebase Cloud.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-10">
          <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 sm:p-8 rounded h-fit">
           

            {/* FORM */}
            <form
              className="space-y-4"
              onSubmit={editingId ? handleUpdateSubmit : handleSubmit}
            >
              {/* NAME */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Premium Cotton Traditional Three Piece"
                  className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                  required
                />
              </div>

              {/* PRICE + CATEGORY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Price (BDT)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1250"
                    className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880] h-[45px]"
                  >
                    <option value="three-piece">Three-Piece</option>

                    <option value="lungi">Lungi</option>

                    <option value="cosmetics">Cosmetics</option>

                    <option value="fabric">Fabric</option>
                  </select>
                </div>
              </div>

              {/* IMAGE + BADGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    {uploadingImage
                      ? "Uploading Asset..."
                      : "Image URL / Local File"}
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="flex-1 bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="fileUpload"
                    />

                    <label
                      htmlFor="fileUpload"
                      className="bg-[#1C1A17] border border-[#302D28] text-zinc-300 text-xs px-4 py-3 rounded cursor-pointer hover:bg-[#2A2723] transition-colors"
                    >
                      Browse
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Badge
                  </label>

                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    placeholder="New / Hot / Sale"
                    className="w-full bg-[#12110F] border border-[#1C1A17] p-3 text-xs rounded text-zinc-200 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="accent-[#C5A880]"
                  />
                  In Stock
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleInputChange}
                    className="accent-[#C5A880]"
                  />
                  New Arrival
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    name="isFeaturedBanner"
                    checked={formData.isFeaturedBanner}
                    onChange={handleInputChange}
                    className="accent-[#C5A880]"
                  />
                  Featured Banner
                </label>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full bg-[#C5A880] text-black font-medium text-xs uppercase tracking-widest p-4 rounded hover:bg-[#B3966E] transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : editingId
                    ? "Update Product"
                    : "Publish Product"}
              </button>
            </form>
          </div>

           {/* BULK IMPORT */}
            <div className="mb-6 p-4 border border-dashed border-zinc-700 bg-zinc-900/40 rounded">
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                {bulkUploading
                  ? "Uploading Bulk Sheet..."
                  : "Bulk Import via Excel"}
              </label>

              <input
                type="file"
                accept=".xlsx,.xls"
                disabled={bulkUploading}
                onChange={handleBulkExcelUpload}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer disabled:opacity-50"
              />
            </div>

          {/* LIVE PRODUCTS TABLE */}
          <div className="bg-[#0B0A09] border border-[#1C1A17] rounded overflow-hidden">
            <div className="p-6 border-b border-[#1C1A17]">
              <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-300">
                Live Inventory ({products.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#12110F]">
                  <tr>
                    <th className="text-left p-4 text-[10px] uppercase tracking-widest text-zinc-500">
                      Product
                    </th>

                    <th className="text-left p-4 text-[10px] uppercase tracking-widest text-zinc-500">
                      Category
                    </th>

                    <th className="text-left p-4 text-[10px] uppercase tracking-widest text-zinc-500">
                      Price
                    </th>

                    <th className="text-left p-4 text-[10px] uppercase tracking-widest text-zinc-500">
                      Status
                    </th>

                    <th className="text-left p-4 text-[10px] uppercase tracking-widest text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1C1A17]">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-[#12110F]/50 transition-all duration-300 border-b border-[#1C1A17]"
                    >
                      {/* ১. প্রোডাক্ট ইমেজ ও নাম */}
                      <td className="p-4 flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded overflow-hidden border border-[#1C1A17] bg-[#12110F] shadow-inner group-hover:border-[#C5A880]/30 transition-colors">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs text-zinc-200 tracking-wide truncate max-w-[180px] group-hover:text-zinc-100 transition-colors">
                            {product.name}
                          </span>
                          {product.badge && (
                            <span className="text-[9px] text-[#C5A880] tracking-widest uppercase mt-0.5 font-light">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ২. ক্যাটাগরি */}
                      <td className="p-4">
                        <span className="inline-block bg-[#12110F] border border-[#1C1A17] px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                          {product.category}
                        </span>
                      </td>

                      {/* ৩. প্রাইস */}
                      <td className="p-4 font-mono text-xs text-zinc-300 font-medium tracking-wide">
                        {Number(product.price).toLocaleString()}{" "}
                        <span className="text-[10px] text-zinc-500 font-sans font-light ml-0.5">
                          BDT
                        </span>
                      </td>

                      {/* ৪. স্টক স্ট্যাটাস */}
                      <td className="p-4">
                        <button
                          onClick={() =>
                            toggleStock(product.id, product.inStock)
                          }
                          className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-semibold transition-all duration-300 border backdrop-blur-sm active:scale-95 ${
                            product.inStock
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                        >
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${product.inStock ? "bg-emerald-400" : "bg-rose-400"}`}
                          ></span>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>

                      {/* ৫. অ্যাকশন বাটনসমূহ (Edit + Delete) */}
                      <td className="p-4 text-right">
                        <div className="flex items-center  gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-zinc-400 hover:text-[#C5A880] border border-[#1C1A17] hover:border-[#C5A880]/30 bg-[#12110F] px-2.5 py-1.5 rounded text-[10px] uppercase tracking-widest transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-zinc-500 hover:text-rose-400 border border-[#1C1A17] hover:border-rose-950/50 hover:bg-rose-950/30 px-2.5 py-1.5 rounded text-[10px] uppercase tracking-widest transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-16 border-b border-[#1C1A17]"
                      >
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <span className="text-2xl mb-2">📦</span>
                          <p className="text-xs uppercase tracking-widest text-zinc-500 font-light">
                            No pieces found in the vault.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
