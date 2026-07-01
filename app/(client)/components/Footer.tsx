"use client";
import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-gray-400 border-t border-white/5">
      {/* Phần nội dung chính */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 md:px-12 py-16 text-sm">
        
        {/* Cột 1: Thương hiệu */}
        <div className="flex flex-col gap-4">
          <h4 className="text-2xl font-black text-white tracking-tighter uppercase">
            A<span className="text-red-600">&</span>K <span className="text-xs text-gray-500 font-bold tracking-[0.2em]">Việt Nam</span>
          </h4>
          <p className="text-gray-500 leading-relaxed">
            Hệ thống rạp chiếu phim hiện đại với công nghệ âm thanh Dolby Atmos và màn hình IMAX cực đại. Mang đến trải nghiệm điện ảnh đích thực.
          </p>
          <div className="flex gap-4 mt-2">
            {[Facebook, Instagram, Youtube].map((Icon, idx) => (
              <Link key={idx} href="#" className="hover:text-red-600 transition-colors p-2 bg-white/5 rounded-full">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* Cột 2: Khám phá */}
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-red-600 w-fit pb-1">Khám phá</h4>
          <ul className="flex flex-col gap-3">
            {["Giới thiệu", "Tuyển dụng", "Liên hệ", "Hệ thống rạp"].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-red-600 w-fit pb-1">Điều khoản</h4>
          <ul className="flex flex-col gap-3">
            {["Điều khoản chung", "Chính sách bảo mật", "Chính sách thanh toán", "Câu hỏi thường gặp"].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-red-600 w-fit pb-1">Hỗ trợ</h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-red-600" />
              <span>Hotline: 1900 6017</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-red-600" />
              <span>Email: support@akcinema.vn</span>
            </div>
            <div className="flex items-center gap-3 italic text-gray-500">
              <MapPin size={18} className="text-red-600" />
              <span>Lầu 5, Bitexco, Quận 1, TP.HCM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dòng bản quyền dưới cùng */}
      <div className="border-t border-white/5 bg-black py-6">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] md:text-xs font-medium tracking-[0.1em] text-gray-600">
            © 2026 NEXT CINEMA - CÔNG TY CỔ PHẦN GIẢI TRÍ A&K.
          </p>
          <div className="flex gap-6">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Bocongthuong.svg/1200px-Bocongthuong.svg.png" alt="Đã thông báo bộ công thương" className="h-8 grayscale opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}