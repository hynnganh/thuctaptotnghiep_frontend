"use client";

import { useState, useEffect } from "react";

import {
  X,
  Loader2,
  Save,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";

import { apiSuperAdminRequest } from "@/app/lib/api";

import toast from "react-hot-toast";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinemaId: number;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddCinemaItemModal({
  isOpen,
  onClose,
  cinemaId,
  onSuccess,
  initialData,
}: AddModalProps) {

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errors, setErrors] =
    useState<any>({});

  const [formData, setFormData] =
    useState({
      name: "",
      address: "",
      city: "TP.HCM",
      hoursPerRoom: 1,
      cinemaId: cinemaId,
    });

  useEffect(() => {

    if (initialData) {

      setFormData({
        name: initialData.name || "",
        address:
          initialData.address || "",
        city: "TP.HCM",
        hoursPerRoom:
          initialData.hoursPerRoom || 1,
        cinemaId: cinemaId,
      });

    } else {

      setFormData({
        name: "",
        address: "",
        city: "TP.HCM",
        hoursPerRoom: 1,
        cinemaId: cinemaId,
      });
    }

    setErrors({});

  }, [initialData, isOpen, cinemaId]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  const validateForm = () => {

    const newErrors: any = {};

    if (!formData.name.trim()) {

      newErrors.name =
        "Tên chi nhánh không được để trống";

    } else if (
      formData.name.trim().length < 3
    ) {

      newErrors.name =
        "Tên chi nhánh tối thiểu 3 ký tự";
    }

    if (!formData.address.trim()) {

      newErrors.address =
        "Địa chỉ không được để trống";
    }

    if (
      !formData.hoursPerRoom ||
      formData.hoursPerRoom <= 0
    ) {

      newErrors.hoursPerRoom =
        "Giờ hoạt động phải lớn hơn 0";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validateForm()) {

      toast.error(
        "Vui lòng kiểm tra lại dữ liệu"
      );

      return;
    }

    try {

      setIsSubmitting(true);

      const loadingToast =
        toast.loading(
          isEdit
            ? "Đang cập nhật chi nhánh..."
            : "Đang tạo chi nhánh..."
        );

      const url = isEdit
        ? `/api/v1/cinema-items/${initialData.id}`
        : `/api/v1/cinema-items`;

      const method = isEdit
        ? "PUT"
        : "POST";

      const res =
        await apiSuperAdminRequest(
          url,
          {
            method,
            body: JSON.stringify({
              ...formData,
              name:
                formData.name.trim(),
              address:
                formData.address.trim(),
              city: "TP.HCM",
              cinemaId,
            }),
          }
        );

      let result: any = null;

      try {

        result = await res.json();

      } catch {

        result = null;
      }

      if (res.ok) {

        toast.success(
          result?.message ||
            (
              isEdit
                ? "Cập nhật thành công"
                : "Tạo chi nhánh thành công"
            ),
          {
            id: loadingToast,
          }
        );

        onSuccess();

        onClose();

        return;
      }

      if (
        result?.data &&
        typeof result.data === "object"
      ) {

        setErrors(result.data);

        const firstError =
          Object.values(
            result.data
          )[0];

        toast.error(
          String(firstError),
          {
            id: loadingToast,
          }
        );

        return;
      }

      toast.error(
        result?.message ||
          result?.error ||
          "Có lỗi xảy ra từ máy chủ",
        {
          id: loadingToast,
        }
      );

    } catch (err) {

      toast.error(
        "Không thể kết nối tới máy chủ"
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">

      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">

        <div className="flex justify-between items-center mb-8">

          <div className="flex items-center gap-2">

            <div
              className={`w-2 h-2 rounded-full ${
                isEdit
                  ? "bg-amber-500"
                  : "bg-red-600"
              }`}
            />

            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">

              {isEdit
                ? "Chỉnh sửa chi nhánh"
                : "Khởi tạo chi nhánh"}

            </span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >

          <div className="col-span-2 space-y-1">

            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">

              Tên chi nhánh

            </label>

            <input
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-700 ${
                errors.name
                  ? "border-red-600"
                  : "border-white/5 focus:border-red-600"
              }`}
              placeholder="VD: Rạp A&K Đường 103"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />

            {errors.name && (

              <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">

                <AlertTriangle size={12} />

                {errors.name}

              </p>
            )}
          </div>

          <div className="col-span-2 space-y-1">

            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">

              Địa chỉ chi tiết

            </label>

            <input
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-700 ${
                errors.address
                  ? "border-red-600"
                  : "border-white/5 focus:border-red-600"
              }`}
              placeholder="Số nhà, tên đường..."
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
            />

            {errors.address && (

              <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">

                <AlertTriangle size={12} />

                {errors.address}

              </p>
            )}
          </div>

          <div className="space-y-1">

            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">

              Thành phố

            </label>

            <input
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-400 outline-none cursor-not-allowed"
              value="TP.HCM"
              disabled
            />
          </div>

          <div className="space-y-1">

            <label className="text-[9px] font-black uppercase text-zinc-700 tracking-widest ml-1 italic">

              Giờ hoạt động

            </label>

            <input
              type="number"
              min={1}
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all ${
                errors.hoursPerRoom
                  ? "border-red-600"
                  : "border-white/5 focus:border-red-600"
              }`}
              value={formData.hoursPerRoom}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursPerRoom:
                    Number(
                      e.target.value
                    ),
                })
              }
            />

            {errors.hoursPerRoom && (

              <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">

                <AlertTriangle size={12} />

                {errors.hoursPerRoom}

              </p>
            )}
          </div>

          <div className="col-span-2 mt-2 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">

            <p className="text-[11px] text-amber-400 leading-relaxed">

              Không thể xoá chi nhánh nếu vẫn còn
              suất chiếu đang hoạt động trong hệ
              thống.

            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`col-span-2 mt-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 ${
              isEdit
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-white text-black hover:bg-red-600 hover:text-white"
            }`}
          >

            {isSubmitting ? (

              <Loader2
                size={14}
                className="animate-spin"
              />

            ) : (

              <>
                {isEdit ? (
                  <Save size={14} />
                ) : (
                  <PlusCircle size={14} />
                )}

                {isEdit
                  ? "Cập nhật dữ liệu"
                  : "Tạo chi nhánh"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}