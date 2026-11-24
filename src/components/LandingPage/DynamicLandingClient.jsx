"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import LandingMinimalHeader from "@/components/LandingPage/LandingMinimalHeader";
import LandingHero from "@/components/LandingPage/LandingHero";
import LandingTimerBanner from "@/components/LandingPage/LandingTimerBanner";
import LandingFeatures from "@/components/LandingPage/LandingFeatures";
import LandingHighlights from "@/components/LandingPage/LandingHighlights";
import LandingReviews from "@/components/LandingPage/LandingReviews";
import LandingRelatedProducts from "@/components/LandingPage/LandingRelatedProducts";
import LandingCheckoutSection from "@/components/LandingPage/LandingCheckoutSection";
import LandingMinimalFooter from "@/components/LandingPage/LandingMinimalFooter";
import LandingFloatingBottomBar from "@/components/LandingPage/LandingFloatingBottomBar";
import { trackViewItem } from "@/utils/dataLayer";

export default function DynamicLandingClient({
  landingPage,
  contactData = null,
}) {
  const product = landingPage?.product || {};
  const supportPhone = contactData?.phone_number || "01969968555";
  const hasTrackedViewContent = useRef(false);

  // Track ViewContent / view_item when landing page loads
  useEffect(() => {
    if (product?.id && !hasTrackedViewContent.current) {
      hasTrackedViewContent.current = true;
      trackViewItem({
        id: product.id,
        productName: product.productName || landingPage?.pageTitle,
        price: landingPage?.offerPrice || product.salePrice || product.price || 0,
        regularPrice: product.regularPrice || product.price || 0,
        category: product.category?.categoryName || "Korean Beauty & Skincare",
        sku: product.sku || `LP-${landingPage?.id}`,
      });
    }
  }, [product, landingPage]);
  const variants = useMemo(() => {
    return Array.isArray(product?.productVariants)
      ? product.productVariants
      : [];
  }, [product]);

  // Gather all images from product images, variant images, and landing page bannerImages
  const allImages = useMemo(() => {
    const imageSet = new Set();

    // 1. Landing page banner images
    if (Array.isArray(landingPage?.bannerImages)) {
      landingPage.bannerImages.forEach((img) => {
        if (typeof img === "string" && img.trim()) imageSet.add(img.trim());
        else if (img?.url && typeof img.url === "string")
          imageSet.add(img.url.trim());
      });
    }

    // 2. Base product images
    if (Array.isArray(product?.images)) {
      product.images.forEach((img) => {
        if (typeof img === "string" && img.trim()) imageSet.add(img.trim());
        else if (img?.url && typeof img.url === "string")
          imageSet.add(img.url.trim());
      });
    } else if (typeof product?.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === "string" && img.trim()) imageSet.add(img.trim());
            else if (img?.url) imageSet.add(img.url.trim());
          });
        }
      } catch (_) {
        if (product.images.trim()) imageSet.add(product.images.trim());
      }
    }

    // 3. Fallback product.image if present
    if (
      product?.image &&
      typeof product.image === "string" &&
      product.image.trim()
    ) {
      imageSet.add(product.image.trim());
    }

    // 4. Variant images
    variants.forEach((v) => {
      if (v?.image && typeof v.image === "string" && v.image.trim()) {
        imageSet.add(v.image.trim());
      }
      if (Array.isArray(v?.images)) {
        v.images.forEach((img) => {
          if (typeof img === "string" && img.trim()) imageSet.add(img.trim());
          else if (img?.url) imageSet.add(img.url.trim());
        });
      }
    });

    const list = Array.from(imageSet);
    return list.length > 0 ? list : ["/placeholder.png"];
  }, [landingPage, product, variants]);

  // Default variant
  const defaultVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null;
    return variants.find((v) => v.isDefault) || variants[0];
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedImg, setSelectedImg] = useState(() => {
    return defaultVariant?.image || allImages[0] || "/placeholder.png";
  });

  // State for related add-on products chosen by user
  const [selectedRelatedItems, setSelectedRelatedItems] = useState([]);

  const handleToggleRelatedItem = (relProd) => {
    setSelectedRelatedItems((prev) => {
      const exists = prev.find((item) => item.product.id === relProd.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== relProd.id);
      } else {
        return [...prev, { product: relProd, quantity: 1 }];
      }
    });
  };

  const handleUpdateRelatedItemQty = (prodId, newQty) => {
    setSelectedRelatedItems((prev) =>
      prev.map((item) =>
        item.product.id === prodId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
    );
  };

  const handleRemoveRelatedItem = (prodId) => {
    setSelectedRelatedItems((prev) =>
      prev.filter((item) => item.product.id !== prodId)
    );
  };

  // Update if props change
  useEffect(() => {
    if (defaultVariant) {
      setSelectedVariant(defaultVariant);
      if (defaultVariant.image) {
        setSelectedImg(defaultVariant.image);
      }
    } else if (allImages[0]) {
      setSelectedImg(allImages[0]);
    }
  }, [defaultVariant, allImages]);

  // Handle variant selection: sets selected variant and switches image if variant has an image
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant?.image) {
      setSelectedImg(variant.image);
    }
  };

  // Handle image thumbnail click: if this image belongs to a variant, also switch selectedVariant!
  const handleImageSelect = (imgUrl) => {
    setSelectedImg(imgUrl);
    if (variants && variants.length > 0) {
      const matchingVariant = variants.find((v) => v.image === imgUrl);
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  };

  const scrollToCheckout = () => {
    const el = document.getElementById("checkout-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const initialBasePrice = useMemo(() => {
    const vDiscount = defaultVariant
      ? parseFloat(
          (landingPage?.variantDiscounts || {})[defaultVariant.id] || 0,
        )
      : 0;
    const base = parseFloat(
      defaultVariant?.price ||
        landingPage?.offerPrice ||
        product?.salePrice ||
        product?.price ||
        0,
    );
    const insideFee = parseFloat(landingPage?.insideDhakaDelivery || 70);
    return Math.max(0, base - vDiscount) + insideFee;
  }, [defaultVariant, landingPage, product]);

  const [currentCheckoutPrice, setCurrentCheckoutPrice] =
    useState(initialBasePrice);

  return (
    <div className="w-full min-h-screen bg-white font-hind text-slate-800 flex flex-col antialiased">
      {/* 1. Dedicated Minimal Landing Header */}
      <LandingMinimalHeader
        phone={supportPhone}
        onOrderClick={scrollToCheckout}
      />

      {/* 2. Hero Section with dynamic gallery, variant selection & dynamic pricing */}
      <LandingHero
        landingPage={landingPage}
        allImages={allImages}
        selectedImg={selectedImg}
        onSelectImage={handleImageSelect}
        selectedVariant={selectedVariant}
        onSelectVariant={handleVariantSelect}
        variants={variants}
        variantDiscounts={landingPage?.variantDiscounts || {}}
        onOrderClick={scrollToCheckout}
      />

      {/* 2.1 Full-Width Mega Countdown Urgency Banner */}
      <LandingTimerBanner
        landingPage={landingPage}
        onOrderClick={scrollToCheckout}
      />

      {/* 3. Value Props */}
      <LandingFeatures
        title={landingPage.whyChooseUsTitle}
        features={landingPage.features}
      />

      {/* 4. Product Highlights & Usage Gallery */}
      <LandingHighlights
        title={landingPage.highlightsTitle}
        highlights={landingPage.highlights}
      />

      {/* 5. Customer Reviews */}
      <LandingReviews
        reviews={landingPage.reviews}
        productName={product?.productName || landingPage?.pageTitle}
      />

      {/* 5.1 Related Add-on Products (Optional on/off) */}
      {Array.isArray(landingPage?.relatedProducts) && landingPage.relatedProducts.length > 0 && (
        <LandingRelatedProducts
          relatedProducts={landingPage.relatedProducts}
          selectedRelatedItems={selectedRelatedItems}
          onToggleRelatedItem={handleToggleRelatedItem}
          onOrderClick={scrollToCheckout}
        />
      )}

      {/* 6. 1-Page Direct COD Checkout Section synchronized with variant */}
      <LandingCheckoutSection
        landingPage={landingPage}
        selectedVariant={selectedVariant}
        onSelectVariant={handleVariantSelect}
        variants={variants}
        variantDiscounts={landingPage?.variantDiscounts || {}}
        selectedImg={selectedImg}
        onPriceChange={setCurrentCheckoutPrice}
        selectedRelatedItems={selectedRelatedItems}
        onUpdateRelatedItemQty={handleUpdateRelatedItemQty}
        onRemoveRelatedItem={handleRemoveRelatedItem}
      />

      {/* 7. Dedicated Minimal Landing Footer */}
      <LandingMinimalFooter phone={supportPhone} />

      {/* 8. Mobile & Tablet Floating Sticky Order Bar */}
      <LandingFloatingBottomBar
        price={currentCheckoutPrice}
        onOrderClick={scrollToCheckout}
      />
    </div>
  );
}
