"use client";

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Minus, Loader2, Utensils, Ticket, ShoppingBag, ArrowRight } from 'lucide-react';
import { apiRequest, getImageUrl } from "@/app/lib/api"; 
import toast, { Toaster } from 'react-hot-toast';

export default function ComboPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCombos = useCallback(async (id: number) => {
    try {
      const res = await apiRequest(`/api/v1/cinema-combos/${id}/combos`);
      if (res.ok) {
        const result = await res.json();
        setCombos(result.data || []);
      }
    } catch { 
      toast.error("Không thể tải thực đơn"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('booking_data');
    if (!saved) {
      router.push(`/booking/${showtimeId}`);
      return;
    }
    
    const parsedData = JSON.parse(saved);
    setBookingData(parsedData);
    if (parsedData.selectedCombos) setSelectedCombos(parsedData.selectedCombos);
    if (parsedData.cinemaItemId) fetchCombos(parsedData.cinemaItemId);
    else setLoading(false);
  }, [showtimeId, router, fetchCombos]);

  // Đánh dấu cờ quay lại trang chọn ghế nếu bấm back
  const handleBack = () => {
    sessionStorage.setItem('is_back_from_combos', 'true');
    router.back();
  };

  const updateQuantity = (combo: any, delta: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(i => i.id === combo.id);
      const newQty = (existing?.quantity || 0) + delta;
      
      if (newQty > combo.stock) {
        toast.error(`Chỉ còn ${combo.stock} phần trong kho!`);
        return prev;
      }
      if (newQty <= 0) return prev.filter(i => i.id !== combo.id);
      if (existing) return prev.map(i => i.id === combo.id ? { ...i, quantity: newQty } : i);
      return [...prev, { ...combo, quantity: 1 }];
    });
  };

  const handleNext = () => {
    const totalComboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const saved = JSON.parse(sessionStorage.getItem('booking_data') || '{}');
    sessionStorage.setItem('booking_data', JSON.stringify({ ...saved, selectedCombos, comboPrice: totalComboPrice }));
    router.push(`/booking/payment`);
  };

  const totalComboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const finalTotal = (bookingData?.seatPrice || 0) + totalComboPrice;

  if (loading) return (
    <div className="h-screen bg-[#f8f9fa] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Toaster position="top-center" />
      
      {/* Header Sáng thanh lịch */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-6 py-5 flex items-center border-b border-zinc-200/80 shadow-sm">
        <button onClick={handleBack} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl transition-all">
          <ChevronLeft size={18} />
        </button>
        <div className="ml-4 flex flex-col">
          <h1 className="text-[10px] font-black uppercase tracking-widest text-red-600">Bước 2: Chọn bắp nước</h1>
          <p className="text-sm font-extrabold text-zinc-900 tracking-tight">{bookingData?.movieTitle || 'Thực đơn ưu đãi'}</p>
        </div>
      </header>

      {/* Bố cục 2 Cột Đột Phá */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-6">
        
        {/* CỘT TRÁI (70%): Danh sách Combo bắp nước */}
        <main className="flex-1 lg:max-w-[calc(100%-380px)]">
          <div className="flex items-center gap-2 mb-6">
            <Utensils size={18} className="text-zinc-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Combo dành cho bạn</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {combos.map((c) => {
              const qty = selectedCombos.find(i => i.id === c.id)?.quantity || 0;
              const isOutOfStock = c.stock <= 0;

              return (
                <div key={c.id} className={`flex flex-col bg-white border ${qty > 0 ? 'border-red-500 shadow-sm shadow-red-500/5' : 'border-zinc-200/60 hover:border-zinc-400'} rounded-2xl overflow-hidden transition-all group`}>
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-100 relative">
                    <img src={getImageUrl(c.imageUrl)} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt={c.name} />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">Hết hàng</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-zinc-900 text-sm tracking-tight line-clamp-1">{c.name}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-red-600 font-black text-sm">{c.price.toLocaleString()}đ</span>
                      
                      {!isOutOfStock && (
                        <div className={`flex items-center gap-1.5 ${qty > 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'} rounded-xl p-1 transition-colors`}>
                          {qty > 0 && (
                            <button onClick={() => updateQuantity(c, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-all"><Minus size={11} /></button>
                          )}
                          {qty > 0 && <span className="text-xs font-extrabold w-5 text-center">{qty}</span>}
                          <button onClick={() => updateQuantity(c, 1)} disabled={qty >= c.stock} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 ${qty > 0 ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-zinc-200 hover:bg-zinc-300'}`}>
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* CỘT PHẢI (30%): Sidebar Hóa Đơn Tóm Tắt */}
        <aside className="w-full lg:w-[340px] shrink-0">
          <div className="sticky top-24 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-3 border-b border-zinc-100">Chi tiết đơn hàng</h2>
            
            {/* Mục Vé phim */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-xl flex items-center justify-center shrink-0">
                <Ticket size={14} />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex justify-between font-extrabold text-zinc-900">
                  <span>Ghế xem phim</span>
                  <span className="text-zinc-600">{(bookingData?.seatPrice || 0).toLocaleString()}đ</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[180px] truncate">
                  Ghế: {bookingData?.selectedSeats?.map((s: any) => s.seatRow + s.seatNumber).join(', ') || '...'}
                </p>
              </div>
            </div>

            {/* Mục Bắp nước */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag size={14} />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex justify-between font-extrabold text-zinc-900">
                  <span>Combo bắp nước</span>
                  <span className="text-zinc-600">{totalComboPrice.toLocaleString()}đ</span>
                </div>
                {selectedCombos.length > 0 ? (
                  <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                    {selectedCombos.map(item => (
                      <div key={item.id} className="flex justify-between text-zinc-400">
                        <span className="max-w-[150px] truncate">x{item.quantity} {item.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400 mt-0.5">Chưa chọn combo nào</p>
                )}
              </div>
            </div>

            {/* Tổng số tiền */}
            <div className="pt-4 border-t border-dashed border-zinc-200 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-zinc-400 font-black uppercase">Thành tiền</p>
                <p className="text-2xl font-[1000] text-red-600 italic tracking-tight">{finalTotal.toLocaleString()}đ</p>
              </div>
            </div>

            {/* Nút hành động */}
            <button onClick={handleNext} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.15)] active:scale-98 transition-all flex items-center justify-center gap-2">
              Tiếp tục thanh toán
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}