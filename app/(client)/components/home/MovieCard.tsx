"use client";

import React from "react";
import { Star, Play } from "lucide-react";
import { getImageUrl } from "../../../lib/api"; 
import Link from "next/link";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: string | number;
  status?: string;
  ageRating?: string;
  genreNames?: string[]; 
  reviewCount?: number;  
}

export default function MovieCard({ 
  id, 
  title, 
  image, 
  rating, 
  status, 
  ageRating = "P", 
  genreNames = [], 
  reviewCount = 0
}: MovieCardProps) {
  const isShowing = status === "SHOWING";
  const hasRating = rating && Number(rating) > 0;
  const displayRating = hasRating ? Number(rating).toFixed(1) : "0.0";

  return (
    <Link 
      href={`/movies/${id}`} 
      // Xóa max-w-[155px], thêm h-full flex flex-col để card luôn đều nhau
      className="block group relative w-full h-full overflow-hidden rounded-[1rem] bg-[#111217] border border-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50 select-none flex flex-col"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#16171d]">
        <img
          src={getImageUrl(image)} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/20 to-transparent opacity-90" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20">
          {/* Phóng to nút Play */}
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {/* 🎯 Nhãn độ tuổi: Phóng to chữ và padding */}
        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded uppercase z-10">
          <span className="text-white text-[10px] font-black tracking-widest">
            {ageRating}
          </span>
        </div>
      </div>

      {/* Nội dung text: Tăng padding, flex-1 để đẩy khối thể loại xuống đáy */}
      <div className="p-3 md:p-3.5 space-y-2 bg-[#111217] flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Tăng cỡ chữ Title lên text-sm */}
          <h3 className="font-bold text-white text-sm line-clamp-1 tracking-tight group-hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>
          
          {/* 🎯 RATING & LƯỢT ĐÁNH GIÁ: Scale font và icon to hơn */}
          <div className="flex items-center gap-1.5">
            <Star size={12} className="fill-orange-500 text-orange-500" />
            <span className="text-white text-xs font-bold">
              {displayRating}<span className="text-zinc-500 font-normal text-[10px]">/5</span>
            </span>
            <span className="text-zinc-500 text-[10px] font-medium ml-0.5">({reviewCount} đánh giá)</span>
          </div>
        </div>
        
        {/* 🎯 THỂ LOẠI & TRẠNG THÁI */}
        <div className="flex items-center justify-between gap-1 text-[11px] pt-1.5 mt-auto border-t border-white/[0.03]">
          <span className="line-clamp-1 text-zinc-400 max-w-[70%]">
            {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono tracking-wide ${
            isShowing ? "text-orange-400 bg-orange-400/5" : "text-sky-400 bg-sky-400/5"
          }`}>
            {isShowing ? "LIVE" : "SẮP"}
          </span>
        </div>
      </div>
    </Link>
  );
}