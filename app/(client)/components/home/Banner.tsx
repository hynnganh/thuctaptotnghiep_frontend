"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { apiRequest } from "../../../lib/api";


interface BannerType {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  status: string;
  sortOrder: number;
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiRequest("/api/v1/banners/active", { method: "GET" });
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const resData = await response.json();
        if (resData && resData.data) {
          setBanners(resData.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-zinc-800 rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full h-[400px] relative group overflow-hidden rounded-xl bg-zinc-900">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        loop={banners.length > 1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={true}
        className="h-full w-full"
      >
        {banners.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full h-full flex items-center">
              {item.imageUrl.endsWith(".mp4") ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={item.imageUrl} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                  style={{ backgroundImage: `url('${item.imageUrl}')` }}
                />
              )}

              {/* ĐÃ FIX: Gradient mỏng hơn, chỉ che nhẹ bên trái để đọc chữ */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10" />

              <div className="relative z-20 px-12 md:px-20 w-full">
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter text-white uppercase italic drop-shadow-lg">
                    {item.title}
                  </h1>
                  
                  <p className="text-sm md:text-base text-zinc-200 mb-6 font-medium max-w-md drop-shadow-md">
                    Trải nghiệm điện ảnh chân thực nhất tại A&K Cinema.
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => item.linkUrl && (window.location.href = item.linkUrl)}
                      className="bg-zinc-100 text-black px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all hover:bg-white hover:scale-105"
                    >
                      Đặt Vé Ngay
                    </button>
                    <button className="backdrop-blur-md bg-black/20 border border-white/20 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white/20 transition-all">
                      Chi Tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        @keyframes kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        .animate-ken-burns {
          animation: kenburns 8s ease-out forwards;
        }

        .swiper-button-next:after, .swiper-button-prev:after { font-size: 16px !important; font-weight: bold; }
        .swiper-button-next, .swiper-button-prev { 
          width: 40px !important; 
          height: 40px !important; 
          background: rgba(255, 255, 255, 0.1); 
          backdrop-filter: blur(4px);
          border-radius: 50%; 
          color: white !important; 
          opacity: 0; 
          transition: 0.3s ease;
        }
        .group:hover .swiper-button-next, .group:hover .swiper-button-prev { opacity: 0.8; }
        .swiper-button-next:hover, .swiper-button-prev:hover { opacity: 1 !important; background: rgba(255, 255, 255, 0.2); }

        .swiper-pagination-bullet { background: white !important; opacity: 0.3; }
        .swiper-pagination-bullet-active { background: white !important; width: 20px !important; border-radius: 4px; opacity: 1; }
      `}</style>
    </div>
  );
}