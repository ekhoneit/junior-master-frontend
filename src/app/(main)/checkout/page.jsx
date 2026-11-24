import { Suspense } from "react";
import CheckoutClient from "@/components/Checkout/CheckoutClient";
import { apiClient } from "@/lib/apiClient";

export const metadata = {
    title: "Checkout | Glow Korean Beauty",
    description: "Complete your order with Cash on Delivery across Bangladesh on Glow Korean Beauty.",
};

export default async function CheckoutPage() {
    let contactData = null;
    try {
        const contactRes = await apiClient("/api/contact", {
            next: { revalidate: 15, tags: ['contact'] }
        });
        contactData = contactRes?.data || contactRes || null;
    } catch (_) {}

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
                <div className="w-8 h-8 border-3 border-[#D48B80] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutClient initialContact={contactData} />
        </Suspense>
    );
}
