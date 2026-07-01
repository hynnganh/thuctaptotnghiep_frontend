"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, ChevronRight, Loader2, Building2, MapPin, Save, ShieldCheck, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { apiSuperAdminRequest } from "@/app/lib/api";

interface AddCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

interface ErrorState {
  name?: string;
}

export default function AddCinemaModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddCinemaModalProps) {
  const [cinemaName, setCinemaName] = useState("");
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setCinemaName(initialData.name || "");
    } else {
      setCinemaName("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: ErrorState = {};
    if (!cinemaName.trim()) {
      newErrors.name = "Tên cụm rạp không được để trống";
    } else if (cinemaName.trim().length < 3) {
      newErrors.name = "Tên cụm rạp tối thiểu 3 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại dữ liệu");
      return;
    }

    setIsSubmitting(true);
    const mode = initialData ? "Cập nhật" : "Khởi tạo";
    const loadingToast = toast.loading(`Đang ${mode.toLowerCase()} cụm rạp...`);

    try {
      const url = initialData
        ? `/api/v1/cinemas/${initialData.id}`
        : "/api/v1/cinemas";

      const method = initialData ? "PUT" : "POST";

      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify({
          name: cinemaName.trim(), // Giữ nguyên Payload sạch chỉ gửi trường name lên DB
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result?.message || `${mode} cụm rạp thành công`, {
          id: loadingToast,
        });
        onSuccess();
        onClose();
        return;
      }

      if (result?.data && typeof result.data === "object") {
        setErrors(result.data);
        const firstError = Object.values(result.data)[0];
        toast.error(String(firstError), { id: loadingToast });
        return;
      }

      toast.error(result?.message || result?.error || "Không thể xử lý dữ liệu", {
        id: loadingToast,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi kết nối máy chủ", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-[#080808] border-l border-white/10 h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              {initialData ? <Save size={20} /> : <Zap size={20} className="fill-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                {initialData ? "Edit Cinema" : "New Cinema"}
              </h2>
              <p className="text-[9px] font-bold text-red-600 uppercase tracking-[0.3em]">
                {initialData ? `Đang chỉnh sửa ID: ${initialData.id}` : "Khởi tạo cụm rạp mới"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Trường nhập Tên */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Building2 size={12} className="text-red-600" />
                Tên cụm rạp
              </label>
              <input
                type="text"
                value={cinemaName}
                disabled={isSubmitting}
                onChange={(e) => setCinemaName(e.target.value)}
                placeholder="VD: Phường Sài Gòn,..."
                className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white outline-none transition-all
                ${errors.name ? "border-red-500" : "border-white/10 focus:border-red-600/50"}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Trường Địa Chỉ Hệ Thống Mặc Định (Chỉ hiển thị UI) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <MapPin size={12} className="text-red-600" />
                Khu vực / Thành phố hiển thị
              </label>
              
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl px-5 py-4 flex justify-between items-center opacity-80 backdrop-blur-sm select-none">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">
                    Phạm vi vận hành mặc định
                  </p>
                  <p className="text-white font-black tracking-wide text-sm">
                    Thành phố Hồ Chí Minh (TP.HCM)
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-red-600/10 border border-red-600/20 text-red-500 rounded-lg tracking-wider">
                  Hệ thống
                </span>
              </div>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-red-600 hover:text-white disabled:opacity-40 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {initialData ? "Lưu thay đổi" : "Khởi tạo cụm rạp"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Alert */}
        <div className="p-8 border-t border-white/5 bg-black/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-600/10 rounded-lg">
              <ShieldCheck size={16} className="text-red-600" />
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
              Ràng buộc dữ liệu: Tên cụm rạp trên toàn hệ thống không được trùng nhau và được kiểm duyệt tự động dựa trên vị trí địa lý đã cấu hình.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}