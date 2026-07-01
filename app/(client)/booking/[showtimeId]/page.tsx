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
                borderRadius: '12px',
                background: '#1a1a1a', 
                color: '#fff',
                border: '1px solid #dc2626',
                fontSize: '11px', 
                fontWeight: '900', 
                textTransform: 'uppercase',
                letterSpacing: '1px'
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
          borderRadius: '12px',
          background: '#1a1a1a', 
          color: '#fff',
          border: '1px solid #dc2626',
          fontSize: '11px', 
          fontWeight: '900', 
          textTransform: 'uppercase',
          letterSpacing: '1px'
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

  if (fetching) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <Toaster />
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-black italic"><ChevronLeft size={16}/> Quay lại</button>
        <div className="text-center font-[1000] uppercase italic text-xl tracking-tighter">{showtimeInfo?.movie?.title}</div>
        <div className="w-20"></div>
      </div>
      <div className="flex-1 py-10">
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
                    borderRadius: '12px',
                    background: '#1a1a1a', 
                    color: '#fff',
                    border: '1px solid #dc2626',
                    fontSize: '11px', 
                    fontWeight: '900', 
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
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
      <div className="p-8 ml-8 bg-zinc-950 border-t border-white/5 flex justify-between items-center sticky bottom-0 z-50">
        <div>
          <p className="text-[10px] text-zinc-500 font-black uppercase">Ghế: <span className="text-white">{selectedSeats.map(s => s.seatRow + s.seatNumber).join(', ') || '...'}</span></p>
          <div className="text-2xl font-[1000] text-red-600 italic">{(selectedSeats.reduce((sum, s) => sum + s.price, 0)).toLocaleString()}đ</div>
        </div>
        <button onClick={handleNext} className="px-10 py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-red-600 hover:text-white transition-all">Chọn Combo <ArrowRight className="inline ml-2" size={16}/></button>
      </div>
    </div>
  );
}