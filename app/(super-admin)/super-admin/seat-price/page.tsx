"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  Armchair,
  Edit3,
  Trash2,
  CalendarDays,
  Settings2,
  ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiSuperAdminRequest } from "../../../lib/api";
import { PriceActionModal } from "./PriceActionModal";

const DAYS: Record<number, string> = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
  8: "Chủ Nhật",
};

export default function PriceManagementPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest("/api/v1/seat-price-configs");
      const json = await res.json();
      if (res.ok) setPrices(json?.data ?? []);
      else toast.error(json?.message || "Lỗi tải dữ liệu");
    } catch (err) {
      toast.error("Không thể kết nối với máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, []);

  const groupedPrices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    prices.forEach((item) => {
      if (!groups[item.seatType]) groups[item.seatType] = [];
      groups[item.seatType].push(item);
    });
    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => Number(a.dayOfWeek) - Number(b.dayOfWeek));
    });
    return groups;
  }, [prices]);

  const handleSave = async (formData: any) => {
    const payload = {
      seatType: formData.seatType,
      dayOfWeek: Number(formData.dayOfWeek),
      price: Number(formData.price),
    };
    const method = selectedItem?.id ? "PUT" : "POST";
    const url = selectedItem?.id
      ? `/api/v1/seat-price-configs/${selectedItem.id}`
      : "/api/v1/seat-price-configs";

    try {
      const res = await apiSuperAdminRequest(url, { method, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok) {
        toast.success(selectedItem?.id ? "Cập nhật thành công" : "Thiết lập thành công");
        fetchPrices();
        setIsActionOpen(false);
        setSelectedItem(null);
      } else {
        toast.error(json?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    }
  };

  // HÀM XỬ LÝ XÓA CẤU HÌNH GIÁ VÉ
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu hình giá này không?")) return;
    
    try {
      const res = await apiSuperAdminRequest(`/api/v1/seat-price-configs/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Xóa cấu hình thành công");
        fetchPrices();
      } else {
        toast.error(json?.message || "Xóa thất bại");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi xóa");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 p-6 md:p-8 font-sans antialiased selection:bg-red-600/30">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#0a0a0a', color: '#fff', border: '1px solid #1f1f1f', borderRadius: '8px' } 
        }} 
      />

      {/* THANH ĐẦU TRANG (HEADER) */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Settings2 size={26} className="text-red-600" />
            Quản lý giá vé hệ thống
          </h1>
          <p className="text-zinc-500 text-xs max-w-xl font-medium">
            Thiết lập linh hoạt đơn giá cho từng loại ghế rạp chiếu theo các ngày trong tuần.
          </p>
        </div>

        <button
          onClick={() => { setSelectedItem(null); setIsActionOpen(true); }}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:bg-red-700 active:scale-95 shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
        >
          <Plus size={14} strokeWidth={3} />
          Thiết lập mới
        </button>
      </header>

      {/* TRẠNG THÁI TẢI DỮ LIỆU */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <Loader2 className="animate-spin text-red-600" size={36} />
          <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase animate-pulse">
            Đang đồng bộ dữ liệu...
          </span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-16">
          {Object.entries(groupedPrices).map(([seatType, items]: [string, any[]]) => {
            const isFullWeek = items.length >= 7;

            return (
              <section key={seatType} className="space-y-6">
                
                {/* TIÊU ĐỀ LOẠI GHẾ */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-900 px-5 py-2.5 rounded-xl shadow-md">
                    <Armchair className="text-red-600" size={18} />
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      Ghế: <span className="text-red-500">{seatType}</span>
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                      {items.length}/7 Ngày
                    </span>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-900 to-transparent" />
                </div>

                {/* LƯỚI CARD GIÁ VÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map((item) => {
                    const isWeekend = item.dayOfWeek === 7 || item.dayOfWeek === 8;
                    return (
                      <div
                        key={item.id}
                        className="group relative bg-[#0a0a0a] border border-zinc-900 p-5 rounded-xl transition-all duration-300 hover:border-red-600/40 hover:bg-zinc-950 shadow-lg flex flex-col justify-between min-h-[135px]"
                      >
                        {/* THỜI GIAN & CẶP NÚT SỬA/XÓA */}
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black uppercase tracking-wider ${isWeekend ? 'text-red-500' : 'text-zinc-400'}`}>
                            {DAYS[item.dayOfWeek] ?? "---"}
                          </span>
                          
                          {/* NHÓM NÚT THAO TÁC (ẨN KHI CHƯA HOVER, HIỆN KHI HOVER CARD) */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all duration-200">
                            <button
                              onClick={() => { setSelectedItem(item); setIsActionOpen(true); }}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 hover:border-red-900/50 transition-colors"
                              title="Xóa cấu hình"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* ĐƠN GIÁ VÉ */}
                        <div className="pt-4 border-t border-zinc-900/60 flex flex-col">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Giá áp dụng</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black tracking-tight text-white font-mono">
                              {item.price.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500">VND</span>
                          </div>
                        </div>

                        {/* Hình trang trí chìm */}
                        <CalendarDays className="absolute bottom-3 right-3 text-white/[0.01] group-hover:text-red-600/[0.02] transition-colors pointer-events-none" size={48} />
                      </div>
                    );
                  })}

                  {/* ẨN NÚT THÊM NẾU ĐÃ ĐỦ 7 NGÀY */}
                  {!isFullWeek && (
                    <button
                      onClick={() => { setSelectedItem({ seatType }); setIsActionOpen(true); }}
                      className="group/add border border-dashed border-zinc-800 hover:border-red-600/40 rounded-xl min-h-[135px] flex flex-col justify-center items-center transition-all duration-200 bg-zinc-950/20 hover:bg-[#0a0a0a]"
                    >
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover/add:text-white group-hover/add:bg-red-600 group-hover/add:border-transparent transition-all duration-200">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-bold mt-3 text-zinc-500 group-hover/add:text-zinc-300 transition-colors uppercase tracking-wider">
                        Thêm ngày
                      </span>
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* MODAL CẤU HÌNH */}
      <PriceActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onSave={handleSave}
        initialData={selectedItem}
      />
    </div>
  );
}