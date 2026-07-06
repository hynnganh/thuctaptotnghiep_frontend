"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/app/lib/api';
import { getTokenByRole } from '@/app/lib/auth';

// 🎯 IMPORT COMPONENTS
import CinemaGroup from './components/CinemaGroup';
import MovieCard from './components/MovieCard';

// 🔥 Hàm sửa lỗi lệch múi giờ: Luôn lấy YYYY-MM-DD theo đúng giờ Local (VN)
const getLocalISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Cinema() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingShowtimes, setFetchingShowtimes] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    setSelectedDate(getLocalISODate(new Date()));
  }, []);

  const handleBooking = (showtimeId: number) => {
    const userToken = getTokenByRole("USER");
    if (!userToken) {
      router.push('/auth');
      return;
    }
    router.push(`/booking/${showtimeId}`);
  };

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest('/api/v1/cinema-items');
        const result = await res.json();
        const list = result.data || [];
        setCinemas(list);
        if (list.length > 0) {
          const firstParent = list[0].cinema?.name || "Khu vực khác";
          setExpandedParent(firstParent);
          setSelectedId(list[0].id);
        }
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (!selectedId || !selectedDate) return;
    
    const fetchShowtimes = async () => {
      setFetchingShowtimes(true);
      try {
        const res = await apiRequest(`/api/v1/showtimes/cinema-item/${selectedId}`);
        const result = await res.json();
        
        if (result?.data) {
          const now = new Date(); 

          // 1. 🔥 LỌC BỎ HOÀN TOÀN SUẤT CHIẾU ĐÃ HỦY
          const filtered = result.data.filter((item: any) => {
            const startTime = new Date(item.startTime);
            const isSameDate = item.startTime.startsWith(selectedDate);
            const isFuture = startTime > now;
            const isLiveStatus = item.status !== 'CANCELLED' && item.status !== 'PENDING_CANCEL';
            
            return isSameDate && isFuture && isLiveStatus;
          });

          // 2. 🔥 SẮP XẾP SUẤT CHIẾU THEO THỜI GIAN TĂNG DẦN
          filtered.sort((a: any, b: any) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

          // 3. Gom nhóm dữ liệu theo bộ phim và định dạng phòng chiếu
          const grouped = filtered.reduce((acc: any, curr: any) => {
            const m = curr.movie;
            if (!m) return acc;
            
            const genreDisplay = m.genreNames?.length > 0 ? m.genreNames.join(" • ") : (m.genre?.name || "Phim");

            if (!acc[m.id]) {
              acc[m.id] = { 
                id: m.id, 
                title: m.title, 
                image: m.posterUrl, 
                duration: m.duration, 
                genre: genreDisplay, 
                tag: m.ageRating || "P", 
                formats: {} 
              };
            }
            const type = curr.room?.name?.includes("IMAX") ? "IMAX 3D" : "2D DIGITAL";
            if (!acc[m.id].formats[type]) acc[m.id].formats[type] = [];
            
            acc[m.id].formats[type].push({ 
                id: curr.id, 
                time: new Date(curr.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }), 
                roomId: curr.room?.id,
                status: curr.status 
              });
            return acc;
          }, {});

          setMovies(Object.values(grouped).map((m: any) => ({ 
            ...m, 
            formats: Object.entries(m.formats).map(([type, times]) => ({ type, times })) 
          })));
        } else {
          setMovies([]);
        }
      } catch (e) { 
        setMovies([]); 
      } finally { 
        setFetchingShowtimes(false); 
      }
    };
    fetchShowtimes();
  }, [selectedId, selectedDate]);

  // 🎯 LOGIC GOM RẠP THEO KHU VỰC
  const groupedCinemas = useMemo(() => {
    const filtered = cinemas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.reduce((acc: any, curr: any) => {
      const parentName = curr.cinema?.name || "Khu vực khác";
      if (!acc[parentName]) acc[parentName] = [];
      acc[parentName].push(curr);
      return acc;
    }, {});
  }, [cinemas, searchTerm]);

  const dateTabs = useMemo(() => {
    const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      return { 
        id: getLocalISODate(d), 
        dayName: i === 0 ? "Hôm nay" : VI_DAYS[d.getDay()], 
        dateNum: d.getDate() 
      };
    });
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-24 pb-16 px-4 text-slate-600 font-sans antialiased selection:bg-red-600 selection:text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* SIDEBAR RẠP (TONE SÁNG) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative group sticky top-24 z-10 bg-[#f8fafc] pb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={14} />
            <input 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Tìm nhanh rạp..." 
              className="w-full bg-white border border-slate-200/80 py-3 pl-10 pr-4 rounded-xl text-[11px] font-bold outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 shadow-sm transition-all text-slate-800 placeholder:text-slate-400" 
            />
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
            {Object.keys(groupedCinemas).length > 0 ? (
              Object.keys(groupedCinemas).map((parentName) => (
                <CinemaGroup
                  key={parentName}
                  parentName={parentName}
                  childrenCinemas={groupedCinemas[parentName]}
                  isExpanded={expandedParent === parentName || searchTerm !== ""}
                  onToggle={() => setExpandedParent(expandedParent === parentName ? null : parentName)}
                  activeChildId={selectedId}
                  onChildSelect={(id: number) => setSelectedId(id)}
                />
              ))
            ) : (
              <div className="text-center py-12 opacity-60 text-[10px] uppercase font-black tracking-widest border border-dashed border-slate-300 bg-white rounded-2xl text-slate-400 shadow-sm">
                Không tìm thấy rạp phù hợp
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT - LỊCH CHIẾU (TONE SÁNG) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* THANH NGÀY CHIẾU */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2.5 border-b border-slate-200/60">
            {dateTabs.map(d => (
              <button 
                key={d.id} 
                onClick={() => setSelectedDate(d.id)} 
                className={`min-w-[55px] py-2.5 flex flex-col items-center rounded-xl border transition-all duration-300 ${
                  selectedDate === d.id 
                    ? 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/10 scale-105 font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`text-[7px] font-black uppercase mb-0.5 ${selectedDate === d.id ? 'text-white/80' : 'text-slate-400'}`}>{d.dayName}</span>
                <span className="text-base font-black tracking-tight">{d.dateNum}</span>
              </button>
            ))}

            {/* ĐATE PICKER CHỌN NGÀY KHÁC */}
            <div className="relative shrink-0 h-full">
              <input 
                type="date" 
                ref={dateInputRef}
                value={selectedDate}
                min={getLocalISODate(new Date())} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer -z-10" 
              />
              <button 
                onClick={() => dateInputRef.current?.showPicker()}
                className={`min-w-[55px] p-2.5 flex flex-col items-center justify-center rounded-xl border transition-all duration-300 ${
                  !dateTabs.some(d => d.id === selectedDate) 
                    ? 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-600 shadow-md scale-105' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <CalendarIcon size={14} className="mb-0.5 opacity-90" />
                <span className="text-[7px] font-black uppercase tracking-wider">Khác</span>
              </button>
            </div>
          </div>

          {/* CHỈ BÁO NGÀY ĐANG CHỌN NGOÀI DANH SÁCH 7 NGÀY */}
          {!dateTabs.some(d => d.id === selectedDate) && (
             <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-xl w-fit shadow-sm">
                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Đang xem:</span>
                <span className="text-[10px] font-black text-slate-700 uppercase">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
             </div>
          )}

          {/* VÙNG HIỂN THỊ DANH SÁCH PHIM & SUẤT CHIẾU */}
          <div className="bg-white rounded-[1.5rem] border border-slate-200/70 p-3 min-h-[420px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            {fetchingShowtimes ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-red-600" size={24} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ suất chiếu...</p>
              </div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {movies.map((m) => (
                  <MovieCard key={m.id} movie={m} onSelect={handleBooking} />
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center p-6">
                <Clock size={32} className="mb-3 text-slate-300" />
                <div className="font-black uppercase text-[10px] tracking-widest text-slate-500>">Không có suất chiếu</div>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs font-medium">Rạp hiện tại chưa xếp lịch cho ngày này, vui lòng chọn ngày khác hoặc đổi chi nhánh rạp kế bên nhé!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* TÙY CHỈNH SCROLLBAR TONE SÁNG */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; }
      `}</style>
    </div>
  );
}