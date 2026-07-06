"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Flame, Coffee } from 'lucide-react';
import { apiRequest } from '../../lib/api';

interface ComboItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

export default function ComboDealsSection() {
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await apiRequest('/api/v1/combos');
        const resData = await res.json();
        const targetData = resData.data || resData;
        if (res.ok) setCombos(Array.isArray(targetData) ? targetData : []);
      } catch (error) {
        console.error("Lỗi tải danh sách Combo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-[#f8f9fa] min-h-[40vh]">
      <div className="w-9 h-9 border-2 border-red-500/20 border-t-red-600 rounded-full animate-spin mb-4" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Đang tải thực đơn...</span>
    </div>
  );

  return (
    <section className="bg-[#f8f9fa] py-12 md:py-20 px-4 text-zinc-800 antialiased">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 items-start">
        
        {/* --- CỘT TRÁI: TIÊU ĐỀ CỐ ĐỊNH --- */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm">
            <Coffee size={22} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight leading-none text-zinc-900">
            COMBO <br />
            <span className="text-red-600">
              BẮP NƯỚC
            </span>
          </h2>
          <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-sm">
            Đặt kèm bắp nước ngay tại quầy khi đến rạp để nhận mức giá ưu đãi nhất từ hệ thống rạp HNA.
          </p>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-4 border-t border-zinc-200">
            <Flame size={14} className="text-orange-500" /> Nhận trực tiếp tại quầy vị trí soát vé
          </div>
        </div>

        {/* --- CỘT PHẢI: DANH SÁCH SẢN PHẨM KHÔNG CÓ MODAL --- */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {combos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-zinc-200 border-dashed shadow-sm">
              <ShoppingBag size={32} className="text-zinc-300 mb-3" />
              <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Thực đơn đang cập nhật</p>
            </div>
          ) : (
            combos.map((item) => (
              <div 
                key={item.id}
                className="group flex flex-row bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-red-200 transition-all hover:shadow-sm duration-300"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-28 sm:w-40 h-28 sm:h-36 relative flex-shrink-0 bg-zinc-50 border-r border-zinc-100">
                  <img 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={item.name} 
                  />
                </div>

                {/* Nội dung sản phẩm */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                    <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-zinc-900 group-hover:text-red-600 transition-colors">
                      {item.name}
                    </h4>
                    <span className="inline-block text-red-600 font-mono font-bold text-sm sm:text-base whitespace-nowrap">
                      {formatPrice(item.price)}đ
                    </span>
                  </div>
                  
                  <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed max-w-xl">
                    {item.description || "Khẩu phần bắp nước tiêu chuẩn, chuẩn bị nóng hổi ngay khi bạn đến rạp."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}