"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Save,
  UploadCloud,
  Loader2,
  Package,
  CircleDollarSign,
  Info,
} from "lucide-react";

interface ComboFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<any>;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function ComboForm({
  initialData,
  onSubmit,
  onClose,
  isSubmitting,
}: ComboFormProps) {

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  // ✅ FIELD ERRORS
  const [fieldErrors, setFieldErrors] = useState<any>({});

  // ================= IMAGE =================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    // ✅ CHECK SIZE
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    // reset lỗi cũ
    setFieldErrors({});

    const data = new FormData();

    data.append(
      "combo",
      new Blob(
        [
          JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
          }),
        ],
        { type: "application/json" }
      )
    );

    if (imageFile) {
      data.append("file", imageFile);
    }

    try {

      const res = await onSubmit(data);

      // ❌ BACKEND ERROR
      if (res && !res.ok) {

        const result = await res.json();

        console.log("ERROR RESPONSE:", result);

        // map lỗi validate BE
        const errors = result?.data;

        if (errors && typeof errors === "object") {

          setFieldErrors(errors);

          return;
        }
        return;
      }

    } catch (error) {

      console.error(error);

      toast.error("Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* FORM */}
      <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] w-full max-w-xl shadow-[0_0_100px_-20px_rgba(220,38,38,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              {initialData ? "Chỉnh sửa" : "Thêm"}{" "}
              <span className="text-red-600">Combo</span>
            </h2>

            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">
              Cập nhật thông tin thực đơn
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* IMAGE */}
          <div className="flex items-center gap-6 p-4 bg-zinc-900/30 rounded-[2rem] border border-white/5">

            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden shrink-0 group hover:border-red-600/50 transition-all">

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
              />

              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
              ) : (
                <UploadCloud
                  className="text-zinc-700 group-hover:text-red-500 transition-colors"
                  size={28}
                />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">
                Ảnh minh họa
              </h4>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Hỗ trợ PNG, JPG. <br />
                Tối đa 2MB.
              </p>
            </div>
          </div>

          {/* NAME + PRICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NAME */}
            <div className="space-y-2">

              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <Package size={12} />
                Tên Combo
              </label>

              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className={`w-full bg-zinc-900 border rounded-xl p-4 text-sm font-bold outline-none transition-all text-white
                  ${
                    fieldErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/5 focus:border-red-600"
                  }`}
                placeholder="Ví dụ: Combo Bắp Nước"
              />

              {fieldErrors.name && (
                <p className="text-red-500 text-[11px] font-medium pl-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* PRICE */}
            <div className="space-y-2">

              <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <CircleDollarSign size={12} />
                Giá bán (VND)
              </label>

              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className={`w-full bg-zinc-900 border rounded-xl p-4 text-sm font-black outline-none transition-all text-white
                  ${
                    fieldErrors.price
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/5 focus:border-red-600"
                  }`}
              />

              {fieldErrors.price && (
                <p className="text-red-500 text-[11px] font-medium pl-1">
                  {fieldErrors.price}
                </p>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">

            <label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
              <Info size={12} />
              Mô tả sản phẩm
            </label>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className={`w-full bg-zinc-900 border rounded-xl p-4 text-sm font-medium outline-none transition-all resize-none text-white
                ${
                  fieldErrors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/5 focus:border-red-600"
                }`}
              placeholder="Chi tiết gồm những gì..."
            />

            {fieldErrors.description && (
              <p className="text-red-500 text-[11px] font-medium pl-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-600/20"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {isSubmitting
              ? "Đang xử lý..."
              : "Lưu thực đơn"}
          </button>
        </form>
      </div>
    </div>
  );
}