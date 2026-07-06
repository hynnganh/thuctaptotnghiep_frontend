"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { ChevronLeft, Loader2, Calendar, ChevronDown, Monitor, MapPin, Ticket, Clapperboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../../../lib/api";
import { getTokenByRole } from "@/app/lib/auth";

export default function MovieBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // CHI NHÁNH CHA
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(today));
  const [showPicker, setShowPicker] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  useEffect(() => {
    if (selectedDate) {
      fetchShowtimes();
    }
  }, [selectedDate, movieId]);

  // MOVIE DETAIL
  const fetchMovieDetail = async () => {
    try {
      const res = await apiRequest(`/api/v1/movies/${movieId}`);
      const data = await res.json();
      if (res.ok) {
        setMovie(data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy phim:", error);
    }
  };

  // CHỈ LẤY SUẤT CHIẾU TƯƠNG LAI VÀ ACTIVE
  const fetchShowtimes = async () => {
    setLoading(true);

    try {
      const res = await apiRequest(`/api/v1/showtimes/movie/${movieId}?date=${selectedDate}`);
      const data = await res.json();
      const fetchedShowtimes = res.ok ? data.data : [];
      const now = new Date();

      // 🔥 FILTER SUẤT CHIẾU
      const futureShowtimes = fetchedShowtimes.filter((st: any) => {
        try {
          const start = new Date(st.startTime);
          const isFuture = start.getTime() > now.getTime();
          const isLiveStatus = st.status !== 'CANCELLED' && st.status !== 'PENDING_CANCEL';
          
          return isFuture && isLiveStatus;
        } catch {
          return false;
        }
      });

      // 🔥 SẮP XẾP SUẤT CHIẾU THEO THỜI GIAN
      futureShowtimes.sort((a: any, b: any) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      setShowtimes(futureShowtimes);

      // LẤY DANH SÁCH CHI NHÁNH CHA
      const parentCinemas = [
        ...new Set(
          futureShowtimes.map((st: any) => st.cinemaItem?.cinema?.name || "Khu vực khác")
        )
      ] as string[];

      if (parentCinemas.length > 0) {
        setSelectedParent((prev) =>
          prev && parentCinemas.includes(prev) ? prev : parentCinemas[0]
        );
      } else {
        setSelectedParent(null);
      }
    } catch (error) {
      console.error("Lỗi lấy suất chiếu:", error);
    } finally {
      setLoading(false);
    }
  };

  // BOOKING
  const handleBookingClick = (showtimeId: string) => {
    const userToken = getTokenByRole("USER");
    if (!userToken) {
      router.push("/auth");
      return;
    }
    router.push(`/booking/${showtimeId}`);
  };

  // GROUP DATA
  const groupedShowtimes = showtimes.reduce((acc: any, st: any) => {
    const parentName = st.cinemaItem?.cinema?.name || "Khu vực khác";
    const branchName = st.cinemaItem?.name || "Rạp HNA Cinema";

    if (!acc[parentName]) {
      acc[parentName] = {};
    }
    if (!acc[parentName][branchName]) {
      acc[parentName][branchName] = [];
    }

    acc[parentName][branchName].push(st);
    return acc;
  }, {});

  const parentList = Object.keys(groupedShowtimes);

  // 14 NGÀY
  const getWeeklyDays = () => {
    const days = [];
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      days.push({
        full: formatLocalDate(d),
        date: d.getDate(),
        name: i === 0 ? "Nay" : weekdays[d.getDay()],
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 font-sans pb-16 antialiased selection:bg-red-600 selection:text-white">
      
      {/* HEADER TONE SÁNG */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          
          {/* TOP BAR */}
          <div className="flex items-center justify-between mb-4">
            <Link href={`/movies/${movieId}`} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-50/50 transition-all duration-300">
                <ChevronLeft size={18} className="text-slate-500 group-hover:text-red-600 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[9px] uppercase tracking-widest text-red-600 font-extrabold">Đang lịch đặt vé</span>
                <h1 className="text-sm font-black uppercase tracking-wide text-slate-800 line-clamp-1 max-w-[200px] sm:max-w-md">
                  {movie?.title || "Đang tải phim..."}
                </h1>
              </div>
            </Link>

            {/* BỘ LỌC LỊCH */}
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 hover:border-red-500 hover:bg-slate-50 transition-all duration-300 shadow-sm"
              >
                <Calendar size={13} className="text-red-600" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Tháng {new Date(selectedDate).toLocaleDateString("vi-VN", { month: "2-digit", day: "2-digit" })}
                </span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {showPicker && (
                <div className="absolute right-0 mt-2 z-20 bg-white border border-slate-200 rounded-xl p-3 w-48 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="date"
                    value={selectedDate}
                    min={formatLocalDate(today)}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setShowPicker(false);
                    }}
                    className="w-full bg-transparent text-xs p-1.5 outline-none text-slate-800 border border-slate-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* THANH LỊCH NGANG */}
          <div ref={scrollContainerRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
            {getWeeklyDays().map((d) => {
              const isSelected = selectedDate === d.full;
              return (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex flex-col items-center justify-center min-w-[50px] h-14 rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-b from-red-600 to-red-700 border-red-600 text-white font-bold shadow-md shadow-red-600/10 scale-102"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className={`text-[8px] font-extrabold uppercase tracking-widest ${isSelected ? "text-white/80" : "text-slate-400"}`}>{d.name}</span>
                  <span className="text-sm font-black mt-0.5 tracking-tight">{d.date}</span>
                </button>
              );
            })}
          </div>

          {/* TABS HỆ THỐNG RẠP CHA */}
          {!loading && parentList.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3 flex gap-6 overflow-x-auto scrollbar-hide">
              {parentList.map((parent) => {
                const isSelected = selectedParent === parent;
                return (
                  <button
                    key={parent}
                    onClick={() => setSelectedParent(parent)}
                    className={`whitespace-nowrap text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all duration-300 ${
                      isSelected
                        ? "text-red-600 border-red-600 font-black"
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    {parent}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DANH SÁCH SUẤT CHIẾU */}
      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-5">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-red-600 w-7 h-7" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Đang tải lịch chiếu...</p>
          </div>
        ) : selectedParent && groupedShowtimes[selectedParent] ? (
          Object.entries(groupedShowtimes[selectedParent]).map(([branchName, times]: any) => (
            <div key={branchName} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
              
              {/* TÊN CHI NHÁNH RẠP */}
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3.5">
                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                  <MapPin size={12} className="text-red-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wide text-slate-800 uppercase">{branchName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Clapperboard size={10} className="opacity-70" /> Hệ thống phòng chiếu tiêu chuẩn quốc tế
                  </p>
                </div>
              </div>

              {/* LƯỚI SUẤT CHIẾU */}
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {times.map((st: any) => {
                  const format = st.format || "2D Phụ Đề";
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleBookingClick(st.id)}
                      className="p-3 bg-white border border-slate-200 hover:border-red-500 hover:bg-red-50/30 rounded-xl transition-all duration-300 text-center group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="block text-sm font-black text-slate-800 group-hover:text-red-600 transition-colors tracking-tight">
                        {st.startTime.split("T")[1].substring(0, 5)}
                      </span>
                      <span className="block text-[9px] font-extrabold text-slate-400 uppercase mt-0.5 tracking-wide group-hover:text-red-500/80 transition-colors">
                        {format}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          ))
        ) : (
          /* TRẠNG THÁI KHÔNG CÓ LỊCH CHIẾU */
          <div className="py-24 text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <Monitor size={36} className="mb-3 text-slate-300 mx-auto" />
            <p className="text-xs uppercase font-black tracking-widest text-slate-600">
              Không có suất chiếu phù hợp
            </p>
            <p className="text-[10px] mt-1.5 font-medium text-slate-400 max-w-xs mx-auto">
              Vui lòng đổi ngày chiếu hoặc chọn một hệ thống rạp khác ở thanh menu phía trên nhé!
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}