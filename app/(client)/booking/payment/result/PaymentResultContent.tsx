"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

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

  // ================= TOAST (Dọn sạch Text rườm rà) =================
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

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 font-sans selection:bg-red-600">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Hiệu ứng ánh sáng nền mờ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md bg-zinc-950/60 backdrop-blur-xl border border-zinc-900 rounded-3xl p-10 text-center shadow-2xl">
        {isSuccess ? (
          <div className="space-y-8">
            {/* Thanh trạng thái phía trên (Thay cho Icon) */}
            <div className="w-24 h-1 mx-auto bg-green-500 rounded-full shadow-lg shadow-green-500/20 animate-pulse" />

            <div className="space-y-3">
              <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-br from-green-300 to-emerald-500 bg-clip-text text-transparent">
                Thành Công
              </h1>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                A&K Cinema đã xác nhận giao dịch của bạn
              </p>
            </div>

            {/* Khung thông tin hóa đơn được tối ưu lại */}
            <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Mã vé</span>
                <span className="text-xs font-mono font-black text-zinc-100 p-1.5 bg-zinc-800 rounded">#{txnRef}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold pb-1">Tổng cộng</span>
                <span className="text-3xl font-black text-white leading-none">
                  {amount.toLocaleString()}<span className="text-xl font-bold ml-1">đ</span>
                </span>
              </div>
            </div>

            {/* Countdown tinh giản */}
            <div className="pt-2">
              <p className="text-xs text-zinc-400 font-medium">
                Về trang chủ sau{" "}
                <span className="text-green-400 font-black px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">{count}s</span>
              </p>
            </div>

            {/* Nút hành động */}
            <div className="grid grid-cols-2 gap-4 pt-3">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 active:scale-95 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Trang chủ
              </button>
              <button
                onClick={() => router.push("/ticket")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                Xem vé ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Thanh trạng thái thất bại */}
            <div className="w-24 h-1 mx-auto bg-red-500 rounded-full shadow-lg shadow-red-500/20" />

            <div className="space-y-3">
              <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-br from-red-300 to-rose-500 bg-clip-text text-transparent">
                {isCancelled ? "Đã Hủy" : "Thất Bại"}
              </h1>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                {isCancelled 
                  ? "Bạn đã chủ động hủy luồng thanh toán" 
                  : "Có lỗi xảy ra hoặc giao dịch không được phía ngân hàng chấp nhận"}
              </p>
            </div>

            {/* Khung thông tin đơn lỗi */}
            <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 text-left space-y-4">
              <div className="flex justify-between items-center pb-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Mã đơn</span>
                <span className="text-xs font-mono font-black text-zinc-100 p-1.5 bg-zinc-800 rounded">#{txnRef}</span>
              </div>
            </div>

            {/* Nút xử lý lỗi */}
            <div className="grid grid-cols-2 gap-4 pt-5">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Trang chủ
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl transition-all"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}