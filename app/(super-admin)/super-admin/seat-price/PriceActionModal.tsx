"use client";

import React, { useEffect, useState } from "react";
import { X, Save, Armchair, Calendar, Banknote, ShieldAlert, SlidersHorizontal } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const DAYS = [
  { value: 2, label: "Thứ Hai" },
  { value: 3, label: "Thứ Ba" },
  { value: 4, label: "Thứ Tư" },
  { value: 5, label: "Thứ Năm" },
  { value: 6, label: "Thứ Sáu" },
  { value: 7, label: "Thứ Bảy" },
  { value: 8, label: "Chủ Nhật" },
];

const SEAT_TYPES = ["NORMAL", "VIP", "COUPLE"];

export function PriceActionModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [formData, setFormData] = useState({
    seatType: "NORMAL",
    dayOfWeek: 2,
    price: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    if (initialData) {
      setFormData({
        seatType: initialData.seatType || "NORMAL",
        dayOfWeek: Number(initialData.dayOfWeek) || 2,
        price: Number(initialData.price) || 0,
      });
    } else {
      setFormData({ seatType: "NORMAL", dayOfWeek: 2, price: 0 });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.price <= 0) {
      setError("Giá vé phải lớn hơn 0 VNĐ");
      return;
    }

    if (formData.price > 2000000) {
      setError("Giá vé không được vượt quá 2.000.000 VNĐ");
      return;
    }

    setError(null);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-zinc-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        
        {/* TIÊU ĐỀ MODAL */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-zinc-900">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-wider">
              <SlidersHorizontal size={10} />
              <span>Hệ thống cấu hình</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              {initialData?.id ? "Cập nhật" : "Thiết lập"} cấu hình giá
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* NỘI DUNG FORM */}
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            
            {/* CHỌN LOẠI GHẾ */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Armchair size={12} className="text-red-500" /> Loại ghế
              </label>
              <div className="relative">
                <select
                  value={formData.seatType}
                  onChange={(e) => setFormData({ ...formData, seatType: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-red-600/50 appearance-none pr-8 cursor-pointer"
                >
                  {SEAT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>
            </div>

            {/* CHỌN NGÀY TRONG TUẦN */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} className="text-red-500" /> Ngày áp dụng
              </label>
              <div className="relative">
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-red-600/50 appearance-none pr-8 cursor-pointer"
                >
                  {DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>
            </div>
          </div>

          {/* Ô NHẬP GIÁ TIỀN */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote size={12} className="text-red-500" /> Giá vé áp dụng
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, price: val });
                  if (val > 0) setError(null);
                }}
                className={`w-full bg-zinc-950 border-2 rounded-lg px-4 py-3.5 text-2xl font-bold font-mono outline-none transition-all ${
                  error ? "border-red-600 animate-shake" : "border-zinc-800 focus:border-red-600"
                } ${formData.price > 0 ? "text-white" : "text-zinc-600"}`}
                placeholder="0"
                onFocus={(e) => e.target.select()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">VND</div>
            </div>
            
            {/* THÔNG BÁO LỖI */}
            {error && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1.5 animate-in slide-in-from-top-1">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}
          </div>

          {/* NÚT SUBMIT LƯU DỮ LIỆU */}
          <button
            type="submit"
            disabled={formData.price <= 0}
            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              formData.price > 0 
                ? "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]" 
                : "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800"
            }`}
          >
            <Save size={14} strokeWidth={2.5} />
            {initialData?.id ? "Cập nhật cấu hình" : "Áp dụng giá vé"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }
      `}</style>
    </div>
  );
}