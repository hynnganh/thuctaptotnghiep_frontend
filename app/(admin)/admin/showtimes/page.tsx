"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Plus, Edit3, Loader2, ChevronLeft, ChevronRight, Upload, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ShowtimeModal from "./ShowtimeModal";
import ImportExcelModal from "./ImportExcelModal";
import { apiAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

const VIETNAMESE_DAYS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export default function AdminShowtimePage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Kiểm tra ngày hiển thị (cả ngày là quá khứ) để chặn nút Tạo suất chiếu
  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }, [selectedDate]);

  // Kiểm tra thời gian chi tiết của từng suất chiếu
  const isPastShowtime = (startTime: string) => {
    return new Date(startTime) < new Date();
  };

  const weekTabs = useMemo(() => {
    const current = new Date(selectedDate);
    const monday = new Date(current);
    monday.setDate(current.getDate() - (current.getDay() || 7) + 1);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      return {
        full: iso,
        label: VIETNAMESE_DAYS[d.getDay()],
        dayNum: d.getDate(),
        isOld: new Date(iso).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0),
      };
    });
  }, [selectedDate]);

  const changeWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resUser = await apiAdminRequest("/api/v1/users/me");
      const user = await resUser.json();
      const idRap = user.data?.managedCinemaItemId;
      if (!idRap) return;
      setCinemaId(idRap);

      const [c, s, r, m] = await Promise.all([
        apiAdminRequest(`/api/v1/cinema-items/${idRap}`),
        apiAdminRequest(`/api/v1/showtimes/cinema-item/${idRap}`),
        apiAdminRequest(`/api/v1/rooms/cinema-item/${idRap}`),
        apiAdminRequest(`/api/v1/movies?status=SHOWING`),
      ]);
      const [cinema, show, room, movie] = await Promise.all([c.json(), s.json(), r.json(), m.json()]);

      setCinemaName(cinema.data?.name);
      
      // Lấy toàn bộ lịch sử suất chiếu (không lọc bỏ quá khứ nữa)
      setShowtimes(show.data || []);
      
      setRooms(room.data || []);
      setMovies(movie.data?.content || movie.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: any) => {
    const tid = toast.loading("Đang xử lý...");
    try {
      const res = await apiAdminRequest(
        data.id ? `/api/v1/showtimes/${data.id}` : "/api/v1/showtimes",
        {
          method: data.id ? "PUT" : "POST",
          body: JSON.stringify({ ...data, cinemaItemId: cinemaId, price: 75000 }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        const errorMessage = result.message || result.error || "Lỗi không xác định";
        throw new Error(errorMessage);
      }

      toast.success("Thành công!", { id: tid });
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Lỗi xử lý lịch chiếu!", { id: tid });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 p-6 font-sans antialiased select-none tracking-tight">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-2 h-9 bg-red-600 rounded-full" />
            <div className="space-y-1">
              <h1 className="text-2xl font-[1000] text-white tracking-tighter uppercase italic leading-none">
                Lịch chiếu <span className="text-red-600">{cinemaName || "Chi nhánh"}</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">HNA Cinema Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto text-sm">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <Upload size={16} /> Import Excel
            </button>
            {/* Chặn nút tạo mới nếu đang xem ngày trong quá khứ */}
            {!isPastDate && (
              <button
                onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-red-600 rounded-xl font-black text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 uppercase tracking-wide text-xs"
              >
                <Plus size={16} /> Tạo suất
              </button>
            )}
          </div>
        </div>

        {/* Input ẩn để gọi bộ chọn lịch */}
        <input 
          type="date" 
          ref={dateInputRef} 
          value={selectedDate} 
          onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }} 
          className="absolute opacity-0 pointer-events-none w-0 h-0" 
        />

        <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-2 rounded-xl gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => dateInputRef.current?.showPicker()} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-900/20" title="Chọn ngày từ lịch"><CalendarIcon size={18} /></button>
            <button onClick={() => changeWeek(-1)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-white"><ChevronLeft size={18} /></button>
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2">
            {weekTabs.map((d) => {
              const active = selectedDate === d.full;
              return (
                <button 
                  key={d.full} 
                  onClick={() => setSelectedDate(d.full)} 
                  className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all border ${
                    active 
                      ? "bg-red-600 border-red-600 text-white font-black shadow-md shadow-red-900/10" 
                      : "bg-zinc-900/30 border-transparent hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-wider ${active ? "text-red-100" : d.isOld ? "text-zinc-600" : "text-zinc-500"}`}>{d.label}</span>
                  <span className={`text-sm font-black mt-1 ${d.isOld && !active ? 'text-zinc-600' : ''}`}>{d.dayNum}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => changeWeek(1)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-white"><ChevronRight size={18} /></button>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden">
          {loading ? (
            <div className="py-28 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Đang tải...</p>
            </div>
          ) : rooms.map((room) => {
            const currentShowtimes = showtimes.filter((s) => s.startTime?.startsWith(selectedDate) && s.room?.id === room.id);
            return (
              <div key={room.id} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="w-full md:w-36 shrink-0">
                  <span className={`inline-block px-4 py-1.5 border text-xs font-black uppercase rounded-lg tracking-wide ${isPastDate ? 'bg-zinc-950 border-zinc-900 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
                    {room.name}
                  </span>
                </div>
                <div className="flex-1 flex flex-wrap items-center gap-2.5 w-full">
                  {currentShowtimes.map((s) => {
                    const isPast = isPastShowtime(s.startTime);
                    const isCancelled = s.status === 'CANCELLED';
                    const isPending = s.status === 'PENDING_CANCEL';

                    // Cờ hiệu để ẩn nút sửa: Đã qua giờ chiếu HOẶC đã hủy HOẶC đang xin hủy
                    const canEditQuickly = !isPast && !isCancelled && !isPending;

                    return (
                      <div 
                        key={s.id} 
                        onClick={() => router.push(`/admin/showtimes/${s.id}`)} 
                        className={`group relative inline-flex items-center gap-3 border px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
                          isCancelled
                            ? "bg-zinc-950/40 border-zinc-900/50 opacity-40 grayscale hover:opacity-70"
                          : isPending
                            ? "bg-orange-950/20 border-orange-900/40 text-orange-500"
                          : isPast 
                            ? "bg-zinc-950/50 border-zinc-900 text-zinc-500 opacity-70 hover:bg-zinc-900 hover:opacity-100" 
                          : "bg-zinc-900 border-zinc-800 text-white hover:border-red-600/40 hover:bg-zinc-900/60"
                        }`}
                        title={
                          isCancelled ? "Suất chiếu đã bị hủy (Nhấp để xem chi tiết)" :
                          isPending ? "Suất chiếu đang chờ duyệt hủy (Nhấp để xem chi tiết)" :
                          isPast ? "Nhấp để xem lịch sử vé" : "Nhấp để xem chi tiết"
                        }
                      >
                        <span className={`text-xs font-black tracking-tight transition-colors ${
                          isCancelled ? 'text-zinc-500 line-through' :
                          isPending ? 'text-orange-500' :
                          isPast ? 'text-zinc-500' : 'text-white group-hover:text-red-500'
                        }`}>
                          {s.startTime.split("T")[1].substring(0, 5)}
                        </span>

                        {s.movie && <span className={`text-[11px] font-bold max-w-[120px] truncate ${
                          isCancelled ? 'text-zinc-600 line-through' :
                          isPending ? 'text-orange-400/80' :
                          isPast ? 'text-zinc-600' : 'text-zinc-400'
                        }`}>
                          {s.movie.title || s.movie.name}
                        </span>}
                        
                        {/* Chỉ hiện nút sửa nhanh khi suất chiếu bình thường và chưa diễn ra */}
                        {canEditQuickly && (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(s); setIsModalOpen(true); }} className="text-zinc-600 hover:text-white transition-colors pl-1">
                            <Edit3 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Nút cộng suất chiếu bị ẩn đi nếu ở ngày quá khứ */}
                  {!isPastDate && (
                    <button onClick={() => { setSelectedItem({ roomId: room.id, startTime: selectedDate }); setIsModalOpen(true); }} className="inline-flex items-center justify-center w-9 h-8 border border-dashed border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/40 rounded-lg transition-all bg-zinc-950">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ShowtimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={selectedItem} movies={movies} rooms={rooms} />
      <ImportExcelModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onRefreshData={loadData} />
    </div>
  );
}