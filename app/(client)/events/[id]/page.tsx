"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  BookmarkCheck,
  Gift,
  Zap,
  Calendar,
  Clock
} from "lucide-react";
import { apiRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  /* 🌟 FIX TOKEN: Đồng bộ chuẩn key token_user giống hệ thống */
  const getUserToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_user") || "";
    }
    return "";
  };

  /* ================= IMAGE FIX ================= */

  const getImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  /* ================= FORMAT ================= */

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getUserToken();

        // 🌟 Gửi Request cơ bản cho Event và Vouchers thuộc Event đó
        const requests = [
          apiRequest(`/api/v1/promotions/${params.id}`),
          apiRequest(`/api/v1/vouchers/promotion/${params.id}`)
        ];

        // 🌟 Nếu đã đăng nhập, đính kèm Header Authorization để lấy danh sách Voucher cá nhân
        if (token) {
          requests.push(
            apiRequest(`/api/v1/vouchers/my-vouchers`, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            })
          );
        }

        const responses = await Promise.all(requests);

        /* EVENT */
        const eventJson = await responses[0].json();
        if (responses[0].ok) setEvent(eventJson.data);

        /* VOUCHERS */
        const voucherJson = await responses[1].json();
        if (responses[1].ok) setVouchers(voucherJson.data || []);

        /* SAVED VOUCHERS (Chỉ chạy khi có phản hồi thứ 3) */
        if (token && responses[2]?.ok) {
          const myVouchersJson = await responses[2].json();
          // Map danh sách voucher ID người dùng đã sở hữu để hiển thị nút "Đã lấy"
          const myVoucherList = myVouchersJson.data || [];
          setSavedIds(myVoucherList.map((v: any) => v.id));
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sự kiện:", err);
        toast.error("Lỗi kết nối dữ liệu máy chủ");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  /* ================= SAVE VOUCHER ================= */

  const handleSaveVoucher = async (voucherId: number) => {
    const token = getUserToken();

    if (!token) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá bạn nhé!");
      // Định hướng sang trang login nếu cần thiết
      router.push("/auth");
      return;
    }

    setIsSavingId(voucherId);

    try {
      // 🌟 Truyền Token vào Header chuẩn hóa quy trình nhận diện phiên đăng nhập
      const res = await apiRequest(`/api/v1/vouchers/save/${voucherId}`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setSavedIds((prev) => [...prev, voucherId]);
        toast.success("Đã lưu mã ưu đãi thành công!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Không thể lưu voucher này");
      }
    } catch (err) {
      toast.error("Lỗi đường truyền mạng, thử lại sau!");
    } finally {
      setIsSavingId(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={28} />
      </div>
    );

  /* ================= UI TONE ĐỎ - TRẮNG - ĐEN ================= */

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 pb-20 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Toaster position="top-right" />

      {/* ===== HERO IMAGE BANNER ===== */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-zinc-950">
        {event?.thumbnail ? (
          <img
            src={getImageUrl(event.thumbnail)}
            alt={event.title}
            className="w-full h-full object-cover opacity-40 brightness-75 transition-all duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-800">
            <Gift size={56} className="animate-pulse" />
          </div>
        )}

        {/* Lớp phủ mờ mượt mà chuyển sắc về nền đen tối thượng */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

        {/* Nút quay lại tinh giản */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-zinc-800 text-white hover:border-red-600 hover:text-red-500 transition-all z-50 shadow-lg"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* ===== KHU VỰC THÔNG TIN CHÍNH ===== */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ===== BÊN TRÁI: CHI TIẾT NỘI DUNG SỰ KIỆN ===== */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-3.5">
              <Zap size={13} className="text-red-600 fill-red-600 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                Chương trình ưu đãi độc quyền
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black uppercase mb-5 text-white tracking-tight leading-tight italic">
              {event?.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-900 pb-5">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-600" />
                <span>Ngày đăng: {formatDate(event?.createdAt)}</span>
              </div>

              {event?.movie && (
                <div className="px-2.5 py-0.5 bg-red-600/10 border border-red-600/20 rounded text-red-500 font-black">
                  Phim áp dụng: {event.movie.title}
                </div>
              )}
            </div>

            {/* Khung bài viết Content */}
            <div className="bg-[#0c0c0e] border border-zinc-900 p-6 md:p-9 rounded-2xl shadow-inner">
              <div
                className="text-zinc-300 text-sm md:text-base leading-relaxed prose prose-invert max-w-none 
                  prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic
                  prose-p:text-zinc-400 prose-strong:text-white prose-a:text-red-500 hover:prose-a:text-red-400"
                dangerouslySetInnerHTML={{ __html: event?.content }}
              />
            </div>
          </div>

          {/* ===== BÊN PHẢI: SIDEBAR DANH SÁCH VOUCHER ===== */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="sticky top-24 space-y-5 bg-[#0c0c0e] border border-zinc-900 p-5 rounded-2xl">
              
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                <div className="w-1 h-4 bg-red-600 rounded-full" />
                <h2 className="text-[11px] font-black uppercase text-zinc-300 tracking-wider">
                  Mã Voucher Sẵn Có
                </h2>
              </div>

              <div className="grid gap-3">
                {vouchers.length > 0 ? (
                  vouchers.map((v) => {
                    const isSaved = savedIds.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        className={`flex items-center justify-between bg-black border rounded-xl p-4 transition-colors ${
                          isSaved ? "border-zinc-900 bg-black/40" : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider truncate">
                            CODE: <span className="text-zinc-300 font-bold">{v.code}</span>
                          </div>

                          <div className="text-xl font-black text-white italic tracking-tight">
                            {v.discountValue
                              ? v.discountValue > 100
                                ? formatCurrency(v.discountValue)
                                : `${Math.round(v.discountValue * 100)}%`
                              : "Ưu đãi đặc biệt"}
                          </div>

                          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                            <Clock size={10} className="text-zinc-600" />
                            <span>Hạn: {formatDate(v.endDate)}</span>
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <button
                          onClick={() => handleSaveVoucher(v.id)}
                          disabled={isSaved || isSavingId === v.id}
                          className={`ml-4 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center min-w-[70px] ${
                            isSaved
                              ? "bg-zinc-900/80 border border-zinc-800 text-green-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md shadow-red-900/20"
                          }`}
                        >
                          {isSavingId === v.id ? (
                            <Loader2 size={12} className="animate-spin text-white" />
                          ) : isSaved ? (
                            <BookmarkCheck size={15} />
                          ) : (
                            "Lấy"
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl bg-black/20">
                    <Gift className="mx-auto text-zinc-800 mb-2" size={20} />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      Chưa có mã ưu đãi nào
                    </p>
                  </div>
                )}
              </div>

              {/* Điều khoản đi kèm */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-zinc-900/60">
                <p className="text-[9.5px] text-zinc-500 leading-relaxed font-medium">
                  * Khuyến mãi chỉ áp dụng cho tài khoản thành viên khi thanh toán trực tuyến. Số lượng mã phát hành có hạn theo ngày.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}