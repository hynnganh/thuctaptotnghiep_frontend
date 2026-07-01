"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, Gift, Coins, Tag, Percent, DollarSign, Calendar, FileText, Hash } from "lucide-react";
import { apiSuperAdminRequest } from "@/app/lib/api";
import toast from "react-hot-toast";

export default function VoucherModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting
}: any) {

  const [promotions, setPromotions] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 1,
    startDate: "",
    endDate: "",
    promotionId: "",
    voucherType: "EVENT",
    costPoints: 0
  });

  // LOAD DATA
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    apiSuperAdminRequest("/api/v1/promotions")
      .then(async (r) => {
        if (r && r.ok) return r.json();
        return { data: [] };
      })
      .then(d => setPromotions(d.data || []))
      .catch(() => console.error("Không thể tải danh sách sự kiện"));

    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "",
        promotionId: initialData.promotionId || "",
        title: initialData.title || "",
        description: initialData.description || "",
        usageLimit: initialData.usageLimit ?? 1,
        costPoints: initialData.costPoints ?? 0,
        voucherType: initialData.voucherType || "EVENT"
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        discountValue: 0,
        minOrderAmount: 0,
        usageLimit: 1,
        startDate: "",
        endDate: "",
        promotionId: "",
        voucherType: "EVENT",
        costPoints: 0
      });
    }
  }, [isOpen, initialData]);

  // INPUT CHANGE
  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    let finalValue: any = type === "number" ? Number(value) : value;

    if (name === "code") {
      finalValue = value.toUpperCase().replace(/\s+/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = "Mã voucher không được để trống!";
    if (!formData.title.trim()) newErrors.title = "Tiêu đề voucher không được để trống!";
    if (formData.discountValue <= 0) newErrors.discountValue = "Giá trị giảm phải lớn hơn 0!";
    if (formData.minOrderAmount < 0) newErrors.minOrderAmount = "Đơn hàng tối thiểu không được âm!";
    if (formData.usageLimit <= 0) newErrors.usageLimit = "Số lượng voucher phải lớn hơn 0!";
    if (!formData.startDate) newErrors.startDate = "Ngày bắt đầu không được để trống!";
    if (!formData.endDate) newErrors.endDate = "Ngày kết thúc không được để trống!";
    
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu!";
    }
    if (formData.discountValue >= formData.minOrderAmount && formData.minOrderAmount > 0) {
      newErrors.discountValue = "Giá trị giảm phải nhỏ hơn đơn hàng tối thiểu!";
    }

    // CHỈ BẮT LỖI ĐIỂM ĐỔI KHI LÀ VOUCHER ĐỔI ĐIỂM (REDEEM)
    if (formData.voucherType === "REDEEM" && formData.costPoints <= 0) {
      newErrors.costPoints = "Điểm đổi thưởng phải lớn hơn 0!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// SUBMIT FORM (ĐÃ THÊM LOG ĐỂ KIỂM TRA LỖI 400)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});

  const payload = {
    ...formData,
    promotionId: formData.voucherType === "EVENT" && formData.promotionId ? Number(formData.promotionId) : null,
    discountValue: Number(formData.discountValue),
    minOrderAmount: Number(formData.minOrderAmount),
    usageLimit: Number(formData.usageLimit),
    
    costPoints: formData.voucherType === "EVENT" ? null : Number(formData.costPoints)
  };

    console.log("=== [DEBUG FRONTEND] DỮ LIỆU PAYLOAD GỬI LÊN BACKEND ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("=====================================================");

    try {
      const res = await onSubmit(payload);
      
      if (!res) {
        toast.error("Lỗi cấu hình hàm submit: Không nhận được phản hồi từ Server.");
        return;
      }

      // 3. IN LOG TRẠNG THÁI HTTP CỦA SERVER TRẢ VỀ
      console.log(`=== [DEBUG BACKEND] HTTP STATUS: ${res.status} (${res.statusText}) ===`);

      const contentType = res.headers?.get("content-type");
      let result: any = {};
      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
        
        // 4. IN LOG CHI TIẾT LỖI TỪ SPRING BOOT (Nếu trả về dạng JSON)
        console.log("=== [DEBUG BACKEND] CHI TIẾT PHẢN HỒI LỖI (JSON) ===");
        console.log(result);
        console.log("====================================================");
      } else {
        const txtErr = await res.text();
        toast.error("Hệ thống phản hồi không đúng định dạng JSON.");
        console.error("=== [DEBUG BACKEND] CHI TIẾT PHẢN HỒI LỖI (RAW TEXT) ===");
        console.error(txtErr);
        console.error("========================================================");
        return;
      }

      // XỬ LÝ LỖI TRẢ VỀ TỪ SPRING BOOT VALIDATION
      if (!res.ok) {
        const backendErrors = result?.data || result;
        if (backendErrors && typeof backendErrors === "object") {
          setErrors(backendErrors);
          return;
        }
        toast.error(result?.message || "Có lỗi xảy ra khi lưu voucher");
        return;
      }

      toast.success("Lưu voucher thành công");
      onClose();

    } catch (err: any) {
      console.error("=== [DEBUG FRONTEND] LỖI KẾT NỐI MẠNG ===");
      console.error(err);
      toast.error(err?.message || "Lỗi kết nối mạng");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#060608] border border-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            {initialData ? "Cập nhật" : "Thiết lập"} Voucher
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={16} /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Tiêu đề & Mô tả */}
            <div className="space-y-4 border-b border-zinc-900/50 pb-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1"><FileText size={12}/> Tiêu đề Voucher</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề hiển thị..."
                  className={`w-full bg-zinc-950 border ${errors.title ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white text-xs`}
                />
                {errors.title && <p className="text-[10px] text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Mô tả điều kiện</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả ngắn gọn..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white text-xs resize-none"
                />
              </div>
            </div>

            {/* Mã Code & Hình thức */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Mã Code</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: SALE2026"
                  className={`w-full bg-zinc-950 border ${errors.code ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white font-bold text-xs uppercase`}
                />
                {errors.code && <p className="text-[10px] text-red-500">{errors.code}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Hình thức</label>
                <select name="voucherType" value={formData.voucherType} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs">
                  <option value="EVENT">Voucher sự kiện</option>
                  <option value="REDEEM">Voucher đổi điểm</option>
                </select>
              </div>
            </div>

            {/* Điều kiện mở rộng */}
            {formData.voucherType === "EVENT" ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Gift size={12}/> Sự kiện áp dụng</label>
                <select name="promotionId" value={formData.promotionId} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs">
                  <option value="">Chọn sự kiện...</option>
                  {promotions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1"><Coins size={12}/> Điểm đổi (PTS)</label>
                <input name="costPoints" type="number" value={formData.costPoints} onChange={handleChange} className="w-full bg-zinc-950 border border-amber-900/30 p-3 rounded-lg text-amber-500 font-bold text-xs" />
                {errors.costPoints && <p className="text-[10px] text-red-500">{errors.costPoints}</p>}

              </div>
            )}

            {/* Cấu hình tài chính & Số lượng */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Tag size={12} /> Giá trị & Giới hạn</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Số tiền giảm</p>
                  <div className="relative">
                    <input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} className={`w-full bg-zinc-950 border ${errors.discountValue ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white font-bold text-xs pl-7`} />
                    <Percent className="absolute left-2.5 top-3.5 text-zinc-600" size={12} />
                  </div>
                  {errors.discountValue && <p className="text-[9px] text-red-500">{errors.discountValue}</p>}
                </div>
                
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Đơn tối thiểu</p>
                  <div className="relative">
                    <input name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} className={`w-full bg-zinc-950 border ${errors.minOrderAmount ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white font-bold text-xs pl-7`} />
                    <DollarSign className="absolute left-2.5 top-3.5 text-zinc-600" size={12} />
                  </div>
                  {errors.minOrderAmount && <p className="text-[9px] text-red-500">{errors.minOrderAmount}</p>}
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Số lượng mã phát</p>
                  <div className="relative">
                    <input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} className={`w-full bg-zinc-950 border ${errors.usageLimit ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white font-bold text-xs pl-7`} />
                    <Hash className="absolute left-2.5 top-3.5 text-zinc-600" size={12} />
                  </div>
                  {errors.usageLimit && <p className="text-[9px] text-red-500">{errors.usageLimit}</p>}
                </div>
              </div>
            </div>

            {/* Cấu hình thời gian */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Calendar size={12} /> Thời gian chạy chương trình</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Ngày bắt đầu</p>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className={`w-full bg-zinc-950 border ${errors.startDate ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white text-xs`} />
                  {errors.startDate && <p className="text-[9px] text-red-500">{errors.startDate}</p>}
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Ngày kết thúc</p>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className={`w-full bg-zinc-950 border ${errors.endDate ? 'border-red-500' : 'border-zinc-800'} p-3 rounded-lg text-white text-xs`} />
                  {errors.endDate && <p className="text-[9px] text-red-500">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-900 bg-zinc-950/50">
          <button type="submit" form="voucher-form" disabled={isSubmitting} className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl text-white font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors disabled:bg-zinc-800 disabled:text-zinc-600">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  );
}