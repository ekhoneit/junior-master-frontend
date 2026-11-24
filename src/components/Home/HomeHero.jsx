"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { getProductThumbnail } from "@/utils/productImage";
import { apiClient } from "@/lib/apiClient";

export default function HomeHero({ heroSliders: initialHeroSliders = [], featuredProducts = [] }) {
    const [heroSliders, setHeroSliders] = useState(initialHeroSliders);
    const [currentSlide, setCurrentSlide] = useState(0);

    // If SSR failed (e.g. server-to-server DNS block), fetch client-side as fallback!
    useEffect(() => {
        if (!initialHeroSliders || initialHeroSliders.length === 0) {
            apiClient("/api/hero-sliders")
                .then((res) => {
                    if (Array.isArray(res)) setHeroSliders(res);
                    else if (res?.data && Array.isArray(res.data)) setHeroSliders(res.data);
                })
                .catch((err) => console.warn("Client fallback hero-slider fetch:", err));
        } else {
            setHeroSliders(initialHeroSliders);
        }
    }, [initialHeroSliders]);

    // Sort sliders strictly by priority (asc)
    const sortedSliders = Array.isArray(heroSliders)
        ? [...heroSliders].sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0))
        : [];

    const hasCmsSliders = sortedSliders.length > 0;

    // Auto rotate if multiple sliders
    useEffect(() => {
        if (!hasCmsSliders || sortedSliders.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sortedSliders.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [hasCmsSliders, sortedSliders.length]);

    const activeSlide = hasCmsSliders ? sortedSliders[currentSlide] : null;

    // Check if CMS slider is text+product layout or purely a full-width cover graphic
    // If title has no letters (e.g. empty or symbol like "%"), treat as full-width cover graphic
    const cleanTitle = (activeSlide?.title || "").replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, "").trim();
    const isGraphicOnly = activeSlide && (!cleanTitle || (!activeSlide.title?.trim() && !activeSlide.sub_title?.trim()) || activeSlide.title?.trim() === "%");

    return (
        <section className="w-full py-4 sm:py-6 bg-white font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Main Hero Banner Container */}
                <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#EFE8DF] bg-gradient-to-br from-[#2D1B1E] via-[#3D2528] to-[#1E1113] min-h-[380px] sm:min-h-[320px] md:aspect-[2.68/1] flex items-center">
                    
                    {/* CASE 1: CMS Slide is just a full cover image */}
                    {isGraphicOnly ? (
                        <div className="relative w-full h-[220px] sm:h-[300px] md:h-full min-h-[220px] sm:min-h-[280px]">
                            <Image
                                src={activeSlide.image || "/glow-banner.jpg"}
                                alt="Glow Korean Beauty Banner"
                                fill
                                priority
                                className="object-cover object-center"
                                sizes="(max-width: 1280px) 100vw, 1280px"
                            />
                            {activeSlide.link && (
                                <Link
                                    href={activeSlide.link}
                                    className="absolute inset-0 z-10"
                                    aria-label="Shop Banner"
                                />
                            )}
                        </div>
                    ) : hasCmsSliders && activeSlide ? (
                        /* CASE 2: CMS Slide has Text + Product Image + Button */
                        <div className="relative z-10 w-full p-5 sm:p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 pb-12 sm:pb-8">
                            {/* Ambient Soft Glows */}
                            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#D48B80]/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#B88348]/20 rounded-full blur-3xl pointer-events-none" />

                            {/* Left Text Content */}
                            <div className="w-full md:w-3/5 text-white z-10 text-center md:text-left">
                                {activeSlide.badge && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#F8E7DE] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-2.5 sm:mb-4">
                                        <Sparkles size={11} className="text-[#D48B80]" />
                                        <span>{activeSlide.badge}</span>
                                    </div>
                                )}
                                
                                <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-2 sm:mb-3">
                                    {activeSlide.title}
                                </h1>
                                
                                {activeSlide.sub_title && (
                                    <p className="text-xs sm:text-sm md:text-base text-[#E5D7D0] max-w-xl mx-auto md:mx-0 mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
                                        {activeSlide.sub_title}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                                    <Link
                                        href={activeSlide.link || (activeSlide.productId ? `/product/${activeSlide.productId}` : "/product")}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-[#D48B80] to-[#B88348] hover:from-[#C47A70] hover:to-[#A77338] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                                    >
                                        <span>Shop Now</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                    {activeSlide.categoryLink && (
                                        <Link
                                            href={activeSlide.categoryLink}
                                            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-colors border border-white/10"
                                        >
                                            Browse Categories
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Right Product Image Showcase (1:1 Aspect Ratio with Rounded Corners) */}
                            <div className="w-full md:w-2/5 flex justify-center items-center z-10">
                                <div className="relative aspect-square w-48 sm:w-64 md:w-80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center">
                                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
                                        <Image
                                            src={activeSlide.image || (activeSlide.product ? getProductThumbnail(activeSlide.product) : "/glow-banner.jpg")}
                                            alt={activeSlide.title || "Featured Product"}
                                            fill
                                            sizes="(max-width: 768px) 200px, 340px"
                                            className="object-cover rounded-xl sm:rounded-2xl"
                                        />
                                    </div>
                                    {activeSlide.product?.price && (
                                        <div className="absolute -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 bg-white text-slate-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-xl border border-slate-100 flex flex-col items-center z-20">
                                            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Special Price</span>
                                            <span className="text-xs sm:text-sm font-black text-primary">৳{activeSlide.product.price}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* CASE 3: Default Curated Korean Luxury Full Banner */
                        <div className="relative w-full h-[220px] sm:h-[300px] md:h-full min-h-[220px] sm:min-h-[280px]">
                            <Image
                                src="/glow-banner.jpg"
                                alt="Glow Korean Beauty Banner"
                                fill
                                priority
                                className="object-cover object-center"
                                sizes="(max-width: 1280px) 100vw, 1280px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/5 pointer-events-none" />
                            <Link
                                href="/product"
                                className="absolute inset-0 z-10"
                                aria-label="Shop Glow Korean Beauty"
                            />
                        </div>
                    )}

                    {/* Left/Right Slider Controls if multiple CMS sliders exist */}
                    {hasCmsSliders && heroSliders.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSliders.length) % heroSliders.length)}
                                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSliders.length)}
                                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95"
                                aria-label="Next slide"
                            >
                                <ChevronRight size={20} />
                            </button>
                            {/* Slide Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                {heroSliders.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 rounded-full transition-all ${
                                            idx === currentSlide ? "w-6 bg-white" : "w-2 bg-white/40"
                                        }`}
                                        aria-label={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Junior Master Kids Value Propositions Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
                    <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-red-50/50 hover:bg-red-50 rounded-xl sm:rounded-2xl border border-red-100 shadow-2xs transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Child Safe & Non-Toxic</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500">100% Certified Eco-Friendly</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-blue-50/50 hover:bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-100 shadow-2xs transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">STEM & Brain Booster</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500">Early Learning Focus</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-amber-50/50 hover:bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100 shadow-2xs transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Award size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Premium Quality</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500">Durable & Kid-Tested</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-2xs transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <HeartHandshake size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Nationwide COD</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500">Cash on delivery 64 districts</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
