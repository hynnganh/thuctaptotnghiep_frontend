"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Loader2, Megaphone, Ticket, ChevronRight, 
  MapPin, Check, Search, ChevronDown, Calendar 
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
    <div className="min-h-screen bg-[#050505] text-white pt-8 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER: Gọn hơn */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="border-l-2 border-red-600 pl-4">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
              Ưu đãi & <span className="text-red-600">Sự kiện</span>
            </h1>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.3em] mt-1 opacity-60">
              A&K Cinema Exclusive
            </p>
          </div>

          {/* DROPDOWN: Thu hẹp chiều rộng */}
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-zinc-900/40 border border-white/5 px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-all shadow-lg group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin size={14} className="text-red-600 shrink-0" />
                <span className="text-[11px] font-bold truncate">
                  {selectedCinema ? selectedCinema.name : "Chọn rạp..."}
                </span>
              </div>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 bg-zinc-800/30">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={12} />
                    <input
                      type="text"
                      placeholder="Tìm rạp..."
                      className="w-full bg-black rounded-lg py-1.5 pl-8 pr-3 text-[10px] outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar text-[11px]">
                  {cinemas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cinema) => (
                    <button
                      key={cinema.id}
                      onClick={() => { setSelectedCinema(cinema); setIsOpen(false); }}
                      className="w-full px-4 py-3 text-left hover:bg-red-600 transition-colors flex justify-between items-center border-b border-white/[0.02]"
                    >
                      <span className={selectedCinema?.id === cinema.id ? "text-red-500 font-bold" : "text-zinc-300"}>{cinema.name}</span>
                      {selectedCinema?.id === cinema.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-40"><Loader2 className="animate-spin text-red-600" size={30} /></div>
        ) : (
          /* GRID: Chỉnh col-4 trên màn lớn để card nhỏ lại */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {promotions.map((p) => {
              const cleanContent = p.content?.replace(/<[^>]*>?/gm, "") || "";
              return (
                <div key={p.id} className="group bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden hover:bg-zinc-900/60 transition-all duration-300 flex flex-col">
                  
                  {/* IMAGE: Giảm chiều cao xuống h-40 */}
                  <div className="h-40 relative overflow-hidden bg-zinc-800">
                    {p.thumbnail && (
                      <img
                        src={getImageUrl(p.thumbnail)}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />
                    )}
                    {p.voucher?.discountValue > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded-md shadow-lg">
                        -{Number(p.voucher.discountValue / 1000)}K
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent" />
                  </div>

                  {/* CONTENT: Nhỏ chữ lại */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-4 h-[1px] bg-red-600"></span>
                      <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Promotion</span>
                    </div>

                    <h3 className="text-xs font-bold uppercase mb-2 line-clamp-2 italic tracking-tight leading-snug group-hover:text-red-500 transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-[10px] text-zinc-500 line-clamp-2 mb-4 italic opacity-80 leading-relaxed">
                      {cleanContent}
                    </p>

                    <Link href={`/events/${p.id}`} className="mt-auto">
                      <button className="w-full py-2 bg-zinc-800/50 border border-white/5 text-white text-[9px] font-bold uppercase rounded-xl hover:bg-red-600 hover:border-red-600 transition-all flex items-center justify-center gap-2 tracking-widest">
                        Chi tiết <ChevronRight size={10} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}