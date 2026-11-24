import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import Container from "@/components/Shared/Container";
import CollectionProductCard from "@/components/Shared/CollectionProductCard";
import { apiClient } from "@/lib/apiClient";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await apiClient(`/api/collections/slug/${slug}`);
        const col = res?.data || res;
        if (col?.name) {
            return {
                title: `${col.name} | Glow Korean Beauty`,
                description: `Shop authentic Korean skincare from ${col.name}.`,
            };
        }
    } catch (_) {}
    return { title: "Collection | Glow Korean Beauty" };
}

export default async function SingleCollectionPage({ params }) {
    const { slug } = await params;
    let collection = null;

    try {
        const res = await apiClient(`/api/collections/slug/${slug}`, {
            next: { revalidate: 15, tags: ["collections"] }
        });
        collection = res?.data || res;
    } catch (e) {
        console.error("SingleCollectionPage error:", e);
    }

    if (!collection || !collection.name) {
        return notFound();
    }

    const colProducts = (collection.products || []).map(p => p.product || p).filter(Boolean);

    return (
        <div className="w-full bg-[#FAF7F2]/40 min-h-screen py-6 sm:py-8 font-sans">
            <Container>
                {/* Back button & Breadcrumb */}
                <div className="mb-4">
                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>All Collections</span>
                    </Link>
                </div>

                {/* Compact Full-Width Hero Header */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#EDE5DC] shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EDE5DC] text-[10px] font-bold text-[#B88348] uppercase tracking-wider mb-2">
                            <Sparkles size={11} className="text-[#B88348]" />
                            <span>CURATED K-BEAUTY EDIT</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {collection.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                            Handpicked authentic Korean skincare items curated for optimal results with Nationwide Cash on Delivery.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <ShieldCheck size={14} />
                            <span>{colProducts.length} Verified Items</span>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {colProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                        {colProducts.map((product) => (
                            <CollectionProductCard
                                key={product.id}
                                product={product}
                                collectionName={collection.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                        <p className="text-sm font-semibold text-slate-500">No products found in this collection.</p>
                        <Link
                            href="/product"
                            className="mt-4 inline-block px-5 py-2 rounded-full bg-primary text-white text-xs font-bold"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    );
}
