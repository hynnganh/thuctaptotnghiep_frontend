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
// 2. COMPONENT CON: MOVIECARD (LIGHT TONE)
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
      className="block group relative w-full overflow-hidden rounded-[1.2rem] bg-white border border-slate-200/60 transition-all duration-500 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] select-none"
    >
      <div className={`relative w-full overflow-hidden bg-slate-100 ${
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
        
        {/* Lớp phủ shadow giữ lại một chút phần dưới ảnh để hiển thị chữ sáng rõ nét */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-20">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
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
      
      {/* Thông tin phim (Text màu tối trên nền trắng) */}
      <div className="p-3 space-y-1.5 bg-white">
        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-1 tracking-tight group-hover:text-red-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] font-medium">
          <span className="line-clamp-1 max-w-[65%] text-slate-500">
            {genreNames?.length > 0 ? genreNames.join(" • ") : "Đang cập nhật"}
          </span>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
            isShowing ? "text-orange-600 bg-orange-50 border border-orange-100" : "text-sky-600 bg-sky-50 border border-sky-100"
          }`}>
            {isShowing ? "Đang Chiếu" : "Sắp Chiếu"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ==========================================
// 3. COMPONENT CHÍNH: HEROSECTION (LIGHT TONE)
// ==========================================
export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]); 
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [loadingData, setLoadingData] = useState(true);

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

  const nowWatchingMovies = allMovies.slice(0, 3);

  return (
    <section className="w-full bg-slate-50 px-4 md:px-16 pt-4 md:pt-6 pb-10 space-y-8 text-slate-800 mt-0">
      
      {/* BỐ CỤC CHIA HAI CỘT: BANNER CHÍNH VÀ ĐANG XEM NHIỀU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
        
        {/* CỘT TRÁI: SWIPER HERO BANNER */}
        <div className="lg:col-span-2 relative h-[340px] md:h-[420px] rounded-[2rem] overflow-hidden group shadow-lg border border-slate-200/60">
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

          {/* Lớp phủ bảo vệ tương phản text cho Banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />

          <div className="absolute bottom-6 left-6 md:left-12 right-6 z-20 space-y-2 md:space-y-3 select-none text-white">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-md w-fit backdrop-blur-md border border-white/10">
              Phim Nổi Bật
            </span>
            <h1 className="text-2xl md:text-4xl font-[900] uppercase tracking-tight leading-none drop-shadow-md line-clamp-1 max-w-xl">
              {activeBanner?.title || "Trải Nghiệm Điện Ảnh Đỉnh Cao"}
            </h1>
            <p className="text-[11px] md:text-xs text-slate-200/90 max-w-md leading-relaxed line-clamp-2">
              Săn vé an toàn, lựa chọn vị trí ngồi đẹp nhất và thưởng thức trọn vẹn những bộ phim bom tấn đỉnh cao cùng HNA Cinema.
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] text-slate-300 font-bold">
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

        {/* CỘT PHẢI: DANH SÁCH ĐANG XEM NHIỀU */}
        <div className="flex flex-col justify-between space-y-3 h-full">
          <h2 className="text-sm font-black tracking-tight text-slate-800 pl-1 flex items-center gap-2 uppercase tracking-wide">
            <Film size={14} className="text-red-600" /> Phim Mới Nhất
          </h2>
          
          <div className="flex-1 grid grid-rows-3 gap-3">
            {nowWatchingMovies.length > 0 ? (
              nowWatchingMovies.map((movie) => (
                <Link 
                  href={`/movies/${movie.id}`}
                  key={movie.id}
                  className="flex items-center gap-3 p-2 rounded-[1.2rem] bg-white border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:bg-slate-100/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition group"
                >
                  <div className="relative w-24 h-full aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img 
                      src={getImageUrl(movie.posterUrl)} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="p-1.5 rounded-full bg-white/40 backdrop-blur-sm text-white">
                        <Play size={10} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 pr-2">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-red-600 transition">
                      {movie.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                      {movie.genreNames?.slice(0, 2).join(", ") || movie.genres?.map((g: any) => g.name).slice(0, 2).join(", ") || "Đang cập nhật"}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-mono font-bold">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star size={8} fill="currentColor"/> {movie.rating ? Number(movie.rating).toFixed(1) : "0.0"}
                      </span>
                      <span className="text-slate-400">• {movie.ageRating || "P"}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="row-span-3 flex items-center justify-center text-xs text-slate-400 bg-white rounded-[1.2rem] border border-slate-200/60 shadow-sm">
                Không có dữ liệu phim thịnh hành...
              </div>
            )}
          </div>
        </div>
      </div>

{/* ================= HÀNG DANH SÁCH PHIM XU HƯỚNG ================= */}
      <div className="max-w-[1400px] mx-auto space-y-3 pt-2 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
            Phim Xu Hướng
          </h2>
          {/* Mũi tên điều hướng phối màu Light Mode sạch sẽ */}
          <div className="flex items-center gap-2">
            <button className="hero-prev p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-400 hover:shadow-sm transition disabled:opacity-30 z-40">
              <ChevronLeft size={14} />
            </button>
            <button className="hero-next p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-400 hover:shadow-sm transition disabled:opacity-30 z-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          {loadingData && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center text-xs text-red-600 font-bold transition-all">
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
              slidesPerView={2}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
                1400: { slidesPerView: 6 }, 
              }}
              className="w-full"
            >
              {allMovies.map((movie) => (
                <SwiperSlide key={movie.id} className="py-2">
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
            <div className="w-full py-16 flex items-center justify-center text-xs text-slate-400 bg-white rounded-[1.2rem] border border-slate-200/60 shadow-sm">
              Hiện không có bộ phim nào đang chiếu.
            </div>
          )}
        </div>
      </div>

    </section>
  );
}