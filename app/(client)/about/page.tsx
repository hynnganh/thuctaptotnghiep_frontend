"use client";
import React, { useState } from "react";
import { Info, Phone, FileText, ShieldCheck, HelpCircle, Briefcase, AlertTriangle, CreditCard, ChevronRight } from "lucide-react";

// 🎯 IMPORT CÁC COMPONENT TIẾNG ANH
import AboutContent from "./components/AboutContent";
import RulesContent from "./components/RulesContent";
import TransactionTermsContent from "./components/TransactionTermsContent";
import PaymentPolicyContent from "./components/PaymentPolicyContent";
import PrivacyPolicyContent from "./components/PrivacyPolicyContent";
import GeneralTermsContent from "./components/GeneralTermsContent";
import PartnerContent from "./components/PartnerContent";
import FAQContent from "./components/FAQContent";
import ContactContent from "./components/ContactContent";

const MENU_ITEMS = [
  { id: "gioi-thieu", icon: Info, title: "Giới thiệu A&K" },
  { id: "lien-he", icon: Phone, title: "Liên hệ A&K Cinema" },
  { id: "dieu-khoan-chung", icon: FileText, title: "Điều khoản chung" },
  { id: "giao-dich", icon: CreditCard, title: "Điều khoản giao dịch" },
  { id: "thanh-toan", icon: ShieldCheck, title: "Chính sách thanh toán" },
  { id: "bao-mat", icon: ShieldCheck, title: "Chính sách bảo mật" },
  { id: "faq", icon: HelpCircle, title: "Câu hỏi thường gặp" },
  { id: "doi-tac", icon: Briefcase, title: "Dành cho đối tác" },
  { id: "quy-dinh", icon: AlertTriangle, title: "Quy định tại rạp" },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("gioi-thieu");

  // 🎯 SỬ DỤNG COMPONENT TIẾNG ANH
  const renderContent = () => {
    switch (activeTab) {
      case "gioi-thieu": return <AboutContent />;
      case "lien-he": return <ContactContent />;
      case "dieu-khoan-chung": return <GeneralTermsContent />;
      case "giao-dich": return <TransactionTermsContent />;
      case "thanh-toan": return <PaymentPolicyContent />;
      case "bao-mat": return <PrivacyPolicyContent />;
      case "faq": return <FAQContent />;
      case "doi-tac": return <PartnerContent />;
      case "quy-dinh": return <RulesContent />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* CỘT TRÁI: SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-zinc-900/20 backdrop-blur-xl border border-white/5 rounded-[2rem] p-3 shadow-2xl">
            <div className="p-4 mb-2 border-b border-white/5">
              <h1 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-3 italic">
                <div className="w-2 h-6 bg-red-600 rounded-full" /> Về Chúng Tôi
              </h1>
            </div>
            <nav className="flex flex-col gap-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-500 group overflow-hidden ${
                      isActive ? "bg-gradient-to-r from-red-600/10 to-transparent" : "hover:bg-zinc-900/50"
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md shadow-[0_0_15px_rgba(220,38,38,1)]" />}
                    <div className="flex items-center gap-3 z-10">
                      <Icon size={18} className={`transition-colors duration-300 ${isActive ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? "text-white translate-x-1" : "text-zinc-400 group-hover:text-white group-hover:translate-x-1"}`}>
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight size={16} className={`transition-all duration-300 ${isActive ? "text-red-500 opacity-100 translate-x-0" : "text-zinc-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* CỘT PHẢI: CONTENT */}
        <div className="lg:col-span-8">
          <div key={activeTab} className="bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
}