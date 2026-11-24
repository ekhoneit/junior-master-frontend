"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Container from "@/components/Shared/Container";
import ProductCard from "@/components/Shared/ProductCard";
import QuickViewModal from "@/components/Shared/QuickViewModal";
import { motion } from "framer-motion";

export default function NewArrivalSection({ products = [] }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!products || products.length === 0) return null;

    const displayProducts = products.slice(0, 15);

    const checkScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Left arrow only shows if scrolled more than 10px inside
        setCanScrollLeft(scrollLeft > 10);
        // Right arrow shows if there's more content ahead
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", checkScroll, { passive: true });
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            if (el) el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, displayProducts]);

    // Auto scroll carousel every 4.5 seconds when not hovered
    useEffect(() => {
        if (isHovered || displayProducts.length <= 4) return;
        const interval = setInterval(() => {
            if (!scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 15) {
                // Loop back to start smoothly
                scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                scrollRef.current.scrollBy({ left: 290, behavior: "smooth" });
            }
        }, 4500);

        return () => clearInterval(interval);
    }, [isHovered, displayProducts.length]);

    const handleScroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const handleOpenQuickView = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="py-8 sm:py-10 bg-white border-b border-slate-100 font-sans">
            <Container>
                {/* Header with Title and Left/Right Buttons */}
                <div className="flex items-end justify-between gap-3 mb-5 sm:mb-6">
                    <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                            <Sparkles size={13} className="text-primary animate-pulse" />
                            <span>JUST DROPPED IN KOREA</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            New Arrivals
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Discover freshly landed authentic skincare & cosmetics from Seoul.
                        </p>
                    </div>

                    {/* Navigation Buttons: Left arrow hides at the very start */}
                    <div className="flex items-center gap-2">
                        {canScrollLeft && (
                            <button
                                type="button"
                                onClick={() => handleScroll("left")}
                                className="w-9 h-9 rounded-full border border-[#E8DFD8] bg-white hover:bg-[#FAF7F2] text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:border-primary active:scale-95"
                                aria-label="Previous products"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => handleScroll("right")}
                            disabled={!canScrollRight}
                            className={`w-9 h-9 rounded-full border border-[#E8DFD8] bg-white hover:bg-[#FAF7F2] text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:border-primary active:scale-95 ${
                                !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            aria-label="Next products"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* 1 Row Carousel with Auto-scroll and smooth hide-scrollbar */}
                <div
                    ref={scrollRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth hide-scrollbar py-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {displayProducts.map((product) => (
                        <div
                            key={product.id}
                            className="w-[200px] sm:w-[230px] md:w-[245px] shrink-0 flex flex-col"
                        >
                            <ProductCard
                                product={product}
                                onOpenQuickView={handleOpenQuickView}
                            />
                        </div>
                    ))}
                </div>
            </Container>

            {/* Quick View Variant Modal */}
            <QuickViewModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
            />
        </motion.section>
    );
}
