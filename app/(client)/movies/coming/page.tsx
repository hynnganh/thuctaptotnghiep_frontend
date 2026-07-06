"use client";
import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieCard'; 
import { apiRequest } from "../../../lib/api";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function PhimSapChieu() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        const response = await apiRequest("/api/v1/movies?status=COMING_SOON", { 
          method: "GET" 
        });
        
        if (response.ok) {
          const resData = await response.json();
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
    <div className="bg-slate-50 min-h-screen pt-6 pb-20 px-6 md:px-16 text-slate-900 font-sans relative overflow-hidden">
      {/* Vệt sáng loang đỏ đen nhạt chạy dưới nền */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[200px] bg-gradient-to-r from-slate-900/5 to-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HEADER PHONG CÁCH ĐỎ ĐEN --- */}
      <div className="max-w-[1440px] mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-600 font-black tracking-[0.3em] text-[10px] uppercase">
            <span className="w-12 h-[2px] bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"></span>
            Coming Soon to HNA Cinema
          </div>
          <h1 className="text-3xl md:text-4xl font-[1000] uppercase tracking-tighter leading-none italic text-slate-900">
            PHIM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-red-600 to-rose-600">
              SẮP CHIẾU
            </span>
          </h1>
        </div>
        
        <div className="max-w-xs text-slate-500 text-xs font-bold leading-relaxed border-l-2 border-red-600 pl-6 mb-1">
          Đừng bỏ lỡ những siêu phẩm điện ảnh sắp đổ bộ. Nhấn "Thông tin phim" để cập nhật và đón chờ lịch chiếu sớm nhất!
        </div>
      </div>

      {/* --- TRẠNG THÁI LOADING --- */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 relative z-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[2/3] w-full bg-slate-200/60 border border-slate-200/40 animate-pulse rounded-[2rem]" />
              <div className="h-5 w-3/4 bg-slate-200/60 animate-pulse rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-200/40 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        /* --- GRID HIỂN THỊ PHIM --- */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 relative z-10 items-stretch">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="h-full pt-4">
                <MovieCard 
                  id={movie.id}
                  title={movie.title}
                  image={movie.posterUrl}
                  rating={movie.rating}
                  reviewCount={movie.reviewCount}
                  ageRating={movie.ageRating}
                  genreNames={movie.genreNames || movie.genres?.map((g: any) => g.name) || []}
                  status={movie.status} 
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-white/60 backdrop-blur-sm rounded-[2.5rem]">
              <Sparkles size={24} className="text-red-500 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic text-sm">
                Danh sách phim sắp chiếu đang được cập nhật...
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- FOOTER TRANG --- */}
      <div className="mt-28 text-center border-t border-slate-200 pt-16 relative z-10">
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mb-5">
          Bạn đang xem danh sách phim sắp khởi chiếu tại HNA Cinema
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="group inline-flex items-center gap-2 px-10 py-4 bg-white border border-slate-200 rounded-full font-black text-[10px] tracking-[0.25em] uppercase text-slate-700 hover:text-white hover:bg-red-600 hover:border-transparent transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}