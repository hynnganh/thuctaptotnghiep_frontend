"use client";
import React, { useState, useEffect } from 'react';
import { Layers, Zap, Eye, MapPin, ChevronRight, Loader2, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/app/lib/api';

const TECH_FEATURES = [
  {
    icon: <Zap className="text-blue-400" />,
    title: "Triple Beam",
    desc: "Tăng cường độ sáng, loại bỏ hoàn toàn hiện tượng mỏi mắt."
  },
  {
    icon: <Layers className="text-blue-400" />,
    title: "HFR 48fps",
    desc: "Khung hình tốc độ cao giúp các phân cảnh hành động mượt mà."
  },
  {
    icon: <Eye className="text-blue-400" />,
    title: "Phân Cực Tròn",
    desc: "Kính 3D công nghệ mới, nghiêng đầu thoải mái không mất hình."
  }
];

export default function Cinema3DPage() {
  // 🎯 CÔNG TẮC BẬT/TẮT TRẠNG THÁI COMING SOON
  // Khi nào rạp 3D khai trương, ông chỉ cần đổi true thành false là xong!
  const IS_COMING_SOON = true;

  const [cinemas3D, setCinemas3D] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest('/api/v1/cinema-items');
        const result = await res.json();
        
        // Lọc ra các rạp có phòng 3D
        const filtered = (result.data || []).filter((cinema: any) => 
          cinema.rooms?.some((room: any) => room.name?.toUpperCase().includes('3D'))
        );
        
        setCinemas3D(filtered);
      } catch (e) {
        console.error("Lỗi lấy danh sách rạp:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 selection:bg-blue-600/30">
      
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-6 text-center space-y-6 mb-24">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">A&K RealD 3D</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-[1000] italic uppercase tracking-tighter leading-none">
          BƯỚC RA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">KHỎI KHUNG HÌNH</span>
        </h1>
        
        <p className="text-zinc-400 text-sm font-medium max-w-xl mx-auto">
          Trải nghiệm chiều sâu tuyệt đối với công nghệ 3D thế hệ mới nhất chuẩn bị có mặt tại hệ thống A&K Cinema.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 space-y-24">
        
        {/* TECH GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TECH_FEATURES.map((feat, i) => (
            <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-4 hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">{feat.title}</h3>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* 🎯 DANH SÁCH RẠP 3D & TRẠNG THÁI COMING SOON */}
        <section className={`bg-gradient-to-br from-[#0a0a0c] to-[#050505] border border-white/5 rounded-[2.5rem] p-8 md:p-12 transition-all ${IS_COMING_SOON ? 'grayscale-[0.3]' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
            <div>
              <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">Danh sách rạp 3D</h2>
              <p className="text-zinc-500 text-xs font-medium mt-2 tracking-wide uppercase">
                {IS_COMING_SOON ? "Đang trong quá trình lắp đặt" : "Cập nhật theo dữ liệu thời gian thực"}
              </p>
            </div>
            
            {/* 🎯 NÚT BẤM (KHÓA NẾU COMING SOON) */}
            {IS_COMING_SOON ? (
              <button 
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/50 text-zinc-600 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed shrink-0"
              >
                Sắp ra mắt <Lock size={14} />
              </button>
            ) : (
              <Link 
                href="/cinema"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group shrink-0"
              >
                Xem lịch chiếu ngay <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* 🎯 NỘI DUNG HIỂN THỊ */}
          {IS_COMING_SOON ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                <Clock size={32} className="text-blue-500 mb-4 opacity-80" />
                <h3 className="text-blue-500 text-sm font-black uppercase tracking-widest mb-2">Coming Soon</h3>
                <p className="text-zinc-500 text-xs font-medium">Hệ thống phòng chiếu 3D đang được triển khai và sẽ sớm ra mắt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cinemas3D.length > 0 ? (
                cinemas3D.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-4 bg-black/50 border border-white/5 rounded-2xl hover:border-blue-500/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <span className="text-sm font-bold text-zinc-300">{c.name}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                  Hiện tại hệ thống chưa cập nhật phòng 3D
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
