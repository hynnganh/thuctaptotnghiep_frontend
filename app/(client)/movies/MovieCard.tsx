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
  genreNames?: string[]; 
  status?: string;
}

export default function MovieCard({
  id,
  title,
  image,
  rating,
  reviewCount = 0,
  ageRating = "P",
  genreNames = [], 
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
    <div className="group relative flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-[0_20px_40px_rgba(220,38,38,0.08)] hover:-translate-y-3 border border-slate-200/60">

      {/* IMAGE CONTAINER - Khóa cứng tỷ lệ 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
        <img
          src={finalImageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${!isShowing && 'grayscale-[0.2] group-hover:grayscale-0'}`}
          onError={handleImageError}
          loading="lazy"
        />

        {/* GRADIENT ĐỔ BÓNG MỜ MỊN MÀNG */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

        {/* 🎯 ĐỘ TUỔI (Đỏ nhãn T18 / Đen nhãn thường) */}
        <div className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl backdrop-blur-md border font-black text-[11px] tracking-widest uppercase shadow-sm transition-transform duration-500 group-hover:scale-95 ${ageRating === "T18" ? "bg-red-600/90 border-red-400/20 text-white" : "bg-slate-900/90 border-slate-700/20 text-white"}`}>
          {ageRating}
        </div>

        {/* HOVER BUTTONS - Tone Đỏ Đen cao cấp */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-30 px-6 gap-3">
          <Link href={`/movies/${id}`} className="w-full">
            <button className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg transition-all active:scale-95 ${isShowing ? 'bg-red-600 text-white hover:bg-slate-900 hover:text-white' : 'bg-slate-900 text-white hover:bg-red-600 hover:text-white'}`}>
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
            <button className="w-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
              <Info size={16} /> Chi Tiết
            </button>
          </Link>
        </div>
      </div>

      {/* INFO BLOCK - Khóa layout chống lệch dòng */}
      <div className="p-6 relative flex-grow flex flex-col justify-between bg-white">
        <div>
          {/* ⭐ ĐÁNH GIÁ (Giữ màu cam amber chuẩn điện ảnh) */}
          <div className="flex items-center gap-2 mb-2 min-h-[24px]">
            {hasRating ? (
              <>
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span className="text-slate-900 font-extrabold text-[14px]">{displayRating}</span>
                {reviewCount > 0 && (
                  <span className="text-slate-400 text-[13px] font-medium">({formatReviewCount(reviewCount)} đánh giá)</span>
                )}
              </>
            ) : (
              <span className="text-slate-400 text-[13px] font-medium italic">Chưa có đánh giá</span>
            )}
          </div>

          {/* TITLE - Khóa cứng chiều cao bằng 2 dòng văn bản (3.5rem) tránh lệch layout */}
          <h3 className="font-black text-slate-900 text-[17px] md:text-[18px] h-[3.5rem] line-clamp-2 group-hover:text-red-600 transition-colors duration-300 tracking-tight leading-snug mb-2 cursor-pointer">
            {title}
          </h3>

          {/* META THỂ LOẠI */}
          <div className="flex items-center justify-between mb-4 min-h-[20px]">
            <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 line-clamp-1 w-full">
              {!isShowing && <CalendarDays size={12} className="text-red-500 shrink-0" />}
              <span className="truncate">
                {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
              </span>
            </span>
          </div>
        </div>

        {/* LINE ĐÁY CARD - Hoạt họa co giãn khi hover */}
        <div className="w-full bg-slate-100 h-[2px] rounded-full overflow-hidden mt-auto">
          <div className={`h-full w-0 transition-all duration-700 group-hover:w-full ${isShowing ? 'bg-red-600' : 'bg-slate-900'}`} />
        </div>
      </div>
    </div>
  );
}