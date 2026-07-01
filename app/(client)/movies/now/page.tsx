"use client";

import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieCard';
import { apiRequest } from "../../../lib/api";

export default function PhimDangChieu() {

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // ⭐ API PHIM ĐANG CHIẾU
        const movieResponse = await apiRequest("/api/v1/movies?status=SHOWING", { method: "GET" });
        // ⭐ API TOP PHIM BÁN CHẠY
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

        // ⭐ GHÉP totalTickets VÀO MOVIE
        const mergedMovies = showingMovies.map((movie) => {
          const matchedMovie = topMovies.find((top) => top.movieId === movie.id);
          return {
            ...movie,
            totalTickets: matchedMovie?.totalTickets || 0
          };
        });

        // ⭐ SORT THEO SỐ VÉ BÁN
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
    <div className="bg-[#050505] min-h-screen pt-5 pb-20 px-6 md:px-16 text-white font-sans">
      {/* HEADER */}
      <div className="max-w-[1440px] mx-auto mb-5 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 font-black tracking-[0.4em] text-[10px] uppercase">
            <span className="w-16 h-[2px] bg-red-600"></span> A&K Cinema Now Showing
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
            PHIM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
              ĐANG CHIẾU
            </span>
          </h1>
        </div>

        <div className="max-w-xs text-gray-500 text-sm font-bold leading-relaxed border-l-2 border-red-600 pl-6 mb-2">
          Trải nghiệm điện ảnh đỉnh cao với những siêu phẩm mới nhất.
          Đặt vé ngay để nhận vị trí ngồi đẹp nhất tại hệ thống A&K!
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 relative">
              <div className="aspect-[2/3] w-full bg-zinc-900 animate-pulse rounded-[2.5rem]" />
              <div className="h-6 w-3/4 bg-zinc-900 animate-pulse rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-900 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      ) : (

        /* GRID MOVIES */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {movies.length > 0 ? (
            movies.map((movie, index) => {
              const rank = index + 1;
              const shouldShowBadge = rank <= 3;

              return (
                <div key={movie.id} className="relative group/card flex flex-col">
                  {/* 🎯 TOP 1 2 3 */}
                  {shouldShowBadge && (
                    <div className="absolute top-[-18px] left-4 z-20 pointer-events-none">
                      <span
                        className="text-[95px] md:text-[110px] font-black italic text-transparent drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover/card:scale-105"
                        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}
                      >
                        {rank}
                      </span>
                    </div>
                  )}

                  {/* MOVIE CARD */}
                  <div className="relative z-10 rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                    <MovieCard
                      id={movie.id}
                      title={movie.title}
                      image={movie.posterUrl}
                      rating={movie.rating}
                      reviewCount={movie.reviewCount}
                      ageRating={movie.ageRating}
                      
                      // 🎯 FIX: Hứng mọi loại API (Danh sách DTO hoặc Chi tiết Entity)
                      genreNames={movie.genreNames || movie.genres?.map((g: any) => g.name) || []}
                      
                      status={movie.status}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-32 border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">
                Hệ thống đang cập nhật danh sách phim...
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-32 text-center border-t border-white/5 pt-20">
        <p className="text-gray-600 font-bold tracking-widest text-xs uppercase mb-6">
          Hết danh sách phim đang chiếu
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-12 py-5 border border-white/10 rounded-full font-black text-[10px] tracking-[0.4em] uppercase text-gray-400 hover:text-white hover:border-red-600 transition-all active:scale-95 shadow-2xl"
        >
          Quay lại đầu trang
        </button>
      </div>
    </div>
  );
}