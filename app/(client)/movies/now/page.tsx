"use client";

import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieCard';
import { apiRequest } from "../../../lib/api";
import { Sparkles, ArrowUp } from "lucide-react";

export default function PhimDangChieu() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movieResponse = await apiRequest("/api/v1/movies?status=SHOWING", { method: "GET" });
        const topResponse = await apiRequest("/api/v1/movies/top-tickets", { method: "GET" });

        let showingMovies: any[] = [];
        let topMovies: any[] = [];

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          const targetData = movieData.data;
          showingMovies = targetData?.content || (Array.isArray(targetData) ? targetData : []);
        }

        if (topResponse.ok) {
          const topData = await topResponse.json();
          topMovies = topData.data || [];
        }

        const mergedMovies = showingMovies.map((movie) => {
          const matchedMovie = topMovies.find((top) => top.movieId === movie.id);
          return {
            ...movie,
            totalTickets: matchedMovie?.totalTickets || 0
          };
        });

        mergedMovies.sort((a, b) => b.totalTickets - a.totalTickets);
        setMovies(mergedMovies);

      } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-6 pb-20 px-6 md:px-16 text-slate-900 font-sans relative overflow-hidden">
      {/* Vệt sáng loang màu đỏ nhạt chạy ẩn dưới nền */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[200px] bg-gradient-to-r from-red-600/5 to-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER PHONG CÁCH ĐỎ ĐEN TRÊN NỀN SÁNG */}
      <div className="max-w-[1440px] mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-600 font-black tracking-[0.3em] text-[10px] uppercase">
            <span className="w-12 h-[2px] bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"></span> 
            HNA Cinema Now Showing
          </div>
          <h1 className="text-3xl md:text-4xl font-[1000] uppercase tracking-tighter leading-none italic text-slate-900">
            PHIM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">
              ĐANG CHIẾU
            </span>
          </h1>
        </div>

        <div className="max-w-xs text-slate-500 text-xs font-bold leading-relaxed border-l-2 border-red-600 pl-6 mb-1">
          Trải nghiệm điện ảnh đỉnh cao với những siêu phẩm mới nhất.
          Đặt vé ngay để nhận vị trí ngồi đẹp nhất tại hệ thống HNA Cinema!
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 relative z-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 relative">
              <div className="aspect-[2/3] w-full bg-slate-200/60 border border-slate-200/40 animate-pulse rounded-[2rem]" />
              <div className="h-5 w-3/4 bg-slate-200/60 animate-pulse rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-200/40 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        /* GRID MOVIES */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 relative z-10">
          {movies.length > 0 ? (
            movies.map((movie, index) => {
              const rank = index + 1;
              const shouldShowBadge = rank <= 3;

              return (
                <div key={movie.id} className="relative group/card flex flex-col pt-4">
                  {/* BADGE ĐÁNH SỐ TOP RANK - Đổ bóng viền đỏ đen nổi bật */}
                  {shouldShowBadge && (
                    <div className="absolute top-[-26px] left-2 z-20 pointer-events-none select-none">
                      <span
                        className="text-[90px] md:text-[105px] font-[1000] italic text-transparent drop-shadow-[0_8px_20px_rgba(220,38,38,0.06)] transition-all duration-500 group-hover/card:scale-105 group-hover/card:-translate-y-1 inline-block"
                        style={{ WebkitTextStroke: '2px rgba(220, 38, 38, 0.2)' }}
                      >
                        {rank}
                      </span>
                    </div>
                  )}

                  {/* MOVIE CARD WRAPPER */}
                  <div className="relative z-10 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_20px_40px_rgba(220,38,38,0.08)]">
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
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-white/60 backdrop-blur-sm rounded-[2.5rem]">
              <Sparkles size={24} className="text-red-500 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic text-sm">
                Hệ thống đang cập nhật danh sách phim...
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER ĐẦU TRANG */}
      <div className="mt-28 text-center border-t border-slate-200 pt-16 relative z-10">
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mb-5">
          Hết danh sách phim đang chiếu
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group inline-flex items-center gap-2 px-10 py-4 bg-white border border-slate-200 rounded-full font-black text-[10px] tracking-[0.25em] uppercase text-slate-700 hover:text-white hover:bg-red-600 hover:border-transparent transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
        >
          Quay lại đầu trang
          <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}