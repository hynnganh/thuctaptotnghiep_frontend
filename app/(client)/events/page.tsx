"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Loader2, ChevronRight, MapPin, Check, Search, 
  ChevronDown, Calendar, Ticket, ArrowUpRight 
} from "lucide-react";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await apiRequest("/api/v1/cinema-items");
        const json = await res.json();
        const list = json.data || [];
        setCinemas(list);
        if (list.length > 0) setSelectedCinema(list[0]);
        else setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (!selectedCinema) return;
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/api/v1/promotions/client/${selectedCinema.id}`);
        const json = await res.json();
        setPromotions(json.data || []);
      } catch (e) {
        toast.error("Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [selectedCinema]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 pt-12 pb-24 px-4 md:px-10 font-sans antialiased selection:bg-red-50 selection:text-red-600">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER PHẲNG HIỆN ĐẠI --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] block">
              HNA Cinema Live Experience
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
              SỰ KIỆN <span className="text-zinc-400">&</span> ƯU ĐÃI
            </h1>
          </div>

          {/* DROPDOWN CHỌN RẠP */}
          <div className="relative w-full md:w-72" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-11 flex items-center justify-between bg-white border border-zinc-200 px-4 rounded-xl hover:border-zinc-300 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin size={14} className="text-red-500 shrink-0" />
                <span className="text-xs font-bold text-zinc-700 truncate">
                  {selectedCinema ? selectedCinema.name : "Chọn cụm rạp..."}
                </span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 z-[100] w-full mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 bg-zinc-50 border-b border-zinc-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm vị trí rạp..."
                      className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:border-red-400 text-zinc-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto custom-scrollbar text-xs">
                  {cinemas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cinema) => (
                    <button
                      key={cinema.id}
                      onClick={() => { setSelectedCinema(cinema); setIsOpen(false); }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors flex justify-between items-center border-b border-zinc-100/60"
                    >
                      <span className={selectedCinema?.id === cinema.id ? "text-red-600 font-bold" : "text-zinc-600"}>
                        {cinema.name}
                      </span>
                      {selectedCinema?.id === cinema.id && <Check size={14} className="text-red-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- KHU VỰC NỘI DUNG CHÍNH --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="w-9 h-9 border-2 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Đang tải dòng sự kiện...</span>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-zinc-200 rounded-2xl shadow-sm">
            <Ticket size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Không có sự kiện diễn ra tại rạp này</p>
          </div>
        ) : (
          /* BỐ CỤC BẤT ĐỐI XỨNG / DÒNG THỜI GIAN XEN KẼ */
          <div className="space-y-16">
            {promotions.map((p, index) => {
              const cleanContent = p.content?.replace(/<[^>]*>?/gm, "") || "";
              const isEven = index % 2 === 0;

              return (
                <div 
                  key={p.id} 
                  className={`flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* CỘT 1: HÌNH ẢNH TO RỘNG CỰC KỲ ĐIỆN ẢNH */}
                  <div className="w-full lg:w-[52%] relative rounded-2xl overflow-hidden bg-zinc-100 aspect-[16/9] group shadow-sm border border-zinc-200">
                    {p.thumbnail && (
                      <img
                        src={getImageUrl(p.thumbnail)}
                        alt={p.title}
                        className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-102 transition-all duration-700 ease-out"
                      />
                    )}
                    
                    {/* Voucher Tag bọc góc xịn hơn */}
                    {p.voucher?.discountValue > 0 && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase">
                        Quà tặng -{Number(p.voucher.discountValue / 1000)}K
                      </div>
                    )}
                  </div>

                  {/* CỘT 2: THÔNG TIN TẬP TRUNG TỐI GIẢN */}
                  <div className="w-full lg:w-[48%] flex flex-col justify-center py-2">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                        CHƯƠNG TRÌNH ĐẶC BIỆT
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight text-zinc-900 mb-2.5 leading-snug group-hover:text-red-600 transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-normal">
                      {cleanContent}
                    </p>

                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-medium">Đang diễn ra</span>
                      </div>

                      <Link href={`/events/${p.id}`}>
                        <button className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-red-600 transition-colors group/btn">
                          Khám phá ưu đãi 
                          <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8f9fa; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
      `}</style>
    </div>
  );
}