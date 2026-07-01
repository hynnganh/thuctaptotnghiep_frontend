"use client";

import React, { useState } from "react";
import { X, Check, Armchair, Monitor } from "lucide-react";

interface PropsForm {
  dangSuaId: number | null;
  duLieuForm: { name: string; totalSeats: number };
  setDuLieuForm: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDong: () => void;

  // 🔥 NEW: lỗi từ backend
  errors?: {
    name?: string;
    totalSeats?: string;
    message?: string;
  };

  loading?: boolean;
}

export default function FormPhongChieu({
  dangSuaId,
  duLieuForm,
  setDuLieuForm,
  onSubmit,
  onDong,
  errors,
  loading = false,
}: PropsForm) {

  const [localError, setLocalError] = useState<any>({});

  // merge error FE + BE
  const getError = (field: string) => {
    return errors?.[field as keyof typeof errors] || localError[field];
  };

  const handleChange = (field: string, value: any) => {
    setDuLieuForm({ ...duLieuForm, [field]: value });

    // clear error khi user sửa
    setLocalError((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onDong}
      />

      <div className="relative bg-[#0c0c0e] border border-white/10 rounded-[2rem] w-full max-w-[340px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        <div className="p-8">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">

            <div>
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">
                {dangSuaId ? "Cập nhật" : "Thêm mới"}
              </h2>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">
                Hệ thống phòng
              </p>
            </div>

            <button
              onClick={onDong}
              className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-5">

            {/* NAME */}
            <div className="space-y-1.5">

              <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-[0.2em]">
                Định danh phòng
              </label>

              <div className="relative group">

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <Monitor size={14} />
                </div>

                <input
                  className={`w-full bg-zinc-900/50 border rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-bold outline-none text-white transition-all
                    ${
                      getError("name")
                        ? "border-red-600/50"
                        : "border-white/5 focus:border-red-600/30"
                    }
                  `}
                  value={duLieuForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Phòng chiếu 01..."
                />

              </div>

              {/* ERROR NAME */}
              {getError("name") && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {getError("name")}
                </p>
              )}
            </div>

            {/* TOTAL SEATS */}
            <div className="space-y-1.5">

              <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-[0.2em]">
                Sức chứa (Ghế)
              </label>

              <div className="relative group">

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <Armchair size={14} />
                </div>

                <input
                  type="number"
                  className={`w-full bg-zinc-900/50 border rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-bold outline-none text-white transition-all
                    ${
                      getError("totalSeats")
                        ? "border-red-600/50"
                        : "border-white/5 focus:border-red-600/30"
                    }
                  `}
                  value={duLieuForm.totalSeats}
                  onChange={(e) =>
                    handleChange(
                      "totalSeats",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              {/* ERROR TOTAL SEATS */}
              {getError("totalSeats") && (
                <p className="text-[10px] text-red-500 font-bold ml-1">
                  {getError("totalSeats")}
                </p>
              )}
            </div>

            {/* GENERAL ERROR */}
            {errors?.message && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3">
                <p className="text-[10px] text-red-400 font-bold">
                  {errors.message}
                </p>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 mt-2 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Lưu dữ liệu"}
              <Check size={14} strokeWidth={3} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}