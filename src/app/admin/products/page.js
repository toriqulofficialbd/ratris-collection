"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { db } from "@/lib/firebase";
import { useAlert } from "@/context/AlertContext";

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
  const { showAlert } = useAlert();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);
  const [bulkUploading, setBulkUploading] =
    useState(false);
  const [editingId, setEditingId] =
    useState(null);

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

  const [formData, setFormData] =
    useState(initialFormData);

  // ☁️ Live Product Fetch
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveProducts = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setProducts(liveProducts);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔄 Input Change
  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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

      data.append(
        "upload_preset",
        "product_upload"
      );

      const cloudName = "dwrhdbdt6";

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const resData =
        await response.json();

      if (resData.secure_url) {
        setFormData((prev) => ({
          ...prev,
          image: resData.secure_url,
        }));

        showAlert(
          "📸 Image uploaded successfully to cloud node!",
          "success"
        );
      } else {
        throw new Error(
          resData.error?.message ||
            "Upload failed"
        );
      }
    } catch (error) {
      console.error(
        "Cloudinary upload error:",
        error
      );

      showAlert(
        `Failed to upload image: ${error.message}`,
        "error"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ➕ Publish Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image.trim()) {
      showAlert(
        "Please upload a product media asset image first.",
        "error"
      );

      return;
    }

    if (formData.isFeaturedBanner) {
      const hasExistingBanner =
        products.some(
          (p) => p.isFeaturedBanner
        );

      if (hasExistingBanner) {
        showAlert(
          "⚠️ একটি Featured Banner অলরেডি সচল আছে! প্রথমে সেটি ক্লিয়ার করুন।",
          "error"
        );

        return;
      }
    }

    try {
      setLoading(true);

      await addDoc(
        collection(db, "products"),
        {
          name: formData.name,
          price: Number(
            formData.price
          ),
          category:
            formData.category,
          image: formData.image,
          inStock:
            formData.inStock,
          badge:
            formData.badge ||
            "New",
          isNewArrival:
            formData.isNewArrival,
          isFeaturedBanner:
            formData.isFeaturedBanner,
          createdAt:
            new Date().toISOString(),
        }
      );

      showAlert(
        "🎉 Product Deployed and Published Successfully!",
        "success"
      );

      setFormData(initialFormData);
    } catch (error) {
      console.error(error);

      showAlert(
        `Deployment Error: ${error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // 📊 Excel Upload
  const handleBulkExcelUpload = async (
    e
  ) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setBulkUploading(true);

      const data =
        await file.arrayBuffer();

      const workbook = XLSX.read(
        data
      );

      const worksheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      let successCount = 0;

      for (const row of jsonData) {
        if (row.name && row.price) {
          await addDoc(
            collection(db, "products"),
            {
              name: String(row.name),
              price: Number(
                row.price
              ),
              category: String(
                row.category ||
                  "three-piece"
              ).toLowerCase(),

              image: String(
                row.image ||
                  "https://placehold.co/600x600"
              ),

              badge: String(
                row.badge || "New"
              ),

              inStock:
                row.inStock ===
                undefined
                  ? true
                  : String(
                      row.inStock
                    ).toLowerCase() ===
                    "true",

              isNewArrival:
                row.isNewArrival ===
                undefined
                  ? false
                  : String(
                      row.isNewArrival
                    ).toLowerCase() ===
                    "true",

              isFeaturedBanner:
                row.isFeaturedBanner ===
                undefined
                  ? false
                  : String(
                      row.isFeaturedBanner
                    ).toLowerCase() ===
                    "true",

              createdAt:
                new Date().toISOString(),
            }
          );

          successCount++;
        }
      }

      showAlert(
        `📊 Bulk Sync Complete! ${successCount} products mapped into database ledger.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Excel Error:",
        error
      );

      showAlert(
        "Failed to parse and upload excel spreadsheet matrix.",
        "error"
      );
    } finally {
      setBulkUploading(false);

      e.target.value = "";
    }
  };

  // ❌ Delete
  const handleDelete = async (
    productId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you absolute sure to delete this piece from vault?"
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "products", productId)
      );

      showAlert(
        "🗑️ Product permanent deleted from catalog.",
        "success"
      );
    } catch (error) {
      showAlert(
        `Deletion Fault: ${error.message}`,
        "error"
      );
    }
  };

  // 🔄 Stock Toggle
  const toggleStock = async (
    productId,
    currentStatus
  ) => {
    try {
      await updateDoc(
        doc(db, "products", productId),
        {
          inStock: !currentStatus,
        }
      );

      showAlert(
        `Stock node updated to ${
          !currentStatus
            ? "In Stock"
            : "Out of Stock"
        }`,
        "success"
      );
    } catch (error) {
      showAlert(
        "Failed to update warehouse stock metric.",
        "error"
      );
    }
  };

  // ⭐ Banner Toggle
  const toggleFeaturedBanner =
    async (
      productId,
      currentStatus
    ) => {
      if (!currentStatus) {
        const hasExistingBanner =
          products.some(
            (p) =>
              p.isFeaturedBanner &&
              p.id !== productId
          );

        if (hasExistingBanner) {
          showAlert(
            "⚠️ একটি Featured Banner অলরেডি সচল আছে! প্রথমে সেটি রিমুভ করুন।",
            "error"
          );

          return;
        }
      }

      try {
        await updateDoc(
          doc(db, "products", productId),
          {
            isFeaturedBanner:
              !currentStatus,
          }
        );

        showAlert(
          currentStatus
            ? "🛑 Master Showcase Banner Disabled Successfully!"
            : "✨ Node deployed to Live Main Featured Hero Banner Stage!",
          "success"
        );
      } catch (error) {
        showAlert(
          `Error configuring banner stage: ${error.message}`,
          "error"
        );
      }
    };

  // ✏️ Edit Click
  const handleEditClick = (
    product
  ) => {
    setEditingId(product.id);

    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock:
        product.inStock ?? true,
      badge: product.badge || "",
      isNewArrival:
        product.isNewArrival ??
        false,
      isFeaturedBanner:
        product.isFeaturedBanner ??
        false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 🔄 Update Submit
  const handleUpdateSubmit =
    async (e) => {
      e.preventDefault();

      if (!formData.image) {
        showAlert(
          "Please upload a product asset image node first.",
          "error"
        );

        return;
      }

      if (
        formData.isFeaturedBanner
      ) {
        const hasExistingBanner =
          products.some(
            (p) =>
              p.isFeaturedBanner &&
              p.id !== editingId
          );

        if (hasExistingBanner) {
          showAlert(
            "⚠️ একটি Featured Banner অলরেডি সচল আছে! দয়া করে সেটি বন্ধ করে সাবমিট করুন।",
            "error"
          );

          return;
        }
      }

      try {
        setLoading(true);

        await updateDoc(
          doc(
            db,
            "products",
            editingId
          ),
          {
            name: formData.name,
            price: Number(
              formData.price
            ),
            category:
              formData.category,
            image: formData.image,
            inStock:
              formData.inStock,
            badge:
              formData.badge ||
              "New",
            isNewArrival:
              formData.isNewArrival,
            isFeaturedBanner:
              formData.isFeaturedBanner,
          }
        );

        showAlert(
          "✨ Product Asset Specs Synchronized Successfully!",
          "success"
        );

        setEditingId(null);

        setFormData(initialFormData);
      } catch (error) {
        showAlert(
          `Sync Updates Interrupted: ${error.message}`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#060504] text-zinc-100 lg:pl-64 antialiased">
      <AdminSidebar />

      <main className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pt-24 lg:pt-10">
        <header className="mb-10 border-b border-[#1C1A17] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-light uppercase tracking-widest text-zinc-100 font-serif">
              Product Portfolio Manager
            </h1>

            <p className="text-xs text-zinc-500 tracking-wider mt-1">
              Connected Live with Firebase
              Cloud.
            </p>
          </div>

          <label className="cursor-pointer text-xs uppercase tracking-widest bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-2.5 px-4 rounded transition active:scale-95">
            {bulkUploading
              ? "Uploading Sync..."
              : "Import Excel Matrix"}

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={
                handleBulkExcelUpload
              }
              className="hidden"
              disabled={bulkUploading}
            />
          </label>
        </header>

        {/* FORM NODE UTILITY */}
        <div className="grid grid-cols-1 gap-10">
          <div className="bg-[#0B0A09] border border-[#1C1A17] p-6 sm:p-8 rounded h-fit">
            <h2 className="text-sm uppercase tracking-widest text-zinc-400 font-semibold mb-6 border-b border-zinc-900 pb-2">
              {editingId
                ? "✨ Edit Asset Metrics"
                : "➕ Product Entry System"}
            </h2>

            <form
              className="space-y-4"
              onSubmit={
                editingId
                  ? handleUpdateSubmit
                  : handleSubmit
              }
            >
              {/* NAME */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                  required
                  placeholder="Enter product name..."
                  className="w-full bg-[#12110F] border border-zinc-800 rounded p-3 text-zinc-200"
                />
              </div>

              {/* PRICE & CATEGORY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    Base Price (BDT)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={
                      handleInputChange
                    }
                    required
                    className="w-full bg-[#12110F] border border-zinc-800 rounded p-3 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    Category Stack
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={
                      handleInputChange
                    }
                    className="w-full bg-[#12110F] border border-zinc-800 rounded p-3 text-zinc-200"
                  >
                    <option value="three-piece">
                      Three-Piece
                    </option>

                    <option value="kurti">
                      Kurti
                    </option>

                    <option value="saree">
                      Saree
                    </option>

                    <option value="unstitched">
                      Unstitched
                    </option>
                  </select>
                </div>
              </div>

              {/* BADGE */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Custom Badge Tag
                </label>

                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={
                    handleInputChange
                  }
                  placeholder="New / Hot"
                  className="w-full bg-[#12110F] border border-zinc-800 rounded p-3 text-zinc-200"
                />
              </div>

              {/* IMAGE */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Media Image
                </label>

                {formData.image ? (
                  <div className="space-y-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border border-zinc-800"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setFormData(
                          (
                            prev
                          ) => ({
                            ...prev,
                            image: "",
                          })
                        )
                      }
                      className="text-[11px] uppercase tracking-wider text-red-400 hover:underline"
                    >
                      Purge & Map New
                      Image Asset
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full border border-dashed border-zinc-700 rounded p-6 cursor-pointer hover:border-zinc-500 transition">
                    <span className="text-xs uppercase tracking-wider text-zinc-400">
                      {uploadingImage
                        ? "⚡ Core Syncing Media Matrix..."
                        : "📸 Cloudinary Secure File Dropzone"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageFileChange
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* FLAGS */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={
                      formData.inStock
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                  Available In Stock
                </label>

                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={
                      formData.isNewArrival
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                  Mark New Collection
                  Pipeline
                </label>

                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="isFeaturedBanner"
                    checked={
                      formData.isFeaturedBanner
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                  Deploy as Master Hero
                  Feature Showcase
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingImage
                  }
                  className="flex-1 text-center bg-zinc-100 hover:bg-zinc-200 text-black font-semibold py-3.5 rounded text-xs uppercase tracking-widest transition active:scale-[0.99] disabled:opacity-40"
                >
                  {loading
                    ? "Processing Sync Node..."
                    : editingId
                    ? "Save Catalog Updates"
                    : "Deploy Component Item"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(
                        null
                      );

                      setFormData(
                        initialFormData
                      );
                    }}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-5 rounded text-xs uppercase tracking-wider hover:bg-zinc-800"
                  >
                    Abort Changes
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* PRODUCTS */}
          <div>
            <h2 className="text-sm uppercase tracking-widest text-zinc-400 font-semibold mb-6">
              Live Vault Registry Data (
              {products.length} Units Map)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <div className="text-zinc-500 text-sm">
                  No core items recorded
                  inside live asset
                  registry node.
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-[#0B0A09] border ${
                      editingId ===
                      product.id
                        ? "border-zinc-400 ring-1 ring-zinc-400"
                        : "border-[#1C1A17]"
                    } rounded-2xl p-4 relative overflow-hidden backdrop-blur-md transition active:scale-[0.99]`}
                  >
                    <div className="relative w-full h-64 rounded-xl overflow-hidden mb-4">
                      <img
                        src={
                          product.image ||
                          "https://placehold.co/600x600"
                        }
                        alt={
                          product.name
                        }
                        className="w-full h-full object-cover"
                      />

                      {!product.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded">
                          SOLD OUT
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs uppercase text-zinc-500">
                          {
                            product.category
                          }
                        </span>

                        {product.badge && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                            {
                              product.badge
                            }
                          </span>
                        )}

                        {product.isFeaturedBanner && (
                          <span className="text-[10px] bg-amber-500 text-black px-2 py-1 rounded">
                            ⚡ Featured
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-zinc-100">
                        {product.name}
                      </h3>

                      <p className="text-zinc-300">
                        ৳
                        {Number(
                          product.price
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() =>
                          toggleStock(
                            product.id,
                            product.inStock
                          )
                        }
                        className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                          product.inStock
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                        }`}
                      >
                        {product.inStock
                          ? "Active"
                          : "OOS"}
                      </button>

                      <button
                        onClick={() =>
                          toggleFeaturedBanner(
                            product.id,
                            product.isFeaturedBanner
                          )
                        }
                        className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                          product.isFeaturedBanner
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800"
                        }`}
                      >
                        {product.isFeaturedBanner
                          ? "Remove Banner"
                          : "Set Banner"}
                      </button>

                      <button
                        onClick={() =>
                          handleEditClick(
                            product
                          )
                        }
                        className="p-2 bg-[#12110F] border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl transition active:scale-90 text-xs"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                        className="p-2 bg-[#12110F] border border-red-950/40 text-red-400/80 hover:text-red-400 rounded-xl transition active:scale-90 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}