"use client";

import React, { useEffect, useState, useRef } from 'react';
import { X, Save, Sparkles, Upload, ChevronDown, Check, Film, MapPin, RefreshCw } from 'lucide-react';
import { apiSuperAdminRequest, BASE_URL } from '@/app/lib/api';
import toast from 'react-hot-toast';

// --- THÀNH PHẦN CHỌN TÙY CHỈNH (Custom Select) ---
export const CustomSelect = ({ label, options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className="space-y-2 relative text-left w-full" ref={dropdownRef}>
      <label className="text-xs font-bold text-zinc-500 uppercase ml-1 tracking-wider italic">
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-zinc-950/50 border backdrop-blur-sm ${isOpen ? 'border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.05)]' : 'border-white/5'} p-4 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-500 hover:border-white/10`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon size={15} className={value !== 0 ? "text-red-500 shrink-0" : "text-zinc-600 shrink-0"} />}
          <span className={`text-xs font-semibold truncate ${value !== 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>
            {selectedOption ? (selectedOption.title || selectedOption.name) : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`text-zinc-600 shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[120] top-[105%] left-0 right-0 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-48 overflow-y-auto"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .absolute::-webkit-scrollbar { display: none; }
          `}} />
          {options.map((opt: any) => (
            <div 
              key={opt.id}
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              className="px-4 py-3 flex justify-between items-center hover:bg-red-600/10 cursor-pointer transition-all duration-300 group"
            >
              <span className={`text-xs font-semibold truncate ${value === opt.id ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-100'}`}>
                {opt.title || opt.name}
              </span>
              {value === opt.id && <Check size={14} className="text-red-500 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function PromotionModal({ isOpen, mode, data, onClose, onRefresh }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", content: "", movieId: 0, cinemaItemId: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  useEffect(() => {
    if (isOpen) {
      setFieldErrors({});
      loadOptions();
      if (data) {
        setForm({ 
          title: data.title || "", 
          content: data.content || "", 
          movieId: data.movie?.id || 0, 
          cinemaItemId: data.cinemaItem?.id || 0 
        });
        const thumb = data.thumbnail;
        setPreviewUrl(thumb?.startsWith("/") ? `${BASE_URL}${thumb}` : thumb || "");
      } else {
        setForm({ title: "", content: "", movieId: 0, cinemaItemId: 0 });
        setPreviewUrl("");
        setSelectedFile(null);
      }
    }
  }, [isOpen, data]);

  const loadOptions = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        apiSuperAdminRequest('/api/v1/movies'), 
        apiSuperAdminRequest('/api/v1/cinema-items')
      ]);
      const mJson = await mRes.json();
      const cJson = await cRes.json();
      setMovies([{ id: 0, title: "Tất cả phim" }, ...(mJson.data?.content || mJson.data || [])]);
      setCinemas([{ id: 0, name: "Toàn hệ thống" }, ...(cJson.data || [])]);
    } catch (e) { 
      console.error("Lỗi tải tùy chọn", e); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setFieldErrors({});

    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên chương trình");
      return;
    }

    if (!form.content.trim()) {
      toast.error("Vui lòng nhập nội dung chương trình");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("content", form.content);

      if (form.movieId && form.movieId !== 0) {
        formData.append("movieId", form.movieId.toString());
      }

      if (form.cinemaItemId && form.cinemaItemId !== 0) {
        formData.append("cinemaItemId", form.cinemaItemId.toString());
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const isEdit = mode === "edit";

      const url = isEdit
        ? `/api/v1/promotions/${data.id}`
        : "/api/v1/promotions";

      const res = await apiSuperAdminRequest(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        const errors = result?.data;

        if (errors && typeof errors === "object") {
          setFieldErrors(errors);

          const firstError = Object.values(errors)[0];
          toast.error(firstError as string);

          return;
        }

        toast.error(result?.message || "Có lỗi xảy ra");
        return;
      }

      toast.success(isEdit ? "Cập nhật thành công" : "Tạo sự kiện thành công");

      onRefresh();
      onClose();

    } catch (error: any) {
      toast.error(error?.message || "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 font-sans antialiased">
      <div className="w-full max-w-xl bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Tiêu đề Modal */}
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-white">
                {mode === 'edit' ? 'Cập Nhật Sự Kiện' : 'Tạo Sự Kiện Mới'}
              </h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mt-1 italic">
                Database Engine // Promotions Factory
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* Nội dung Modal */}
        <div 
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .overflow-y-auto::-webkit-scrollbar { display: none; }
          `}} />

          {/* Khu vực tải ảnh */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 italic">Hình Ảnh Đại Diện</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group relative aspect-[21/9] rounded-2xl overflow-hidden border transition-all duration-700 cursor-pointer flex items-center justify-center bg-zinc-900/30
                ${previewUrl ? 'border-white/10' : 'border-white/5 hover:border-red-600/30'}`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102" alt="Xem trước" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <Upload size={22} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center group-hover:scale-105 transition-all duration-500">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-2.5">
                    <Upload size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nhấn để tải lên ảnh</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {/* Các trường thông tin */}
          <div className="space-y-5">
             <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 italic">Tên Chương Trình</label>
               <input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full bg-zinc-950/50 border border-white/5 p-4 rounded-xl outline-none focus:border-red-600/40 transition-all duration-500 font-semibold text-zinc-100 text-sm placeholder:text-zinc-800" 
                placeholder="Nhập tên sự kiện..." 
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 italic">Mô Tả Nội Dung</label>
               <textarea 
                value={form.content} 
                onChange={e => setForm({...form, content: e.target.value})} 
                rows={3} 
                className="w-full bg-zinc-950/50 border border-white/5 p-4 rounded-xl outline-none focus:border-white/10 transition-all duration-500 text-xs font-medium text-zinc-400 placeholder:text-zinc-800 leading-relaxed resize-none" 
                placeholder="Viết nội dung chương trình khuyến mãi chi tiết..." 
               />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
               <CustomSelect label="Phim Áp Dụng" options={movies} value={form.movieId} onChange={(id: any) => setForm({...form, movieId: id})} placeholder="Tất cả phim" icon={Film} />
               <CustomSelect label="Cơ Sở Rạp" options={cinemas} value={form.cinemaItemId} onChange={(id: any) => setForm({...form, cinemaItemId: id})} placeholder="Toàn hệ thống" icon={MapPin} />
             </div>
          </div>
        </div>

        {/* Nút điều hướng chân trang */}
        <div className="p-6 md:p-8 flex gap-4 bg-zinc-950/80 border-t border-white/5 shrink-0 items-center">
          <button 
            onClick={onClose} 
            className="px-6 py-3.5 text-zinc-500 hover:text-white font-bold uppercase text-xs tracking-wider transition-colors"
          >
            Hủy Bỏ
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={isSubmitting} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-extrabold uppercase text-xs tracking-wider flex justify-center items-center gap-2 shadow-2xl shadow-red-600/10 transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin" size={14}/>
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <>
                <Save size={14} className="opacity-60" />
                <span>{mode === 'edit' ? 'Cập Nhật Ngay' : 'Xác Nhận Tạo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}