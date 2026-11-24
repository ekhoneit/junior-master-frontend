"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Truck,
  Bell,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

export default function TopHeader({ contactData }) {
  const contact = contactData?.data || contactData || {};
  const phone = contact?.phone_number || "01700000000";

  const [location, setLocation] = useState("Bangladesh");
  const [isLocating, setIsLocating] = useState(false);
  const [language, setLanguage] = useState("EN"); // 'BN' | 'EN'
  const [currency, setCurrency] = useState("BDT ৳");

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  // Silent IP-based location detection without browser GPS popup
  useEffect(() => {
    let isMounted = true;

    const detectLocationQuietly = async () => {
      // Check cache first in session
      try {
        const cachedLoc = sessionStorage.getItem("user_detected_location");
        if (cachedLoc) {
          if (isMounted) {
            setLocation(cachedLoc);
          }
          return;
        }
      } catch (_) {}

      // Pure IP lookup (100% silent, never asks user permission)
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const city = data.city || "Dhaka";
          const postal = data.postal || "";
          const formatted = postal ? `${city} ${postal}` : city;
          if (isMounted) {
            setLocation(formatted);
            try {
              sessionStorage.setItem("user_detected_location", formatted);
            } catch (_) {}
          }
        }
      } catch (e) {
        // Fallback default
        if (isMounted) {
          setLocation("Dhaka 1205");
        }
      }
    };

    detectLocationQuietly();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-primary text-orange-100 text-[11px] py-1.5 border-b border-orange-700/40 hidden md:block select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Auto-located city & postal code, Track Order, Help Center, Hotline */}
        <div className="flex items-center gap-5">
          {/* Auto-detected Delivery Location */}
          <div className="flex items-center gap-1.5 text-orange-100">
            <MapPin size={12} className="text-white animate-pulse" />
            <span>Deliver to</span>
            {isLocating ? (
              <span className="flex items-center gap-1 text-orange-200/80 font-medium">
                <Loader2 size={10} className="animate-spin text-white" />
                <span>Locating...</span>
              </span>
            ) : (
              <strong className="text-white font-semibold tracking-tight">
                {location}
              </strong>
            )}
          </div>

          <div className="w-px h-3 bg-white/20" />

          {/* Track Order */}
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 hover:text-white transition font-medium text-orange-100"
          >
            <Truck size={12} className="text-orange-200" />
            <span>Track order</span>
          </Link>

          {/* Help Center */}
          <Link
            href="/faqs"
            className="hover:text-white transition text-orange-100 font-medium"
          >
            Help center
          </Link>

          {/* Hotline for single-store direct support */}
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-1 text-orange-100 hover:text-white transition font-medium"
          >
            <Phone size={11} className="text-orange-200" />
            <span>
              Hotline: <strong className="text-white">{phone}</strong>
            </span>
          </a>
        </div>

        {/* Right: Notifications, Language Toggle, Currency */}
        <div className="flex items-center gap-5">
          {/* Notifications button */}
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer text-orange-100"
          >
            <Bell size={12} className="text-orange-200" />
            <span>Notifications</span>
          </button>

          <div className="w-px h-3 bg-white/20" />

          {/* Language Display (বাংলা / EN) */}
          <div className="flex items-center text-white font-medium">
            <span>বাংলা / EN</span>
          </div>

          <div className="w-px h-3 bg-white/20" />

          {/* Currency */}
          <div className="flex items-center gap-1 font-semibold text-white">
            <span>{currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
