"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Eye, Heart, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductThumbnail } from "@/utils/productImage";

export default function CollectionProductCard({ product, collectionName = "", onOpenQuickView }) {
    const router = useRouter();
    const { addToCart, setBuyNowItem } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    if (!product) return null;

    const isWishlisted = isInWishlist(product.id);
    const sellingPrice = parseFloat(product.price) || 0;
    const regularPrice = parseFloat(product.regularPrice) || sellingPrice;
    const hasDiscount = regularPrice > sellingPrice;
    const discountPct = hasDiscount ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) : 0;

    const fallbackImg = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80";
    const displayImg = getProductThumbnail(product, fallbackImg);

    const isVariantProduct = product.productType === "variant" && Array.isArray(product.productVariants) && product.productVariants.length > 0;

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();

        let targetVariant = null;
        if (isVariantProduct) {
            targetVariant = product.productVariants?.find(v => v.isDefault) || product.productVariants?.[0] || null;
        }

        const baseVariantPrice = isVariantProduct
            ? (targetVariant?.regularPrice ? parseFloat(targetVariant.regularPrice) : (targetVariant?.price ? parseFloat(targetVariant.price) : regularPrice))
            : regularPrice;
        const vFinalPrice = isVariantProduct
            ? (targetVariant?.price ? parseFloat(targetVariant.price) : sellingPrice)
            : sellingPrice;
        const vDiscAmt = Math.max(0, baseVariantPrice - vFinalPrice);

        const item = {
            ...product,
            price: vFinalPrice,
            originalPrice: baseVariantPrice,
            discountAmount: vDiscAmt,
            discountValue: product.discountValue || 0,
            discountType: product.discountType || "Percentage",
            ...(targetVariant && {
                variantId: targetVariant.id,
                variantAttributes: targetVariant.attributes || targetVariant.variantAttributes || null,
                variantType: targetVariant.title || targetVariant.name || null,
                sku: targetVariant.sku || product.sku,
                image: targetVariant.image || displayImg,
                images: targetVariant.image ? [targetVariant.image] : (product.images || [displayImg]),
                stockQuantity: targetVariant.stockQuantity ?? targetVariant.quantity ?? product.stockQuantity ?? null,
                productVariants: product.productVariants || [],
                productType: "variant",
            }),
        };

        setBuyNowItem(item, 1, targetVariant?.id || null);
        toast.success("Proceeding to checkout...");
        router.push("/checkout?buyNow=true");
    };

    return (
        <div className="group relative bg-white rounded-3xl p-3 sm:p-3.5 border border-[#EDE5DC] hover:border-[#D48B80]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            
            {/* Top Image Showcase */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] p-2 flex items-center justify-center">
                
                {/* Brand / Collection Pill */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                    {hasDiscount && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-[#D48B80] to-[#B88348] text-white shadow-xs">
                            -{discountPct}% OFF
                        </span>
                    )}
                    {product.brand?.name && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200/60 shadow-2xs">
                            {product.brand.name}
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-2xs transition-all active:scale-90"
                    aria-label="Wishlist"
                >
                    <Heart size={15} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>

                {/* Product Image (1:1 Aspect ratio with rounded corners and edge fit) */}
                <Link href={`/product/${product.slug || product.id}`} className="relative w-full h-full block rounded-xl overflow-hidden">
                    <Image
                        src={displayImg}
                        alt={product.productName}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>

                {/* Quick view hover action */}
                {onOpenQuickView && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenQuickView(product);
                        }}
                        className="absolute bottom-2 inset-x-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white flex items-center justify-center gap-1.5"
                    >
                        <Eye size={13} />
                        <span>Quick Look</span>
                    </button>
                )}
            </div>

            {/* Bottom Content */}
            <div className="pt-3 flex flex-col flex-1 justify-between">
                <div>
                    <span className="text-[10px] font-semibold text-[#B88348] uppercase tracking-wider block mb-0.5">
                        {product.subCategory?.category?.name || "K-Beauty Essential"}
                    </span>
                    <Link
                        href={`/product/${product.slug || product.id}`}
                        className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                        title={product.productName}
                    >
                        {product.productName}
                    </Link>
                </div>

                {/* Price & Action Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex sm:flex-col items-baseline sm:items-start gap-1.5 sm:gap-0">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                            ৳{sellingPrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                            <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                                ৳{regularPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleBuyNow}
                        className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D48B80] to-[#B88348] hover:from-[#C47A70] hover:to-[#A77338] text-white text-[11px] font-bold shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                        <ShoppingBag size={12} />
                        <span>Buy Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
