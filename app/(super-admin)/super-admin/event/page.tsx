"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Edit3, MapPin, Film, Sparkles, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PromotionModal from './EventModal';

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest('/api/v1/promotions');
      const json = await res.json();
      const rawData = json.data?.content || json.data || json || [];
      if (Array.isArray(rawData)) {
        const sortedData = [...rawData].sort((a, b) => (b.id || 0) - (a.id || 0));
        setPromotions(sortedData);
      } else {
        setPromotions([]);
      }
    } catch (e) {
      toast.error("Không thể kết nối trực tiếp với máy chủ nguồn");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const executeDelete = async () => {
    if (!promoToDelete) return;
    try {
      const res = await apiSuperAdminRequest(`/api/v1/promotions/${promoToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa bản ghi sự kiện thành công");
        fetchPromotions();
      } else {
        toast.error("Không thể xóa sự kiện này khỏi hệ thống");
      }
    } catch (e) {
      toast.error("Lỗi đồng bộ hệ thống khi thực hiện xóa");
    } finally {
      setIsDeleteModalOpen(false);
      setPromoToDelete(null);
    }
  };

  const filteredPromotions = promotions.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stripHtml = (html: string) => {
    if (!html) return "Chương trình chưa cập nhật mô tả chi tiết từ quản trị viên.";
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px',
          },
        }} 
      />
      
      <PromotionModal 
        isOpen={isModalOpen} 
        mode={modalMode} 
        data={selectedPromo}
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchPromotions} 
      />

      {/* HEADER SECTION */}
      <header className="bg-[#020202] border-b border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6 py-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">Quản lý sự kiện</h1>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Promotion Hub Registry</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={14} />
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Tìm kiếm sự kiện, ưu đãi..." 
                className="w-full bg-[#060608] border border-zinc-900 pl-11 pr-4 py-3 rounded-xl text-xs font-bold focus:border-zinc-800 outline-none transition-all placeholder:text-zinc-700 text-white" 
              />
            </div>
            <button 
              onClick={() => { setModalMode('create'); setSelectedPromo(null); setIsModalOpen(true); }} 
              className="bg-white hover:bg-zinc-200 text-black h-[42px] px-5 rounded-lg font-bold uppercase text-xs flex items-center gap-1.5 transition-all active:scale-98 tracking-wider"
            >
              <Plus size={15} /> Tạo mới
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-6 md:p-10 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <Loader2 className="animate-spin text-red-600 opacity-80" size={32} />
            <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest animate-pulse">Syncing Engine...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPromotions.length > 0 ? filteredPromotions.map((p) => (
              <div 
                key={p.id} 
                className="bg-[#060608] border border-zinc-900 rounded-xl p-5 flex flex-col lg:flex-row items-center gap-6 group hover:border-zinc-800 transition-all duration-300"
              >
                {/* Banner Thumbnail */}
                <div className="w-full lg:w-60 aspect-video lg:aspect-[16/10] rounded-lg overflow-hidden bg-zinc-950 relative shrink-0 border border-zinc-900">
                  <img 
                    src={p.thumbnail?.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || "https://placehold.co/600x400?text=Cinema+Event"}${p.thumbnail}` : (p.thumbnail || "https://placehold.co/600x400?text=Cinema+Event")} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-500" 
                    alt={p.title} 
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 rounded border border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-400 tracking-wide">ID-{p.id}</span>
                  </div>
                </div>

                {/* Event Core Info */}
                <div className="flex-1 min-w-0 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-wider">
                      Hoạt động
                    </span>
                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide flex items-center gap-1">
                      <Calendar size={12} className="text-zinc-600" /> {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-black uppercase tracking-tight text-zinc-200 group-hover:text-white transition-colors leading-snug truncate">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed max-w-4xl">
                    {stripHtml(p.content)}
                  </p>
                  
                  {/* Scope Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-500 tracking-wide">
                      <MapPin size={11} className="text-zinc-600" /> {p.cinemaItem?.name || "Toàn Hệ Thống"}
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-500 tracking-wide">
                      <Film size={11} className="text-zinc-600" /> {p.movie?.title || "Tất cả các phim"}
                    </div>
                  </div>
                </div>

                {/* Operations Panel */}
                <div className="flex lg:flex-col gap-3 shrink-0 justify-center items-center border-t lg:border-t-0 lg:border-l border-zinc-900 w-full lg:w-auto pt-4 lg:pt-0 lg:pl-6">
                  <button 
                    onClick={() => { setSelectedPromo(p); setModalMode('edit'); setIsModalOpen(true); }} 
                    className="w-9 h-9 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:text-white rounded-md transition-all flex items-center justify-center active:scale-95"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit3 size={14} />
                  </button>
                  
                  <button 
                    onClick={() => { setPromoToDelete(p.id); setIsDeleteModalOpen(true); }} 
                    className="w-9 h-9 bg-zinc-950 border border-zinc-900 hover:border-red-900/60 hover:text-red-500 rounded-md transition-all flex items-center justify-center text-zinc-600 active:scale-95"
                    title="Xóa sự kiện"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
                <AlertCircle size={28} className="text-zinc-800 mb-2" />
                <p className="font-bold uppercase tracking-widest text-zinc-600 text-[11px]">Không tìm thấy dữ liệu sự kiện tương thích</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CORE ACTION: DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#060608] border border-zinc-900 p-6 md:p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={18} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-200">Xác nhận gỡ bỏ bản ghi sự kiện?</h3>
            <p className="text-[11px] text-zinc-500 mt-1.5 font-medium leading-relaxed">Hành động này sẽ xóa vĩnh viễn cấu hình ưu đãi ra khỏi cơ sở dữ liệu core hệ thống.</p>
            <div className="flex gap-3 mt-5">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-500 rounded-md font-bold uppercase text-[10px] tracking-wider transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-black uppercase text-[10px] tracking-wider transition-all"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}