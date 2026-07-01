"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function ComboSection() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await apiRequest("/api/v1/combos", {
          method: "GET",
        });

        if (response.ok) {
          const resData = await response.json();
          // Lấy trực tiếp mảng từ resData.data theo đúng cấu trúc JSON hệ thống trả về
          if (Array.isArray(resData.data)) {
            setCombos(resData.data);
          }
        }
      } catch (error) {
        console.error("Lỗi tải danh sách combo bắp nước:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-6 md:px-12 py-14 bg-[#050505]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-zinc-900/40 border border-zinc-800/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (combos.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-16 bg-[#050505] border-t border-zinc-900/30">
      
      {/* TIÊU ĐỀ SECTION */}
      <div className="flex items-end justify-between mb-10 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)]" /> 
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none italic">
                Menu Bắp Nước
              </h2>
              <Sparkles size={14} className="text-pink-400 animate-pulse" />
            </div>
            <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-2">
              Ưu đãi combo vị ngon bùng nổ không thể bỏ lỡ khi xem phim
            </span>
          </div>
        </div>
        
        {/* NÚT XEM THÊM TÍCH HỢP LINK */}
        <Link href="/combos" className="block">
          <button className="group flex items-center gap-1.5 text-zinc-500 hover:text-white transition-all duration-300 font-bold text-[10px] uppercase tracking-widest">
            Xem menu đầy đủ 
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform text-orange-400" />
          </button>
        </Link>
      </div>

      {/* GRID KHUNG HÌNH CHỮ NHẬT ĐỨNG (PORTRAIT CARD) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-w-[1400px] mx-auto">
        {combos.map((item: any) => (
          <div 
            key={item.id} 
            className="group bg-[#09090b]/40 border border-zinc-900/80 rounded-2xl p-3 flex flex-col transition-all duration-500 hover:border-orange-500/30 hover:bg-zinc-900/10"
          >
            {/* Khung ảnh đứng tỷ lệ 3:4 */}
            <div className="w-full aspect-[3/4] bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <span className="text-[10px] font-black tracking-widest text-zinc-800 uppercase italic">A&K Cinema</span>
              )}
              
              {/* Mặt nạ đen mờ phủ chân ảnh khi hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Khu vực thông tin chi tiết */}
            <div className="flex flex-col pt-3.5 flex-grow text-center sm:text-left px-1">
              <h3 className="text-xs font-black uppercase tracking-wide text-zinc-200 group-hover:text-white truncate transition-colors">
                {item.name}
              </h3>
              
              <p className="text-[10px] text-zinc-500 font-bold mt-1 line-clamp-2 leading-relaxed italic min-h-[30px]">
                {item.description}
              </p>
              
              {/* Giá tiền và phân loại ở đáy thẻ */}
              <div className="pt-2 mt-auto border-t border-zinc-900/60 flex items-center justify-center sm:justify-between w-full">
                <span className="text-[11px] font-[1000] tracking-wider italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
                  {formatPrice(item.price)}
                </span>
                <span className="hidden sm:inline text-[7px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 group-hover:border-zinc-800 transition-colors">
                  Combo
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}