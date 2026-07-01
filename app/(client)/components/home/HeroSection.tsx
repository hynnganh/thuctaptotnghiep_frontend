"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";
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
      className="block group relative w-full overflow-hidden rounded-[1.8rem] bg-[#101115] border border-white/[0.04] transition-all duration-500 cursor-pointer shadow-md select-none"
    >
      <div className={`relative w-full overflow-hidden bg-[#15161b] ${
        variant === "landscape" ? "aspect-[16/10]" : "h-[380px]"
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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20">
          <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl border border-white/10 z-10">
          <Star size={10} className={`${hasRating ? 'fill-amber-400 text-amber-400' : 'text-sky-400 animate-pulse'}`} />
          <span className="text-white text-[10px] font-black font-mono">{displayRating}</span>
        </div>

        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-lg z-10">
          <span className="text-pink-300 text-[9px] font-black tracking-wide font-mono uppercase">
            {ageRating || "P"}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1 transform transition-transform duration-300 group-hover:-translate-y-1">
          <h3 className="font-bold text-white text-[13px] md:text-[14px] line-clamp-1 tracking-tight drop-shadow-md">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
            {/* 🌟 FIX CHỐNG LỖI: Dùng genreNames?.length để nối chuỗi */}
            <span className="line-clamp-1 max-w-[70%]">
              {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
            </span>
            <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
              isShowing ? "text-orange-400 bg-orange-400/10" : "text-sky-400 bg-sky-400/10"
            }`}>
              {isShowing ? "Đang Chiếu" : "Sắp Chiếu"}
            </span>
          </div>
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
  const [movies, setMovies] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bannerRes = await apiRequest("/api/v1/banners/active");
        const movieRes = await apiRequest("/api/v1/movies?status=SHOWING&page=0&size=6&sort=id,desc");

        if (bannerRes.ok) {
          const resData = await bannerRes.json();
          const activeBanners = resData.data || [];
          setBanners(activeBanners);
          if (activeBanners.length > 0) {
            setActiveBanner(activeBanners[0]);
          }
        }

        if (movieRes.ok) {
          const resData = await movieRes.json();
          setMovies(resData.data?.content || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      }
    };

    loadData();
  }, []);

  if (!banners.length) return null;

  return (
    <section className="relative h-[78vh] w-full overflow-hidden bg-[#0a0b0e]">
      
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* ================= BANNER BACKGROUND SLIDER ================= */}
      <div className="absolute inset-0 h-[72%] w-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          speed={1000}
          loop={banners.length > 1}
          onSlideChange={(swiper) => {
            const realIndex = swiper.realIndex;
            if (banners[realIndex]) {
              setActiveBanner(banners[realIndex]);
            }
          }}
          className="w-full h-full"
        >
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${b.imageUrl})` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/40 to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0e]/80 via-transparent to-black/10 z-10" />
      </div>

      {/* ================= NỘI DUNG THÔNG TIN BANNER CHÍNH ================= */}
      <div className="absolute z-20 top-[12%] md:top-[15%] left-6 md:left-16 max-w-xl space-y-3 select-none">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md w-fit backdrop-blur-sm">
          Phim Nổi Bật • Độc Quyền Tại Rạp
        </div>

        <h1 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tight leading-none drop-shadow-md max-w-md line-clamp-2">
          {activeBanner?.title || "Trải Nghiệm Điện Ảnh Đỉnh Cao"}
        </h1>

        <p className="text-[11px] md:text-xs text-zinc-300/70 max-w-sm leading-relaxed line-clamp-2">
          Săn vé an toàn, lựa chọn vị trí ngồi đẹp nhất và thưởng thức trọn vẹn những bộ phim bom tấn đỉnh cao cùng gia đình, bạn bè.
        </p>

        <div className="flex items-center gap-2.5 pt-0.5">
          <Link 
            href={activeBanner?.linkUrl || "#"}
            className="bg-[#3b82f6] text-white px-5 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 hover:bg-blue-600 transition shadow-lg shadow-blue-500/10 active:scale-95"
          >
            <Play size={10} fill="currentColor" />
            Xem Ngay
          </Link>
        </div>
      </div>

      {/* ================= HÀNG DANH SÁCH 6 PHIM MỚI NHẤT TRƯỢT NGANG ================= */}
      <div className="absolute bottom-4 w-full z-30 px-6 md:px-16 space-y-2">
        
        <div className="flex items-center justify-between max-w-[1400px] mx-auto pb-1 border-b border-white/[0.02]">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 drop-shadow">
            Phim Mới Nhất
          </h2>
          
          <div className="flex items-center gap-2">
            <button className="hero-prev p-2 rounded-full bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-md disabled:opacity-20 z-40">
              <ChevronLeft size={14} />
            </button>
            <button className="hero-next p-2 rounded-full bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-md disabled:opacity-20 z-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".hero-prev",
              nextEl: ".hero-next",
            }}
            spaceBetween={18}
            slidesPerView={1.4}
            breakpoints={{
              480: { slidesPerView: 2.2 },
              768: { slidesPerView: 3.2 },
              1024: { slidesPerView: 4.5 },
              1400: { slidesPerView: 5 }, 
            }}
            className="!overflow-visible"
          >
            {movies.map((movie) => (
              <SwiperSlide key={movie.id} className="py-1">
                <div className="transition-transform duration-300 hover:scale-[1.02]">
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    image={movie.posterUrl} 
                    status={movie.status}
                    rating={movie.rating}
                    ageRating={movie.ageRating}
                    
                    // 🎯 CHỐT HẠ: Hứng mọi loại API (Danh sách hoặc Chi tiết)
                    genreNames={movie.genreNames || movie.genres?.map((g: any) => g.name) || []} 
                    
                    variant="landscape"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

    </section>
  );
}