"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Zap, Search, AlertTriangle, X } from "lucide-react";
import { apiSuperAdminRequest, BASE_URL } from "@/app/lib/api"; 
import toast, { Toaster } from "react-hot-toast";
import FormBanner from "./FormBanner";

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [dangSua, setDangSua] = useState(false);
  const [idHienTai, setIdHienTai] = useState<number | null>(null);

  // State cho Modal xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idCanXoa, setIdCanXoa] = useState<number | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const emptyForm = {
    title: "",
    linkUrl: "",
    imageUrl: "",
    status: "ACTIVE",
  };

  const [duLieuForm, setDuLieuForm] = useState(emptyForm);

  const xuLyAnhBanner = (path: string | null | undefined) => {
    if (!path) return "https://placehold.co/1920x800?text=No+Banner+Image";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BASE_URL}/uploads/banners/${cleanPath}`; 
  };

  // ================= FETCH =================
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest("/api/v1/banners");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBanners(json.data || []);
    } catch {
      toast.error("Lỗi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ================= SAVE =================
const handleLuu = async (formData: FormData) => {
  const method = dangSua ? "PUT" : "POST";
  const url = dangSua ? `/api/v1/banners/${idHienTai}` : "/api/v1/banners";

  const t = toast.loading("Đang xử lý...");

  try {
    const res = await apiSuperAdminRequest(url, {
      method,
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        data?.message ||
        data?.error ||
        "Dữ liệu không hợp lệ";

      toast.error(msg, { id: t });
      return; // ❗ QUAN TRỌNG
    }

    toast.success("Thành công!", { id: t });

    setShowForm(false);
    setDangSua(false);
    setIdHienTai(null);
    setDuLieuForm(emptyForm);

    fetchBanners();
  } catch (err: any) {
    toast.error("Lỗi kết nối server", { id: t });
  }
};

  // ================= DELETE PROCESS =================
  const yeuCauXoa = (id: number) => {
    setIdCanXoa(id);
    setIsDeleteModalOpen(true);
  };

  const handleXacNhanXoa = async () => {
    if (!idCanXoa) return;
    setDangXoa(true);
    const t = toast.loading("Đang tiến hành xóa...");

    try {
      const res = await apiSuperAdminRequest(`/api/v1/banners/${idCanXoa}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Đã gỡ bỏ banner thành công", { id: t });
      setBanners((prev) => prev.filter((b) => b.id !== idCanXoa));
      setIsDeleteModalOpen(false);
      setIdCanXoa(null);
    } catch {
      toast.error("Xóa banner thất bại", { id: t });
    } finally {
      setDangXoa(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (b: any) => {
    setDangSua(true);
    setIdHienTai(b.id);

    setDuLieuForm({
      title: b.title || "",
      linkUrl: b.linkUrl || "",
      imageUrl: b.imageUrl || "",
      status: b.status || "ACTIVE",
    });

    setShowForm(true);
  };

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }} 
      />

      {showForm && (
        <FormBanner
          dangSua={dangSua}
          idHienTai={idHienTai}
          duLieu={duLieuForm}
          setDuLieu={setDuLieuForm}
          onLuu={handleLuu}
          onDong={() => setShowForm(false)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 gap-2">
          <div className="space-y-0.5">
            <h1 className="text-lg font-black uppercase tracking-tight text-white leading-none">
                Quản Lý <span className="text-red-600">Banners</span>
              </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Media Component // SuperAdmin Interface
            </p>
          </div>

          <button
            onClick={() => {
              setDangSua(false);
              setDuLieuForm(emptyForm);
              setShowForm(true);
            }}
            className="bg-white text-black px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] shadow-sm flex items-center gap-2"
          >
            <Plus size={14} />
            Thêm mới
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
          <input
            placeholder="Tìm kiếm tiêu đề banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 pl-10 pr-4 py-2 rounded-lg outline-none text-xs font-semibold text-white focus:border-red-600/40 transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* BANNER GRID LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col justify-center items-center py-24 gap-3">
              <Zap className="animate-spin text-red-600 opacity-80" size={28} />
              <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest animate-pulse">Đang nạp dữ liệu media...</p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-[#060608] border border-zinc-900 rounded-xl text-xs font-medium text-zinc-600">
              Hệ thống chưa ghi nhận dữ liệu banner nào phù hợp.
            </div>
          ) : (
            filteredBanners.map((b) => (
              <div
                key={b.id}
                className="bg-[#060608] border border-zinc-900 p-4 rounded-xl hover:border-red-600/20 transition-all flex flex-col group overflow-hidden shadow-md"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-zinc-950 border border-zinc-900/40">
                  <img
                    src={xuLyAnhBanner(b.imageUrl)}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                    alt={b.title}
                  />
                </div>

                <h3 className="font-bold uppercase text-zinc-200 text-sm mb-1 truncate group-hover:text-white transition-colors tracking-tight">
                  {b.title}
                </h3>
                <p className="text-[11px] text-zinc-600 font-medium mb-5 truncate">{b.linkUrl || "Không có đường dẫn liên kết"}</p>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleEdit(b)}
                    className="flex-1 bg-zinc-950 border border-zinc-900 py-2.5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:border-zinc-700 hover:text-white transition active:scale-[0.97]"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => yeuCauXoa(b.id)}
                    className="bg-zinc-950 border border-zinc-900 px-3.5 rounded-lg text-zinc-500 hover:border-red-600/30 hover:bg-red-600/5 hover:text-red-500 transition active:scale-[0.97]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= CUSTOM CONFIRM DELETE MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => !dangXoa && setIsDeleteModalOpen(false)}></div>
          
          <div className="relative bg-[#0f0f0f] border border-zinc-900 w-full max-w-[380px] rounded-xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
            <div className="mx-auto w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle size={20} />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold uppercase text-white tracking-tight"> Xác nhận gỡ bỏ</h2>
              <p className="text-xs text-zinc-500 font-medium px-2 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn banner khỏi hệ thống hiển thị. Bạn có chắc chắn muốn tiếp tục?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                disabled={dangXoa}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-zinc-950 border border-zinc-900 py-3 rounded-lg text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 transition disabled:opacity-40"
              >
                Hủy bỏ
              </button>
              <button
                disabled={dangXoa}
                onClick={handleXacNhanXoa}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {dangXoa ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}