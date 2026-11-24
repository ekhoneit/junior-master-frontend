"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  ShoppingCart,
  Check,
  Loader2,
  Truck,
  User,
  UserCheck,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Package,
  Plus,
  PlusCircle,
  CheckSquare,
  Square,
  Sparkles,
  Flame,
  ClipboardList,
  Receipt,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Banknote,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { apiClient } from "@/lib/apiClient";
import { trackBeginCheckout, trackPurchase } from "@/utils/dataLayer";
import {
  getVariantColorInfo,
  getVariantDisplayLabel,
} from "@/lib/variantHelpers";
import {
  sendAbandonedOrderBeacon,
  sendAbandonedOrderCall,
} from "@/lib/abandonedOrderTracker";

export default function LandingCheckoutSection({
  landingPage,
  selectedVariant,
  onSelectVariant,
  variants = [],
  variantDiscounts = {},
  selectedImg,
  onPriceChange,
  selectedRelatedItems = [],
  onUpdateRelatedItemQty,
  onRemoveRelatedItem,
}) {
  // Korean Beauty Brand Palette Consistent Theme
  const isIslamic = false;
  const product = landingPage?.product || {};
  const bumpProduct = landingPage?.orderBumpProduct || null;

  const bumpVariants = bumpProduct?.productVariants || [];
  const [selectedBumpVariant, setSelectedBumpVariant] = useState(
    bumpVariants.length > 0 ? bumpVariants[0] : null,
  );

  const sortedVariants = useMemo(() => {
    return Array.isArray(variants)
      ? [...variants].sort((a, b) => a.id - b.id)
      : [];
  }, [variants]);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("inside"); // 'inside' | 'outside'
  const [orderNotes, setOrderNotes] = useState(""); // Additional optional instructions
  const [quantity, setQuantity] = useState(1);
  const [includeBump, setIncludeBump] = useState(false); // Order bump toggle
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const orderPlacedRef = useRef(false);
  const abandonedSentRef = useRef(false);
  const abandonmentDataRef = useRef(null);
  const lastSentAddressRef = useRef("");
  const beginCheckoutTrackedRef = useRef(false);

  // Gallery & Lightbox Zoom Modal States
  const [modalGallery, setModalGallery] = useState([]); // [{ url, title, variantId }]
  const [activeModalIdx, setActiveModalIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1); // 1 = 100%, 1.5 = 150%, 2 = 200%, 2.5 = 250%

  // Synchronize bump variant if bumpProduct changes
  useEffect(() => {
    if (bumpProduct?.productVariants?.length > 0) {
      setSelectedBumpVariant(bumpProduct.productVariants[0]);
    } else {
      setSelectedBumpVariant(null);
    }
  }, [bumpProduct]);

  // Reset zoom when active image changes or modal closes
  useEffect(() => {
    setZoomScale(1);
  }, [activeModalIdx, isModalOpen]);

  const insideFee = parseFloat(landingPage.insideDhakaDelivery || 70);
  const outsideFee = parseFloat(landingPage.outsideDhakaDelivery || 130);
  const deliveryFee = deliveryArea === "inside" ? insideFee : outsideFee;

  // Per-variant discount from admin
  const variantDiscountAmt = selectedVariant
    ? parseFloat(
        variantDiscounts[selectedVariant.id] ||
          variantDiscounts[String(selectedVariant.id)] ||
          0,
      )
    : 0;
  const baseSellingPrice = parseFloat(
    selectedVariant?.price ||
      landingPage.offerPrice ||
      product.salePrice ||
      product.price ||
      0,
  );
  const baseRegularPrice = selectedVariant?.regularPrice
    ? parseFloat(selectedVariant.regularPrice)
    : product.regularPrice
      ? parseFloat(product.regularPrice)
      : baseSellingPrice;

  const unitPrice = Math.max(
    0,
    variantDiscountAmt > 0
      ? baseRegularPrice - variantDiscountAmt
      : baseSellingPrice,
  );
  const rawUnitPrice =
    baseRegularPrice > unitPrice ? baseRegularPrice : baseSellingPrice;
  const mainSubtotal = unitPrice * quantity;

  // Order Bump Pricing & Discount
  const bumpRawPrice = selectedBumpVariant?.price
    ? parseFloat(selectedBumpVariant.price)
    : parseFloat(
        landingPage.orderBumpPrice ||
          bumpProduct?.salePrice ||
          bumpProduct?.price ||
          0,
      );
  const bumpRegularPrice = selectedBumpVariant?.regularPrice
    ? parseFloat(selectedBumpVariant.regularPrice)
    : bumpProduct?.regularPrice
      ? parseFloat(bumpProduct.regularPrice)
      : parseFloat(bumpProduct?.price || 0);

  const bumpUnitPrice = bumpProduct ? bumpRawPrice : 0;
  const bumpDiscountAmount =
    bumpProduct && includeBump
      ? parseFloat(landingPage.orderBumpDiscount || 0)
      : 0;

  // Related products subtotal calculation
  const relatedSubtotal = useMemo(() => {
    if (!Array.isArray(selectedRelatedItems) || selectedRelatedItems.length === 0) return 0;
    return selectedRelatedItems.reduce((acc, item) => {
      const p = parseFloat(item.product?.salePrice || item.product?.price || 0);
      const q = parseInt(item.quantity || 1, 10);
      return acc + (p * q);
    }, 0);
  }, [selectedRelatedItems]);

  // Subtotal before bundle discount (Main product + Order bump + Related Products)
  const totalBeforeDiscount = mainSubtotal + (includeBump ? bumpUnitPrice : 0) + relatedSubtotal;
  // Effective subtotal after applying order bump discount
  const discountedTotal = Math.max(0, totalBeforeDiscount - bumpDiscountAmount);
  // Grand Total including delivery fee
  const grandTotal = discountedTotal + deliveryFee;

  // Keep abandonment tracking state fresh
  useEffect(() => {
    const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
    if (cleanPhone.length >= 11) {
      const items = [
        {
          productId: product.id,
          productName: selectedVariant
            ? `${product.productName || "Product"} (${getVariantLabel(selectedVariant)})`
            : product.productName || "Product",
          price: unitPrice,
          quantity: quantity,
          variant: selectedVariant || null,
        },
      ];

      if (includeBump && bumpProduct) {
        items.push({
          productId: bumpProduct.id,
          productName: selectedBumpVariant
            ? `${bumpProduct.productName} (${getVariantLabel(selectedBumpVariant)})`
            : bumpProduct.productName,
          price: Math.max(0, bumpUnitPrice - bumpDiscountAmount),
          quantity: 1,
          variant: selectedBumpVariant || null,
        });
      }

      abandonmentDataRef.current = {
        name: fullName.trim() || "Guest Customer",
        phone: cleanPhone,
        address:
          fullAddress.trim() ||
          (deliveryArea === "inside" ? "Dhaka City" : "Outside Dhaka"),
        shippingCost: deliveryFee,
        items: items,
      };

      // Trigger InitiateCheckout / begin_checkout once customer enters contact info
      if (!beginCheckoutTrackedRef.current && cleanPhone.length >= 10) {
        beginCheckoutTrackedRef.current = true;
        trackBeginCheckout(
          items.map((it) => ({
            id: it.productId,
            name: it.productName,
            price: it.price,
            quantity: it.quantity,
          })),
          grandTotal
        );
      }

      // Call failed/abandoned order API as soon as user types their phone number,
      // and re-send/update once address is also typed (debounced 1.5s)
      const currentAddressSnapshot = fullAddress.trim();
      const shouldTrigger =
        !abandonedSentRef.current ||
        (currentAddressSnapshot.length >= 5 &&
          currentAddressSnapshot !== lastSentAddressRef.current);

      const timer = setTimeout(() => {
        if (
          abandonmentDataRef.current &&
          shouldTrigger &&
          !orderPlacedRef.current
        ) {
          abandonedSentRef.current = true;
          lastSentAddressRef.current = currentAddressSnapshot;
          sendAbandonedOrderCall(abandonmentDataRef.current);
        }
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      abandonmentDataRef.current = null;
    }
  }, [
    fullName,
    phoneNumber,
    fullAddress,
    deliveryArea,
    deliveryFee,
    product,
    selectedVariant,
    unitPrice,
    quantity,
    includeBump,
    bumpProduct,
    selectedBumpVariant,
    bumpUnitPrice,
    bumpDiscountAmount,
  ]);

  // Send abandoned order beacon if customer leaves without placing order
  useEffect(() => {
    const handleExit = () => {
      if (orderPlacedRef.current || abandonedSentRef.current) return;
      if (abandonmentDataRef.current) {
        abandonedSentRef.current = true;
        sendAbandonedOrderBeacon(abandonmentDataRef.current);
      }
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
    };
  }, []);

  // Synchronize current total price with parent/floating bottom bar
  useEffect(() => {
    if (typeof onPriceChange === "function") {
      onPriceChange(grandTotal);
    }
  }, [grandTotal, onPriceChange]);

  const getVariantLabel = (v) => getVariantDisplayLabel(v);

  // Helper to gather all distinct images from a product and its variants
  const getAllProductImages = (prod) => {
    if (!prod) return [];
    const list = [];
    const seen = new Set();

    const addImg = (url, label) => {
      if (!url || typeof url !== "string") return;
      const trimmed = url.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        list.push({ url: trimmed, title: label || prod.productName || "পণ্য" });
      }
    };

    // 1. Check prod.images
    if (Array.isArray(prod.images)) {
      prod.images.forEach((img) => {
        if (typeof img === "string") addImg(img, prod.productName);
        else if (img && typeof img === "object")
          addImg(img.url || img.secure_url, prod.productName);
      });
    } else if (typeof prod.images === "string" && prod.images.trim()) {
      try {
        const parsed = JSON.parse(prod.images);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === "string") addImg(img, prod.productName);
            else if (img && typeof img === "object")
              addImg(img.url || img.secure_url, prod.productName);
          });
        } else if (typeof parsed === "string") {
          addImg(parsed, prod.productName);
        }
      } catch {
        addImg(prod.images, prod.productName);
      }
    }

    // 2. Check prod.image
    if (prod.image) addImg(prod.image, prod.productName);

    // 3. Check all product variants
    if (Array.isArray(prod.productVariants)) {
      prod.productVariants.forEach((v) => {
        if (v.image) {
          const vLabel = `${prod.productName} (${getVariantLabel(v)})`;
          addImg(v.image, vLabel);
        }
      });
    }

    return list;
  };

  const getProductThumb = (prod) => {
    const imgs = getAllProductImages(prod);
    return imgs.length > 0 ? imgs[0].url : null;
  };

  const activeDisplayImg =
    selectedImg || selectedVariant?.image || getProductThumb(product);
  const bumpDisplayImg =
    selectedBumpVariant?.image || getProductThumb(bumpProduct);

  // Open Gallery Lightbox Modal
  const openLightbox = (targetProduct, preferredImgUrl) => {
    const images = getAllProductImages(targetProduct);
    if (images.length === 0 && preferredImgUrl) {
      images.push({
        url: preferredImgUrl,
        title: targetProduct?.productName || "পণ্য",
      });
    }
    if (images.length === 0) return;

    let startIndex = 0;
    if (preferredImgUrl) {
      const foundIdx = images.findIndex((item) => item.url === preferredImgUrl);
      if (foundIdx !== -1) startIndex = foundIdx;
    }

    setModalGallery(images);
    setActiveModalIdx(startIndex);
    setZoomScale(1);
    setIsModalOpen(true);
  };

  const handlePrevImg = (e) => {
    if (e) e.stopPropagation();
    setActiveModalIdx((prev) =>
      prev > 0 ? prev - 1 : modalGallery.length - 1,
    );
    setZoomScale(1);
  };

  const handleNextImg = (e) => {
    if (e) e.stopPropagation();
    setActiveModalIdx((prev) =>
      prev < modalGallery.length - 1 ? prev + 1 : 0,
    );
    setZoomScale(1);
  };

  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = (e) => {
    if (e) e.stopPropagation();
    setZoomScale(1);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("অনুগ্রহ করে আপনার পুরো নাম লিখুন");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone || !cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      toast.error(
        "অনুগ্রহ করে 01 দিয়ে শুরু সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন (যেমন: 01XXXXXXXXX)",
      );
      return;
    }

    if (!fullAddress.trim() || fullAddress.length < 5) {
      toast.error("অনুগ্রহ করে আপনার পূর্ণ ডেলিভারি ঠিকানা বিস্তারিত লিখুন");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("অর্ডার সম্পন্ন হচ্ছে...");

    try {
      // Step 1: Ensure customer profile exists or create customer
      let customerId = null;
      try {
        const custRes = await apiClient("/api/customer", {
          method: "POST",
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: cleanPhone,
            address: fullAddress.trim(),
            city: deliveryArea === "inside" ? "Dhaka" : "Outside Dhaka",
            country: "Bangladesh",
          }),
        });
        customerId = custRes?.data?.id || custRes?.id;
      } catch (custErr) {
        console.warn("Customer creation fallback:", custErr.message);
      }

      // Step 2: Build Order Payload connected to Online Orders
      const orderItemsPayload = [
        {
          productId: product.id,
          productVariantId: selectedVariant?.id || null,
          quantity: quantity,
          unitPrice: unitPrice,
          lineTotal: mainSubtotal,
          total: mainSubtotal,
          sku: selectedVariant?.sku || product.sku || null,
        },
      ];

      // If user checked the Order Bump product, add it to order items
      if (includeBump && bumpProduct) {
        orderItemsPayload.push({
          productId: bumpProduct.id,
          productVariantId: selectedBumpVariant?.id || null,
          quantity: 1,
          unitPrice: bumpUnitPrice,
          discount: bumpDiscountAmount,
          lineTotal: bumpUnitPrice,
          total: bumpUnitPrice,
          sku: selectedBumpVariant?.sku || bumpProduct.sku || null,
        });
      }

      // If user added Related Products, add them to order items
      if (Array.isArray(selectedRelatedItems) && selectedRelatedItems.length > 0) {
        selectedRelatedItems.forEach((rel) => {
          const rProd = rel.product;
          const rPrice = parseFloat(rProd.salePrice || rProd.price || 0);
          const rQty = parseInt(rel.quantity || 1, 10);
          orderItemsPayload.push({
            productId: rProd.id,
            productVariantId: null,
            quantity: rQty,
            unitPrice: rPrice,
            lineTotal: rPrice * rQty,
            total: rPrice * rQty,
            sku: rProd.sku || null,
          });
        });
      }

      const relatedNotesSummary = Array.isArray(selectedRelatedItems) && selectedRelatedItems.length > 0
        ? ` | সাথে সম্পর্কিত পণ্য: ${selectedRelatedItems.map(r => `${r.product.productName} (${r.quantity}টি)`).join(", ")}`
        : "";

      const orderPayload = {
        customerId: customerId || undefined,
        orderDate: new Date().toISOString(),
        source: "Landing Page",
        paymentMethod: "COD",
        paymentStatus: "Unpaid",
        status: "Pending",
        orderStatus: "Pending",
        shippingCost: deliveryFee,
        totalAmount: totalBeforeDiscount,
        subtotal: totalBeforeDiscount,
        discount: bumpDiscountAmount,
        grandTotal: grandTotal,
        paidAmount: 0,
        dueAmount: grandTotal,
        note: `Landing Page Order (/landing/${landingPage.slug}) | এরিয়া: ${deliveryArea === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"}${includeBump ? ` | সাথে অর্ডার বাম্প: ${bumpProduct?.productName}${selectedBumpVariant ? ` (${getVariantLabel(selectedBumpVariant)})` : ""} (ছাড়: ৳${bumpDiscountAmount})` : ""}${relatedNotesSummary}${orderNotes.trim() ? ` | অতিরিক্ত নির্দেশনা: ${orderNotes.trim()}` : ""}`,
        customer: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          address: fullAddress.trim(),
        },
        shippingAddress: {
          recipientName: fullName.trim(),
          phoneNumber: cleanPhone,
          address: fullAddress.trim(),
          city: deliveryArea === "inside" ? "Dhaka" : "Outside Dhaka",
        },
        items: orderItemsPayload,
        orderItems: orderItemsPayload,
        userAgent:
          typeof window !== "undefined" ? window.navigator?.userAgent : null,
      };

      const response = await apiClient("/api/order", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      if (response.success || response.id || response.orderNumber) {
        orderPlacedRef.current = true;
        const orderData = response.data || response;
        const orderNum =
          orderData.orderNumber || response.orderNumber || response.id;

        // Track purchase event in DataLayer with customer data
        trackPurchase(
          {
            ...orderData,
            recipientName: fullName.trim(),
            phoneNumber: cleanPhone,
            address: fullAddress.trim(),
            city: deliveryArea === "inside" ? "Dhaka" : "Outside Dhaka",
          },
          orderItemsPayload
        );

        toast.success("আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!", { id: toastId });
        setOrderSuccess({
          orderNumber: orderNum,
          grandTotal: grandTotal,
          phone: cleanPhone,
          name: fullName.trim(),
        });
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Landing order error:", err);
      if (
        err?.code === "DUPLICATE_ORDER" ||
        err?.isDuplicate ||
        err?.message?.toLowerCase().includes("recently placed") ||
        err?.message?.toLowerCase().includes("অর্ডার")
      ) {
        toast.dismiss(toastId);
        const waitTimeText = err?.remainingTimeBn
          ? `অনুগ্রহ করে <b>${err.remainingTimeBn}</b> পর পুনরায় অর্ডার করার চেষ্টা করুন।`
          : "কিছুক্ষণ পর পুনরায় অর্ডার করুন।";

        // Ensure Bengali message even if old English was cached or returned
        let displayMsg = err.message || "";
        if (
          !displayMsg ||
          displayMsg.toLowerCase().includes("you recently placed an order") ||
          displayMsg.toLowerCase().includes("our team is processing it")
        ) {
          displayMsg = `আপনি ইতিমধ্যে একটি অর্ডার${err.orderNumber ? ` (নম্বর: #${err.orderNumber})` : ""} সম্পন্ন করেছেন যা বর্তমানে প্রসেসিং রয়েছে।`;
        }

        const trackUrl = err.orderNumber
          ? `/track-order?orderId=${encodeURIComponent(err.orderNumber)}`
          : `/track-order`;

        Swal.fire({
          icon: "warning",
          title: "দুঃখিত! সম্প্রতি একটি অর্ডার সম্পন্ন হয়েছে",
          html: `
                        <div style="font-family: 'Hind Siliguri', sans-serif;" class="text-left space-y-4 pt-1">
                            <p class="text-slate-900 text-base sm:text-lg font-semibold leading-relaxed">
                                ${displayMsg}
                            </p>
                            <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 space-y-2.5">
                                ${
                                  err.orderNumber
                                    ? `
                                <div class="text-sm sm:text-base font-bold flex items-center justify-between gap-2 text-amber-950 flex-wrap">
                                    <span>অর্ডার রেফারেন্স নম্বর:</span>
                                    <span class="bg-amber-200/80 text-amber-950 px-2.5 py-1 rounded-lg font-extrabold tracking-wide">#${err.orderNumber}</span>
                                </div>`
                                    : ""
                                }
                                <div class="text-amber-900 text-sm sm:text-base font-bold flex items-center gap-2">
                                    <span class="text-lg">⏱️</span>
                                    <span>${waitTimeText}</span>
                                </div>
                            </div>
                            
                            <!-- Track Order Button Banner -->
                            <div class="pt-1">
                                <a 
                                    href="${trackUrl}" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-[#BF756A] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 text-center cursor-pointer no-underline"
                                    style="text-decoration: none;"
                                >
                                    <span>📦 অর্ডার ট্র্যাক করুন (Live Status)</span>
                                </a>
                            </div>

                            <p class="text-xs sm:text-sm text-slate-500 leading-normal text-center pt-1">
                                অর্ডারে কোনো পরিবর্তন করতে চাইলে বা তথ্য জানার থাকলে অনুগ্রহ করে আমাদের কাস্টমার সাপোর্ট হেল্পলাইনে যোগাযোগ করুন।
                            </p>
                        </div>
                    `,
          showCancelButton: true,
          confirmButtonText: "📦 অর্ডার ট্র্যাক করুন",
          cancelButtonText: "ঠিক আছে, বুঝেছি",
          confirmButtonColor: "#D48B80",
          cancelButtonColor: "#64748b",
          customClass: {
            popup: "rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg",
            title: "text-xl sm:text-2xl font-bold text-slate-900 pt-2",
            confirmButton:
              "font-semibold text-base px-6 py-3 rounded-xl shadow-lg order-1",
            cancelButton:
              "font-semibold text-base px-6 py-3 rounded-xl shadow-sm order-2",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(trackUrl, "_blank");
          }
        });
      } else {
        toast.error(
          err.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          { id: toastId },
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="checkout-form"
      className="py-12 sm:py-18 bg-gradient-to-b from-white via-rose-50/20 to-slate-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Highlighted Banner Header */}
        <div
          className="rounded-2xl py-6 px-4 sm:px-8 text-center shadow-lg mb-8 sm:mb-10 max-w-6xl mx-auto border text-white bg-gradient-to-r from-primary via-[#BF756A] to-primary border-primary/40 shadow-primary/20"
        >
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-xl sm:text-2xl md:text-3xl font-black mb-2.5">
            <ShoppingCart
              size={28}
              className="text-white fill-white shrink-0"
            />
            <h2 className="tracking-tight text-white font-extrabold">
              ক্যাশ অন ডেলিভারিতে অর্ডার করতে নিচের ফর্মটি পূরণ করুন
            </h2>
          </div>
          <p className="text-sm sm:text-base text-rose-50 font-medium max-w-2xl mx-auto leading-relaxed">
            অর্ডার কনফার্ম করতে কোনো প্রকার অগ্রিম টাকা দিতে হবে না। ডেলিভারি ম্যানের কাছ থেকে পণ্য দেখে ও পরখ করে মূল্য পরিশোধ করবেন।
          </p>
        </div>

        {orderSuccess ? (
          /* Order Confirmation Screen */
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center border-2 border-emerald-500 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                অভিনন্দন, {orderSuccess.name}!
              </h3>
              <p className="text-sm text-emerald-700 font-bold">
                আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>অর্ডার নাম্বার:</span>
                <strong className="font-hind text-slate-900 text-sm">
                  #{orderSuccess.orderNumber}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>কন্টাক্ট নাম্বার:</span>
                <strong className="font-hind text-slate-900">
                  {orderSuccess.phone}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">
                  মোট প্রদেয় মূল্য (COD):
                </span>
                <strong className="text-primary text-base font-extrabold">
                  ৳ {orderSuccess.grandTotal.toLocaleString()}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে কল করে অর্ডারের তথ্য নিশ্চিত
              করবেন।
            </p>

            <button
              type="button"
              onClick={() => {
                setOrderSuccess(null);
                setFullName("");
                setPhoneNumber("");
                setFullAddress("");
              }}
              className="px-6 py-2.5 bg-secound hover:bg-secound-hover text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              আরেকটি নতুন অর্ডার করুন
            </button>
          </div>
        ) : (
          /* Checkout Form Container */
          <form
            onSubmit={handleFormSubmit}
            suppressHydrationWarning
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
          >
            {/* Col 1: Customer Details Form (Span 6) */}
            <div className="lg:col-span-6 bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
                <UserCheck
                  size={22}
                  className="text-slate-900 shrink-0"
                  strokeWidth={2.4}
                />
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ১. আপনার তথ্য দিন
                </h3>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5 font-hind">
                    আপনার সম্পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="যেমন: আহমেদ সিয়ান"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base font-hind focus:outline-none transition bg-slate-50/50 ${
                        "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5 font-hind">
                    মোবাইল নাম্বার <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="যেমন: 01XXXXXXXXX"
                      maxLength={11}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base font-hind focus:outline-none transition bg-slate-50/50 ${
                        "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block font-hind">
                    অর্ডার কনফার্ম করার জন্য এই নাম্বারে কল করা হবে
                  </span>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5 font-hind">
                    সম্পূর্ণ ডেলিভারি ঠিকানা{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3.5 top-3.5 text-slate-400"
                    />
                    <textarea
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      rows={3}
                      placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলার নাম বিস্তারিত লিখুন..."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm sm:text-base font-hind focus:outline-none transition bg-slate-50/50 min-h-[90px] resize-y ${
                        "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Delivery Area Radio Selection */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2 font-hind">
                    ডেলিভারি এলাকা নির্বাচন করুন{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <label
                      className={`flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        deliveryArea === "inside" ? "border-primary bg-primary-light/50 text-primary font-bold shadow-xs" : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="inside"
                          checked={deliveryArea === "inside"}
                          onChange={() => setDeliveryArea("inside")}
                          className={`shrink-0 ${"accent-primary"}`}
                          suppressHydrationWarning
                        />
                        <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-semibold whitespace-nowrap">
                          ঢাকার ভিতরে
                        </span>
                      </div>
                      <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-hind font-bold shrink-0 ml-1 whitespace-nowrap">
                        ৳ {insideFee}
                      </span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        deliveryArea === "outside" ? "border-primary bg-primary-light/50 text-primary font-bold shadow-xs" : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="outside"
                          checked={deliveryArea === "outside"}
                          onChange={() => setDeliveryArea("outside")}
                          className={`shrink-0 ${"accent-primary"}`}
                          suppressHydrationWarning
                        />
                        <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-semibold whitespace-nowrap">
                          ঢাকার বাইরে
                        </span>
                      </div>
                      <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-hind font-bold shrink-0 ml-1 whitespace-nowrap">
                        ৳ {outsideFee}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Payment Method Notice Box */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  "bg-primary-light/40 border-primary/20"
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    "bg-primary-light text-primary"
                  }`}>
                    <Banknote size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-hind">
                      পেমেন্ট পদ্ধতি:{" "}
                      <span className={`font-extrabold ${"text-primary"}`}>
                        ক্যাশ অন ডেলিভারি (Cash on Delivery)
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-hind">
                      পণ্য ডেলিভারির সময় সম্পূর্ণ টাকা ডেলিভারি ম্যানের হাতে চেক করে পরিশোধ করবেন।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Order Summary & Confirm Button (Span 6) */}
            <div className="lg:col-span-6 bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
                  <Receipt
                    size={22}
                    className="text-slate-900 shrink-0"
                    strokeWidth={2.4}
                  />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    ২. অর্ডার বিবরণী
                  </h3>
                </div>

                {/* Product Summary Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div
                    className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative cursor-pointer group shadow-2xs hover:border-emerald-600 transition"
                    title="বড় করে ছবি দেখতে ক্লিক করুন"
                    onClick={() => openLightbox(product, activeDisplayImg)}
                  >
                    {activeDisplayImg ? (
                      <>
                        <Image
                          src={activeDisplayImg}
                          alt={product.productName || "Product"}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                          unoptimized={
                            typeof activeDisplayImg === "string" &&
                            activeDisplayImg.startsWith("http")
                          }
                        />
                        {/* Always visible magnifying glass badge */}
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors flex items-center justify-center rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-black/55 group-hover:bg-primary text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                            <ZoomIn size={14} className="stroke-[2.5]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <Package size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {product.productName}
                    </h4>
                    {selectedVariant && (
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5 font-hind">
                        ভ্যারিয়েন্ট: {getVariantLabel(selectedVariant)}
                      </p>
                    )}
                    <div className="flex items-baseline flex-wrap gap-2 mt-1">
                      <p className={`text-base sm:text-lg font-black font-hind ${
                        "text-primary"
                      }`}>
                        ৳ {unitPrice.toLocaleString()}
                      </p>
                      {rawUnitPrice > unitPrice && (
                        <>
                          <span className="text-xs sm:text-sm text-slate-400 line-through font-hind">
                            ৳ {rawUnitPrice.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            -৳ {(rawUnitPrice - unitPrice).toLocaleString()} ছাড়
                            (
                            {Math.round(
                              ((rawUnitPrice - unitPrice) / rawUnitPrice) * 100,
                            )}
                            % OFF)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variant Selector (if any) */}
                {variants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 block font-hind">
                        ভ্যারিয়েন্ট নির্বাচন করুন:
                      </label>
                      <span className="text-xs text-slate-500 font-hind">
                        মূল্য ভ্যারিয়েন্ট অনুযায়ী আপডেট হবে
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sortedVariants.map((v) => {
                        const label = getVariantLabel(v);
                        const colorInfo = getVariantColorInfo(v);
                        const isSel = selectedVariant?.id === v.id;
                        const vSelling = parseFloat(v.price || 0);
                        const vRegular = v.regularPrice
                          ? parseFloat(v.regularPrice)
                          : vSelling;
                        const vDisc = parseFloat(
                          variantDiscounts[v.id] ||
                            variantDiscounts[String(v.id)] ||
                            0,
                        );
                        const vEff = Math.max(
                          0,
                          vDisc > 0 ? vRegular - vDisc : vSelling,
                        );

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() =>
                              onSelectVariant && onSelectVariant(v)
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer flex items-center gap-2 ${
                              isSel ? "bg-primary text-white border-primary shadow-xs font-bold" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {v.image ? (
                              <div
                                className="w-4 h-4 rounded-full overflow-hidden relative shrink-0 border border-white/50 hover:scale-125 transition"
                                title="ছবি বড় করে দেখুন"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(product, v.image);
                                }}
                              >
                                <Image
                                  src={v.image}
                                  alt={label}
                                  fill
                                  className="object-cover"
                                  unoptimized={v.image.startsWith("http")}
                                />
                              </div>
                            ) : colorInfo.hasColor ? (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0 inline-block"
                                style={{
                                  backgroundColor: colorInfo.colorValue,
                                }}
                              />
                            ) : null}
                            <span>{label}</span>
                            <span
                              className={`text-[10px] font-hind px-1 rounded ${
                                isSel
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              ৳{vEff.toLocaleString()}
                              {vRegular > vEff && (
                                <span className="line-through ml-1 opacity-60">
                                  ৳{vRegular.toLocaleString()}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Counter */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm sm:text-base font-bold text-slate-800 font-hind">
                    পরিমাণ (Quantity):
                  </span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-base"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 text-sm sm:text-base font-extrabold text-slate-900 font-hind">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Selected Related Products In-Cart Display */}
                {Array.isArray(selectedRelatedItems) && selectedRelatedItems.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 font-hind">
                        <Sparkles size={14} className="text-primary" />
                        <span>অতিরিক্ত যুক্ত করা পণ্যসমূহ:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-hind">
                        {selectedRelatedItems.length} টি পণ্য
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedRelatedItems.map((relItem) => {
                        const rProd = relItem.product;
                        const rPrice = parseFloat(rProd.salePrice || rProd.price || 0);
                        const rImg = (Array.isArray(rProd.images) && rProd.images[0]) || rProd.image || "/placeholder.png";

                        return (
                          <div
                            key={rProd.id}
                            className="flex items-center justify-between gap-3 p-2.5 bg-rose-50/40 rounded-xl border border-primary/20"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden relative shrink-0">
                                <Image
                                  src={typeof rImg === "string" ? rImg : rImg?.url || "/placeholder.png"}
                                  alt={rProd.productName}
                                  fill
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-slate-800 truncate font-hind">
                                  {rProd.productName}
                                </h5>
                                <span className="text-xs font-extrabold text-primary font-hind">
                                  ৳ {rPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Quantity Controls & Remove */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => onUpdateRelatedItemQty && onUpdateRelatedItemQty(rProd.id, Math.max(1, (relItem.quantity || 1) - 1))}
                                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-2.5 py-1 text-xs font-bold text-slate-800 font-hind">
                                  {relItem.quantity || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateRelatedItemQty && onUpdateRelatedItemQty(rProd.id, (relItem.quantity || 1) + 1)}
                                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                title="মুছে ফেলুন"
                                onClick={() => onRemoveRelatedItem && onRemoveRelatedItem(rProd.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Bump Portion (Upsell Add-on) */}
                {bumpProduct && (
                  <div
                    onClick={() => setIncludeBump(!includeBump)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden select-none ${
                      includeBump
                        ? "border-red-600 border-solid bg-red-50/80 shadow-md ring-2 ring-red-500/30 scale-[1.01]"
                        : "border-dotted border-red-500 bg-red-50/40 hover:bg-red-50/70 shadow-xs animate-bump-pulse"
                    }`}
                  >
                    {/* Flash badge - 2 rows on mobile, 1 row on sm+ */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black text-white shadow-md tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-red-700 ring-2 ring-red-300">
                        <Flame
                          size={16}
                          className="animate-pulse text-amber-200 shrink-0 fill-amber-200"
                        />
                        <span className="font-extrabold drop-shadow-xs">
                          এক ক্লিকে যোগ করুন (স্পেশাল অফার)
                        </span>
                      </span>
                      {parseFloat(landingPage.orderBumpDiscount || 0) > 0 && (
                        <span className="inline-flex items-center text-xs sm:text-sm font-black text-red-700 bg-white px-3 py-1 rounded-full border border-red-300 shadow-2xs font-hind">
                          ৳{parseFloat(landingPage.orderBumpDiscount)} অতিরিক্ত ছাড়!
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Checkbox Icon */}
                      <div className="mt-0.5 shrink-0 text-red-600">
                        {includeBump ? (
                          <CheckSquare
                            size={20}
                            className="text-red-600 fill-red-100"
                          />
                        ) : (
                          <Square size={20} className="text-red-400" />
                        )}
                      </div>

                      {/* Bump Product Thumbnail with zoom button */}
                      <div
                        className="w-14 h-14 rounded-lg bg-white border border-red-200 overflow-hidden relative shrink-0 p-1 flex items-center justify-center cursor-zoom-in group shadow-2xs hover:border-red-400 transition"
                        title="সব ভ্যারিয়েন্ট ও ছবি স্লাইড করে জুম দেখতে ক্লিক করুন"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(bumpProduct, bumpDisplayImg);
                        }}
                      >
                        {bumpDisplayImg ? (
                          <>
                            <Image
                              src={bumpDisplayImg}
                              alt={bumpProduct?.productName || "অতিরিক্ত পণ্য"}
                              fill
                              className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
                              unoptimized={
                                typeof bumpDisplayImg === "string" &&
                                bumpDisplayImg.startsWith("http")
                              }
                            />
                            {/* Always visible magnifying glass badge */}
                            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors flex items-center justify-center rounded-lg">
                              <div className="w-5 h-5 rounded-full bg-black/55 group-hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                                <ZoomIn size={12} className="stroke-[2.5]" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <Package
                            size={22}
                            className="text-red-500 m-auto"
                          />
                        )}
                      </div>

                      {/* Bump Content */}
                      <div className="min-w-0 flex-1">
                        {/* Promo Headline */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {landingPage.orderBumpTitle ||
                            "স্পেশাল অ্যাড-অন অফার!"}
                        </h4>

                        {/* Product Name Badge */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                            <Package size={11} className="text-red-600" />
                            <span>{bumpProduct.productName}</span>
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {landingPage.orderBumpSubtitle ||
                            "মূল পণ্যের সাথে একই পার্সেল ডেলিভারিতে পাচ্ছেন আকর্ষণীয় অতিরিক্ত ছাড়!"}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-red-600 font-hind">
                            + ৳{bumpUnitPrice.toLocaleString()}
                          </span>
                          {bumpRegularPrice > bumpUnitPrice && (
                            <span className="text-[11px] text-slate-400 line-through font-hind">
                              ৳{bumpRegularPrice.toLocaleString()}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                              includeBump
                                ? "bg-red-600 text-white shadow-2xs"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {includeBump
                              ? "✓ যোগ করা হয়েছে"
                              : "+ যোগ করতে ক্লিক করুন"}
                          </span>
                        </div>

                        {/* Bump Product Variants Selection */}
                        {bumpVariants.length > 0 && (
                          <div
                            className="mt-2.5 pt-2 border-t border-slate-200/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <label className="text-[10px] font-bold text-slate-700 block mb-1">
                              ভ্যারিয়েন্ট / সাইজ / কালার পছন্দ করুন:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {bumpVariants.map((v) => {
                                const isSelected =
                                  selectedBumpVariant?.id === v.id;
                                const label = getVariantLabel(v);
                                const colorInfo = getVariantColorInfo(v);
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedBumpVariant(v);
                                      if (!includeBump) setIncludeBump(true);
                                    }}
                                    className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                                      isSelected
                                        ? "bg-primary text-white border-primary shadow-xs"
                                        : "bg-white text-slate-700 border-slate-300 hover:border-primary/50"
                                    }`}
                                  >
                                    {v.image ? (
                                      <img
                                        src={v.image}
                                        alt={label}
                                        className="w-3.5 h-3.5 rounded object-cover"
                                      />
                                    ) : colorInfo.hasColor ? (
                                      <span
                                        className="w-3 h-3 rounded-full border border-black/20 shrink-0 inline-block"
                                        style={{
                                          backgroundColor: colorInfo.colorValue,
                                        }}
                                      />
                                    ) : null}
                                    <span>{label}</span>
                                    {v.price && (
                                      <span
                                        className={`text-[9px] ${isSelected ? "text-amber-200" : "text-slate-400"}`}
                                      >
                                        (৳{v.price})
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bill Calculations */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>মূল পণ্যের মূল্য ({quantity} টি):</span>
                    <strong className="text-slate-900 font-hind">
                      ৳ {mainSubtotal.toLocaleString()}
                    </strong>
                  </div>

                  {Array.isArray(selectedRelatedItems) && selectedRelatedItems.length > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>সম্পর্কিত অতিরিক্ত পণ্য ({selectedRelatedItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} টি):</span>
                      <strong className="text-slate-900 font-hind">
                        + ৳ {relatedSubtotal.toLocaleString()}
                      </strong>
                    </div>
                  )}

                  {includeBump && bumpProduct && (
                    <div className="flex justify-between text-slate-700">
                      <span>
                        অর্ডার বাম্প ({bumpProduct.productName}
                        {selectedBumpVariant
                          ? ` - ${getVariantLabel(selectedBumpVariant)}`
                          : ""}
                        ):
                      </span>
                      <strong className="text-slate-900 font-hind">
                        + ৳ {bumpUnitPrice.toLocaleString()}
                      </strong>
                    </div>
                  )}

                  {includeBump && bumpDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>কম্বো স্পেশাল ডিসকাউন্ট:</span>
                      <strong className="font-hind">
                        - ৳ {bumpDiscountAmount.toLocaleString()}
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span>
                      ডেলিভারি চার্জ (
                      {deliveryArea === "inside"
                        ? "ঢাকার ভিতরে"
                        : "ঢাকার বাইরে"}
                      ):
                    </span>
                    <strong className="text-slate-900 font-hind text-base sm:text-lg">
                      ৳ {deliveryFee}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-lg sm:text-xl font-extrabold text-slate-900 pt-3.5 border-t-2 border-slate-200">
                    <span>সর্বমোট প্রদেয় বিল:</span>
                    <span className={`text-2xl sm:text-3xl font-black font-hind ${
                      "text-primary"
                    }`}>
                      ৳ {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-3 pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-white text-sm sm:text-base md:text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99] ${
                    "bg-primary hover:bg-primary-hover shadow-primary/30"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin shrink-0" />
                      <span className="whitespace-nowrap">অর্ডার প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag
                        size={20}
                        className={`shrink-0 group-hover:scale-110 transition-transform ${
                          "text-white"
                        }`}
                      />
                      <span className="whitespace-nowrap tracking-tight">
                        অর্ডার কনফার্ম করুন - ৳ {grandTotal.toLocaleString()}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 text-center font-semibold font-hind">
                  <ShieldCheck size={16} className="text-emerald-700 mb-0.5" />
                  <span>ক্যাশ অন ডেলিভারিতে ১০০% নিরাপদ ও নিশ্চিন্তে কেনাকাটা</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Interactive Image Slider & Multi-level Zoom Lightbox Modal */}
      {isModalOpen && modalGallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Eye size={17} className="text-primary shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate font-hind">
                  {modalGallery[activeModalIdx]?.title || "পণ্য প্রিভিউ"}
                </h3>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full shrink-0 font-hind">
                  {activeModalIdx + 1} / {modalGallery.length}
                </span>
              </div>

              {/* Controls: Zoom Out, Reset, Zoom In, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  title="Reset Zoom"
                >
                  <RotateCcw size={13} />
                  <span>{Math.round(zoomScale * 100)}%</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 3}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 ml-1 rounded-full bg-slate-200/80 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Image Stage with Left / Right Navigation */}
            <div className="relative w-full h-[340px] sm:h-[460px] md:h-[520px] bg-slate-950/5 flex items-center justify-center overflow-auto p-2 select-none">
              {/* Left Navigation Arrow */}
              {modalGallery.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImg}
                  className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-primary shadow-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Zoomable Image Container */}
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? "grab" : "zoom-in",
                }}
                onClick={() => {
                  if (zoomScale === 1) setZoomScale(1.75);
                  else if (zoomScale === 1.75) setZoomScale(2.5);
                  else setZoomScale(1);
                }}
              >
                <Image
                  src={modalGallery[activeModalIdx]?.url}
                  alt={modalGallery[activeModalIdx]?.title || "Gallery image"}
                  fill
                  className="object-contain p-2"
                  unoptimized={
                    typeof modalGallery[activeModalIdx]?.url === "string" &&
                    modalGallery[activeModalIdx]?.url.startsWith("http")
                  }
                  priority
                />
              </div>

              {/* Right Navigation Arrow */}
              {modalGallery.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImg}
                  className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-primary shadow-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Modal Footer with Thumbnail Strip & Close */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              {/* Horizontal Thumbnail Slider */}
              {modalGallery.length > 1 ? (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-1">
                  {modalGallery.map((item, idx) => {
                    const isCurrent = idx === activeModalIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveModalIdx(idx);
                          setZoomScale(1);
                        }}
                        className={`w-12 h-12 rounded-lg border-2 overflow-hidden relative shrink-0 p-0.5 bg-white transition cursor-pointer ${
                          isCurrent
                            ? "border-primary ring-2 ring-primary/20 scale-105"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={item.url}
                          alt={`Thumb ${idx + 1}`}
                          fill
                          className="object-contain"
                          unoptimized={
                            typeof item.url === "string" &&
                            item.url.startsWith("http")
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  ছবিতে ক্লিক করে অথবা উপরের বাটন দিয়ে জুম করুন
                </div>
              )}

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  ক্লিক করে বড় বা রিসেট করুন
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition font-hind"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
