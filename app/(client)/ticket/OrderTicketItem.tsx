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
          ? 'bg-zinc-950/20 border-red-900/10 opacity-60 grayscale hover:opacity-80' 
          : (isUsed || isExpired)
            ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-zinc-600 shadow-md'
            : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-white/5 hover:border-red-500/40 hover:translate-x-1 shadow-xl shadow-black/40'
      }`}
    >
      {/* CON DẤU TRẠNG THÁI */}
      {isInvalid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none rotate-[-15deg] scale-110">
          <div className={`border-[2px] backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl shadow-black ${
            isCancelled ? 'border-red-500/60 bg-red-950/90' :
            isExpired ? 'border-amber-500/60 bg-amber-950/90' : 
            'border-emerald-500/60 bg-emerald-950/90'
          }`}>
            {isCancelled ? <XCircle size={14} className="text-red-500 stroke-[3]" /> :
             isExpired ? <AlertTriangle size={14} className="text-amber-400 stroke-[3]" /> : 
             <Check size={14} className="text-emerald-400 stroke-[3]" />}
            
            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${
              isCancelled ? 'text-red-500' :
              isExpired ? 'text-amber-400' : 
              'text-emerald-400'
            }`}>
              {isCancelled ? 'ĐÃ HỦY VÉ' : isExpired ? 'HẾT HẠN' : 'ĐÃ SOÁT VÉ'}
            </span>
          </div>
        </div>
      )}

      {/* ĐÈN LED CHỈ THỊ TRẠNG THÁI BÊN TRÁI */}
      <div className={`w-2.5 shrink-0 transition-colors duration-500 ${
        isCancelled ? 'bg-red-900/50' : 
        isUsed ? 'bg-emerald-600/50' : 
        isExpired ? 'bg-amber-600/50' : 
        'bg-red-600 group-hover:bg-red-500'
      }`} />

      {/* THÔNG TIN VÉ */}
      <div className={`flex-1 flex flex-col justify-center px-5 min-w-0 transition-all duration-300 ${
        isInvalid ? 'blur-[0.5px] group-hover:blur-0' : ''
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-zinc-950 border border-white/5 ${
            isInvalid ? 'text-zinc-500' : 'text-red-500'
          }`}>
            ĐƠN: #{order.id}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
            <Clock size={10} />
            {order.time || "N/A"}
          </div>
        </div>
        
        <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${
          isCancelled ? 'text-zinc-500 line-through' :
          (isUsed || isExpired) ? 'text-zinc-400 group-hover:text-white' : 
          'text-white group-hover:text-red-400'
        }`}>
          {order.movieTitle || "Vé Xem Phim"}
        </h4>
        
        {/* 🔥 ĐÃ BỔ SUNG PHÒNG CHIẾU (Tv icon) VÀO ĐÂY */}
        <div className="flex items-center gap-3 mt-1.5 h-5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 shrink-0">
            <Calendar size={11} className="text-zinc-600" />
            {order.date || "Hôm nay"}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 truncate">
            <MapPin size={11} className="text-zinc-600" />
            <span className="truncate max-w-[100px]">{order.cinemaName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 shrink-0">
            <Tv size={11} className="text-zinc-600" />
            <span className="truncate max-w-[80px]">{order.roomName || "N/A"}</span>
          </div>
          {combos.length > 0 && (
            <div className={`flex items-center gap-1 text-[8px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded-md border ${
               isCancelled ? 'text-zinc-600 border-zinc-800 bg-zinc-900/30' : 'text-pink-500 bg-pink-950/20 border-pink-900/30'
            }`}>
              <Coffee size={10} />
              <span>+{combos.length} Combo</span>
            </div>
          )}
        </div>
      </div>

      {/* ĐƯỜNG RĂNG CƯA */}
      <div className="relative w-6 flex flex-col justify-between py-3 opacity-20 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-black -mx-0.5" />
        ))}
      </div>

      {/* CUỐNG VÉ PHẢI */}
      <div className={`w-28 shrink-0 flex flex-col items-center justify-center border-l border-white/5 relative group-hover:bg-white/[0.03] transition-all ${
        isCancelled ? 'bg-zinc-950/50' : 
        (isUsed || isExpired) ? 'bg-zinc-900/50' : 
        'bg-red-600/[0.02]'
      }`}>
        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Vị trí ghế</span>
        <div className="px-2 w-full text-center truncate">
          <p className={`text-xs font-black tracking-tight uppercase transition-colors ${
            isCancelled ? 'text-zinc-600 line-through' :
            (isUsed || isExpired) ? 'text-zinc-500 group-hover:text-zinc-300' : 
            'text-white group-hover:text-red-400'
          }`}>
            {seatNames || "Combo"}
          </p>
        </div>
        
        {!isCancelled && (
           <ChevronRight size={13} className={`transition-colors mt-1 ${
             (isUsed || isExpired) ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-600 group-hover:text-red-500'
           }`} />
        )}
      </div>
    </div>
  );
}