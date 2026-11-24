import Image from "next/image";
import { Phone, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useStoreSettings } from "@/lib/dataFetch";

export default function LandingMinimalFooter({ phone = "01969968555" }) {
  const { storeSettings } = useStoreSettings();

  const logoSrc =
    storeSettings?.footerLogo ||
    storeSettings?.logo ||
    "/glowbeauty.png";

  return (
    <footer
      id="landing-footer"
      className="w-full bg-[#111827] text-slate-300 py-12 border-t border-slate-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Brand Logo in clean aesthetic card */}
        <div className="inline-block rounded-2xl bg-white px-6 py-3 shadow-md border border-white/20">
          <div className="relative w-44 sm:w-56 h-12 sm:h-14">
            <Image
              src={logoSrc}
              alt="Glow Korean Beauty"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          আমরা শতভাগ আসল ও যাচাইকৃত কোয়ালিটির পণ্য সরবরাহ করি। যেকোন প্রয়োজনে
          সরাসরি আমাদের হটলাইনে যোগাযোগ করতে পারেন।
        </p>

        {/* Hotline Bar */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold">
          <Phone size={14} className="text-primary" />
          <span>হটলাইন হেল্পলাইন:</span>
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="font-hind text-primary font-bold hover:underline"
          >
            {phone}
          </a>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-2 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Truck size={13} className="text-primary" /> সারা বাংলাদেশে ক্যাশ অন
            ডেলিভারি
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-primary" /> ১০০% সুরক্ষিত
            কেনাকাটা
          </span>
          <span className="flex items-center gap-1.5">
            <RotateCcw size={13} className="text-primary" /> সহজ রিটার্ন পলিসি
          </span>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-700/40 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Glow Korean Beauty. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
