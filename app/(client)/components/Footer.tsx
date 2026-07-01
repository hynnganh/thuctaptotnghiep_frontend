"use client";
import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] text-gray-400 border-t border-white/5 font-sans">
      {/* Phần nội dung chính */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-sm">
          
          {/* Cột 1: Thương hiệu */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-2xl font-black text-white tracking-tighter uppercase">
              A<span className="text-red-600">&</span>K <span className="text-xs text-gray-500 font-bold tracking-[0.2em]">Việt Nam</span>
            </h4>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              Hệ thống rạp chiếu phim hiện đại với công nghệ âm thanh Dolby Atmos và màn hình IMAX cực đại. Mang đến trải nghiệm điện ảnh đích thực.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/anhloveyou08" },
                { Icon: Instagram, href: "https://www.instagram.com/hynnganh" },
                { Icon: Youtube, href: "#" }
              ].map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href} 
                  className="hover:text-red-600 transition-colors p-2.5 bg-white/5 rounded-full hover:bg-white/10"
                  aria-label="Social Media"
                >
                  <item.Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-red-600 w-fit pb-1">
              Khám phá
            </h4>
            <ul className="flex flex-col gap-3">
              {["Giới thiệu", "Tuyển dụng", "Liên hệ", "Hệ thống rạp"].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="hover:text-white transform hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-red-600 w-fit pb-1">
              Điều khoản
            </h4>
            <ul className="flex flex-col gap-3">
              {["Điều khoản chung", "Chính sách bảo mật", "Chính sách thanh toán", "Câu hỏi thường gặp"].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="hover:text-white transform hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-red-600 w-fit pb-1">
              Hỗ trợ
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 group">
                <Phone size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span className="group-hover:text-gray-300 transition-colors">Hotline: 0869803329</span>
              </div>
              <div className="flex items-start gap-3 group break-all">
                <Mail size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span className="group-hover:text-gray-300 transition-colors">Email: huynhthingocanh2008@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-gray-500 italic">
                <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">Lầu 3, Bitexco, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dòng bản quyền dưới cùng */}
      <div className="border-t border-white/5 bg-black py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[11px] md:text-xs font-medium tracking-[0.1em] text-gray-600 max-w-md sm:max-w-none">
            © 2026 HNA CINEMA - CÔNG TY CỔ PHẦN GIẢI TRÍ HNA.
          </p>
          <div className="flex shrink-0">
            <img 
              src="https://dangkywebvoibocongthuong.com/wp-content/uploads/2021/11/logo-da-thong-bao-bo-cong-thuong.png" 
              alt="Đã thông báo bộ công thương" 
              className="h-7 md:h-8 w-auto grayscale opacity-40 hover:opacity-100 transition-opacity object-contain" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
}