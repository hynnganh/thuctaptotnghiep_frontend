"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { 
  Loader2, CheckCircle2, XCircle, AlertCircle, 
  Home, Ticket, RefreshCw, ArrowRight 
} from "lucide-react";

export const dynamic = "force-dynamic"; // 🔥 FIX BUILD SSR

export default function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [count, setCount] = useState(5);

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef") || "N/A";
  const amount = Number(searchParams.get("vnp_Amount") || 0) / 100;

  const isSuccess = responseCode === "00";
  const isCancelled = responseCode === "24";

  // ================= TOAST =================
  useEffect(() => {
    if (isSuccess) {
      toast.success("Thanh toán thành công");
    } else if (isCancelled) {
      toast.error("Đã hủy thanh toán");
    } else if (responseCode) {
      toast.error("Giao dịch thất bại");
    }
  }, [isSuccess, isCancelled, responseCode]);

  // ================= COUNTDOWN =================
  useEffect(() => {
    if (!isSuccess) return;

    if (count === 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isSuccess, router]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 flex items-center justify-center p-6 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Vòng tròn gradient nền sáng sinh động */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-zinc-200/40 rounded-full blur-3xl pointer-events-none z-0" />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] ${isSuccess ? 'bg-emerald-100/50' : 'bg-rose-100/50'} rounded-full blur-3xl pointer-events-none z-0`} />

      {/* Thẻ Hóa Đơn Chính */}
      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl p-8 text-center flex flex-col items-center">
        
        {isSuccess ? (
          <div className="w-full space-y-6">
            {/* Biểu tượng Thành công sinh động */}
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center shadow-sm animate-bounce">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-[1000] uppercase tracking-tight text-zinc-900">
                Thanh toán thành công
              </h1>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-extrabold px-4">
                Hệ thống đã ghi nhận và kích hoạt vé xem phim của bạn
              </p>
            </div>

            {/* Khung Chi Tiết Biên Lai (Receipt Style) */}
            <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 text-left space-y-3.5 relative overflow-hidden">
              {/* Hiệu ứng răng cưa viền vé giả lập ở 2 bên */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#f8f9fa] border-r border-zinc-200 rounded-full" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#f8f9fa] border-l border-zinc-200 rounded-full" />
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-400 uppercase tracking-wider">Mã giao dịch</span>
                <span className="font-mono font-black text-zinc-800 px-2 py-1 bg-white border border-zinc-200/80 rounded-md shadow-2xs">
                  #{txnRef}
                </span>
              </div>
              
              <div className="border-t border-dashed border-zinc-200 pt-3.5 flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-0.5">Tổng tiền đã chi</span>
                <span className="text-2xl font-[1000] italic text-zinc-900 tracking-tight leading-none">
                  {amount.toLocaleString()}<span className="text-sm font-black ml-0.5 not-italic text-red-600">đ</span>
                </span>
              </div>
            </div>

            {/* Đếm ngược tinh tế */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400">
              <span>Tự động chuyển hướng sau</span>
              <span className="text-emerald-600 font-black px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md animate-pulse">
                {count}s
              </span>
            </div>

            {/* Bố cục Nút Hành Động Ngang */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 active:scale-98 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                <Home size={14} />
                Trang chủ
              </button>
              <button
                onClick={() => router.push("/ticket")}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-red-600 text-white hover:bg-red-700 active:scale-98 text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.15)] transition-all"
              >
                <Ticket size={14} />
                Xem vé ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Biểu tượng Hủy/Thất bại */}
            <div className={`w-16 h-16 ${isCancelled ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'} rounded-full flex items-center justify-center shadow-sm`}>
              {isCancelled ? <AlertCircle size={32} strokeWidth={2.5} /> : <XCircle size={32} strokeWidth={2.5} />}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-[1000] uppercase tracking-tight text-zinc-900">
                {isCancelled ? "Giao dịch đã hủy" : "Thanh toán thất bại"}
              </h1>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-extrabold px-6 leading-relaxed">
                {isCancelled 
                  ? "Bạn đã chủ động dừng luồng thanh toán hiện tại trên cổng kết nối" 
                  : "Thẻ không đủ số dư hoặc thông tin xác thực OTP chưa chính xác"}
              </p>
            </div>

            {/* Thông tin đơn lỗi */}
            <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 flex justify-between items-center text-xs text-left">
              <span className="font-bold text-zinc-400 uppercase tracking-wider">Mã vận đơn</span>
              <span className="font-mono font-black text-zinc-800 px-2 py-1 bg-white border border-zinc-200/80 rounded-md">
                #{txnRef}
              </span>
            </div>

            {/* Bố cục Nút Phụ Hồi Lỗi */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <Home size={14} />
                Trang chủ
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              >
                <RefreshCw size={13} />
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}