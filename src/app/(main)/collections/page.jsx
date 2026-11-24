import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Layers, ShieldCheck, Heart } from "lucide-react";
import Container from "@/components/Shared/Container";
import CollectionProductCard from "@/components/Shared/CollectionProductCard";
import { apiClient } from "@/lib/apiClient";

export const metadata = {
    title: "Curated Collections | Glow Korean Beauty",
    description: "Explore exclusive curated Korean skincare edits, glass skin routines, and best sellers from Seoul.",
};

export default async function CollectionsPage() {
    let collections = [];
    try {
        const res = await apiClient("/api/collections", {
            next: { revalidate: 15, tags: ["collections"] }
        });
        collections = Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
        console.error("CollectionsPage fetch error:", e);
    }

    const activeCollections = collections.filter(c => c.status !== false);

    return (
        <div className="w-full bg-[#FAF7F2]/40 min-h-screen py-8 sm:py-14 font-sans">
            <Container>
                {/* Hero Header */}
                <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#EDE5DC] text-[11px] font-bold text-[#B88348] uppercase tracking-wider mb-3 shadow-2xs">
                        <Sparkles size={13} className="text-[#B88348]" />
                        <span>K-BEAUTY CURATED EDITS</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Exclusive Collections
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2.5 max-w-lg mx-auto leading-relaxed">
                        Handcrafted skincare routines and specialized treatments designed to bring authentic Korean glass-skin radiance into your daily ritual.
                    </p>
                </div>

                {/* Collections List */}
                <div className="space-y-16 sm:space-y-20">
                    {activeCollections.map((col, idx) => {
                        const colProducts = (col.products || []).map(p => p.product || p).filter(Boolean);

                        return (
                            <div 
                                key={col.id} 
                                id={col.slug}
                                className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-[#EDE5DC] shadow-xs"
                            >
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B88348] uppercase tracking-wider mb-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#B88348]"></span>
                                            <span>Collection #{idx + 1}</span>
                                        </div>
                                        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                            {col.name}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                            Featuring {colProducts.length} authentic Korean skincare essentials
                                        </p>
                                    </div>

                                    <Link
                                        href={`/collections/${col.slug}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D48B80] to-[#B88348] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 w-fit"
                                    >
                                        <span>View Full Collection</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>

                                {/* Products Grid */}
                                {colProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
                                        {colProducts.map((product) => (
                                            <CollectionProductCard
                                                key={product.id}
                                                product={product}
                                                collectionName={col.name}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs">
                                        No products in this collection currently.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Container>
        </div>
    );
}
