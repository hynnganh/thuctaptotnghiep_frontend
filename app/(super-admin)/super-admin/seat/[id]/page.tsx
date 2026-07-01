"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import { 
  Loader2, ArrowLeft, Armchair, 
  ShieldCheck, Zap, Monitor, 
  TrendingUp, MapPin, Heart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- SUB-COMPONENTS CHO INTERFACE GỌN GÀNG ---
const LegendItem = ({ dot, label }: { dot: string; label: string }) => (
  <div className="flex items-center gap-2 px-3 border-r border-zinc-900 last:border-none">
    <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{label}</span>
  </div>
);

const StatCard = ({ icon, label, value, subIcon }: any) => (
  <div className="p-5 bg-[#060608] border border-zinc-900 rounded-xl relative overflow-hidden group hover:border-zinc-800 transition-all">
    <div className="relative z-10 space-y-1">
      <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest pt-2">{label}</p>
      <p className="text-xl font-black text-zinc-200 group-hover:text-white transition-colors">{value}</p>
    </div>
    {subIcon && (
      <div className="absolute -bottom-2 -right-2 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity text-white pointer-events-none">
        {subIcon}
      </div>
    )}
  </div>
);

function SeatContent() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id; 

  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!roomId) return;
      try {
        setLoading(true);
        const res = await apiSuperAdminRequest(`/api/v1/seats/room/${roomId}`);
        if (!res.ok) throw new Error();

        const responseData = await res.json();
        const rawSeats = responseData.data || [];
        
        const sortedSeats = [...rawSeats].sort((a: any, b: any) => {
          if (a.seatRow < b.seatRow) return -1;
          if (a.seatRow > b.seatRow) return 1;
          return parseInt(a.seatNumber) - parseInt(b.seatNumber);
        });
        
        setSeats(sortedSeats);
      } catch (err) {
        toast.error("Lỗi đồng bộ sơ đồ (403/500)");
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [roomId]);

  // LOGIC THỐNG KÊ
  const totalSeats = seats.length;
  const normalSeats = seats.filter(s => s.seatType?.toUpperCase() === 'NORMAL').length;
  const vipSeats = seats.filter(s => s.seatType?.toUpperCase() === 'VIP').length;
  const sweetboxSeats = seats.filter(s => s.seatType?.toUpperCase() === 'SWEETBOX').length;
  const soldSeats = seats.filter(s => s.status?.toUpperCase() === 'SOLD' || s.status === false).length;
  
  const roomData = seats[0]?.room || {};
  const cinemaData = roomData?.cinemaItem || {};

  const renderSeatGrid = () => {
    const rows: { [key: string]: any[] } = {};
    seats.forEach(seat => {
      const rowName = seat.seatRow;
      if (!rows[rowName]) rows[rowName] = [];
      rows[rowName].push(seat);
    });

    return Object.keys(rows).sort().map((row) => (
      <div key={row} className="flex gap-4 justify-center items-center mb-2.5 last:mb-0">
        <div className="w-6 text-[11px] font-black text-zinc-700 uppercase text-center">{row}</div>
        
        <div className="flex gap-2">
          {rows[row].map((seat: any) => {
            const type = seat.seatType?.toUpperCase();
            const isSold = seat.status?.toUpperCase() === 'SOLD' || seat.status === false;
            const isSweet = type === 'SWEETBOX';
            const isVip = type === 'VIP';
            
            let seatStyle = "bg-zinc-950/60 border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"; 
            let widthClass = "w-7"; 

            if (isSold) {
              seatStyle = "bg-zinc-900/40 border-transparent opacity-20 cursor-not-allowed text-zinc-700";
            } else if (isVip) {
              seatStyle = "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/40 shadow-sm";
            } else if (isSweet) {
              seatStyle = "bg-pink-500/5 border-pink-500/20 text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/40 shadow-sm";
              widthClass = "w-[64px]"; 
            }

            return (
              <div
                key={seat.id}
                title={`${seat.name} (${type})`}
                className={`h-7 rounded border shrink-0 flex flex-col items-center justify-center transition-all duration-150 group/seat ${widthClass} ${seatStyle}`}
              >
                {isSweet ? (
                  <Heart size={9} className="mb-0.5 opacity-70 group-hover/seat:scale-105 transition-transform" />
                ) : (
                  <Armchair size={9} className="mb-0.5 opacity-40 group-hover/seat:opacity-80 transition-opacity" />
                )}
                <span className="text-[7px] font-bold leading-none tracking-tight">
                  {seat.seatRow}{seat.seatNumber}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-6 text-[11px] font-black text-zinc-700 uppercase text-center">{row}</div>
      </div>
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600 opacity-80" size={28} />
      <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase animate-pulse">Đang đồng bộ sơ đồ ghế...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }} 
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP NAV BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-4">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại
          </button>

          <div className="flex bg-[#060608] border border-zinc-900 rounded-lg p-1.5 shadow-md">
             <LegendItem dot="bg-zinc-600" label={`Thường (${normalSeats})`} />
             <LegendItem dot="bg-amber-500" label={`VIP (${vipSeats})`} />
             <LegendItem dot="bg-pink-500" label={`Sweetbox (${sweetboxSeats})`} />
          </div>
        </div>

        {/* HEADER CHUẨN HOÁ */}
        <header className="space-y-1">
            <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest">
              <ShieldCheck size={14} /> 
              <span>Giám sát nút: {cinemaData.name || "Cinema System"}</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Sơ đồ phòng: {roomData.name || "Seat Layout"}
            </h1>
        </header>

        {/* MÀN HÌNH RẠP CHIẾU */}
        <div className="w-full pt-6 pb-12 text-center relative">
          <div className="w-[60%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto" />
          <div className="w-[30%] h-[2px] bg-red-600/10 mx-auto blur-md absolute top-6 left-1/2 -translate-x-1/2" />
          <p className="text-[8px] font-bold tracking-[1.5em] text-zinc-700 uppercase mt-4 ml-[1.5em]">Màn hình hiển thị chính</p>
        </div>

        {/* SƠ ĐỒ GHẾ (GRID LAYOUT) */}
        <div className="overflow-x-auto pb-6 custom-scrollbar flex justify-start md:justify-center">
          <div className="min-w-max px-10 py-8 bg-[#060608]/40 border border-zinc-900/60 rounded-xl">
            {renderSeatGrid()}
          </div>
        </div>

        {/* DASHBOARD THỐNG KÊ BIẾN ĐỘNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <StatCard 
              icon={<Zap size={16} className="text-red-500"/>} 
              label="Quy mô phòng" 
              value={`${totalSeats} chỗ ngồi`} 
              subIcon={<Monitor size={70}/>}
            />
            <StatCard 
              icon={<TrendingUp size={16} className="text-amber-500"/>} 
              label="Hạng ghế VIP" 
              value={`${vipSeats} ghế`} 
            />
            <StatCard 
              icon={<Heart size={16} className="text-pink-500"/>} 
              label="Hạng đôi tình nhân" 
              value={`${sweetboxSeats} cặp`} 
            />
            <StatCard 
              icon={<MapPin size={16} className="text-zinc-500"/>} 
              label="Tỷ lệ lấp đầy" 
              value={`${totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0}%`} 
            />
        </div>
      </div>
    </div>
  );
}

// BẢO VỆ ĐIỀU HƯỚNG NEXT.JS APP ROUTER
export default function SuperAdminSeatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-bold text-zinc-600 text-xs uppercase tracking-widest">
        Đang khởi tạo phân hệ...
      </div>
    }>
      <SeatContent />
    </Suspense>
  );
}