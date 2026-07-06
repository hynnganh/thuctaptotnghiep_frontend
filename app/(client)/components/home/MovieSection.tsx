"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { ChevronRight, Calendar } from "lucide-react";
import { apiRequest } from "../../../lib/api";

export default function MovieSection() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        const response = await apiRequest("/api/v1/movies?status=COMING_SOON&page=0&size=5&sort=id,desc", { 
          method: "GET" 
        });
        
        if (response.ok) {
          const resData = await response.json();
          const targetData = resData.data;
          if (targetData) {
            setMovies(targetData.content || (Array.isArray(targetData) ? targetData : []));
          } else {
            setMovies(Array.isArray(resData) ? resData : (resData.content || []));
          }
        }
      } catch (error) {
        console.error("Lỗi tải phim sắp chiếu tại trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-6 md:px-12 py-14 bg-zinc-50/50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full bg-zinc-200/60 border border-zinc-200/40 animate-pulse rounded-[1rem]" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-14 bg-zinc-50/50 border-y border-zinc-200/50">
      <div className="flex items-end justify-between mb-8 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          {/* Thanh Accent đổi sang bóng mờ trên nền sáng */}
          <div className="w-1.5 h-8 bg-pink-500 rounded-full shadow-[0_2px_10px_rgba(236,72,153,0.3)]" /> 
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {/* Text tiêu đề đổi sang màu tối (zinc-900) */}
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none italic">
                Phim Sắp Chiếu
              </h2>
              <Calendar size={14} className="text-pink-500 animate-pulse" />
            </div>
            {/* Subtitle đổi sang text-zinc-400 mềm mại hơn */}
            <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.15em] mt-2.5">
              Những siêu phẩm bom tấn sắp sửa đổ bộ hệ thống rạp
            </span>
          </div>
        </div>
        
        <Link href="/movies/coming" className="block">
          {/* Nút xem tất cả đổi màu tương phản nền sáng */}
          <button className="group flex items-center gap-1.5 text-zinc-400 hover:text-zinc-800 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest">
            Xem tất cả 
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform text-pink-500" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-8 max-w-[1400px] mx-auto">
        {movies.map((movie: any) => (
          <div key={movie.id} className="transition-transform duration-300 hover:-translate-y-1 h-full">
            <MovieCard
              id={movie.id}
              title={movie.title}
              image={movie.posterUrl} 
              status={movie.status}
              rating={movie.rating} 
              genreNames={movie.genreNames || movie.genres?.map((g: any) => g.name) || []} 
              ageRating={movie.ageRating} 
              reviewCount={movie.reviewCount || 0} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}