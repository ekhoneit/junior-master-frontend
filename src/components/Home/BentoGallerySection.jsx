"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import Container from "@/components/Shared/Container";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/apiClient";

export default function BentoGallerySection({ bentoCards: initialBentoCards = [] }) {
    const [bentoCards, setBentoCards] = useState(initialBentoCards);

    // If SSR failed (e.g. server-to-server DNS loopback), fetch client-side as fallback!
    useEffect(() => {
        if (!initialBentoCards || initialBentoCards.length === 0) {
            apiClient("/api/bento-gallery")
                .then((res) => {
                    if (Array.isArray(res)) setBentoCards(res);
                    else if (res?.data && Array.isArray(res.data)) setBentoCards(res.data);
                })
                .catch((err) => console.warn("Client fallback bento-gallery fetch:", err));
        } else {
            setBentoCards(initialBentoCards);
        }
    }, [initialBentoCards]);

    if (!bentoCards || bentoCards.length === 0) return null;

    // Filter active cards and sort by priority (asc) so ordering is strictly respected
    const activeCards = bentoCards
        .filter(c => c.image && c.status !== false)
        .sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0));

    if (activeCards.length === 0) return null;

    return (
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="py-8 sm:py-12 bg-white border-b border-slate-100 font-sans">
            <Container>
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                        <Sparkles size={13} className="text-primary" />
                        <span>KIDS WONDER & INSPIRATION</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Junior Master Discovery Gallery
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Spark creativity, problem-solving and joy with our curated educational collection.
                    </p>
                </div>

                {/* Perfect 5-card Bento Layout (No empty gaps): 
                    - Desktop: 12-column grid.
                      Row 1: Card 0 (7 cols), Card 1 (5 cols)
                      Row 2: Card 2 (4 cols), Card 3 (4 cols), Card 4 (4 cols)
                */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
                    {/* Item 0 (Large Feature on Left) */}
                    {activeCards[0] && (
                        <Link
                            href={activeCards[0].link || "/product"}
                            className="group relative md:col-span-7 h-[260px] sm:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EDE5DC] shadow-xs hover:shadow-xl transition-all duration-300 bg-stone-100"
                        >
                            <Image
                                src={activeCards[0].image}
                                alt={activeCards[0].title || "K-Beauty"}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 60vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white z-10 flex flex-col justify-end">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-white w-fit mb-2">
                                    {activeCards[0].category || "Routine"}
                                </span>
                                <h3 className="text-base sm:text-xl font-bold text-white drop-shadow-sm group-hover:text-[#F7D8CE] transition-colors">
                                    {activeCards[0].title}
                                </h3>
                                {activeCards[0].sub_title && (
                                    <p className="text-xs sm:text-sm text-[#E5D7D0] mt-1 line-clamp-1">
                                        {activeCards[0].sub_title}
                                    </p>
                                )}
                            </div>
                        </Link>
                    )}

                    {/* Item 1 (Wide Feature on Right) */}
                    {activeCards[1] && (
                        <Link
                            href={activeCards[1].link || "/product"}
                            className="group relative md:col-span-5 h-[260px] sm:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EDE5DC] shadow-xs hover:shadow-xl transition-all duration-300 bg-stone-100"
                        >
                            <Image
                                src={activeCards[1].image}
                                alt={activeCards[1].title || "K-Beauty"}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white z-10 flex flex-col justify-end">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-white w-fit mb-2">
                                    {activeCards[1].category || "Trend"}
                                </span>
                                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-sm group-hover:text-[#F7D8CE] transition-colors">
                                    {activeCards[1].title}
                                </h3>
                                {activeCards[1].sub_title && (
                                    <p className="text-xs text-[#E5D7D0] mt-1 line-clamp-1">
                                        {activeCards[1].sub_title}
                                    </p>
                                )}
                            </div>
                        </Link>
                    )}

                    {/* Row 2: Items 2, 3, 4 (3 equal balanced cards: 4 cols each) */}
                    {activeCards.slice(2, 5).map((card, idx) => (
                        <Link
                            key={card.id || idx}
                            href={card.link || "/product"}
                            className="group relative md:col-span-4 h-[220px] sm:h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EDE5DC] shadow-xs hover:shadow-xl transition-all duration-300 bg-stone-100"
                        >
                            <Image
                                src={card.image}
                                alt={card.title || "K-Beauty"}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white z-10 flex flex-col justify-end">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-white w-fit mb-1.5">
                                    {card.category || "Care"}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-sm group-hover:text-[#F7D8CE] transition-colors line-clamp-1">
                                    {card.title}
                                </h3>
                                {card.sub_title && (
                                    <p className="text-xs text-[#E5D7D0] mt-0.5 line-clamp-1">
                                        {card.sub_title}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </motion.section>
    );
}
