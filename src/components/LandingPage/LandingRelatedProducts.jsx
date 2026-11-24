"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/variantHelpers";

export default function LandingRelatedProducts({
  relatedProducts = [],
  selectedRelatedItems = [],
  onToggleRelatedItem,
  onOrderClick,
}) {
  if (!Array.isArray(relatedProducts) || relatedProducts.length === 0) {
    return null;
  }

  const getProductImage = (prod) => {
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      return typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.url || "/placeholder.png";
    }
    if (typeof prod.images === "string" && prod.images.trim()) {
      try {
        const parsed = JSON.parse(prod.images);
        if (Array.isArray(parsed) && parsed[0]) {
          return typeof parsed[0] === "string" ? parsed[0] : parsed[0]?.url || "/placeholder.png";
        }
      } catch (_) {
        return prod.images;
      }
    }
    return prod.image || "/placeholder.png";
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-gradient-to-b from-white via-rose-50/20 to-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs sm:text-sm font-bold mb-3 border border-primary/20 shadow-2xs">
            <Sparkles size={15} className="animate-spin text-primary" style={{ animationDuration: "8s" }} />
            <span>একসাথে কিনুন - স্পেশাল সেভিংস</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-hind tracking-tight">
            সম্পর্কিত অন্যান্য আকর্ষণীয় পণ্য
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-hind mt-2">
            একই পার্সেল ডেলিভারিতে সাথে নিতে নিচে টিক দিন। কোনো অতিরিক্ত ডেলিভারি চার্জ ছাড়াই একসাথে পাবেন!
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {relatedProducts.map((prod) => {
            const isAdded = selectedRelatedItems.some((item) => item.product.id === prod.id);
            const sellingPrice = parseFloat(prod.salePrice || prod.price || 0);
            const regularPrice = prod.regularPrice ? parseFloat(prod.regularPrice) : sellingPrice;
            const hasDiscount = regularPrice > sellingPrice;
            const imgSrc = getProductImage(prod);

            return (
              <div
                key={prod.id}
                onClick={() => {
                  onToggleRelatedItem(prod);
                  if (!isAdded && typeof onOrderClick === "function") {
                    // Smoothly scroll down so user notices it added to checkout
                    onOrderClick();
                  }
                }}
                className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer select-none ${
                  isAdded
                    ? "border-primary bg-primary-light/40 shadow-lg ring-2 ring-primary/30 scale-[1.01]"
                    : "border-slate-200 hover:border-primary/40 hover:shadow-md bg-white"
                }`}
              >
                {/* Badge if added */}
                {isAdded && (
                  <div className="absolute top-3 right-3 z-10 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Check size={13} strokeWidth={3} />
                    <span>অর্ডারে যুক্ত</span>
                  </div>
                )}

                <div>
                  {/* Thumbnail */}
                  <div className="w-full h-44 sm:h-48 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative mb-4 flex items-center justify-center">
                    <Image
                      src={imgSrc}
                      alt={prod.productName || "Product"}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("http")}
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs font-hind">
                        -{Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)}% ছাড়
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2 font-hind">
                    {prod.productName}
                  </h3>
                </div>

                {/* Pricing & Toggle Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-extrabold text-primary font-hind">
                        ৳ {sellingPrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through font-hind">
                          ৳ {regularPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block font-hind">
                      ক্যাশ অন ডেলিভারি
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRelatedItem(prod);
                      if (!isAdded && typeof onOrderClick === "function") {
                        onOrderClick();
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isAdded
                        ? "bg-primary text-white shadow-primary/20 hover:bg-primary-hover"
                        : "bg-slate-100 text-slate-700 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>যোগ করা হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} strokeWidth={2.5} />
                        <span>অর্ডারে যোগ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
