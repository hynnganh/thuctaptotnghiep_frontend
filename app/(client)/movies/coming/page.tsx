"use client";
import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieCard'; 
import { apiRequest } from "../../../lib/api";

export default function PhimSapChieu() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        // Gọi API lấy phim với trạng thái COMING_SOON
        const response = await apiRequest("/api/v1/movies?status=COMING_SOON", { 
          method: "GET" 
        });
        
        if (response.ok) {
          const resData = await response.json();
          // Lấy mảng phim từ resData.data.content (Page object của Spring)
          setMovies(resData.data.content || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải phim sắp chiếu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen pt-5 pb-20 px-6 md:px-16 text-white font-sans">
      {/* Inject CSS Animation - Màu xanh cho phim sắp chiếu */}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-12deg); } 100% { transform: translateX(150%) skewX(-12deg); } }
        .animate-shimmer-blue { animation: shimmer 2.5s infinite; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="max-w-[1440px] mx-auto mb-5 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black tracking-[0.4em] text-[10px] uppercase">
            <span className="w-16 h-[2px] bg-blue-500"></span>
            Coming Soon to A&K Cinema
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
            PHIM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400">
              SẮP CHIẾU
            </span>
          </h1>
        </div>
        
        <div className="max-w-xs text-gray-400 text-sm font-bold leading-relaxed border-l-2 border-blue-600 pl-6 mb-2">
            Đừng bỏ lỡ những siêu phẩm điện ảnh sắp đổ bộ. Nhấn "Nhận thông báo" để cập nhật lịch chiếu sớm nhất!
        </div>
      </div>

      {/* --- TRẠNG THÁI LOADING --- */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[2/3] w-full bg-zinc-900/50 animate-pulse rounded-[2.5rem]" />
              <div className="h-6 w-3/4 bg-zinc-900/30 animate-pulse rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-900/20 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        /* --- GRID HIỂN THỊ PHIM --- */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                id={movie.id}
                title={movie.title}
                image={movie.posterUrl} // Chuyển posterUrl sang prop image
                rating={movie.rating}
                status={movie.status} // COMING_SOON
              />
            ))
          ) : (
            <div className="col-span-full text-center py-32 border border-dashed border-blue-900/20 rounded-[3rem]">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">
                Danh sách phim sắp chiếu đang được cập nhật...
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- FOOTER DECORATION --- */}
      <div className="mt-32 text-center border-t border-white/5 pt-20">
        <p className="text-gray-600 font-bold tracking-widest text-xs uppercase mb-6 italic">
          Bạn đang xem danh sách phim sắp khởi chiếu tại A&K Cinema
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-12 py-5 border border-white/10 rounded-full font-black text-[10px] tracking-[0.4em] uppercase text-gray-400 hover:text-white hover:border-blue-600 transition-all active:scale-95 hover:bg-blue-600/5 shadow-2xl"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}