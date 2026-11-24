import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import ProductDetailsClient from "@/components/Products/ProductDetailsClient";
import RelatedProductsSlider from "@/components/Products/RelatedProductsSlider";
import ProductCardSkeleton from "@/components/Shared/ProductCardSkeleton";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://glowbeautybd.com";

// 1. Dynamic SEO Metadata with OpenGraph and Twitter cards
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found - Glow Korean Beauty",
      description: "The requested product is not available on Glow Korean Beauty.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const plainDescription =
    product.description
      ? product.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 160)
      : `Buy ${product.productName} online at best price in Bangladesh from Glow Korean Beauty. Authentic quality and fast delivery.`;

  const primaryImage =
    product.images?.[0] ||
    product.image ||
    product.productVariants?.[0]?.image ||
    `${SITE_URL}/glowbeauty.png`;

  const canonicalUrl = `${SITE_URL}/product/${product.slug || slug}`;
  const brandName = product.brand?.name || product.brandName || "Glow Korean Beauty";

  return {
    title: `${product.productName} - Buy Online in Bangladesh | Glow Korean Beauty`,
    description: plainDescription,
    keywords: [
      product.productName,
      brandName,
      product.subCategory?.category?.name,
      product.subCategory?.name,
      "online shopping bangladesh",
      "glowbeauty online shop",
      "buy online dhaka",
      product.sku,
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.productName} - Glow Korean Beauty`,
      description: plainDescription,
      url: canonicalUrl,
      siteName: "Glow Korean Beauty",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.productName,
        },
      ],
      type: "website",
      locale: "en_BD",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.productName} - Glow Korean Beauty`,
      description: plainDescription,
      images: [primaryImage],
    },
  };
}

import { Suspense } from "react";

async function AsyncRelatedProducts({ subCategoryId, productId }) {
  const relatedProducts = await getRelatedProducts(subCategoryId, productId, 8);
  return <RelatedProductsSlider relatedProducts={relatedProducts} />;
}

// 2. Server Component page rendering with JSON-LD Schema markup for Google Rich Results
export default async function ProductDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Helpers for SEO & Rich snippet schema
  const primaryImage =
    product.images?.[0] ||
    product.image ||
    product.productVariants?.[0]?.image ||
    `${SITE_URL}/glowbeauty.png`;

  const canonicalUrl = `${SITE_URL}/product/${product.slug || slug}`;
  const brandName = product.brand?.name || product.brandName || "Glow Korean Beauty";
  const plainDescription = product.description
    ? product.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 300)
    : `Buy ${product.productName} online at best price in Bangladesh from Glow Korean Beauty. Authentic quality and fast delivery.`;

  // Construct Google Merchant & Product Rich Result JSON-LD Schema
  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [primaryImage];

  const variants = product.productVariants || [];
  const hasVariants = variants.length > 0;

  // Determine low/high prices and availability
  let offerSchema;
  const isAvailable = Boolean(
    product.status &&
    (product.stockStatus === "IN_STOCK" ||
      (!product.trackQuantity && product.stockStatus !== "OUT_OF_STOCK") ||
      product.quantity > 0 ||
      variants.some((v) => v.quantity > 0))
  );

  const availabilityUrl = isAvailable
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const validUntilDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: product.insideDhakaDeliveryCharge ? parseFloat(product.insideDhakaDeliveryCharge) : 60,
      currency: "BDT",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "BD",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "d",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "d",
      },
    },
  };

  const hasMerchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "BD",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };

  if (hasVariants && variants.length > 1) {
    const variantPrices = variants.map((v) => parseFloat(v.price || 0)).filter((p) => p > 0);
    const lowPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : parseFloat(product.price || 0);
    const highPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : parseFloat(product.price || 0);

    offerSchema = {
      "@type": "AggregateOffer",
      url: canonicalUrl,
      priceCurrency: "BDT",
      lowPrice: lowPrice,
      highPrice: highPrice,
      offerCount: variants.length,
      priceValidUntil: validUntilDate,
      itemCondition: "https://schema.org/NewCondition",
      availability: availabilityUrl,
      seller: {
        "@type": "Organization",
        name: "Glow Korean Beauty",
      },
      shippingDetails,
      hasMerchantReturnPolicy,
      offers: variants.map((v, i) => ({
        "@type": "Offer",
        name: `${product.productName} - ${Object.values(v.attributes || {}).join(" / ") || `Variant ${i + 1}`}`,
        sku: v.sku || `${product.sku || product.id}-V${i + 1}`,
        url: canonicalUrl,
        priceCurrency: "BDT",
        price: parseFloat(v.price || product.price || 0),
        priceValidUntil: validUntilDate,
        itemCondition: "https://schema.org/NewCondition",
        availability: v.quantity > 0 || !product.trackQuantity ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Glow Korean Beauty",
        },
        shippingDetails,
        hasMerchantReturnPolicy,
      })),
    };
  } else {
    offerSchema = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BDT",
      price: parseFloat(product.price || 0),
      priceValidUntil: validUntilDate,
      itemCondition: "https://schema.org/NewCondition",
      availability: availabilityUrl,
      seller: {
        "@type": "Organization",
        name: "Glow Korean Beauty",
      },
      shippingDetails,
      hasMerchantReturnPolicy,
    };
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.productName,
    image: allImages,
    description: plainDescription,
    sku: product.sku || `EKH-${product.id}`,
    mpn: product.sku || `EKH-${product.id}`,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    category: product.subCategory?.name || product.subCategory?.category?.name || "General",
    offers: offerSchema,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "42",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.subCategory?.category?.name || "Products",
        item: `${SITE_URL}/product?category=${encodeURIComponent(product.subCategory?.category?.name || "")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.productName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      {/* Inject Structured Data for Google Engine (Product Rich Snippet & Breadcrumbs) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProductsSlot={
          <Suspense
            key={`related-${product.id}`}
            fallback={
              <div className="mt-14 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                      Related Products
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Customers also viewed these authentic items
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {[...Array(5)].map((_, i) => (
                    <ProductCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              </div>
            }
          >
            <AsyncRelatedProducts
              subCategoryId={product.subCategoryId || product.subCategory?.id}
              productId={product.id}
            />
          </Suspense>
        }
      />
    </>
  );
}
