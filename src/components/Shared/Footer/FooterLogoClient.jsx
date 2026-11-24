"use client";

import Image from "next/image";
import Link from "next/link";
import { useStoreSettings } from "@/lib/dataFetch";

export default function FooterLogoClient({ initialSettings = null }) {
  const { storeSettings } = useStoreSettings(initialSettings);
  const settings = storeSettings || initialSettings;

  const logoSrc = settings?.footerLogo || settings?.logo || "/juniormaster-logo.png";
  const hasBg = Boolean(settings?.footerLogoBg ?? true);

  return (
    <Link href="/" className="inline-block group mb-3">
      <div
        className={`relative transition-all ${
          hasBg
            ? "w-48 sm:w-60 h-16 sm:h-20 bg-white rounded-xl shadow-xs border border-white/20 flex items-center justify-center p-2"
            : "w-44 sm:w-56 h-12 sm:h-14 bg-white/10 rounded-xl flex items-center justify-center p-1.5"
        }`}
      >
        <Image
          src={logoSrc}
          alt={settings?.siteTitle || "Junior Master"}
          fill
          priority={false}
          className={`object-contain transition-transform duration-200 group-hover:scale-[1.03] ${
            hasBg ? "object-center p-1.5" : "object-center p-1.5"
          }`}
        />
      </div>
    </Link>
  );
}
