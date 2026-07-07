"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import MovieCard from './MovieCard';
import { apiRequest } from "@/app/lib/api"; 
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function TatCaPhim() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States: Bộ lọc
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAgeRatings, setSelectedAgeRatings] = useState<string[]>([]);
  
  // Ref để đóng popup khi click ra ngoài
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const MOVIES_PER_PAGE = 12;

  // Đóng bộ lọc khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movieResponse = await apiRequest("/api/v1/movies?size=200", { method: "GET" });
        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          const targetData = movieData.data;
          let fetchedMovies = targetData?.content || (Array.isArray(targetData) ? targetData : []);
          setMovies(fetchedMovies);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(m => {
      const mGenres = m.genreNames || m.genres?.map((g: any) => g.name) || [];
      mGenres.forEach((g: string) => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [movies]);

  const availableAgeRatings = useMemo(() => {
    const ages = new Set<string>();
    movies.forEach(m => {
      if (m.ageRating) ages.add(m.ageRating);
    });
    return Array.from(ages).sort();
  }, [movies]);

  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];
    result.sort((a, b) => {
      const dateA = new Date(a.releaseDate || a.createdAt).getTime();
      const dateB = new Date(b.releaseDate || b.createdAt).getTime();
      return dateB - dateA;
    });

    if (selectedGenres.length > 0) {
      result = result.filter(m => {
        const mGenres = m.genreNames || m.genres?.map((g: any) => g.name) || [];
        return selectedGenres.some(selected => mGenres.includes(selected));
      });
    }

    if (selectedAgeRatings.length > 0) {
      result = result.filter(m => selectedAgeRatings.includes(m.ageRating));
    }
    return result;
  }, [movies, selectedGenres, selectedAgeRatings]);

  const totalPages = Math.ceil(filteredAndSortedMovies.length / MOVIES_PER_PAGE);
  const currentMovies = filteredAndSortedMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenres, selectedAgeRatings]);

  const toggleFilter = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedAgeRatings([]);
  };

  const isFiltering = selectedGenres.length > 0 || selectedAgeRatings.length > 0;
  const filteredCount = filteredAndSortedMovies.length;

  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-5 pb-20 px-6 md:px-16 text-slate-800 font-sans antialiased">
      
      {/* ===== HEADER LIGHT MODE ===== */}
      <div className="max-w-[1440px] mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200/60 pb-12 relative z-30">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 font-black tracking-[0.4em] text-[10px] uppercase">
            <span className="w-16 h-[2px] bg-red-600"></span> HNA Cinema Collection
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic text-slate-900">
            TẤT CẢ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
              PHIM CHIẾU RẠP
            </span>
          </h1>
        </div>

        {/* KHU VỰC BÊN PHẢI (VĂN BẢN VÀ NÚT LỌC) */}
        <div className="flex flex-col md:items-end gap-4 relative" ref={filterRef}>
          <div className="max-w-xs text-slate-400 text-sm font-bold leading-relaxed border-l-2 border-red-600 pl-6 mb-2">
            Khám phá thế giới điện ảnh đa dạng. Lọc và tìm kiếm những siêu phẩm phù hợp nhất với sở thích của bạn!
          </div>
          
          {/* THANH BỘ LỌC */}
          {!loading && (
            <div className="flex items-center gap-4">
              {isFiltering && (
                <button 
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-600 transition-colors text-xs font-bold"
                >
                  <X size={14} /> Xóa lọc
                </button>
              )}

              {/* NÚT BỘ LỌC LIGHT MODE */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 border ${
                  showFilters || isFiltering
                    ? "bg-slate-900 text-white border-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.15)]" 
                    : "bg-white text-slate-700 hover:border-slate-400 border-slate-200 shadow-sm"
                }`}
              >
                <SlidersHorizontal size={14} className="opacity-90" />
                BỘ LỌC
                
                {/* HIỂN THỊ SỐ PHIM LỌC ĐƯỢC */}
                {isFiltering && (
                  <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-[22px] px-1.5 h-[22px] bg-red-500 text-white rounded-full text-[10px] font-bold shadow-md z-10 border-[2px] border-[#fcfcfd]">
                    {filteredCount}
                  </span>
                )}
              </button>

              {/* KHUNG BỘ LỌC FLOATING LIGHT MODE */}
              <div 
                className={`absolute top-[calc(100%+16px)] right-0 w-[320px] md:w-[380px] bg-white border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] z-40 overflow-hidden transition-all duration-300 origin-top-right ${
                  showFilters ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                }`}
              >
                <div className="p-6 space-y-6 text-left">
                  {/* Filter Thể Loại */}
                  {availableGenres.length > 0 && (
                    <div>
                      <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        Thể Loại <div className="flex-1 h-px bg-slate-100"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {availableGenres.map(genre => (
                          <button
                            key={genre}
                            onClick={() => toggleFilter(genre, selectedGenres, setSelectedGenres)}
                            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold tracking-wider transition-all duration-300 border ${
                              selectedGenres.includes(genre)
                                ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                                : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter Độ Tuổi */}
                  {availableAgeRatings.length > 0 && (
                    <div>
                      <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        Độ Tuổi <div className="flex-1 h-px bg-slate-100"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {availableAgeRatings.map(age => (
                          <button
                            key={age}
                            onClick={() => toggleFilter(age, selectedAgeRatings, setSelectedAgeRatings)}
                            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all duration-300 border ${
                              selectedAgeRatings.includes(age)
                                ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                                : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SKELETON LOADING LIGHT MODE */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 relative animate-pulse">
              <div className="aspect-[2/3] w-full bg-slate-200 rounded-[2.5rem]" />
              <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (

        /* GRID MOVIES */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative z-10">
          {currentMovies.length > 0 ? (
            currentMovies.map((movie) => (
              <div key={movie.id} className="relative group/card flex flex-col">
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
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
            ))
          ) : (
            <div className="col-span-full text-center py-32 border border-dashed border-slate-200 rounded-[3rem] bg-white">
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic text-xl">
                Không tìm thấy phim phù hợp...
              </p>
            </div>
          )}
        </div>
      )}

      {/* ĐIỀU HƯỚNG TRANG LIGHT MODE (PAGINATION) */}
      {!loading && totalPages > 1 && (
        <div className="mt-20 flex justify-center items-center gap-3">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2 bg-white p-2 rounded-full border border-slate-200/80 shadow-sm">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPage(idx + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${
                  currentPage === idx + 1
                    ? "bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)] scale-105"
                    : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* BOTTOM ACTION */}
      <div className="mt-32 text-center border-t border-slate-200/60 pt-20">
        <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-6">
          Hết danh sách phim
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-12 py-5 bg-white border border-slate-200 text-slate-500 rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:text-red-600 hover:border-red-400 hover:shadow-md transition-all active:scale-95"
        >
          Quay lại đầu trang
        </button>
      </div>
    </div>
  );
}