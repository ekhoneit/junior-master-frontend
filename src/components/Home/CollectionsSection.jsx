"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/Shared/Container";
import CollectionProductCard from "@/components/Shared/CollectionProductCard";
import { motion } from "framer-motion";

export default function CollectionsSection({ collections = [] }) {
    if (!collections || collections.length === 0) return null;

    const activeCollections = collections.filter(
        c => c.status !== false && c.products && c.products.length > 0
    );

    if (activeCollections.length === 0) return null;

    return (
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="py-8 sm:py-12 bg-[#FAF7F2]/40 border-b border-[#F0EAE1] font-sans">
            <Container>
                {activeCollections.map((col, idx) => {
                    const colProducts = (col.products || []).map(p => p.product || p).filter(Boolean);
                    if (colProducts.length === 0) return null;

                    return (
                        <div key={col.id} className="mb-12 last:mb-0">
                            {/* Collection Header with Luxury Editorial Styling */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#B88348] uppercase tracking-wider mb-1">
                                        <Sparkles size={12} className="text-[#B88348]" />
                                        <span>EXCLUSIVE CURATED EDIT #{idx + 1}</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {col.name}
                                    </h2>
                                </div>

                                <Link
                                    href={`/collections/${col.slug}`}
                                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-[#EDE5DC] hover:border-primary text-xs font-bold text-slate-800 hover:text-primary transition-all shadow-2xs group"
                                >
                                    <span>Explore Collection</span>
                                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>

                            {/* Luxury Curated Product Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
                                {colProducts.slice(0, 4).map((product) => (
                                    <CollectionProductCard
                                        key={product.id}
                                        product={product}
                                        collectionName={col.name}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </Container>
        </motion.section>
    );
}
