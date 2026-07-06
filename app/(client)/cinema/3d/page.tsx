"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, ChevronRight, Lock, Clock, Zap, Layers, Eye } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

const TECH_FEATURES = [
  { icon: Zap, title: "Độ sáng tối ưu", desc: "Tia laser kép tăng cường độ sáng." },
  { icon: Layers, title: "Tần số quét cao", desc: "Hỗ trợ HFR mượt mà khung hình." },
  { icon: Eye, title: "Kính phân cực mới", desc: "Siêu nhẹ, không mỏi mắt." }
];

export default function Cinema3DPage() {
  const IS_COMING_SOON = true;
  const [cinemas3D, setCinemas3D] = useState<any[]>([]);

  // Giả lập fetching data
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest('/api/v1/cinema-items');
        const result = await res.json();
        setCinemas3D((result.data || []).filter((c: any) => c.rooms?.some((r: any) => r.name?.includes('3D'))));
      } catch (e) { console.error(e); }
    };
    fetchCinemas();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-20 pb-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* HERO - GỌN NHẸ */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <Sparkles size={10} />
            <span className="text-[9px] font-black uppercase tracking-widest">Công nghệ HNA RealD 3D</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950">Chiều sâu điện ảnh</h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Trải nghiệm thị giác đỉnh cao chuẩn 3D thế hệ mới sắp có mặt tại HNA Cinema.</p>
        </header>

        {/* TÍNH NĂNG - DẠNG LIST NHỎ */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TECH_FEATURES.map((feat, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2">
              <feat.icon className="text-blue-600" size={20} />
              <div className="space-y-0.5">
                <h3 className="text-[11px] font-black uppercase">{feat.title}</h3>
                <p className="text-[10px] text-slate-400">{feat.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* RẠP & TRẠNG THÁI - TỐI GIẢN */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight">Chi nhánh 3D</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Trạng thái: {IS_COMING_SOON ? "Đang lắp đặt" : "Hoạt động"}</p>
            </div>
            {IS_COMING_SOON ? (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Lock size={12} /> SẮP RA MẮT
              </div>
            ) : (
              <button className="text-[10px] font-black text-blue-600 flex items-center hover:opacity-70">
                LỊCH CHIẾU <ChevronRight size={14} />
              </button>
            )}
          </div>

          {IS_COMING_SOON ? (
            <div className="border border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center text-slate-400">
              <Clock size={24} className="mb-2 opacity-50" />
              <p className="text-[10px] font-bold uppercase">Hệ thống đang được nâng cấp</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cinemas3D.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="text-xs font-bold">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}