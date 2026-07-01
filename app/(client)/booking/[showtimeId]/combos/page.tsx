"use client";

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Minus, Loader2, Utensils } from 'lucide-react';
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
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md px-8 py-6 flex items-center border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="ml-4 text-xs font-black uppercase tracking-[0.2em] text-red-600">Quay lại</h1>
      </header>

      {/* Grid 4 cột - Rộng rãi */}
      <main className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-40">
        {combos.map((c) => {
          const qty = selectedCombos.find(i => i.id === c.id)?.quantity || 0;
          const isOutOfStock = c.stock <= 0;

          return (
            <div key={c.id} className={`flex flex-col bg-zinc-900/40 border ${isOutOfStock ? 'opacity-40 grayscale' : 'border-white/5 hover:border-red-600/50'} rounded-3xl overflow-hidden transition-all group`}>
              <div className="aspect-video overflow-hidden bg-black">
                <img src={getImageUrl(c.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.name} />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-sm">{c.name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 mb-4 line-clamp-2">{c.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-red-500 font-black text-sm">{c.price.toLocaleString()}đ</span>
                  {!isOutOfStock ? (
                    <div className="flex items-center gap-2 bg-black rounded-full p-1 border border-white/5">
                      {qty > 0 && (
                        <button onClick={() => updateQuantity(c, -1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-800"><Minus size={12} /></button>
                      )}
                      {qty > 0 && <span className="text-xs font-bold w-6 text-center">{qty}</span>}
                      <button onClick={() => updateQuantity(c, 1)} disabled={qty >= c.stock} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-black hover:bg-red-600 hover:text-white transition-all disabled:opacity-30">
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : <span className="text-[10px] font-black uppercase text-red-600">Hết</span>}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer cố định */}
      <div className="fixed bottom-0 w-full px-8 py-6 bg-gradient-to-t from-[#050505] to-transparent z-40">
        <div className="max-w-[1400px] mx-auto bg-black border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase">Tổng tiền thanh toán</p>
            <p className="text-2xl font-black text-white tracking-tight">{finalTotal.toLocaleString()}đ</p>
          </div>
          <button onClick={handleNext} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
