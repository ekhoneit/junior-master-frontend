import Link from "next/link";
import Image from "next/image";
import { Phone, ShoppingBag, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useStoreSettings } from "@/lib/dataFetch";

export default function LandingMinimalHeader({
  phone,
  productName = "Product",
  onOrderClick,
}) {
  const { storeSettings } = useStoreSettings();
  const effectivePhone = phone || storeSettings?.contactPhone || "01558977919";

  const rawPhoneClean = effectivePhone.replace(/\D/g, "");
  const whatsappNumber = rawPhoneClean.startsWith("88")
    ? rawPhoneClean
    : rawPhoneClean.length === 11
      ? `88${rawPhoneClean}`
      : rawPhoneClean || "8801558977919";

  const whatsappMessage = `আসসালামু আলাইকুম! আমি "${productName}" সম্পর্কে জানতে ও সরাসরি অর্ডার করতে আগ্রহী।`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="relative w-28 sm:w-32 h-9 sm:h-10">
          <Image
            src={storeSettings?.logo || "/glowbeauty.png"}
            alt="Glow Korean Beauty"
            fill
            priority
            className="object-contain object-left"
          />
        </div>

        {/* Right WhatsApp & Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold shadow-sm transition active:scale-95"
            title="হোয়াটসঅ্যাপে সরাসরি মেসেজ করুন"
          >
            <FaWhatsapp size={15} className="shrink-0" />
            <span className="font-hind">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onOrderClick}
            className="px-4 sm:px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer animate-bounce hover:animate-none"
          >
            <ShoppingBag size={14} />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </header>
  );
}
