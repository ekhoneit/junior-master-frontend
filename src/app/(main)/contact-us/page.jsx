"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Send, 
    Sparkles, 
    CheckCircle2, 
    MessageCircle,
    ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import Container from "@/components/Shared/Container";

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        subject: "General Inquiry",
        selectedService: "Customer Care",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.mobile.trim() || !formData.message.trim()) {
            toast.error("Please fill in your name, mobile, and message");
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/enquiry-us`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Thank you! Your message has been sent.");
                setSubmitted(true);
                setFormData({
                    name: "",
                    email: "",
                    mobile: "",
                    subject: "General Inquiry",
                    selectedService: "Customer Care",
                    message: ""
                });
            } else {
                toast.error("Could not send message. Please try calling us directly.");
            }
        } catch (err) {
            console.error("Contact submit error:", err);
            toast.error("Network error. Please call our hotline directly.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-[#FAF7F2]/40 min-h-screen py-8 sm:py-14 font-sans">
            <Container>
                {/* Page Title & Breadcrumb */}
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#EDE5DC] text-[11px] font-bold text-primary uppercase tracking-wider mb-3 shadow-2xs">
                        <Sparkles size={13} className="text-primary" />
                        <span>WE ARE HERE FOR YOU</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Contact Glow Korean Beauty
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                        Have questions about Korean skincare routines, authentic product verification, or your orders? Our team is always ready to guide you.
                    </p>
                </div>

                {/* 2-Column Grid: Left Contact Info Cards + Right Send Message Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* LEFT: Contact Info (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Address Card */}
                        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EDE5DC] shadow-xs hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#FBF3EA] text-[#B88348] flex items-center justify-center shrink-0">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                        OUR LOCATION
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900">Store & Dispatch Address</h3>
                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                        Jigatola, Dhanmondi, Dhaka
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Bangladesh
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phone & Hotline Card */}
                        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EDE5DC] shadow-xs hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#FDEEED] text-[#D48B80] flex items-center justify-center shrink-0">
                                    <Phone size={22} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                        DIRECT HOTLINE / WHATSAPP
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900">Call Us Anytime</h3>
                                    <a
                                        href="tel:01901355995"
                                        className="text-base sm:text-lg font-black text-primary hover:underline mt-1 block"
                                    >
                                        01901355995
                                    </a>
                                    <div className="flex items-center gap-2 mt-2">
                                        <a
                                            href="https://wa.me/8801901355995"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
                                        >
                                            <MessageCircle size={14} />
                                            <span>Chat on WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EDE5DC] shadow-xs hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#FBF3EA] text-[#B88348] flex items-center justify-center shrink-0">
                                    <Mail size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                        OFFICIAL EMAIL
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900">Customer Support</h3>
                                    <a
                                        href="mailto:glowkoreanbeautybd@gmail.com"
                                        className="text-xs sm:text-sm font-bold text-slate-800 hover:text-primary transition-colors mt-1 block break-all"
                                    >
                                        glowkoreanbeautybd@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours & Guarantee Card */}
                        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#2D1B1E] to-[#1E1113] text-white rounded-3xl shadow-lg border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck size={20} className="text-[#D48B80]" />
                                <h4 className="text-sm font-bold">100% Authentic Korean Care</h4>
                            </div>
                            <p className="text-xs text-[#E5D7D0] leading-relaxed">
                                Every single skincare bottle is directly imported from authentic Korean suppliers with genuine batch codes.
                            </p>
                            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-[#E5D7D0]">
                                <Clock size={14} className="text-[#B88348]" />
                                <span>Support Hours: 10:00 AM – 10:00 PM (Everyday)</span>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: Send Message Form (7 Cols) */}
                    <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#EDE5DC] shadow-xs">
                        <div className="mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Send us a Message
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Fill up the form below and our beauty advisors will get back to you shortly.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#F0EAE1]">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                    Thank you for contacting Glow Korean Beauty. We will reach you on your phone or email.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-5 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Your Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Nusrat Jahan"
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Mobile Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            required
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="017XXXXXXXX"
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Email Address (Optional)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@gmail.com"
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Subject
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm transition-all bg-white"
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Product Authenticity">Product Authenticity / Routine Advice</option>
                                            <option value="Order Tracking">Order Status / Delivery</option>
                                            <option value="Wholesale / Bulk">Wholesale / Corporate Inquiry</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Your Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can our K-Beauty team assist you today?"
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D48B80] to-[#B88348] hover:from-[#C47A70] hover:to-[#A77338] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Send size={15} />
                                    <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
