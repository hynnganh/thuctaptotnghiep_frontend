"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Play, ChevronLeft, ChevronRight, Star, Film } from "lucide-react";
import { apiRequest, getImageUrl } from "../../../lib/api"; 
import Link from "next/link"; 

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

// ==========================================
// 1. ĐỊNH NGHĨA CÁC INTERFACE DỮ LIỆU
// ==========================================
interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string; 
  position: string;
  status: string;
  sortOrder: number;
}

interface MovieCardProps {
  id: number;
  title: string;
  image: string;
  rating?: string | number;
  status?: string;
  ageRating?: string;
  genreNames?: string[]; 
  variant?: "poster" | "landscape";
}

// ==========================================
// 2. COMPONENT CON: MOVIECARD
// ==========================================
function MovieCard({ 
  id, 
  title, 
  image, 
  rating, 
  status, 
  ageRating, 
  genreNames = [], 
  variant = "landscape"
}: MovieCardProps) {
  const isShowing = status === "SHOWING";
  const hasRating = rating && Number(rating) > 0;
  const displayRating = hasRating ? Number(rating).toFixed(1) : "0.0";

  return (
    <Link 
      href={`/movies/${id}`} 
      className="block group relative w-full overflow-hidden rounded-[1.2rem] bg-[#101115] border border-white/[0.04] transition-all duration-500 cursor-pointer shadow-md select-none"
    >
      <div className={`relative w-full overflow-hidden bg-[#15161b] ${
        variant === "landscape" ? "aspect-[16/10]" : "h-[240px] md:h-[280px]"
      }`}>
        <img
          src={getImageUrl(image)} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=cover";
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {/* Badge đánh giá */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 z-10">
          <Star size={10} className={`${hasRating ? 'fill-amber-400 text-amber-400' : 'text-sky-400 animate-pulse'}`} />
          <span className="text-white text-[10px] font-black font-mono">{displayRating} IMDB</span>
        </div>

        {/* Badge độ tuổi */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-lg z-10">
          <span className="text-pink-300 text-[9px] font-black tracking-wide font-mono uppercase">
            {ageRating || "P"}
          </span>
        </div>
      </div>
      
      {/* Thông tin phim */}
      <div className="p-2 space-y-1">
        <h3 className="font-bold text-white text-[13px] line-clamp-1 tracking-tight group-hover:text-red-500 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
          <span className="line-clamp-1 max-w-[65%]">
            {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
          </span>
          <span className={`text-[8px] font-bold px-1 rounded uppercase ${
            isShowing ? "text-orange-400 bg-orange-400/10" : "text-sky-400 bg-sky-400/10"
          }`}>
            {isShowing ? "Đang Chiếu" : "Sắp Chiếu"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ==========================================
// 3. COMPONENT CHÍNH: HEROSECTION
// ==========================================
export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]); 
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // ─── CALL API ĐỒNG LOẠT (CHẠY LẦN ĐẦU KHI VÀO TRANG) ───
  useEffect(() => {
    const initPageData = async () => {
      setLoadingData(true);
      try {
        const [bannerRes, movieRes] = await Promise.all([
          apiRequest("/api/v1/banners/active"),
          apiRequest("/api/v1/movies?status=SHOWING&page=0&size=20&sort=id,desc")
        ]);

        if (bannerRes.ok) {
          const resData = await bannerRes.json();
          const activeBanners = resData.data || [];
          setBanners(activeBanners);
          if (activeBanners.length > 0) setActiveBanner(activeBanners[0]);
        }

        if (movieRes.ok) {
          const resData = await movieRes.json();
          const fetchedMovies = resData.data?.content || [];
          setAllMovies(fetchedMovies); 
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      } finally {
        setLoadingData(false);
      }
    };

    initPageData();
  }, []);

  if (!banners.length) return null;

  // Lấy 3 phim đầu tiên hiển thị cho cột "Đang xem nhiều"
  const nowWatchingMovies = allMovies.slice(0, 3);

  return (
<section className="w-full bg-[#0a0b0e] px-4 md:px-16 pt-4 md:pt-6 pb-8 space-y-8 text-white mt-0">      {/* BỐ CỤC CHIA HAI CỘT: BANNER CHÍNH VÀ ĐANG XEM NHIỀU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
        
        {/* CỘT TRÁI (CHIẾM 2 PHẦN): SWIPER HERO BANNER */}
        <div className="lg:col-span-2 relative h-[340px] md:h-[420px] rounded-[2rem] overflow-hidden group shadow-2xl border border-white/[0.04]">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            speed={1000}
            loop={banners.length > 1}
            onSlideChange={(swiper) => {
              const realIndex = swiper.realIndex;
              if (banners[realIndex]) setActiveBanner(banners[realIndex]);
            }}
            className="w-full h-full"
          >
            {banners.map((b) => (
              <SwiperSlide key={b.id}>
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${b.imageUrl})` }} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />

          <div className="absolute bottom-6 left-6 md:left-12 right-6 z-20 space-y-2 md:space-y-3 select-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-white/10 px-2.5 py-0.5 rounded-md w-fit backdrop-blur-md">
              Phim Nổi Bật
            </span>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-none drop-shadow-md line-clamp-1 max-w-xl">
              {activeBanner?.title || "Trải Nghiệm Điện Ảnh Đỉnh Cao"}
            </h1>
            <p className="text-[11px] md:text-xs text-zinc-300/80 max-w-md leading-relaxed line-clamp-2">
              Săn vé an toàn, lựa chọn vị trí ngồi đẹp nhất và thưởng thức trọn vẹn những bộ phim bom tấn đỉnh cao cùng HNA Cinema.
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400"/> 4.8 IMDB</span>
              <span>• 2026</span>
            </div>
            
            <div className="absolute right-4 bottom-2 md:right-8 md:bottom-4">
              <Link 
                href={activeBanner?.linkUrl || "#"}
                className="p-4 md:p-5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 block"
              >
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (CHIẾM 1 PHẦN): DANH SÁCH ĐANG XEM NHIỀU */}
        <div className="flex flex-col justify-between space-y-3 h-full">
          <h2 className="text-sm font-bold tracking-tight text-zinc-100 pl-1 flex items-center gap-2">
            <Film size={14} className="text-red-500" /> Đang xem nhiều
          </h2>
          
          <div className="flex-1 grid grid-rows-3 gap-3">
            {nowWatchingMovies.length > 0 ? (
              nowWatchingMovies.map((movie) => (
                <Link 
                  href={`/movies/${movie.id}`}
                  key={movie.id}
                  className="flex items-center gap-3 p-2 rounded-[1.2rem] bg-[#121318] border border-white/[0.02] hover:bg-[#181920] transition group"
                >
                  <div className="relative w-24 h-full aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img 
                      src={getImageUrl(movie.posterUrl)} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play size={12} fill="currentColor" className="text-white opacity-80" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 pr-2">
                    <h3 className="text-xs font-bold line-clamp-1 group-hover:text-red-500 transition">
                      {movie.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">
                      {movie.genreNames?.slice(0, 2).join(", ") || movie.genres?.map((g: any) => g.name).slice(0, 2).join(", ") || "Đang cập nhật"}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star size={8} fill="currentColor"/> {movie.rating ? Number(movie.rating).toFixed(1) : "0.0"}
                      </span>
                      <span>• {movie.ageRating || "P"}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="row-span-3 flex items-center justify-center text-xs text-zinc-500 bg-[#121318] rounded-[1.2rem] border border-white/[0.02]">
                Không có dữ liệu phim thịnh hành...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= HÀNG DANH SÁCH PHIM XU HƯỚNG ================= */}
      <div className="max-w-[1400px] mx-auto space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-300">
            Phim Xu Hướng
          </h2>
          <div className="flex items-center gap-2">
            <button className="hero-prev p-1.5 rounded-full bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-md disabled:opacity-20 z-40">
              <ChevronLeft size={14} />
            </button>
            <button className="hero-next p-1.5 rounded-full bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-md disabled:opacity-20 z-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="relative">
          {loadingData && (
            <div className="absolute inset-0 bg-[#0a0b0e]/50 backdrop-blur-sm z-50 flex items-center justify-center text-xs text-red-500 font-bold transition-all">
              Đang tải danh sách phim...
            </div>
          )}

          {allMovies.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".hero-prev",
                nextEl: ".hero-next",
              }}
              spaceBetween={16}
              slidesPerView={2.2}
              breakpoints={{
                480: { slidesPerView: 2.5 },
                768: { slidesPerView: 3.8 },
                1024: { slidesPerView: 5.2 },
                1400: { slidesPerView: 6.5 }, 
              }}
              className="!overflow-visible"
            >
              {allMovies.map((movie) => (
                <SwiperSlide key={movie.id} className="py-1">
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    image={movie.posterUrl} 
                    status={movie.status}
                    rating={movie.rating}
                    ageRating={movie.ageRating}
                    genreNames={movie.genreNames || movie.genres?.map((g: any) => g.name) || []} 
                    variant="poster"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full py-16 flex items-center justify-center text-xs text-zinc-500 bg-[#121318] rounded-[1.2rem] border border-white/[0.02]">
              Hiện không có bộ phim nào đang chiếu.
            </div>
          )}
        </div>
      </div>

    </section>
  );
}