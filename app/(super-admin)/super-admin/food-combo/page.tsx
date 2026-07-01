"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, RefreshCw, AlertCircle, UtensilsCrossed, Sparkles } from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import ComboForm from './ComboForm';

export default function FoodManagement() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await apiSuperAdminRequest('/api/v1/combos');
      const result = await res.json();
      const rawData = result.data || result || [];
      if (Array.isArray(rawData)) {
        setCombos([...rawData].sort((a, b) => (b.id || 0) - (a.id || 0)));
      }
    } catch (error) {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCombos(); }, []);

const handleFormSubmit = async (data: FormData) => {
  const isUpdate = !!editingItem;

  const endpoint = isUpdate
    ? `/api/v1/combos/${editingItem.id}`
    : "/api/v1/combos";

  setIsSubmitting(true);

  const toastId = toast.loading(
    isUpdate ? "Đang cập nhật..." : "Đang tạo..."
  );

  try {

    const res = await apiSuperAdminRequest(endpoint, {
      method: isUpdate ? "PUT" : "POST",
      body: data,
    });

    // ❌ VALIDATION ERROR
    if (!res.ok) {

      const result = await res.json().catch(() => null);

      toast.error(
        result?.message || "Dữ liệu không hợp lệ",
        { id: toastId }
      );

      // 🔥 QUAN TRỌNG
      // RETURN RES CHO FORM CON XỬ LÝ FIELD ERROR
      return {
        ok: false,
        json: async () => result,
      };
    }

    // ✅ SUCCESS
    toast.success(
      isUpdate
        ? "Cập nhật thành công!"
        : "Tạo combo thành công!",
      { id: toastId }
    );

    setIsModalOpen(false);

    setEditingItem(null);

    fetchCombos();

    return {
      ok: true,
    };

  } catch (error) {

    toast.error("Lỗi hệ thống", { id: toastId });

    return {
      ok: false,
      json: async () => ({
        message: "Không thể kết nối máy chủ",
      }),
    };

  } finally {
    setIsSubmitting(false);
  }
};

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading("Đang xóa...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/combos/${itemToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn", { id: toastId });
        setIsDeleteModalOpen(false);
        fetchCombos();
      }
    } catch {
      toast.error("Không thể xóa", { id: toastId });
    }
  };

  const filteredItems = useMemo(() => 
    combos.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
  [combos, searchTerm]);

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 font-sans antialiased select-none p-4 md:p-0">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px',
            padding: '12px 16px'
          },
        }} 
      />

      {/* THANH THAO TÁC TRÊN (TOPBAR FILTER) */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TIÊU ĐỀ TRANG */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-zinc-900 text-red-500 border border-zinc-800 rounded-xl">
              <UtensilsCrossed size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Menu combo bắp nước
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Database Engine // Food & Combo Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* INPUT TÌM KIẾM */}
            <div className="relative flex-1 sm:w-72 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={14} />
              <input 
                value={searchTerm || ''} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Tìm món nhanh..." 
                className="w-full bg-zinc-950 border border-zinc-900 pl-10 pr-4 py-2 rounded-lg text-xs font-semibold focus:border-red-600/40 outline-none transition-all placeholder:text-zinc-700 text-white" 
              />
            </div>
            
            {/* NÚT TẠO MỚI (Đã đồng bộ sang đỏ chữ trắng) */}
            <button 
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
              className="bg-red-600 text-white h-[34px] px-4 rounded-lg font-bold uppercase text-xs flex items-center gap-2 transition-all hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/10 shrink-0 tracking-wide"
            >
              <Plus size={14} /> Tạo mới
            </button>
          </div>
        </div>

        {/* KHU VỰC GRID HIỂN THỊ CARD */}
        <div className="pt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
              <RefreshCw className="animate-spin text-red-600" size={24} />
              <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest animate-pulse">Đang đồng bộ thực đơn...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-all duration-300 shadow-lg flex flex-col justify-between"
                >
                  {/* Khối hình ảnh tỉ lệ vuông */}
                  <div className="relative aspect-square overflow-hidden bg-zinc-950 border-b border-zinc-900/40">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono font-bold text-[10px]">NO_IMAGE</div>
                    )}
                    
                    {/* Badge Icon trang trí nhỏ */}
                    <div className="absolute top-3 left-3 w-6 h-6 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-amber-500 transition-colors">
                      <Sparkles size={11} />
                    </div>

                    {/* Nút xóa nhanh nổi lên khi hover */}
                    <button 
                      onClick={() => { setItemToDelete(item.id!); setIsDeleteModalOpen(true); }}
                      className="absolute top-3 right-3 w-7 h-7 bg-black/60 backdrop-blur-md text-zinc-400 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all z-10 border border-zinc-800"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Phần thông tin text bên dưới card */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold uppercase text-zinc-200 line-clamp-1 group-hover:text-white transition-colors tracking-tight">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-600 font-bold">#{item.id}</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] font-medium line-clamp-2 leading-relaxed">
                        {item.description || "Chưa thiết lập dữ liệu mô tả cụ thể cho gói combo này"}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-white font-black text-sm tracking-tight">
                        {(item.price || 0).toLocaleString()}
                        <span className="text-[10px] text-red-500 ml-0.5 font-bold uppercase">đ</span>
                      </p>
                      
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                        className="w-full py-2 bg-zinc-950 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-900 hover:bg-zinc-900 hover:text-zinc-200 transition-all active:scale-[0.98]"
                      >
                        Chỉnh sửa 
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 border border-zinc-900 rounded-xl bg-[#060608]/40">
                  <AlertCircle size={32} className="text-zinc-700 mb-3" />
                  <p className="font-bold uppercase tracking-wider text-zinc-600 text-xs">Danh sách thực đơn đang trống</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL THÊM / SỬA FORM */}
      {isModalOpen && (
        <ComboForm 
          initialData={editingItem} 
          isSubmitting={isSubmitting} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleFormSubmit} 
        />
      )}

      {/* MODAL XÁC NHẬN XÓA (Đã chuẩn hóa) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060608] border border-zinc-900 p-6 rounded-xl max-w-sm w-full text-center shadow-xl">
            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-500/10">
              <Trash2 size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-1">Xóa vĩnh viễn dữ liệu?</h3>
            <p className="text-zinc-500 text-xs font-medium mb-6">Hành động này sẽ xóa gói combo khỏi cơ sở dữ liệu và không thể hoàn tác.</p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-2 bg-zinc-900 text-zinc-400 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all hover:bg-zinc-800"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-[11px] tracking-wider shadow-md shadow-red-600/10 active:scale-95 transition-all hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}