"use client";
import React from 'react';
import { ChevronRight, Zap, Star, ShieldCheck, Heart } from 'lucide-react';

const SPECIAL_ROOMS = {
  technology: [
    { title: "IMAX", desc: "Công nghệ điện ảnh tân tiến nhất", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000", badge: "Công nghệ" },
    { title: "4DX", desc: "Đánh thức mọi giác quan", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000", badge: "Công nghệ" },
    { title: "ULTRA 4DX", desc: "Trải nghiệm điện ảnh tột đỉnh", img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000", badge: "Công nghệ", large: true },
  ],
  lifestyle: [
    { title: "GOLD CLASS", desc: "Ghế ngồi hạng thương gia cao cấp", img: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1000", badge: "Phong cách" },
    { title: "L'AMOUR", desc: "Giường nằm thoải mái & tiện nghi", img: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=1000", badge: "Phong cách" },
    { title: "SWEETBOX", desc: "Không gian riêng tư cho cặp đôi", img: "https://images.unsplash.com/photo-1543536448-d247542f576c?q=80&w=1000", badge: "Phong cách" },
  ]
};

export default function SpecialCinemasPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* HEADER SECTION */}
        <header className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">
            Tận hưởng cả thế giới <br /> 
            <span className="text-red-600 underline decoration-white/10 underline-offset-8">điện ảnh tại A&K</span>
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-xs">
            #CôngNghệ #TrảiNghiệm #PhongCách
          </p>
        </header>

        {/* CÔNG NGHỆ SECTION */}
        <section className="space-y-12">
          <div className="flex items-end gap-6 border-l-4 border-red-600 pl-6">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Công Nghệ</h2>
            <p className="text-zinc-500 text-sm max-w-md font-medium pb-1">
              Kết hợp toàn diện của 3 yếu tố (màn hình, âm thanh, ghế ngồi) nâng cấp trải nghiệm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIAL_ROOMS.technology.map((room, i) => (
              <div 
                key={i} 
                className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 aspect-video md:aspect-square lg:aspect-auto ${room.large ? 'lg:col-span-2 lg:h-[400px]' : 'lg:h-[400px]'}`}
              >
                <img 
                  src={room.img} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                  alt={room.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                  <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {room.badge}
                  </span>
                  <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter">{room.title}</h3>
                  <p className="text-zinc-400 text-sm font-medium">{room.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHONG CÁCH SECTION */}
        <section className="space-y-12">
          <div className="flex items-end gap-6 border-l-4 border-white pl-6">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Phong Cách</h2>
            <p className="text-zinc-500 text-sm max-w-md font-medium pb-1">
              Phòng chiếu theo chủ đề mang đến trải nghiệm điện ảnh ấn tượng, đẳng cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SPECIAL_ROOMS.lifestyle.map((room, i) => (
              <div 
                key={i} 
                className="group relative h-[350px] overflow-hidden rounded-[3rem] border border-white/5"
              >
                <img 
                  src={room.img} 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                  alt={room.title} 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-10 space-y-3">
                   <div className="flex justify-between items-center">
                      <h3 className="text-4xl font-[1000] italic uppercase tracking-tighter leading-none">{room.title}</h3>
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ChevronRight size={24} />
                      </div>
                   </div>
                   <p className="text-zinc-300 font-medium tracking-wide">{room.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <div className="bg-red-600 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-red-600/20">
            <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white">
               Bạn đã sẵn sàng trải nghiệm chưa?
            </h2>
            <button className="px-12 py-5 bg-white text-black rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#050505] hover:text-white transition-all shadow-xl">
               Đặt vé ngay bây giờ
            </button>
        </div>

      </div>
    </div>
  );
}