"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, X, Star, CalendarDays, Filter, ArrowDownUp, ZoomIn, Check, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSuperAdminRequest, getImageUrl } from '@/app/lib/api';

// --- COMPONENT CUSTOM DROPDOWN (GLASSMORPHISM) ---
function CustomDropdown({ icon: Icon, value, options, onChange, label }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2 transition-all shadow-sm active:scale-95"
      >
        <Icon size={14} className={isOpen ? "text-red-500" : "text-zinc-500"} />
        <span className="text-zinc-300 text-[11px] font-bold uppercase tracking-widest min-w-[90px] text-left">
          {selectedOption ? selectedOption.label : label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-[#111116]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                value === opt.value 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt.label}
              {value === opt.value && <Check size={14} className="text-red-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewManagementModal({ isOpen, onClose, movieId, movieTitle }: any) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStar, setFilterStar] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest(`/api/v1/reviews/movie/${movieId}`);
      const data = await res.json();
      if (res.ok) setReviews(data.data || []);
    } catch (err) {
      toast.error("Không tải được danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && movieId) {
      setFilterStar("all");
      setSortOrder("newest");
      fetchReviews();
    }
  }, [isOpen, movieId]);

  // 🎯 ĐÃ THAY ĐỔI: Dùng giao diện Toast xác nhận giống y hệt xóa phim
  const handleDeleteReview = async (reviewId: number) => {
    toast((t) => (
      <div className="text-white p-1">
        <p className="text-[10px] font-bold uppercase mb-3 tracking-widest text-zinc-300">Xác nhận xóa vĩnh viễn đánh giá này?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await apiSuperAdminRequest(`/api/v1/reviews/${reviewId}`, { method: 'DELETE' });
                if (res.ok) {
                  toast.success("Đã xóa đánh giá thành công!");
                  fetchReviews(); 
                } else toast.error("Lỗi khi xóa đánh giá!");
              } catch (err) { toast.error("Lỗi máy chủ!"); }
            }} 
            className="bg-red-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-all shadow-md shadow-red-900/20"
          >
            Xóa Vĩnh Viễn
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-zinc-800 px-4 py-2 rounded-lg text-[9px] font-bold uppercase hover:bg-zinc-700 transition-all text-zinc-300"
          >
            Hủy Bỏ
          </button>
        </div>
      </div>
    ), { style: { background: '#09090b', border: '1px solid #1c1c1f', borderRadius: '12px' } });
  };

  const filteredReviews = reviews
    .filter(r => filterStar === "all" || Math.floor(r.rating).toString() === filterStar)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  if (!isOpen) return null;

  return (
    <>
      {zoomedImg && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={() => setZoomedImg(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 hover:scale-110 shadow-2xl">
            <X size={20} />
          </button>
          <img src={zoomedImg} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300" alt="Zoomed Review" />
        </div>
      )}

      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-gradient-to-b from-[#0a0a0f] to-[#050508] border border-white/10 rounded-[2rem] w-full max-w-5xl flex flex-col h-[88vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/5">
          
          <div className="p-6 md:px-8 border-b border-white/5 shrink-0 relative overflow-visible z-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
            
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm">
                  <MessageSquare size={28} className="text-red-500" /> KHO ĐÁNH GIÁ
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  Siêu phẩm: 
                  <span className="text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10 shadow-inner">
                    {movieTitle}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-600 hover:text-white text-zinc-400 rounded-xl transition-all border border-white/5 shadow-sm hover:scale-105 active:scale-95">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative">
              <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                Lọc kết quả <span className="text-zinc-600">|</span> <span className="text-white">{filteredReviews.length}</span> / {reviews.length} đánh giá
              </div>

              <div className="flex items-center gap-3">
                <CustomDropdown 
                  icon={Filter} 
                  value={filterStar} 
                  onChange={setFilterStar} 
                  options={[
                    { value: "all", label: "Tất cả sao" },
                    { value: "5", label: "5 Sao" },
                    { value: "4", label: "4 Sao" },
                    { value: "3", label: "3 Sao" },
                    { value: "2", label: "2 Sao" },
                    { value: "1", label: "1 Sao" }
                  ]} 
                />
                
                <CustomDropdown 
                  icon={ArrowDownUp} 
                  value={sortOrder} 
                  onChange={setSortOrder} 
                  options={[
                    { value: "newest", label: "Mới nhất trước" },
                    { value: "oldest", label: "Cũ nhất trước" }
                  ]} 
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:px-8 space-y-4 bg-transparent relative custom-scrollbar z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in">
                <Loader2 className="animate-spin text-red-600" size={40} />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50 animate-in zoom-in-95 duration-500">
                <div className="p-6 bg-white/5 rounded-full border border-white/5">
                  <MessageSquare size={40} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Hệ thống chưa ghi nhận đánh giá nào</p>
              </div>
            ) : (
              filteredReviews.map((r: any, index: number) => (
                <div 
                  key={r.id} 
                  className="p-5 rounded-[1.25rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-500 flex gap-5 animate-in slide-in-from-bottom-8 fade-in hover:shadow-[0_10px_30px_-15px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 group"
                  style={{ animationDuration: '600ms', animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center font-black text-lg text-zinc-300 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-zinc-500 transition-colors">
                    {r.user?.firstName ? r.user.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-wider drop-shadow-md">
                          {r.user?.firstName} {r.user?.lastName}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-black shadow-sm">
                            <Star size={10} className="fill-amber-500 mr-1.5" /> {r.rating} / 5.0
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500">
                            <CalendarDays size={12} className="opacity-70" /> 
                            {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteReview(r.id)} 
                        className="p-2 bg-black/40 hover:bg-red-600 text-zinc-500 hover:text-white border border-white/5 hover:border-red-500 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-zinc-300 mt-3.5 leading-relaxed font-medium">
                      {r.comment}
                    </p>

                    {r.imageUrl && (
                      <div 
                        className="mt-4 relative w-20 h-20 group/img rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-md ring-2 ring-transparent hover:ring-red-500/30 transition-all duration-300"
                        onClick={() => setZoomedImg(r.imageUrl.startsWith('http') ? r.imageUrl : getImageUrl(r.imageUrl))}
                      >
                        <img 
                          src={r.imageUrl.startsWith('http') ? r.imageUrl : getImageUrl(r.imageUrl)} 
                          alt="Đính kèm" 
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                          <ZoomIn size={16} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
      `}} />
    </>
  );
}