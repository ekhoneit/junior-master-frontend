import "./globals.css";
import { Toaster } from "react-hot-toast";

import Script from "next/script";
import PageTracker from "@/components/Analytics/PageTracker";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import FloatingCart from "@/components/Cart/FloatingCart";
import PromotionalPopup from "@/components/Shared/PromotionalPopup";
import ThemeColorInjector from "@/components/Shared/ThemeColorInjector";
import ScrollToTop from "@/components/Shared/ScrollToTop";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://juniormasterbd.com";

export async function generateMetadata() {
  let faviconUrl = "/juniormaster-favicon.png";
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/store-settings`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.favicon) {
        faviconUrl = data.data.favicon;
      }
    }
  } catch (e) {
    // fallback
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Junior Master | Premium Kids Toys, Smart Games & Learning Essentials",
      template: "%s | Junior Master",
    },
    description:
      "Junior Master is Bangladesh's premier kids & babies destination. Shop creative learning toys, smart STEM games, baby care essentials, and kids lifestyle items with cash on delivery across Bangladesh.",
    keywords: [
      "junior master",
      "junior master bd",
      "juniormasterbd.com",
      "kids toys bangladesh",
      "educational toys bd",
      "baby toys online shop bd",
      "creative learning kits for kids",
      "cash on delivery kids products bd"
    ],
    authors: [{ name: "Junior Master", url: SITE_URL }],
    creator: "Junior Master",
    publisher: "Junior Master",
    alternates: {
      canonical: SITE_URL,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: SITE_URL,
      siteName: "Junior Master",
      title: "Junior Master | Premium Kids Toys, Smart Games & Learning Essentials",
      description:
        "Inspire your child's genius! Explore high-quality learning toys, smart baby gear, and kids fashion with nationwide cash on delivery.",
      images: [
        {
          url: "/juniormaster-logo.png",
          width: 800,
          height: 800,
          alt: "Junior Master - Kids Wonder & Learning in Bangladesh",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Junior Master | Premium Kids Toys & Smart Learning",
      description:
        "Inspire your child's genius with creative toys & baby essentials. Nationwide cash on delivery.",
      images: ["/juniormaster-logo.png"],
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({ children }) {
  let dynamicGtmId = GTM_ID;
  let dynamicPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/store-settings`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.gtmId?.trim()) {
        dynamicGtmId = data.data.gtmId.trim();
      }
      if (data?.data?.pixelId?.trim()) {
        dynamicPixelId = data.data.pixelId.trim();
      }
    }
  } catch (_) {}
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Glow Korean Beauty | 100% Pure Organic & Herbal Care in Bangladesh",
        description:
          "Glow Korean Beauty is Bangladesh's trusted herbal & ayurvedic destination offering 100% authentic natural health supplements, diabetes care, and organic food with fast delivery nationwide.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Junior Master",
        url: SITE_URL,
        logo: `${SITE_URL}/juniormaster-logo.png`,
        sameAs: ["https://www.facebook.com/JuniorMasterBD"],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased min-h-screen flex flex-col bg-white text-slate-800"
      >
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${dynamicGtmId}');`,
          }}
        />
        <script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${dynamicGtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Dynamic Meta Pixel - Configured via Admin Branding Settings */}
        {dynamicPixelId ? (
          <>
            <Script
              id="meta-pixel-dynamic"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${dynamicPixelId}');`,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${dynamicPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        <PageTracker />
        <ThemeColorInjector />
        <CartDrawerProvider>
          {children}
          <FloatingCart />
          {/* <WelcomeAudioPlayer /> */}
          {/* <AiAssistantWidget /> */}
          <PromotionalPopup />
          <ScrollToTop />
        </CartDrawerProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
