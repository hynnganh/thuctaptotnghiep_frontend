"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#fcfcfd] text-zinc-600 border-t border-zinc-200/60 font-sans antialiased">
      {/* ===== PHẦN NỘI DUNG CHÍNH ===== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-sm">
          
          {/* Cột 1: Thương hiệu & Mạng xã hội */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-2xl font-black text-black tracking-tighter uppercase italic">
              H<span className="text-yellow-500 font-sans not-italic">N</span>A <span className="text-xs text-zinc-400 font-bold tracking-[0.2em] not-italic">Việt Nam</span>
            </h4>
            <p className="text-zinc-500 leading-relaxed max-w-sm text-[13px]">
              Hệ thống rạp chiếu phim hiện đại với công nghệ âm thanh Dolby Atmos và màn hình IMAX cực đại. Mang đến trải nghiệm điện ảnh đích thực.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/anhloveyou08" },
                { Icon: Instagram, href: "https://www.instagram.com/hynnganh" },
                { Icon: Youtube, href: "#" }
              ].map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href} 
                  className="hover:text-black text-zinc-400 transition-all p-2.5 bg-zinc-100 rounded-xl hover:bg-zinc-200/70 border border-zinc-200/40"
                  aria-label="Social Media"
                >
                  <item.Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="text-zinc-900 font-black uppercase tracking-wider text-xs mb-4 md:mb-6 border-b-2 border-yellow-400 w-fit pb-1">
              Khám phá
            </h4>
            <ul className="flex flex-col gap-3 font-medium text-[13px]">
              {["Giới thiệu", "Tuyển dụng", "Liên hệ", "Hệ thống rạp"].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="hover:text-yellow-600 text-zinc-500 transform hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="text-zinc-900 font-black uppercase tracking-wider text-xs mb-4 md:mb-6 border-b-2 border-yellow-400 w-fit pb-1">
              Điều khoản
            </h4>
            <ul className="flex flex-col gap-3 font-medium text-[13px]">
              {["Điều khoản chung", "Chính sách bảo mật", "Chính sách thanh toán", "Câu hỏi thường gặp"].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="hover:text-yellow-600 text-zinc-500 transform hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Hỗ trợ */}
          <div>
            <h4 className="text-zinc-900 font-black uppercase tracking-wider text-xs mb-4 md:mb-6 border-b-2 border-yellow-400 w-fit pb-1">
              Hỗ trợ
            </h4>
            <div className="flex flex-col gap-4 text-[13px] font-medium">
              <div className="flex items-start gap-3 group cursor-pointer">
                <Phone size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 group-hover:text-black transition-colors">Hotline: 0869803329</span>
              </div>
              <div className="flex items-start gap-3 group break-all cursor-pointer">
                <Mail size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 group-hover:text-black transition-colors">Email: huynhthingocanh2008@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-zinc-400 font-normal">
                <MapPin size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-zinc-500">Lầu 3, Bitexco, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== DÒNG BẢN QUYỀN DƯỚI CÙNG ===== */}
      <div className="border-t border-zinc-200/60 bg-zinc-50 py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[11px] font-bold tracking-[0.05em] text-zinc-400 max-w-md sm:max-w-none uppercase">
            © 2026 HNA CINEMA - CÔNG TY CỔ PHẦN GIẢI TRÍ HNA.
          </p>
          <div className="flex shrink-0">
            <img 
              src="https://dangkywebvoibocongthuong.com/wp-content/uploads/2021/11/logo-da-thong-bao-bo-cong-thuong.png" 
              alt="Đã thông báo bộ công thương" 
              className="h-7 w-auto opacity-70 hover:opacity-100 transition-all duration-300 object-contain" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
}