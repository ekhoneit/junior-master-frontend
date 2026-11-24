import HomeHero from "@/components/Home/HomeHero";
import ShopCategorySection from "@/components/Home/ShopCategorySection";
import NewArrivalSection from "@/components/Home/NewArrivalSection";
import CollectionsSection from "@/components/Home/CollectionsSection";
import BentoGallerySection from "@/components/Home/BentoGallerySection";
import CategoryProductsSection from "@/components/Home/CategoryProductsSection";
import AllProductsSection from "@/components/Home/AllProductsSection";
import MidBannerSection from "@/components/Home/MidBannerSection";
import { apiClient } from "@/lib/apiClient";
import {
  MOCK_JUNIOR_MASTER_HERO_SLIDERS,
  MOCK_JUNIOR_MASTER_CATEGORIES,
  MOCK_JUNIOR_MASTER_PRODUCTS,
  MOCK_JUNIOR_MASTER_BENTO_GALLERY,
} from "@/lib/mockJuniorMasterData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  description: "Junior Master is Bangladesh's premier destination for kids learning toys, creative STEM games, baby care essentials & educational lifestyle products.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://juniormasterbd.com",
  },
};

export default async function HomePage() {
  let heroSliders = [];
  let categories = [];
  let groupedProducts = {};
  let newArrivalProducts = [];
  let allProducts = [];
  let collections = [];
  let bentoCards = [];
  let midBanners = [];

  // 1. Fetch hero sliders (fallback to Junior Master mock data)
  try {
    const heroRes = await apiClient("/api/hero-sliders", {
      cache: "no-store",
      next: { revalidate: 0, tags: ["hero-sliders"] },
    });
    if (Array.isArray(heroRes)) {
      heroSliders = heroRes;
    } else if (heroRes?.data && Array.isArray(heroRes.data)) {
      heroSliders = heroRes.data;
    }
  } catch (err) {}
  if (!heroSliders || heroSliders.length === 0) {
    heroSliders = MOCK_JUNIOR_MASTER_HERO_SLIDERS;
  }

  // 2. Fetch Categories (fallback to Junior Master mock categories)
  try {
    const catRes = await apiClient("/api/categories", {
      next: { revalidate: 15, tags: ["categories"] },
    });
    if (Array.isArray(catRes)) {
      categories = catRes;
    } else if (catRes?.data && Array.isArray(catRes.data)) {
      categories = catRes.data;
    } else if (catRes?.categories && Array.isArray(catRes.categories)) {
      categories = catRes.categories;
    }
  } catch (err) {}
  if (!categories || categories.length === 0) {
    categories = MOCK_JUNIOR_MASTER_CATEGORIES;
  }

  // 3. Fetch Grouped Products by Category (/api/product/grouped)
  try {
    const groupedRes = await apiClient("/api/product/grouped", {
      next: { revalidate: 15, tags: ["products"] },
    });
    groupedProducts = groupedRes?.data || groupedRes || {};
  } catch (err) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE" && !err?.message?.includes("Dynamic server usage")) {
      console.warn("HomePage: Could not fetch grouped products:", err.message);
    }
  }

  // 4. Fetch New Arrival Products (/api/product/new)
  try {
    const newRes = await apiClient("/api/product/new", {
      next: { revalidate: 15, tags: ["products"] },
    });
    if (Array.isArray(newRes)) {
      newArrivalProducts = newRes;
    } else if (newRes?.data?.products && Array.isArray(newRes.data.products)) {
      newArrivalProducts = newRes.data.products;
    } else if (newRes?.products && Array.isArray(newRes.products)) {
      newArrivalProducts = newRes.products;
    }
  } catch (err) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE" && !err?.message?.includes("Dynamic server usage")) {
      console.warn("HomePage: Could not fetch new products:", err.message);
    }
  }

  // 5. Fetch Collections (/api/collections)
  try {
    const colRes = await apiClient("/api/collections", {
      next: { revalidate: 15, tags: ["collections"] },
    });
    if (Array.isArray(colRes)) {
      collections = colRes;
    } else if (colRes?.data && Array.isArray(colRes.data)) {
      collections = colRes.data;
    }
  } catch (err) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE" && !err?.message?.includes("Dynamic server usage")) {
      console.warn("HomePage: Could not fetch collections:", err.message);
    }
  }

  // 6. Fetch Bento Image Gallery (/api/bento-gallery)
  try {
    const bentoRes = await apiClient("/api/bento-gallery", {
      cache: "no-store",
      next: { revalidate: 0, tags: ["bento-gallery"] },
    });
    if (Array.isArray(bentoRes)) {
      bentoCards = bentoRes;
    } else if (bentoRes?.data && Array.isArray(bentoRes.data)) {
      bentoCards = bentoRes.data;
    }
  } catch (err) {}
  if (!bentoCards || bentoCards.length === 0) {
    bentoCards = MOCK_JUNIOR_MASTER_BENTO_GALLERY;
  }

  // 7. Fetch Mid Banners (/api/mid-banner)
  try {
    const midRes = await apiClient("/api/mid-banner", {
      next: { revalidate: 15, tags: ["mid-banner"] },
    });
    if (Array.isArray(midRes)) {
      midBanners = midRes;
    } else if (midRes?.data && Array.isArray(midRes.data)) {
      midBanners = midRes.data;
    }
  } catch (err) {}

  // 8. Fetch All Products (Catalog) (/api/product?limit=20)
  try {
    const prodRes = await apiClient("/api/product?limit=20", {
      next: { revalidate: 15, tags: ["products"] },
    });
    if (Array.isArray(prodRes)) {
      allProducts = prodRes;
    } else if (prodRes?.products && Array.isArray(prodRes.products)) {
      allProducts = prodRes.products;
    } else if (
      prodRes?.data?.products &&
      Array.isArray(prodRes.data.products)
    ) {
      allProducts = prodRes.data.products;
    }
  } catch (err) {}
  if (!allProducts || allProducts.length === 0) {
    allProducts = MOCK_JUNIOR_MASTER_PRODUCTS;
    newArrivalProducts = MOCK_JUNIOR_MASTER_PRODUCTS.slice(0, 6);
  }

  // Build category showcase list
  const activeCategories = (categories || []).filter((c) => c.status !== false);

  const categoryShowcase = activeCategories
    .map((category) => {
      let catProducts = groupedProducts[category.name] || [];
      if (!catProducts || catProducts.length === 0) {
        catProducts = allProducts.filter(
          (p) =>
            p.subCategory?.category?.id === category.id ||
            p.subCategory?.category?.name?.toLowerCase() ===
              category.name?.toLowerCase() ||
            p.category?.id === category.id ||
            p.categoryName?.toLowerCase() === category.name?.toLowerCase(),
        );
      }
      return {
        category,
        products: catProducts,
      };
    })
    .filter((item) => item.products && item.products.length > 0);

  const firstMidBanner = midBanners.length > 0 ? midBanners[0] : null;
  const secondMidBanner = midBanners.length > 1 ? midBanners[1] : null;

  return (
    <div className="w-full bg-white pb-16 space-y-2">
      {/* 1. Hero Slider Banner (Supports CMS upload: Title, text, product img, button OR full cover pic) */}
      <HomeHero
        heroSliders={heroSliders}
        featuredProducts={allProducts.slice(0, 8)}
      />

      {/* 2. Shop By Category (Redesigned with soft K-Beauty aesthetic) */}
      <ShopCategorySection categories={categories} />

      {/* 3. New Arrivals Section (1-row horizontal carousel with auto-scroll and dynamic left/right arrow visibility) */}
      <NewArrivalSection
        products={
          newArrivalProducts.length > 0
            ? newArrivalProducts
            : allProducts.slice(0, 15)
        }
      />

      {/* 4. Curated Collections Showcase */}
      {collections && collections.length > 0 && (
        <CollectionsSection collections={collections} />
      )}

      {/* 5. First Mid Banner (From CMS Banner (Mid) Management) */}
      {firstMidBanner && (
        <MidBannerSection banner={firstMidBanner} />
      )}

      {/* 6. Bento Image Gallery (K-Beauty Inspiration & Visual Showcase) */}
      {bentoCards && bentoCards.length > 0 && (
        <BentoGallerySection bentoCards={bentoCards} />
      )}

      {/* 7. Category-Wise Product Showcases with interspersed mid banner if available */}
      {categoryShowcase.map(({ category, products }, idx) => (
        <div key={category.id} className="space-y-4">
          <CategoryProductsSection
            categoryName={category.name}
            title={category.name}
            subtitle="EXPLORE ROUTINE"
            products={products}
          />
          {/* If there is a second mid banner, place it between category showcases */}
          {idx === 1 && secondMidBanner && (
            <MidBannerSection banner={secondMidBanner} />
          )}
        </div>
      ))}

      {/* 8. All Products (The Full Catalogue - untouched per request) */}
      <AllProductsSection products={allProducts} />
    </div>
  );
}
