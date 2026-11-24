"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/Shared/Container";

export default function ShopCategorySection({ categories = [] }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const activeCategories = (categories || []).filter(c => c.status !== false);

    const checkScrollButtons = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener("resize", checkScrollButtons);
        return () => window.removeEventListener("resize", checkScrollButtons);
    }, [activeCategories.length]);

    const handleScroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
        setTimeout(checkScrollButtons, 350);
    };

    if (activeCategories.length === 0) return null;

    return (
        <motion.section 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="py-6 sm:py-8 bg-white border-b border-slate-100 font-sans"
        >
            <Container>
                {/* Header with Title and Scroll Controls */}
                <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                            <Sparkles size={12} className="text-primary" />
                            <span>EXPLORE BY AGE & PLAY</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Shop by Category
                        </h2>
                    </div>

                    {/* Scroll Arrows */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleScroll("left")}
                            disabled={!canScrollLeft}
                            className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all ${
                                canScrollLeft
                                    ? "bg-white text-slate-800 hover:bg-primary hover:text-white hover:border-primary shadow-xs cursor-pointer active:scale-95"
                                    : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                            }`}
                            aria-label="Previous categories"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => handleScroll("right")}
                            disabled={!canScrollRight}
                            className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all ${
                                canScrollRight
                                    ? "bg-white text-slate-800 hover:bg-primary hover:text-white hover:border-primary shadow-xs cursor-pointer active:scale-95"
                                    : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                            }`}
                            aria-label="Next categories"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Soft Glass/Pill Card Layout for Korean Skincare Aesthetics */}
                <div
                    ref={scrollRef}
                    onScroll={checkScrollButtons}
                    className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth hide-scrollbar py-1"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {activeCategories.map((category) => {
                        const fallbackImg = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80";
                        const imageUrl = category.image || fallbackImg;

                        return (
                            <Link
                                key={category.id}
                                href={`/product?category=${encodeURIComponent(category.name)}`}
                                className="group w-[125px] sm:w-[145px] md:w-[155px] shrink-0 bg-white hover:bg-[#FCF9F6] p-3.5 sm:p-4 rounded-2xl border border-[#EDE5DC] hover:border-primary/50 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                            >
                                {/* Circle Image with Warm Rose Accent */}
                                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 bg-[#FAF7F2] p-1.5 border border-[#F2ECE4] group-hover:border-primary/30 flex items-center justify-center transition-all duration-300">
                                    <Image
                                        src={imageUrl}
                                        alt={category.name}
                                        fill
                                        unoptimized
                                        sizes="100px"
                                        className="object-cover group-hover:scale-110 transition-transform duration-300 rounded-full"
                                    />
                                </div>
                                <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 w-full">
                                    {category.name}
                                </h3>
                                <span className="text-[10px] text-primary/80 font-medium mt-0.5 uppercase tracking-wide">
                                    Explore Step
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </Container>
        </motion.section>
    );
}
