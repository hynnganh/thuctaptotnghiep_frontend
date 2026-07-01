"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, Save, X, 
  Layers, Search, ShieldAlert, 
  RefreshCw
} from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest('/api/v1/genres');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (e) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErrorMessage("");

  const method = isEditing ? "PUT" : "POST";

  const url = isEditing
    ? `/api/v1/genres/${currentId}`
    : "/api/v1/genres";

  try {
    const res = await apiSuperAdminRequest(url, {
      method,
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(
        isEditing
          ? "Cập nhật thành công!"
          : "Thêm thể loại mới thành công!"
      );

      resetForm();
      fetchCategories();

    } else {

      // ✅ HIỆN LỖI RA UI
      setErrorMessage(
        data?.message ||
        data?.error ||
        "Có lỗi xảy ra"
      );

      toast.error(data?.message || "Có lỗi xảy ra");
    }

  } catch (error: any) {

    setErrorMessage(
      error?.message || "Thao tác thất bại"
    );

    toast.error("Thao tác thất bại");
  }
};

  const confirmDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="text-red-500 shrink-0" size={18} />
          <span className="text-xs font-semibold text-zinc-200">Xác nhận xóa vĩnh viễn thể loại này?</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="px-4 py-1.5 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-all shadow-md shadow-red-600/10"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#060608',
        border: '1px solid #18181b',
        padding: '14px',
        borderRadius: '0.75rem',
      },
    });
  };

  const executeDelete = async (id: number) => {
    const loadingToast = toast.loading("Đang thực hiện xóa...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/genres/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Đã xóa vĩnh viễn thể loại.", { id: loadingToast });
        fetchCategories();
      } else {
        toast.error("Không thể xóa mục này.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Lỗi kết nối hệ thống.", { id: loadingToast });
    }
  };

  const editCategory = (cat: any) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setFormData({ name: cat.name, description: cat.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: "", description: "" });
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-4 md:p-0 font-sans antialiased select-none">
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
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TIÊU ĐỀ TRANG */}
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
          <div className="p-2.5 bg-zinc-900 text-red-500 border border-zinc-800 rounded-xl">
            <Layers size={20} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Cấu hình dữ liệu thể loại
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Database Engine // Genres Registry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRAI: FORM NHẬP LIỆU */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-[#060608] border border-zinc-900 rounded-xl p-5 md:p-6 sticky top-24 shadow-xl">
              <h3 className="text-[11px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-zinc-400">
                {isEditing ? <Pencil size={14} className="text-amber-500" /> : <Plus size={14} className="text-red-500" />}
                {isEditing ? "Cập nhật dữ liệu" : "Thiết lập cấu hình mới"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Tên thể loại</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ví dụ: Hành động, Kinh dị..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-red-600/40 transition-all placeholder:text-zinc-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Mô tả chi tiết</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Nhập mô tả ngắn gọn về phân loại phim này..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-red-600/40 transition-all resize-none placeholder:text-zinc-700 text-white leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                  >
                    <Save size={14} /> {isEditing ? "Cập nhật dữ liệu" : "Áp dụng cấu hình"}
                  </button>
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="p-2.5 bg-zinc-900 text-zinc-400 rounded-lg hover:text-white hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI: SEARCH & BẢNG HIỂN THỊ */}
          <div className="lg:col-span-8 space-y-4">
            {/* INPUT SEARCH */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-all" size={14} />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh tên thể loại phim..." 
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:border-red-600/40 transition-all text-zinc-200 placeholder:text-zinc-700"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* DANH SÁCH BẢNG DỮ LIỆU */}
            <div className="bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/30 border-b border-zinc-900">
                      <th className="p-4 text-[11px] font-bold uppercase text-zinc-500 tracking-wider w-24">Mã số</th>
                      <th className="p-4 text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Tên thể loại</th>
                      <th className="p-4 text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Dữ liệu mô tả</th>
                      <th className="p-4 text-[11px] font-bold uppercase text-zinc-500 tracking-wider text-right w-28">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <RefreshCw className="animate-spin text-red-600 mx-auto opacity-70" size={24} />
                          <p className="text-[10px] font-bold uppercase text-zinc-600 mt-3 tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</p>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-xs font-medium text-zinc-600">
                          Hệ thống không tìm thấy kết quả phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((cat) => (
                        <tr key={cat.id} className="hover:bg-zinc-900/20 group transition-colors">
                          <td className="p-4">
                            <span className="text-xs font-mono font-bold text-zinc-600 group-hover:text-red-500 transition-colors">
                              #{cat.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                              {cat.name}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-zinc-500 max-w-sm break-words line-clamp-2 font-medium group-hover:text-zinc-400 transition-colors leading-relaxed">
                              {cat.description || "Chưa có dữ liệu mô tả cho mục này"}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => editCategory(cat)}
                                className="p-2 bg-zinc-950 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg transition-all border border-zinc-900 active:scale-90"
                              >
                                <Pencil size={13} />
                              </button>
                              <button 
                                onClick={() => confirmDelete(cat.id)}
                                className="p-2 bg-zinc-950 hover:bg-red-600/10 hover:text-red-500 rounded-lg transition-all border border-zinc-900 active:scale-90"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}