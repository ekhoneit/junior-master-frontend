"use client";

import { motion } from "framer-motion";

// Subtle fade-in with very slight upward drift (12px)
// Uses GPU-accelerated opacity & transform (translateY)
// viewport: { once: true, margin: "-40px" } prevents re-animating on scroll back
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1], // easeOutQuart: silky smooth & fast
    },
  },
};

// Simple fade
export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Subtle stagger container for product/category grids
export const staggerContainer = (staggerDelay = 0.04, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

// Reusable lightweight animated section container
export default function MotionSection({
  children,
  className = "",
  delay = 0,
  viewportMargin = "-30px",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        duration: 0.45,
        delay: delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
