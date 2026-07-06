"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, X, Ticket as TicketIcon, Check, AlertTriangle, Calendar, Clock, MapPin, Film, XCircle, Tv } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import { QRCodeSVG } from 'qrcode.react';
import { Toaster, toast } from 'react-hot-toast';
import OrderTicketItem from './OrderTicketItem';

// Kiểm tra vé hết hạn dựa trên chuỗi ISO String từ showtime.startTime
const checkIsExpired = (startTimeStr: string) => {
  if (!startTimeStr) return false;
  try {
    const movieTime = new Date(startTimeStr);
    return movieTime < new Date();
  } catch (error) {
    return false;
  }
};

export default function TicketsTab() {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quản lý trạng thái Modal chi tiết
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showtimeDetail, setShowtimeDetail] = useState<any>(null);
  const [loadingShowtime, setLoadingShowtime] = useState(false);

  // Gọi API lấy lịch sử vé
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const res = await apiRequest(`/api/v1/tickets/my-history?t=${new Date().getTime()}`);

        if (res.ok) {
          const result = await res.json();
          let rawData: any[] = [];
          
          if (Array.isArray(result)) rawData = result;
          else if (result.data && Array.isArray(result.data)) rawData = result.data;
          else if (result.content && Array.isArray(result.content)) rawData = result.content;

          const groupedTickets: Record<string, any> = {};
          const normalizedOrders: any[] = [];

          rawData.forEach((item: any) => {
            const showtimeStatus = item.showtime?.status || "ACTIVE";

            if (item.orderDetails) {
              normalizedOrders.push({
                ...item,
                date: item.date || "N/A",
                time: item.time || "N/A",
                movieTitle: item.movieTitle || "Vé Xem Phim",
                showtimeStatus: showtimeStatus
              });
              return;
            }

            const code = item.bookingCode || `AK${item.id}`;

            if (!groupedTickets[code]) {
              let dateStr = "Hôm nay";
              let timeStr = "N/A";

              if (item.showtime && item.showtime.startTime) {
                try {
                  const dateObj = new Date(item.showtime.startTime);
                  timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch (e) {
                  console.error(e);
                }
              }

              groupedTickets[code] = {
                id: item.id,
                bookingCode: code,
                status: item.status, 
                showtimeStatus: showtimeStatus, 
                date: dateStr,
                time: timeStr,
                showtime: item.showtime,
                movieTitle: item.showtime?.movie?.title || "Vé Xem Phim",
                createdAt: item.createdAt,
                orderDetails: []
              };
            }

            let sName = "";
            if (item.seatName) {
              sName = item.seatName;
            } else if (item.seatRow && item.seatNumber) {
              sName = `${item.seatRow}${item.seatNumber}`;
            } else if (item.seat && item.seat.name) {
              sName = item.seat.name;
            }

            if (sName) {
              groupedTickets[code].orderDetails.push({
                itemType: "TICKET",
                itemName: sName
              });
            }
          });

          const finalOrders = [...normalizedOrders, ...Object.values(groupedTickets)];

          const validOrders = finalOrders.filter(
            (o: any) => o.status === "PAID" || o.status === "USED" || o.status === "CANCELLED" || o.status === "CANCELED"
          );

          validOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(validOrders);
        } else {
          toast.error("Không thể tải lịch sử vé!");
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử vé:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderHistory();
  }, []);

  const handleOpenDetail = async (order: any) => {
    setSelectedOrder(order);
    setShowtimeDetail(null);
    
    const showtimeId = order.showtime?.id;
    if (!showtimeId) return;

    setLoadingShowtime(true);
    try {
      const res = await apiRequest(`/api/v1/showtimes/${showtimeId}`);
      if (res.ok) {
        const data = await res.json();
        setShowtimeDetail(data.data || data);
      } else {
        console.error("Không thể lấy thông tin chi tiết suất chiếu");
      }
    } catch (err) {
      console.error("Lỗi gọi API showtime:", err);
    } finally {
      setLoadingShowtime(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const isCancelled = o.status === 'CANCELLED' || o.status === 'CANCELED';
    const isExpired = o.status === 'PAID' && checkIsExpired(o.showtime?.startTime || o.date);
    
    if (activeFilter === 'upcoming') return o.status === 'PAID' && !isExpired && !isCancelled;
    if (activeFilter === 'done') return (o.status === 'USED' || isExpired) && !isCancelled;
    if (activeFilter === 'cancelled') return isCancelled; 
    
    return true;
  });

  const cleanSeatsDisplay = () => {
    if (!selectedOrder) return "N/A";
    const tickets = selectedOrder.orderDetails?.filter((d: any) => d.itemType === 'TICKET') || [];
    if (tickets.length === 0) return "N/A";
    
    return tickets.map((t: any) => {
      if (!t.itemName) return "N/A";
      return t.itemName.replace(/Ghế\s+/i, '').trim();
    }).sort().join(", ");
  };

  const isSelectedExpired = selectedOrder && selectedOrder.status === 'PAID' && checkIsExpired(selectedOrder.showtime?.startTime || selectedOrder.date);
  const isSelectedUsed = selectedOrder && selectedOrder.status === 'USED';
  const isSelectedCancelled = selectedOrder && (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'CANCELED');
  const isSystemCancelled = isSelectedCancelled && selectedOrder?.showtimeStatus === 'CANCELLED';
  const isInvalid = isSelectedUsed || isSelectedExpired || isSelectedCancelled;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 px-4 sm:px-6 lg:px-64 py-12 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Hiệu ứng nền tone sáng */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-200 pb-8 relative z-10">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter italic text-zinc-900">Vé điện tử <span className="text-red-600">của tôi</span></h2>
           <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">Hệ thống quản lý vé thông minh</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-zinc-200/80 gap-1 shadow-sm self-start sm:self-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'upcoming', label: 'Vé sắp xem' },
            { id: 'done', label: 'Lịch sử xem' },
            { id: 'cancelled', label: 'Đã hủy' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveFilter(tab.id)} 
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${
                activeFilter === tab.id 
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20' 
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH VÉ */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-red-600" size={32} strokeWidth={2.5} /></div>
      ) : (
        <div className="space-y-1 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar pb-20 relative z-10">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-300 rounded-[2.5rem] bg-white/50 backdrop-blur-sm shadow-sm">
              <TicketIcon className="mx-auto text-zinc-300 mb-4" size={36} />
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Không có dữ liệu vé tương ứng</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="transition-all duration-300">
                <OrderTicketItem order={order} onOpenDetail={handleOpenDetail} />
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL CHI TIẾT VÉ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md transition-opacity duration-300" onClick={() => { setSelectedOrder(null); setShowtimeDetail(null); }} />
          
          <div className="relative bg-white border border-zinc-200 rounded-[2rem] w-full max-w-2xl max-h-[85vh] shadow-[0_10px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 z-10">
            
            <button 
              onClick={() => { setSelectedOrder(null); setShowtimeDetail(null); }} 
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 border border-zinc-200 text-zinc-400 hover:text-zinc-700 transition-all shadow-sm hover:scale-105 active:scale-95"
            >
              <X size={14} strokeWidth={2.5}/>
            </button>

            {/* BÊN TRÁI: THÔNG TIN PHIM */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
                  <Film size={12} className="text-red-600" />
                  HNA Cinema Pass
                </div>

                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tác phẩm điện ảnh</span>
                  <h3 className={`text-xl font-black uppercase tracking-tight leading-tight ${isSelectedCancelled ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                    {selectedOrder.movieTitle}
                  </h3>
                </div>

                <div className={`grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-zinc-100 ${isSelectedCancelled ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <Calendar size={11} className="text-zinc-400" /> Ngày chiếu
                    </div>
                    <span className="text-sm font-extrabold text-zinc-700 mt-1">{selectedOrder.date}</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <Clock size={11} className="text-zinc-400" /> Suất chiếu
                    </div>
                    <span className="text-sm font-extrabold text-zinc-700 mt-1">{selectedOrder.time}</span>
                  </div>

                  {/* Cụm rạp */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <MapPin size={11} className="text-zinc-400" /> Cụm rạp
                    </div>
                    {loadingShowtime ? (
                      <Loader2 className="animate-spin text-zinc-400 mt-2" size={12} />
                    ) : (
                      <span 
                        title={showtimeDetail?.cinemaItem?.name || selectedOrder.cinemaName || "HNA Cinema"}
                        className="text-[13px] font-black text-zinc-700 mt-1 uppercase tracking-wide block break-words leading-tight pr-1"
                      >
                        {showtimeDetail?.cinemaItem?.name || selectedOrder.cinemaName || "HNA Cinema"}
                      </span>
                    )}
                  </div>

                  {/* Phòng chiếu */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <Tv size={11} className="text-zinc-400" /> Phòng chiếu
                    </div>
                    {loadingShowtime ? (
                      <Loader2 className="animate-spin text-zinc-400 mt-2" size={12} />
                    ) : (
                      <span className="text-sm font-black text-red-600 mt-1 uppercase tracking-wide">
                        {showtimeDetail?.room?.name || selectedOrder.roomName || "PHÒNG CHIẾU"}
                      </span>
                    )}
                  </div>

                  {/* Vị trí ghế */}
                  <div className="flex flex-col col-span-2">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <Film size={11} className="text-zinc-400" /> Vị trí ghế
                    </div>
                    <span className="text-xs font-black text-zinc-700 mt-1 tracking-wide bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md w-fit min-w-[40px] text-center shadow-sm">
                      {cleanSeatsDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông báo hủy vé */}
              {isSelectedCancelled ? (
                <div className="mt-6 p-4 rounded-2xl border bg-red-50/60 border-red-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      {isSystemCancelled ? 'THÔNG BÁO TỪ HỆ THỐNG' : 'THÔNG BÁO'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    {isSystemCancelled 
                      ? 'Cinema HNA xin lỗi khách hàng do suất chiếu có vấn đề nên bị huỷ ạ, bên rạp đã đền bù điểm cho khách hàng để đổi mã giảm giá cho lần đặt vé tiếp theo, mong quý khách thông cảm ạ.'
                      : 'Bạn đã huỷ thanh toán.'}
                  </p>
                </div>
              ) : (
                <div className={`mt-6 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border text-center md:text-left w-fit ${
                  (isSelectedUsed || isSelectedExpired) ? 'bg-zinc-50 text-zinc-400 border-zinc-200' : 'bg-red-50 text-red-600 border-red-100/60 animate-pulse'
                }`}>
                  {isSelectedUsed ? 'VÉ ĐÃ QUA SOÁT VÉ' : isSelectedExpired ? 'VÉ HẾT HẠN SUẤT CHIẾU' : 'HỆ THỐNG VÉ ĐIỆN TỬ CHÍNH THỨC'}
                </div>
              )}

            </div>

            {/* ĐƯỜNG RĂNG CƯA NGĂN CÁCH (Xé vé) */}
            <div className="hidden md:flex flex-col justify-between py-6 relative w-[1px] border-r border-dashed border-zinc-200">
              <div className="absolute -top-3 -left-2.5 w-5 h-5 rounded-full bg-[#f8f9fa] border-b border-zinc-200" />
              <div className="absolute -bottom-3 -left-2.5 w-5 h-5 rounded-full bg-[#f8f9fa] border-t border-zinc-200" />
            </div>

            {/* BÊN PHẢI: QR CODE */}
            <div className={`w-full md:w-64 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 border-zinc-100 shrink-0 ${
              isInvalid ? 'bg-zinc-50/40' : 'bg-gradient-to-b md:bg-gradient-to-l from-red-50/[0.15] to-transparent'
            }`}>
              <div className="relative p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-sm overflow-hidden">
                <div className={`bg-white p-3 rounded-xl shadow-sm transition-all duration-300 ${
                  isInvalid ? 'opacity-20 grayscale blur-[1.5px]' : '' 
                }`}>
                  <QRCodeSVG value={selectedOrder.bookingCode || "HNA-CINEMA"} size={130} level="H" includeMargin={false} />
                </div>
                
                {/* CON DẤU TRẠNG THÁI TRÊN QR CODE */}
                {isInvalid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 rotate-[-12deg]">
                    <div className={`border-2 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md ${
                      isSelectedCancelled ? 'border-red-400 bg-white/95 text-red-500' :
                      isSelectedExpired ? 'border-amber-400 bg-white/95 text-amber-600' : 'border-emerald-400 bg-white/95 text-emerald-600'
                    }`}>
                      {isSelectedCancelled ? <XCircle size={14} className="stroke-[2.5]" /> :
                       isSelectedExpired ? <AlertTriangle size={13} className="stroke-[2.5]" /> : <Check size={13} className="stroke-[2.5]" />}
                      
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                        {isSelectedCancelled ? 'ĐÃ HỦY VÉ' : isSelectedExpired ? 'HẾT HẠN' : 'ĐÃ DÙNG'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center w-full">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Mã đặt vé</span>
                <div className={`px-4 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs font-black tracking-[0.2em] shadow-sm text-center w-full max-w-[180px] ${
                  isInvalid ? 'text-zinc-300 line-through decoration-zinc-400' : 'text-zinc-700'
                }`}>
                  {isSelectedCancelled ? '***-***-***' : (selectedOrder.bookingCode || "HNA-CINEMA")}
                </div>
              </div>

              <p className={`mt-5 text-[9px] font-bold text-center tracking-wide ${isInvalid ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {isSelectedCancelled ? 'Mã vé đã được ẩn vì lý do bảo mật' : isInvalid ? 'Vé không còn giá trị sử dụng' : 'Đưa mã này cho nhân viên quầy soát vé'}
              </p>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}