"use client";
import React, { useRef, useMemo, useCallback } from 'react';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import { Heart, Armchair, XCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export interface SeatType {
  id: number | string;
  seatRow: string;
  seatNumber: string;
  status: string;
  seatType: string;
  name?: string;
  price?: number;
}

interface SeatMapProps {
  dbSeats: any[]; // Để any[] nhằm tiếp nhận linh hoạt cấu trúc thô từ API
  selectedSeats: SeatType[];
  onToggleSeat: (seat: SeatType) => void;
}

const SeatMap = ({ dbSeats = [], selectedSeats = [], onToggleSeat }: SeatMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Chuẩn hóa dữ liệu, chấp nhận cả camelCase lẫn snake_case từ Backend
  const normalizedSeats = useMemo(() => {
    if (!Array.isArray(dbSeats)) return [];
    return dbSeats.map(s => ({
      id: s.id,
      seatRow: s.seatRow || s.seat_row || "",
      seatNumber: String(s.seatNumber || s.seat_with_number || s.seat_number || ""),
      status: s.status || "AVAILABLE",
      seatType: s.seatType || s.seat_type || "NORMAL",
      name: s.name || "",
      price: s.price || 0
    }));
  }, [dbSeats]);

  // 1. Trích xuất danh sách hàng ghế độc nhất (A, B, C...) và sắp xếp thứ tự từ mảng đã chuẩn hóa
  const uniqueRows = useMemo(() => {
    const rows = normalizedSeats.map(s => s.seatRow).filter(row => row !== "");
    return Array.from(new Set(rows)).sort();
  }, [normalizedSeats]);
  
  // 2. Tìm số ghế lớn nhất an toàn (Chống dính lỗi toán học NaN)
  const maxSeatsInRow = useMemo(() => {
    const numbers = normalizedSeats.map(s => parseInt(s.seatNumber) || 0);
    return numbers.length > 0 ? Math.max(...numbers, 0) : 0;
  }, [normalizedSeats]);

  // 3. Callback phục vụ tính năng Zoom mượt mà
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty('transform', value);
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] relative bg-[#f8f9fa] overflow-hidden p-4 md:p-5 border border-zinc-200/60 rounded-[2rem]">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* THANH CHÚ THÍCH CƠ BẢN CHO PHONG CÁCH SÁNG */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-xs font-bold text-zinc-500 bg-white border border-zinc-200/80 rounded-2xl py-3 px-6 max-w-xl mx-auto shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400"><Armchair size={11} /></div>
          <span>Thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center text-amber-600"><Armchair size={11} /></div>
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-5 bg-pink-50 border border-pink-200 rounded-lg flex items-center justify-center text-pink-500"><Heart size={11} className="fill-pink-500/10" /></div>
          <span>Đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 border border-red-500 rounded-lg flex items-center justify-center text-white"><XCircle size={11} /></div>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 line-through opacity-40"><Armchair size={11} /></div>
          <span>Đã bán</span>
        </div>
      </div>

      <QuickPinchZoom 
        onUpdate={onUpdate} 
        wheelScaleFactor={0.05} 
        draggableUnZoomed={true}
        inertia={true}
        tapZoomFactor={1.5}
      >
        <div 
          ref={containerRef} 
          className="inline-block origin-[0_0] will-change-transform px-3 min-w-full scale-[0.95] md:scale-100 text-center"
        >
          {/* Khu vực màn hình chiếu phim tông sáng thanh lịch */}
          <div className="max-w-[400px] mx-auto mb-16 relative">
             <div className="w-full h-[4px] bg-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.25)] rounded-full"></div>
             <div className="w-full h-20 bg-gradient-to-t from-transparent to-red-600/5 absolute top-0 blur-xl opacity-30 pointer-events-none"></div>
             <p className="text-[10px] text-zinc-400 font-extrabold uppercase mt-4 tracking-[1.5em] text-center ml-[1.5em]">Màn hình hiển thị chính</p>
          </div>

          {/* Vòng lặp dựng sơ đồ ghế vật lý */}
          <div className="flex flex-col gap-3 items-center justify-center">
            {uniqueRows.map((rowName) => (
              <div key={rowName} className="flex gap-5 items-center">
                <span className="text-[11px] w-6 text-zinc-400 font-black uppercase text-right select-none">{rowName}</span>
                
                <div className="flex gap-2.5">
                  {Array.from({ length: maxSeatsInRow }, (_, i) => {
                    const currentNum = i + 1;
                    // Dò tìm dựa trên mảng dữ liệu chuẩn hóa
                    const seatData = normalizedSeats.find(s => s.seatRow === rowName && parseInt(s.seatNumber) === currentNum);
                    
                    if (!seatData) return <div key={i} className="w-9 h-9 opacity-0" />;

                    const statusStr = String(seatData.status).toUpperCase();
                    const isOccupied = statusStr === 'OCCUPIED' || statusStr === 'SOLD';
                    const isSelected = selectedSeats.some(s => s.id === seatData.id);
                    
                    const type = seatData.seatType?.toUpperCase();
                    const isSweet = type === 'SWEETBOX' || type === 'COUPLE';
                    const isVip = type === 'VIP';
                    const label = seatData.name || `${rowName}${currentNum}`;

                    return (
                      <button
                        key={seatData.id}
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seatData)}
                        className={`
                          relative transition-all duration-200 flex flex-col items-center justify-center shrink-0 rounded-xl border font-bold
                          ${isSweet ? 'w-20 h-10' : 'w-9 h-9'} 
                          ${isOccupied 
                            ? 'bg-zinc-200/50 border-zinc-200 text-zinc-400 line-through cursor-not-allowed opacity-40 scale-95 shadow-none' 
                            : isSelected 
                              ? 'bg-red-600 border-red-500 text-white shadow-[0_6px_20px_rgba(220,38,38,0.3)] scale-105 z-10' 
                              : isSweet
                                ? 'bg-pink-50/60 border-pink-200 text-pink-600 hover:border-pink-400 hover:bg-pink-50 shadow-sm'
                                : isVip
                                  ? 'bg-amber-50/60 border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50 shadow-sm'
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          {/* ĐỔI ICON SANG CHỮ X KHI GHẾ ĐÃ ĐƯỢC CHỌN */}
                          {isSelected ? (
                            <XCircle size={isSweet ? 13 : 11} className="text-white fill-white/10 animate-in fade-in zoom-in-75 duration-200" />
                          ) : isSweet ? (
                            <Heart size={13} className="fill-pink-500/10" />
                          ) : (
                            <Armchair size={11} className={`opacity-50 ${isVip ? 'text-amber-600' : 'text-zinc-400'}`} />
                          )}
                          
                          <span className={`font-extrabold tracking-tighter ${isSweet ? 'text-[8.5px]' : 'text-[9.5px]'} ${isSelected ? 'text-white' : 'text-current'}`}>
                            {label}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] w-6 text-zinc-400 font-black uppercase text-left select-none">{rowName}</span>
              </div>
            ))}
          </div>
          
          <div className="h-20"></div>
        </div>
      </QuickPinchZoom>
    </div>
  );
};

export default SeatMap;