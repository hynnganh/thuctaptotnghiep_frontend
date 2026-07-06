"use client";

import React from 'react';
import { Calendar, Check, Clock, Coffee, ChevronRight, MapPin, AlertTriangle, XCircle, Tv } from 'lucide-react';

const checkIsExpired = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr || dateStr === "N/A") return false;
  try {
    let year, month, day;
    
    // Nếu BE trả về '2026-06-17'
    if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } 
    // Nếu BE trả về '17/06/2026'
    else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    } else {
      return false;
    }

    const startTime = timeStr.split('-')[0].trim(); 
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const movieTime = new Date(year, month - 1, day, hours, minutes);
    return movieTime < new Date();
  } catch (error) {
    return false;
  }
};

interface OrderTicketItemProps {
  order: any;
  onOpenDetail: (order: any) => void;
}

export default function OrderTicketItem({ order, onOpenDetail }: OrderTicketItemProps) {
  const isCancelled = order.status === 'CANCELLED' || order.status === 'CANCELED';
  const isExpired = order.status === 'PAID' && checkIsExpired(order.date, order.time);
  const isUsed = order.status === 'USED';

  // Biến check tổng hợp: Vé không còn giá trị (Hủy, Hết hạn, Đã Dùng)
  const isInvalid = isCancelled || isUsed || isExpired;

  const tickets = order.orderDetails?.filter((d: any) => d.itemType === 'TICKET') || [];
  const combos = order.orderDetails?.filter((d: any) => d.itemType === 'COMBO') || [];

  const seatNames = tickets.map((t: any) => {
    const match = t.itemName.match(/Ghế\s+([A-Z0-9]+)/i);
    return match ? match[1] : t.itemName;
  }).sort().join(", ");

  return (
    <div 
      onClick={() => onOpenDetail(order)} 
      className={`relative group flex items-stretch transition-all duration-500 h-28 mb-3.5 rounded-2xl border overflow-hidden select-none cursor-pointer ${
        isCancelled 
          ? 'bg-zinc-100/50 border-red-200 opacity-60 grayscale hover:opacity-80' 
          : (isUsed || isExpired)
            ? 'bg-zinc-50 border-zinc-200 opacity-80 hover:opacity-100 hover:border-zinc-400 shadow-sm'
            : 'bg-white border-zinc-200 hover:border-red-500/40 hover:translate-x-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
      }`}
    >
      {/* CON DẤU TRẠNG THÁI */}
      {isInvalid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none rotate-[-15deg] scale-110">
          <div className={`border-[2px] backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md ${
            isCancelled ? 'border-red-400 bg-red-50/95' :
            isExpired ? 'border-amber-400 bg-amber-50/95' : 
            'border-emerald-400 bg-emerald-50/95'
          }`}>
            {isCancelled ? <XCircle size={14} className="text-red-500 stroke-[3]" /> :
             isExpired ? <AlertTriangle size={14} className="text-amber-500 stroke-[3]" /> : 
             <Check size={14} className="text-emerald-600 stroke-[3]" />}
            
            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${
              isCancelled ? 'text-red-500' :
              isExpired ? 'text-amber-600' : 
              'text-emerald-600'
            }`}>
              {isCancelled ? 'ĐÃ HỦY VÉ' : isExpired ? 'HẾT HẠN' : 'ĐÃ SOÁT VÉ'}
            </span>
          </div>
        </div>
      )}

      {/* ĐÈN LED CHỈ THỊ TRẠNG THÁI BÊN TRÁI */}
      <div className={`w-2.5 shrink-0 transition-colors duration-500 ${
        isCancelled ? 'bg-red-300' : 
        isUsed ? 'bg-emerald-400' : 
        isExpired ? 'bg-amber-400' : 
        'bg-red-600 group-hover:bg-red-500'
      }`} />

      {/* THÔNG TIN VÉ */}
      <div className={`flex-1 flex flex-col justify-center px-5 min-w-0 transition-all duration-300 ${
        isInvalid ? 'blur-[0.5px] group-hover:blur-0' : ''
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border ${
            isInvalid 
              ? 'text-zinc-400 border-zinc-200 bg-zinc-100' 
              : 'text-red-600 border-red-100 bg-red-50'
          }`}>
            ĐƠN: #{order.id}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold">
            <Clock size={10} />
            {order.time || "N/A"}
          </div>
        </div>
        
        <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${
          isCancelled ? 'text-zinc-400 line-through' :
          (isUsed || isExpired) ? 'text-zinc-500 group-hover:text-zinc-800' : 
          'text-zinc-800 group-hover:text-red-600'
        }`}>
          {order.movieTitle || "Vé Xem Phim"}
        </h4>
        
        <div className="flex items-center gap-3 mt-1.5 h-5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 shrink-0">
            <Calendar size={11} className="text-zinc-300" />
            {order.date || "Hôm nay"}
          </div>
          {combos.length > 0 && (
            <div className={`flex items-center gap-1 text-[8px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded-md border ${
               isCancelled 
                 ? 'text-zinc-400 border-zinc-200 bg-zinc-100' 
                 : 'text-pink-600 bg-pink-50 border-pink-100'
            }`}>
              <Coffee size={10} />
              <span>+{combos.length} Combo</span>
            </div>
          )}
        </div>
      </div>

      {/* ĐƯỜNG RĂNG CƯA VÉ SÁNG */}
      <div className="relative w-6 flex flex-col justify-between py-3 opacity-60 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#f8f9fa] -mx-0.5 shadow-inner" />
        ))}
      </div>

      {/* CUỐNG VÉ PHẢI */}
      <div className={`w-28 shrink-0 flex flex-col items-center justify-center border-l border-zinc-100 relative group-hover:bg-zinc-50/50 transition-all ${
        isCancelled ? 'bg-zinc-50/30' : 
        (isUsed || isExpired) ? 'bg-zinc-50/50' : 
        'bg-red-50/[0.05]'
      }`}>
        <span className="text-[8px] font-black text-zinc-400 uppercase mb-0.5 tracking-widest">Vị trí ghế</span>
        <div className="px-2 w-full text-center truncate">
          <p className={`text-xs font-black tracking-tight uppercase transition-colors ${
            isCancelled ? 'text-zinc-400 line-through' :
            (isUsed || isExpired) ? 'text-zinc-400 group-hover:text-zinc-600' : 
            'text-zinc-700 group-hover:text-red-600'
          }`}>
            {seatNames || "Combo"}
          </p>
        </div>
        
        {!isCancelled && (
           <ChevronRight size={13} className={`transition-colors mt-1 ${
             (isUsed || isExpired) ? 'text-zinc-300 group-hover:text-zinc-500' : 'text-zinc-400 group-hover:text-red-500'
           }`} />
        )}
      </div>
    </div>
  );
}