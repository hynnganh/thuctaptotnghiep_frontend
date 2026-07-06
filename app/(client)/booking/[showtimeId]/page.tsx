"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, Loader2, Armchair } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import SeatMap from '../SeatMap'; 
import toast, { Toaster } from 'react-hot-toast';
import { getImageUrl } from "@/app/lib/api";

export default function BookingPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [dbSeats, setDbSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [showtimeInfo, setShowtimeInfo] = useState<any>(null);

  // 1. Tải sơ đồ ghế hệ thống và kiểm tra luồng điều hướng để quyết định khôi phục hay xóa sạch
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resSeats, resInfo] = await Promise.all([
          apiRequest(`/api/v1/seats/showtime/${showtimeId}`),
          apiRequest(`/api/v1/showtimes/${showtimeId}`)
        ]);
        if (resSeats.ok && resInfo.ok) {
          setDbSeats((await resSeats.json()).data);
          setShowtimeInfo((await resInfo.json()).data);

          const saved = sessionStorage.getItem('booking_data');
          const isBack = sessionStorage.getItem('is_back_from_combos');

          // Chỉ khôi phục ghế cũ nếu có cờ xác nhận quay lại từ trang Combo
          if (saved && isBack === 'true') {
            const parsed = JSON.parse(saved);
            if (String(parsed.showtimeId) === String(showtimeId) && parsed.selectedSeats) {
              setSelectedSeats(parsed.selectedSeats);
            }
            sessionStorage.removeItem('is_back_from_combos');
          } else {
            // ĐI TỪ TRANG CHỦ VÀO: Xóa sạch dữ liệu cũ để tạo luồng đặt vé mới tinh
            sessionStorage.removeItem('booking_data');
            setSelectedSeats([]);
          }
        }
      } catch (err) { 
        toast.error("Lỗi tải dữ liệu!"); 
      } finally { 
        setFetching(false); 
      }
    };
    loadData();
  }, [showtimeId]);

  // ================= THUẬT TOÁN ĐỐI CHIẾU GHẾ TRỐNG ĐƠN LẺ TOÀN DIỆN CHUẨN CGV =================
  const validateCGVSeatRules = (): boolean => {
    const uniqueRows = Array.from(new Set(dbSeats.map(s => s.seatRow)));

    for (const rowName of uniqueRows) {
      const rowSeats = dbSeats.filter(s => s.seatRow === rowName);
      const seatMapByNum = new Map(rowSeats.map(s => [parseInt(s.seatNumber), s]));

      for (const currentSeat of rowSeats) {
        // 🎯 CHỈ CHO PHÉP GHẾ ĐÔI ĐƯỢC LẺ VÀ KẸP: Nếu là SWEETBOX hoặc COUPLE thì bỏ qua hoàn toàn không check lỗi
        const seatType = currentSeat.seatType ? String(currentSeat.seatType).toUpperCase() : 'NORMAL';
        if (seatType === 'SWEETBOX' || seatType === 'COUPLE') {
          continue;
        }

        const statusStr = String(currentSeat.status).toUpperCase();
        const isOccupied = statusStr === 'OCCUPIED' || statusStr === 'SOLD';
        const isSelected = selectedSeats.some(s => s.id === currentSeat.id);

        // Chỉ quét kiểm tra những ghế thường đang còn TRỐNG sau khi user đã chọn ghế xong
        if (!isOccupied && !isSelected) {
          const currentNum = parseInt(currentSeat.seatNumber);

          // --- Kiểm thử biên kẹp bên TRÁI (Số ghế thực tế - 1) ---
          const leftSeat = seatMapByNum.get(currentNum - 1);
          const leftIsWallOrWalkway = !leftSeat;
          let leftBlockedBySelectionOrOrder = false;
          let leftSelectedByMe = false;

          if (!leftIsWallOrWalkway) {
            const leftOccupied = String(leftSeat.status).toUpperCase() === 'OCCUPIED' || String(leftSeat.status).toUpperCase() === 'SOLD';
            const leftSimSelected = selectedSeats.some(s => s.id === leftSeat.id);
            if (leftOccupied || leftSimSelected) {
              leftBlockedBySelectionOrOrder = true;
              if (leftSimSelected) leftSelectedByMe = true;
            }
          }

          // --- Kiểm thử biên kẹp bên PHẢI (Số ghế thực tế + 1) ---
          const rightSeat = seatMapByNum.get(currentNum + 1);
          const rightIsWallOrWalkway = !rightSeat;
          let rightBlockedBySelectionOrOrder = false;
          let rightSelectedByMe = false;

          if (!rightIsWallOrWalkway) {
            const rightOccupied = String(rightSeat.status).toUpperCase() === 'OCCUPIED' || String(rightSeat.status).toUpperCase() === 'SOLD';
            const rightSimSelected = selectedSeats.some(s => s.id === rightSeat.id);
            if (rightOccupied || rightSimSelected) {
              rightBlockedBySelectionOrOrder = true;
              if (rightSimSelected) rightSelectedByMe = true;
            }
          }

          // 🎯 BIỂU THỨC QUÉT LỖI TOÀN DIỆN CHO GHẾ THƯỜNG (CHẶN CẢ GIỮA VÀ NGOÀI BIÊN)
          let isSingleSeatError = false;

          // Kịch bản 1: Ghế trống thường nằm ở GIỮA HÀNG (bị chặn cứng cả 2 đầu)
          if (!leftIsWallOrWalkway && !rightIsWallOrWalkway && leftBlockedBySelectionOrOrder && rightBlockedBySelectionOrOrder) {
            if (leftSelectedByMe || rightSelectedByMe) isSingleSeatError = true;
          }
          // Kịch bản 2: Ghế trống thường nằm NGOÀI CÙNG BÊN TRÁI (Sát tường/Lối đi trái, bên phải bị user chọn chặn đầu)
          else if (leftIsWallOrWalkway && rightBlockedBySelectionOrOrder && rightSelectedByMe) {
            isSingleSeatError = true;
          }
          // Kịch bản 3: Ghế trống thường nằm NGOÀI CÙNG BÊN PHẢI (Sát tường/Lối đi phải, bên trái bị user chọn chặn đầu)
          else if (rightIsWallOrWalkway && leftBlockedBySelectionOrOrder && leftSelectedByMe) {
            isSingleSeatError = true;
          }

          if (isSingleSeatError) {
            const label = currentSeat.name || `${currentSeat.seatRow}${currentSeat.seatNumber}`;
            
            toast.error(`Không được để lại ghế trống đơn lẻ (${label}) ở giữa hoặc đầu/cuối hàng ghế!`, {
              duration: 4000,
              position: 'top-center',
              style: {
                borderRadius: '16px',
                background: '#ffffff', 
                color: '#1c1917',
                border: '1px solid #fee2e2',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                fontSize: '11px', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              },
              icon: <Armchair size={18} className="text-red-600" />, 
            });
            return false; 
          }
        }
      }
    }
    return true; 
  };

  const handleNext = () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ghế để tiếp tục!", {
        duration: 3000,
        position: 'top-center',
        style: {
          borderRadius: '16px',
          background: '#ffffff', 
          color: '#1c1917',
          border: '1px solid #fee2e2',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          fontSize: '11px', 
          fontWeight: '800', 
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        },
        icon: <Armchair size={18} className="text-red-600" />, 
      });
      return;
    }

    const isSeatsValid = validateCGVSeatRules();
    if (!isSeatsValid) return; 

    const saved = sessionStorage.getItem('booking_data');
    const existingData = saved ? JSON.parse(saved) : {};

    const bookingData = {
      ...existingData, 
      showtimeId,
      movieTitle: showtimeInfo?.movie?.title,
      movieImage: getImageUrl(showtimeInfo?.movie?.posterUrl), 
      cinemaItemId: showtimeInfo?.cinemaItem?.id,
      cinemaName: showtimeInfo?.cinemaItem?.cinema?.name, 
      roomName: showtimeInfo?.cinemaItem?.name,
      date: new Date(showtimeInfo?.startTime).toLocaleDateString('vi-VN'),
      time: new Date(showtimeInfo?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      selectedSeats, 
      seatPrice: selectedSeats.reduce((sum, s) => sum + s.price, 0)
    };

    sessionStorage.setItem('booking_data', JSON.stringify(bookingData));
    router.push(`/booking/${showtimeId}/combos`);
  };

  if (fetching) return <div className="h-screen bg-[#f8f9fa] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Toaster />
      
      {/* THANH TIÊU ĐỀ TRÊN SÁNG */}
      <div className="p-6 bg-white border-b border-zinc-200/80 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-700 transition-colors uppercase text-[10px] font-black italic">
          <ChevronLeft size={16}/> Quay lại
        </button>
        <div className="text-center font-[1000] uppercase italic text-xl tracking-tighter text-zinc-900">
          {showtimeInfo?.movie?.title}
        </div>
        <div className="w-20"></div>
      </div>

      {/* KHU VỰC SƠ ĐỒ GHẾ CHÍNH */}
      <div className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full">
        <div className="select-none"> 
          <SeatMap 
            dbSeats={dbSeats} 
            selectedSeats={selectedSeats} 
            onToggleSeat={(seat) => {
              const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
              
              if (!isAlreadySelected && selectedSeats.length >= 6) {
                toast.error("Mỗi giao dịch chỉ được đặt tối đa 6 ghế!", {
                  duration: 3000,
                  position: 'top-center',
                  style: {
                    borderRadius: '16px',
                    background: '#ffffff', 
                    color: '#1c1917',
                    border: '1px solid #fee2e2',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                    fontSize: '11px', 
                    fontWeight: '800', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  },
                  icon: <Armchair size={18} className="text-red-600" />, 
                });
                return; 
              }
              
              setSelectedSeats(prev => isAlreadySelected 
                ? prev.filter(s => s.id !== seat.id) 
                : [...prev, seat]
              );
            }} 
          />
        </div>
      </div>

      {/* THANH TRẠNG THÁI THANH TOÁN DƯỚI ĐÁY SÁNG */}
      <div className="p-6 px-20 bg-white border-t border-zinc-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex justify-between items-center sticky bottom-0 z-50">
        <div className="space-y-0.5">
          <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
            Ghế đã chọn: <span className="text-zinc-800 font-black">{selectedSeats.map(s => s.seatRow + s.seatNumber).join(', ') || 'Chưa chọn'}</span>
          </p>
          <div className="text-2xl font-[1000] text-red-600 italic tracking-tight">
            {(selectedSeats.reduce((sum, s) => sum + s.price, 0)).toLocaleString()}đ
          </div>
        </div>
        
        <button 
          onClick={handleNext} 
          className="px-8 py-4 bg-red-600 text-white font-black uppercase italic rounded-2xl hover:bg-red-700 active:scale-98 shadow-[0_4px_15px_rgba(220,38,38,0.2)] transition-all flex items-center gap-2 text-xs tracking-wider"
        >
          Chọn Combo 
          <ArrowRight size={15}/>
        </button>
      </div>
    </div>
  );
}