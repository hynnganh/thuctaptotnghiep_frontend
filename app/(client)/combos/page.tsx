"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, X, Flame, Utensils, Star, Layers } from 'lucide-react';
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
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);

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
    <div className="py-12 flex flex-col items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-red-600 mb-2" size={24} />
      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Đang chuẩn bị...</span>
    </div>
  );

  return (
    <section className="bg-[#050505] py-8 px-4 text-white">
      <div className="max-w-[1200px] mx-auto">
        
        {/* --- HEADER ĐỒNG BỘ THEO DESIGN SYSTEM --- */}
        <div className="mb-6 border-l-[3px] border-red-600 pl-3">
          <h2 className="text-2xl font-black uppercase tracking-wide leading-none">
            COMBO <span className="text-red-600">&</span> BẮP NƯỚC
          </h2>
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mt-1">
            A&K CINEMA EXCLUSIVE
          </span>
        </div>

        {/* --- LƯỚI CARD THU NHỎ SIÊU GỌN --- */}
        {combos.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-[10px] uppercase tracking-widest font-mono">Thực đơn đang được cập nhật</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {combos.map((item) => (
              <div 
                key={item.id}
                className="bg-[#0d0d0d] border border-zinc-900 rounded-xl p-3 flex flex-col justify-between transition-all duration-300 hover:border-zinc-800"
              >
                <div>
                  {/* Khung ảnh bo góc nhẹ giống mục sự kiện */}
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover opacity-95" 
                      alt={item.name} 
                    />
                    {/* Tag giá mini đè góc ảnh */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded border border-white/10">
                      <span className="text-[10px] font-bold text-red-500 font-mono">{formatPrice(item.price)}đ</span>
                    </div>
                  </div>

                  {/* Nhãn nhỏ */}
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block mt-3 mb-1">
                    — QUẦY PHỤC VỤ
                  </span>

                  {/* Tên Combo dạng Chữ in hoa vuông vức */}
                  <h4 className="text-xs font-black uppercase tracking-wide text-zinc-200 line-clamp-1">
                    {item.name}
                  </h4>
                  
                  {/* Mô tả ngắn gọn dòng dưới */}
                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || "Khẩu phần bắp nước tiêu chuẩn chuẩn bị nóng hổi."}
                  </p>
                </div>

                {/* Nút bấm Xem chi tiết phẳng dẹt */}
                <button
                  onClick={() => setSelectedCombo(item)}
                  className="w-full mt-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-zinc-800 transition-colors flex items-center justify-center gap-1"
                >
                  Chi tiết <span>›</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CỬA SỔ MINI MODAL --- */}
      {selectedCombo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#0d0d0d] border border-zinc-800 rounded-xl overflow-hidden p-4 shadow-2xl animate-in slide-in-from-bottom-2">
            
            <button 
              onClick={() => setSelectedCombo(null)}
              className="absolute top-3 right-3 p-1 bg-zinc-900 hover:bg-red-600 text-zinc-400 hover:text-white rounded transition-colors"
            >
              <X size={12} />
            </button>

            <div className="space-y-3">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                <img src={selectedCombo.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block">— CHI TIẾT THỰC ĐƠN</span>
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  {selectedCombo.name}
                </h3>
                <p className="text-[11px] text-zinc-400 leading-normal bg-zinc-950 p-2.5 rounded border border-zinc-900 italic">
                  {selectedCombo.description || "Sự kết hợp hoàn hảo giữa bắp rang thơm lừng cùng thức uống giải khát mát lạnh tại quầy."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                <div>
                  <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider">GIÁ COMBO</span>
                  <span className="text-base font-black text-white font-mono">
                    {formatPrice(selectedCombo.price)}<span className="text-[10px] text-red-500 font-bold ml-0.5">đ</span>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-orange-400 uppercase tracking-wider px-2 py-0.5 bg-orange-500/5 rounded border border-orange-500/10">
                  Phục vụ ngay
                </span>
              </div>

              <button 
                onClick={() => setSelectedCombo(null)}
                className="w-full py-2 bg-zinc-900 hover:bg-white text-zinc-400 hover:text-black rounded font-bold uppercase text-[9px] tracking-wider border border-zinc-800 transition-all duration-200"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}