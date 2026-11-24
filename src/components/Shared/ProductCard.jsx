"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Eye, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductThumbnail } from "@/utils/productImage";

export default function ProductCard({ product, onOpenQuickView }) {
    const router = useRouter();
    const { addToCart, setBuyNowItem } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    if (!product) return null;

    const isWishlisted = isInWishlist(product.id);

    const isVariantProduct = product.productType === "variant" && Array.isArray(product.productVariants) && product.productVariants.length > 0;

    // Stock availability calculation
    const isPreOrder = String(product.stockStatus || "").toUpperCase() === "PRE_ORDER";
    const isExplicitOutOfStock = String(product.stockStatus || "").toUpperCase() === "OUT_OF_STOCK";

    const isOutOfStock = (() => {
        // If product status is explicitly false or inactive
        if (product.status === false || product.status === 0) return true;
        // If explicitly marked as OUT_OF_STOCK in admin
        if (isExplicitOutOfStock) return true;
        // If PRE_ORDER, it is never out of stock
        if (isPreOrder) return false;

        // If trackQuantity is false (default), don't block stock by quantity
        if (product.trackQuantity === false) return false;

        if (isVariantProduct) {
            // Check if every variant is 0 or negative quantity
            return product.productVariants.every(v => {
                const qty = parseInt(v.quantity ?? v.stockQuantity, 10);
                return isNaN(qty) || qty <= 0;
            });
        }

        const qty = parseInt(product.quantity ?? product.stockQuantity, 10);
        return isNaN(qty) || qty <= 0;
    })();

    // Image logic
    const displayImage = product.images?.[0] || 
        product.productVariants?.[0]?.image || 
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

    const hoverImage = product.images?.[1] || product.productVariants?.[1]?.image || null;

    // Price calculation
    // Single product pricing
    const sellingPrice = parseFloat(product.price) || 0;
    const hasExplicitRegularPrice = product.regularPrice != null && product.regularPrice !== '' && parseFloat(product.regularPrice) > 0;
    const regularPrice = hasExplicitRegularPrice ? parseFloat(product.regularPrice) : sellingPrice;

    // Campaign or legacy discount fallback
    const campaignDiscountValue = parseFloat(product.campaignInfo?.discountValue) || 0;
    const discountValue = parseFloat(product.discountValue) || campaignDiscountValue || 0;

    const calcDiscount = (basePrice) => {
        // If there's an active campaign
        if (campaignDiscountValue > 0) {
            if (product.campaignInfo?.discountType === "Fixed") {
                return Math.max(0, basePrice - campaignDiscountValue);
            }
            const discountAmt = (basePrice * campaignDiscountValue) / 100;
            const maxDiscount = product.campaignInfo?.maxDiscountAmount ? parseFloat(product.campaignInfo.maxDiscountAmount) : null;
            return Math.max(0, basePrice - (maxDiscount && discountAmt > maxDiscount ? maxDiscount : discountAmt));
        }

        // If product has explicit regularPrice higher than sellingPrice, product.price IS already the discounted selling price
        if (hasExplicitRegularPrice && regularPrice > sellingPrice) {
            return sellingPrice;
        }

        if (discountValue <= 0) return basePrice;
        if (product.discountType === "Fixed") {
            return Math.max(0, basePrice - discountValue);
        }
        const discountAmt = (basePrice * discountValue) / 100;
        return Math.max(0, basePrice - discountAmt);
    };

    // If it's a variant product, calculate price ranges across all variants
    const variantSellingPrices = isVariantProduct
        ? (product.productVariants || []).map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0)
        : [];
    const variantRegularPrices = isVariantProduct
        ? (product.productVariants || []).map(v => v.regularPrice ? parseFloat(v.regularPrice) : parseFloat(v.price)).filter(p => !isNaN(p) && p > 0)
        : [];

    const minSelling = variantSellingPrices.length > 0 ? Math.min(...variantSellingPrices) : (hasExplicitRegularPrice && regularPrice > sellingPrice ? sellingPrice : calcDiscount(sellingPrice));
    const maxSelling = variantSellingPrices.length > 0 ? Math.max(...variantSellingPrices) : (hasExplicitRegularPrice && regularPrice > sellingPrice ? sellingPrice : calcDiscount(sellingPrice));

    const minRegular = variantRegularPrices.length > 0 ? Math.min(...variantRegularPrices) : (regularPrice > sellingPrice ? regularPrice : (discountValue > 0 ? regularPrice : 0));
    const maxRegular = variantRegularPrices.length > 0 ? Math.max(...variantRegularPrices) : (regularPrice > sellingPrice ? regularPrice : (discountValue > 0 ? regularPrice : 0));

    const discountedPrice = minSelling;
    const originalPrice = maxRegular;

    const hasPriceRange = isVariantProduct && variantSellingPrices.length > 1 && minSelling !== maxSelling;
    const hasDiscount = isVariantProduct
        ? (variantSellingPrices.some((sp, idx) => (variantRegularPrices[idx] || sp) > sp) || (regularPrice > discountedPrice) || (discountValue > 0))
        : (regularPrice > discountedPrice || discountValue > 0);

    const discountPercentage = (() => {
        if (isVariantProduct) {
            // 1. Find max discount percentage among variants that have explicit regularPrice
            let maxPct = 0;
            (product.productVariants || []).forEach(v => {
                const sp = parseFloat(v.price) || 0;
                const rp = v.regularPrice ? parseFloat(v.regularPrice) : (regularPrice > sp ? regularPrice : sp);
                if (rp > sp && sp > 0) {
                    const pct = Math.round(((rp - sp) / rp) * 100);
                    if (pct > maxPct) maxPct = pct;
                }
            });
            if (maxPct > 0) return maxPct;

            // 2. Fallback to product-level regularPrice vs discountedPrice or discountValue
            if (originalPrice > discountedPrice && originalPrice > 0) {
                return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
            }
            if (discountValue > 0) {
                return product.discountType === "Fixed"
                    ? Math.round((discountValue / (originalPrice || discountedPrice || 1)) * 100)
                    : Math.round(discountValue);
            }
            return 0;
        }
        if (originalPrice > discountedPrice && originalPrice > 0) {
            return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
        }
        if (discountValue > 0) {
            return product.discountType === "Fixed"
                ? Math.round((discountValue / (originalPrice || discountedPrice || 1)) * 100)
                : Math.round(discountValue);
        }
        return 0;
    })();

    const isNew = product.isNew || product.newArrival || (() => {
        if (!product.createdAt) return false;
        const diffDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 45;
    })();

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            const targetVariant = isVariantProduct
                ? (product.productVariants?.find(v => v.isDefault) || product.productVariants?.[0] || null)
                : null;

            const finalImg = targetVariant?.image || displayImage || product.image;

            addToWishlist({
                ...product,
                image: finalImg,
                images: [finalImg, ...(product.images || [])].filter(Boolean),
                price: discountedPrice,
                originalPrice: originalPrice,
                discountPrice: discountedPrice,
                discountAmount: Math.max(0, originalPrice - discountedPrice),
                discountValue: discountValue,
                discountType: product.discountType || product.campaignInfo?.discountType || "Percentage",
                ...(targetVariant && {
                    variantId: targetVariant.id,
                    variantAttributes: targetVariant.attributes,
                    variantType: targetVariant.attributes ? Object.entries(targetVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ") : null,
                    productType: "variant",
                }),
            });
        }
    };

    // Add to cart handler
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) {
            toast.error("This product is currently out of stock");
            return;
        }
        if (isVariantProduct) {
            onOpenQuickView && onOpenQuickView(product);
            return;
        }
        const item = {
            ...product,
            price: discountedPrice,
            originalPrice: originalPrice,
            discountAmount: Math.max(0, originalPrice - discountedPrice),
            discountValue: discountValue,
            discountType: product.discountType || product.campaignInfo?.discountType || "Percentage",
            campaignName: product.campaignInfo?.campaignName || null,
            campaignId: product.campaignInfo?.id || product.campaignId || null,
        };
        addToCart(item, 1);
    };

    // Quick View handler
    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenQuickView && onOpenQuickView(product);
    };

    // Buy Now handler
    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) {
            toast.error("This product is currently out of stock");
            return;
        }

        let targetVariant = null;
        if (isVariantProduct) {
            targetVariant = product.productVariants?.find(v => v.isDefault) || product.productVariants?.[0] || null;
        }

        const baseVariantPrice = isVariantProduct
            ? (targetVariant?.regularPrice ? parseFloat(targetVariant.regularPrice) : (targetVariant?.price ? parseFloat(targetVariant.price) : originalPrice))
            : originalPrice;
        const vFinalPrice = isVariantProduct
            ? (targetVariant?.price ? parseFloat(targetVariant.price) : discountedPrice)
            : discountedPrice;
        const vDiscAmt = Math.max(0, baseVariantPrice - vFinalPrice);

        const item = {
            ...product,
            price: vFinalPrice,
            originalPrice: baseVariantPrice,
            discountAmount: vDiscAmt,
            discountValue: discountValue,
            discountType: product.discountType || product.campaignInfo?.discountType || "Percentage",
            campaignName: product.campaignInfo?.campaignName || null,
            campaignId: product.campaignInfo?.id || product.campaignId || null,
            ...(targetVariant && {
                variantId: targetVariant.id,
                variantAttributes: targetVariant.attributes || targetVariant.variantAttributes || null,
                variantType: targetVariant.title || targetVariant.name || null,
                sku: targetVariant.sku || product.sku,
                image: targetVariant.image || displayImage,
                images: targetVariant.image ? [targetVariant.image] : (product.images || [displayImage]),
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
        <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden relative">
            {/* 1. Top Image Container (NO PADDING as requested) */}
            <div className="relative w-full aspect-square bg-[#F8F9FA] overflow-hidden">
                <Link href={`/product/${product.slug || product.id}`} className="block w-full h-full relative">
                    <Image
                        src={displayImage}
                        alt={product.productName || "Product"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${hoverImage ? "group-hover:opacity-0" : ""}`}
                    />
                    {hoverImage && (
                        <Image
                            src={hoverImage}
                            alt={product.productName || "Product"}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                        />
                    )}
                </Link>

                {/* Badges: Discount percentage top-left */}
                {discountPercentage > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-[#E11D48] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs pointer-events-none z-10">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Wishlist Heart button top-right */}
                <button
                    type="button"
                    onClick={toggleWishlist}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#E11D48] transition-all cursor-pointer z-10"
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={14} className={isWishlisted ? "fill-[#E11D48] text-[#E11D48]" : ""} />
                </button>

                {/* Hover Action Bar inside image area: [ 🛒 Add to Cart ] + [ 👁 ] matching screenshot */}
                <div className="absolute inset-x-2.5 bottom-2.5 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all backdrop-blur-xs active:scale-95 ${
                            isOutOfStock 
                                ? "bg-slate-400/90 text-white cursor-not-allowed" 
                                : "bg-[#0F172A]/95 hover:bg-black text-white cursor-pointer"
                        }`}
                    >
                        <ShoppingCart size={14} />
                        <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleQuickView}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-black shadow-md flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Quick View"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            </div>

            {/* 2. Product Information Section */}
            <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                <div className="space-y-1.5">
                    {/* Product Name (Strict max 2 lines with ellipsis truncation) */}
                    <Link href={`/product/${product.slug || product.id}`} className="block group-hover:text-primary transition-colors">
                        <h3 
                            className="text-sm font-medium text-slate-800 line-clamp-2 leading-[1.35] min-h-[2.7em] max-h-[2.7em] overflow-hidden" 
                            title={product.productName}
                        >
                            {product.productName}
                        </h3>
                    </Link>

                    {/* Pricing */}
                    <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5">
                        {hasPriceRange ? (
                            <span className="text-md font-bold text-slate-900 flex items-center gap-1">
                                <span><span className="font-black">৳</span>{minSelling.toLocaleString()}</span>
                                <span className="text-xs font-semibold text-slate-400">-</span>
                                <span><span className="font-black">৳</span>{maxSelling.toLocaleString()}</span>
                            </span>
                        ) : (
                            <span className="text-md text-slate-900">
                                <span className="font-black">৳</span>
                                <span className="font-bold">{minSelling.toLocaleString()}</span>
                            </span>
                        )}

                        {hasDiscount && (
                            <>
                                {hasPriceRange ? (
                                    (maxRegular > minSelling) && (
                                        <span className="text-[11.5px] text-slate-400 line-through">
                                             ৳{minRegular.toLocaleString()} {minRegular !== maxRegular ? `- ৳${maxRegular.toLocaleString()}` : ''}
                                        </span>
                                    )
                                ) : (
                                    maxRegular > minSelling && (
                                        <span className="text-[11.5px] text-slate-400 line-through">
                                            ৳{maxRegular.toLocaleString()}
                                        </span>
                                    )
                                )}
                                {discountPercentage > 0 && (
                                    <span className="text-[10px] font-bold text-[#cf1b42] bg-rose-50 px-1 py-0.5 rounded">
                                        -{discountPercentage}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center justify-between text-[11px]">
                        {isOutOfStock ? (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                                Out of Stock
                            </span>
                        ) : isPreOrder ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Pre-Order
                            </span>
                        ) : isNew ? (
                            <span className="text-[10px] font-semibold text-[#B88348] bg-[#F7EFE6] px-2 py-0.5 rounded-full">
                                New
                            </span>
                        ) : (
                            <span />
                        )}

                        {product.totalSold || product._totalSold ? (
                            <span className="text-[10px] text-slate-400">
                                {product.totalSold || product._totalSold} sold
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* 3. Bottom Action Bar (Cart Icon button on left + Buy Now button on right) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-2xs ${
                                isOutOfStock
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                                    : isPreOrder
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 cursor-pointer active:scale-95"
                                    : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 cursor-pointer active:scale-95"
                            }`}
                            title={isOutOfStock ? "Out of Stock" : isPreOrder ? "Pre-Order" : "Add to Cart"}
                        >
                            <ShoppingCart size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`flex-1 h-8 px-3 rounded-lg font-semibold text-xs sm:text-[12.5px] transition flex items-center justify-center gap-1.5 shadow-xs relative overflow-hidden ${
                                isOutOfStock
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                                    : isPreOrder
                                    ? "bg-amber-600 hover:bg-amber-700 active:scale-95 text-white cursor-pointer btn-shine"
                                    : "bg-primary hover:bg-primary-hover active:scale-95 text-white cursor-pointer btn-shine"
                            }`}
                        >
                            <ShoppingBag size={13} className="relative z-10" />
                            <span className="relative z-10">{isOutOfStock ? "Out of Stock" : isPreOrder ? "Pre-Order" : "Buy Now"}</span>
                        </button>
                    </div>

                    {/* Cash on Delivery notice removed */}
                </div>
            </div>
        </div>
    );
}