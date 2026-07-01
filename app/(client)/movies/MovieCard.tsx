"use client";
import React, { useMemo } from 'react';
import Link from "next/link";
import { Ticket, Star, CalendarDays, Info } from "lucide-react";
import { getImageUrl } from "@/app/lib/api";

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: number | string | null; 
  reviewCount?: number;            
  ageRating?: string;
  genreNames?: string[]; // 🎯 THÊM MỚI: Nhận mảng nhiều thể loại
  status?: string;
}

export default function MovieCard({
  id,
  title,
  image,
  rating,
  reviewCount = 0,
  ageRating = "P",
  genreNames = [], // 🎯 THÊM MỚI: Giá trị mặc định
  status
}: MovieCardProps) {

  const isShowing = status === "SHOWING";

  // FIX IMAGE
  const finalImageUrl = useMemo(() => {
    if (!image) {
      return "https://png.pngtree.com/png-clipart/20190611/original/pngtree-surprised-face-expression-png-image_2888052.jpg";
    }
    if (image.startsWith("http")) {
      return image;
    }
    return getImageUrl(image);
  }, [image]);

  // ⭐ CHỈ KIỂM TRA RATING
  const hasRating = rating !== undefined && rating !== null && Number(rating) > 0;

  // ⭐ FORMAT ĐIỂM
  const displayRating = hasRating ? `${Number(rating)}/5` : "";

  // 👥 FORMAT TỔNG LƯỢT ĐÁNH GIÁ
  const formatReviewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // FALLBACK IMAGE
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://png.pngtree.com/png-clipart/20190611/original/pngtree-surprised-face-expression-png-image_2888052.jpg";
  };

  return (
    <div className="group relative flex flex-col bg-[#0a0a0a] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-red-600/10 hover:-translate-y-4 border border-white/5">

      {/* IMAGE */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={finalImageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${!isShowing && 'grayscale-[0.3] group-hover:grayscale-0'}`}
          onError={handleImageError}
          loading="lazy"
        />

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />

        {/* 🎯 ĐỘ TUỔI */}
        <div className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl backdrop-blur-md border font-black text-[11px] tracking-widest uppercase shadow-lg ${ageRating === "T18" ? "bg-red-600/80 border-red-400/30 text-white" : "bg-blue-600/80 border-blue-400/30 text-white"}`}>
          {ageRating}
        </div>

        {/* HOVER BUTTONS */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0 z-30 px-6 gap-3">
          <Link href={`/movies/${id}`} className="w-full">
            <button className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${isShowing ? 'bg-red-600 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
              {isShowing ? (
                <>
                  <Ticket size={18} fill="currentColor" /> Mua Vé Ngay
                </>
              ) : (
                <>
                  <CalendarDays size={18} /> Thông Tin Phim
                </>
              )}
            </button>
          </Link>

          <Link href={`/movies/${id}`} className="w-full">
            <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
              <Info size={16} /> Chi Tiết
            </button>
          </Link>
        </div>
      </div>

      {/* INFO */}
      <div className="p-6 relative flex-grow flex flex-col justify-between">
        <div>
          {/* ⭐ ĐÁNH GIÁ */}
          <div className="flex items-center gap-2 mb-3 min-h-[24px]">
            {hasRating ? (
              <>
                <Star size={18} className="fill-orange-500 text-orange-500" />
                <span className="text-white font-bold text-[15px]">{displayRating}</span>
                {reviewCount > 0 && (
                  <span className="text-zinc-400 text-[14px]">({formatReviewCount(reviewCount)} đánh giá)</span>
                )}
              </>
            ) : (
              <span className="text-zinc-500 text-[14px] font-medium">Chưa có đánh giá</span>
            )}
          </div>

          {/* TITLE */}
          <h3 className="font-black text-white text-[18px] md:text-[20px] line-clamp-2 group-hover:text-red-500 transition-colors duration-300 tracking-tighter leading-tight mb-3 cursor-pointer">
            {title}
          </h3>

          {/* META THỂ LOẠI */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 line-clamp-1">
              {!isShowing && <CalendarDays size={12} className="text-blue-500" />}
              
              {/* 🎯 FIX: Hiển thị mảng thể loại */}
              {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
            </span>
          </div>
        </div>

        {/* LINE */}
        <div className={`h-[2px] w-0 transition-all duration-700 group-hover:w-full ${isShowing ? 'bg-red-600' : 'bg-blue-600'}`} />
      </div>
    </div>
  );
}