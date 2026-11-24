'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  // Hide on checkout / full landing focus pages if needed
  const isExcluded = pathname === '/checkout' || pathname?.startsWith('/landing');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Calculate scroll progress percentage (0 to 100)
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setScrollProgress(progress);
      }

      // Show after user scrolls down 300px
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (isExcluded) return null;

  // Circular progress stroke calculation (radius = 20, circumference = 2 * PI * 20 ≈ 125.66)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-primary text-slate-700 hover:text-white shadow-[0_4px_20px_rgba(16,45,80,0.18)] hover:shadow-[0_6px_25px_rgba(244,81,22,0.4)] border border-slate-200/80 hover:border-primary/40 transition-all duration-300 cursor-pointer active:scale-90"
      >
        {/* Dynamic Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 48 48"
        >
          {/* Background Ring Track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            className="stroke-slate-100 group-hover:stroke-white/20 transition-colors"
            strokeWidth="2.5"
          />
          {/* Active Gradient/Primary Progress Ring */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            className="stroke-primary group-hover:stroke-white transition-colors"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Up Arrow Icon with Smooth Hover Float */}
        <ArrowUp
          size={19}
          className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1"
          strokeWidth={2.5}
        />

        {/* Subtle tooltip on hover */}
        <span className="absolute -top-9 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded shadow-md whitespace-nowrap">
          Top
        </span>
      </button>
    </div>
  );
}
