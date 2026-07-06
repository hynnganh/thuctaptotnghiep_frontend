"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import MovieCard from './MovieCard'; // 🎯 Chú ý đường dẫn
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

  // 🎯 Biến này để kiểm tra xem user CÓ ĐANG DÙNG LỌC hay không
  const isFiltering = selectedGenres.length > 0 || selectedAgeRatings.length > 0;
  
  // 🎯 Lấy SỐ LƯỢNG PHIM lọc được
  const filteredCount = filteredAndSortedMovies.length;

  return (
    <div className="bg-[#050505] min-h-screen pt-5 pb-20 px-6 md:px-16 text-white font-sans">
      
      {/* HEADER GIỐNG TRANG NOW SHOWING */}
      <div className="max-w-[1440px] mx-auto mb-5 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12 relative z-30">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 font-black tracking-[0.4em] text-[10px] uppercase">
            <span className="w-16 h-[2px] bg-red-600"></span> HNA Cinema Collection
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
            TẤT CẢ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
              PHIM CHIẾU RẠP
            </span>
          </h1>
        </div>

        {/* KHU VỰC BÊN PHẢI (VĂN BẢN VÀ NÚT LỌC) */}
        <div className="flex flex-col md:items-end gap-4 relative" ref={filterRef}>
          <div className="max-w-xs text-gray-500 text-sm font-bold leading-relaxed border-l-2 border-red-600 pl-6 mb-2">
            Khám phá thế giới điện ảnh đa dạng. Lọc và tìm kiếm những siêu phẩm phù hợp nhất với sở thích của bạn!
          </div>
          
          {/* THANH BỘ LỌC */}
          {!loading && (
            <div className="flex items-center gap-4">
              {isFiltering && (
                <button 
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-zinc-500 hover:text-red-500 transition-colors text-xs font-bold"
                >
                  <X size={14} /> Xóa lọc
                </button>
              )}

              {/* 🎯 NÚT BỘ LỌC Y CHANG ẢNH */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 border-[2px] ${
                  showFilters || isFiltering
                  ? "bg-zinc-900 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                  : "bg-[#121212] text-white hover:border-white/50 border-transparent"
                }`}
              >
                <SlidersHorizontal size={14} className="opacity-90" />
                BỘ LỌC
                
                {/* 🎯 HIỂN THỊ SỐ PHIM LỌC ĐƯỢC (Chỉ hiện khi đang bật lọc) */}
                {isFiltering && (
                  <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-[22px] px-1.5 h-[22px] bg-red-500 text-white rounded-full text-[10px] font-bold shadow-md z-10 border-[2px] border-[#050505]">
                    {filteredCount}
                  </span>
                )}
              </button>

              {/* 🛠 KHUNG BỘ LỌC FLOATING */}
              <div 
                className={`absolute top-[calc(100%+16px)] right-0 w-[320px] md:w-[380px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-40 overflow-hidden transition-all duration-300 origin-top-right ${
                  showFilters ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                }`}
              >
                <div className="p-6 space-y-6 text-left">
                  {/* Filter Thể Loại */}
                  {availableGenres.length > 0 && (
                    <div>
                      <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                         Thể Loại <div className="flex-1 h-px bg-white/10"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {availableGenres.map(genre => (
                          <button
                            key={genre}
                            onClick={() => toggleFilter(genre, selectedGenres, setSelectedGenres)}
                            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold tracking-wider transition-all duration-300 ${
                              selectedGenres.includes(genre)
                                ? "bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
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
                      <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                         Độ Tuổi <div className="flex-1 h-px bg-white/10"></div>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {availableAgeRatings.map(age => (
                          <button
                            key={age}
                            onClick={() => toggleFilter(age, selectedAgeRatings, setSelectedAgeRatings)}
                            className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all duration-300 ${
                              selectedAgeRatings.includes(age)
                                ? "bg-orange-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)]"
                                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
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

      {/* SKELETON LOADING */}
      {loading ? (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 relative animate-pulse">
              <div className="aspect-[2/3] w-full bg-zinc-900 rounded-[2.5rem]" />
              <div className="h-6 w-3/4 bg-zinc-900 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-900 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (

        /* GRID MOVIES */
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative z-10">
          {currentMovies.length > 0 ? (
            currentMovies.map((movie) => (
              <div key={movie.id} className="relative group/card flex flex-col">
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
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
            <div className="col-span-full text-center py-32 border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">
                Không tìm thấy phim phù hợp...
              </p>
            </div>
          )}
        </div>
      )}

      {/* ĐIỀU HƯỚNG TRANG (PAGINATION NỔI) */}
      {!loading && totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-3">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white disabled:opacity-20 hover:bg-red-600 transition-all duration-300"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2 bg-white/5 p-2 rounded-full">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPage(idx + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${
                  currentPage === idx + 1
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-110"
                    : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/10"
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
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white disabled:opacity-20 hover:bg-red-600 transition-all duration-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-32 text-center border-t border-white/5 pt-20">
        <p className="text-gray-600 font-bold tracking-widest text-xs uppercase mb-6">
          Hết danh sách phim
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