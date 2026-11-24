import { ShieldCheck, Sparkles, Truck, CheckCircle2, Award, HeartHandshake } from "lucide-react";

export default function LandingFeatures({ title, features }) {
    const list = Array.isArray(features) && features.length > 0 ? features : [
        { title: "১০০% অরিজিনাল কোরিয়ান প্রোডাক্ট", desc: "কোরিয়া থেকে সরাসরি আমদানিকৃত ১০০% আসল ও বিশ্বস্ত ব্র্যান্ডের স্কিনকেয়ার", icon: "shield" },
        { title: "ক্লিনিক্যাল ও নিরাপদ ফর্মুলা", desc: "কোন প্রকার ক্ষতিকর প্যারাবেন ছাড়া ন্যাচারাল ইনগ্রেডিয়েন্টস দিয়ে তৈরি", icon: "sparkles" },
        { title: "সরাসরি ক্যাশ অন ডেলিভারি", desc: "অগ্রিম পেমেন্ট ছাড়াই পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন", icon: "truck" },
        { title: "দ্রুততম ডেলিভারি ও সাপোর্ট", desc: "সারাদেশে নিরাপদ ও দ্রুততম ডেলিভারি সাথে সার্বক্ষণিক কাস্টমার কেয়ার", icon: "check" },
    ];

    const getIcon = (type) => {
        switch (type) {
            case "shield": return ShieldCheck;
            case "truck": return Truck;
            case "check": return CheckCircle2;
            case "award": return Award;
            default: return Sparkles;
        }
    };

    return (
        <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-rose-50/20 to-white border-b border-rose-100/60 font-hind">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
                        Benefits & Skin Glow
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-secound tracking-tight">
                        {title || "কেন আমাদের পণ্য সেরা?"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {list.map((item, idx) => {
                        const Icon = getIcon(item.icon);
                        return (
                            <div 
                                key={idx} 
                                className="p-6 rounded-2xl bg-white border border-rose-100 hover:border-primary/50 hover:shadow-md transition-all duration-300 space-y-3 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-primary flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
