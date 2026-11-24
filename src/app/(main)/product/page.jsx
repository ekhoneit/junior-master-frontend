import ProductCatalogClient from "@/components/Products/ProductCatalogClient";
import { apiClient } from "@/lib/apiClient";
import { MOCK_JUNIOR_MASTER_PRODUCTS, MOCK_JUNIOR_MASTER_CATEGORIES } from "@/lib/mockJuniorMasterData";

export const metadata = {
    title: "All Products - Junior Master",
    description: "Browse the full collection of creative learning toys, smart STEM games and baby essentials at Junior Master.",
};

export default async function ProductPage({ searchParams }) {
    const params = await searchParams;
    const initialSearch = params?.search || params?.q || "";
    const initialCategory = params?.category || params?.categoryName || "";

    let initialProducts = [];
    let initialCategories = [];

    // 1. Fetch catalog products (fallback to Junior Master static mock)
    try {
        let endpoint = "/api/product?limit=150";
        if (initialSearch) {
            endpoint += `&search=${encodeURIComponent(initialSearch)}`;
        }
        if (initialCategory && initialCategory !== "All") {
            endpoint += `&categoryName=${encodeURIComponent(initialCategory)}`;
        }

        const res = await apiClient(endpoint, {
            next: { revalidate: 15, tags: ["products"] },
        });
        if (Array.isArray(res)) {
            initialProducts = res;
        } else if (res?.products && Array.isArray(res.products)) {
            initialProducts = res.products;
        } else if (res?.data?.products && Array.isArray(res.data.products)) {
            initialProducts = res.data.products;
        } else if (res?.data && Array.isArray(res.data)) {
            initialProducts = res.data;
        }
    } catch (err) {}
    if (!initialProducts || initialProducts.length === 0) {
        initialProducts = MOCK_JUNIOR_MASTER_PRODUCTS;
    }

    // 2. Fetch categories
    try {
        const catRes = await apiClient("/api/categories", {
            next: { revalidate: 15, tags: ["categories"] },
        });
        if (Array.isArray(catRes)) {
            initialCategories = catRes;
        } else if (catRes?.data && Array.isArray(catRes.data)) {
            initialCategories = catRes.data;
        } else if (catRes?.categories && Array.isArray(catRes.categories)) {
            initialCategories = catRes.categories;
        }
    } catch (err) {}
    if (!initialCategories || initialCategories.length === 0) {
        initialCategories = MOCK_JUNIOR_MASTER_CATEGORIES;
    }

    return (
        <ProductCatalogClient
            initialProducts={initialProducts}
            initialCategories={initialCategories}
        />
    );
}
