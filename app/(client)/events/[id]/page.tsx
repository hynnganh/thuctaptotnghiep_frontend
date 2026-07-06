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
  Clock,
  Sparkles,
  Info
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

  const getUserToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_user") || "";
    }
    return "";
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getUserToken();
        const requests = [
          apiRequest(`/api/v1/promotions/${params.id}`),
          apiRequest(`/api/v1/vouchers/promotion/${params.id}`)
        ];

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
        const eventJson = await responses[0].json();
        if (responses[0].ok) setEvent(eventJson.data);

        const voucherJson = await responses[1].json();
        if (responses[1].ok) setVouchers(voucherJson.data || []);

        if (token && responses[2]?.ok) {
          const myVouchersJson = await responses[2].json();
          const myVoucherList = myVouchersJson.data || [];
          setSavedIds(myVoucherList.map((v: any) => v.id));
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sự kiện:", err);
        toast.error("Lỗi kết nối dữ liệu máy chủ");
      } finally {
        loading && setLoading(false); // Đảm bảo trạng thái render chuẩn xác
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  const handleSaveVoucher = async (voucherId: number) => {
    const token = getUserToken();

    if (!token) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá bạn nhé!");
      router.push("/auth");
      return;
    }

    setIsSavingId(voucherId);

    try {
      const res = await apiRequest(`/api/v1/vouchers/save/${voucherId}`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setSavedIds((prev) => [...prev, voucherId]);
        toast.success("Đã lưu mã ưu đãi vào ví!");
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-700 pb-24 font-sans antialiased selection:bg-red-50 selection:text-red-600">
      <Toaster position="top-right" />

      {/* ===== HEADER NAVIGATION TOÀN CẢNH ===== */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={15} /> Quay lại
          </button>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span>EVENT_ID:</span>
            <span className="text-zinc-700 font-bold">#{params.id}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===== BÊN TRÁI: POSTER BANNER & BÀI VIẾT (65%) ===== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Poster Khung Điện Ảnh */}
            <div className="relative w-full aspect-[21/9] md:aspect-[16/6] rounded-2xl overflow-hidden bg-zinc-200 border border-zinc-200 shadow-sm">
              {event?.thumbnail ? (
                <img
                  src={getImageUrl(event.thumbnail)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                  <Gift size={36} className="opacity-40" />
                </div>
              )}
            </div>

            {/* Thông tin metadata */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-red-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                  Đặc quyền thành viên HNA
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black uppercase text-zinc-900 tracking-tight leading-snug">
                {event?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase text-zinc-400 pt-1.5 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-400" />
                  <span>Khởi tạo: {formatDate(event?.createdAt)}</span>
                </div>
                {event?.movie && (
                  <div className="px-2 py-0.5 bg-red-50 border border-red-100 rounded text-red-600 font-bold">
                    Sự kiện phim: {event.movie.title}
                  </div>
                )}
              </div>
            </div>

            {/* Khung nội dung chính */}
            <div className="prose max-w-none prose-sm md:prose-base leading-relaxed">
              <div
                className="text-zinc-600 space-y-4
                  prose-headings:text-zinc-900 prose-headings:font-black prose-headings:uppercase 
                  prose-p:text-zinc-600 prose-strong:text-red-600 prose-strong:font-bold
                  prose-a:text-red-600 hover:prose-a:text-red-500"
                dangerouslySetInnerHTML={{ __html: event?.content }}
              />
            </div>
          </div>

          {/* ===== BÊN PHẢI: SIDEBAR VOUCHER DẠNG CUỐNG VÉ (35%) ===== */}
          <div className="lg:col-span-4 w-full">
            <div className="sticky top-24 bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-sm">
              
              <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100">
                <Zap size={14} className="text-red-600 fill-red-600" />
                <h2 className="text-xs font-bold uppercase text-zinc-900 tracking-wide">
                  Mã giảm giá khả dụng
                </h2>
              </div>

              {/* Danh sách Voucher cuống vé */}
              <div className="space-y-3">
                {vouchers.length > 0 ? (
                  vouchers.map((v) => {
                    const isSaved = savedIds.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        className="relative flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-4 overflow-hidden group transition-all"
                      >
                        {/* Hiệu ứng vết khoét răng cưa cuống vé cổ điển ở hai cạnh bên */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-4 bg-[#f8f9fa] border-r border-zinc-200 rounded-r-full z-10" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-4 bg-[#f8f9fa] border-l border-zinc-200 rounded-l-full z-10" />

                        <div className="space-y-0.5 pl-2 min-w-0 flex-1">
                          <div className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider">
                            CODE: <span className="text-zinc-700 font-bold">{v.code}</span>
                          </div>

                          <div className="text-2xl font-black text-zinc-900 tracking-tighter group-hover:text-red-600 transition-colors">
                            {v.discountValue
                              ? v.discountValue > 100
                                ? formatCurrency(v.discountValue)
                                : `${Math.round(v.discountValue * 100)}%`
                              : "Đặc quyền"}
                          </div>

                          <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                            <Clock size={10} />
                            <span>Hạn: {formatDate(v.endDate)}</span>
                          </div>
                        </div>

                        {/* Nút Nhận mã */}
                        <button
                          onClick={() => handleSaveVoucher(v.id)}
                          disabled={isSaved || isSavingId === v.id}
                          className={`ml-4 mr-1 px-3 h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all min-w-[75px] shadow-sm ${
                            isSaved
                              ? "bg-zinc-100 border border-zinc-200 text-emerald-600 cursor-not-allowed shadow-none"
                              : "bg-red-600 text-white hover:bg-red-500 active:scale-95"
                          }`}
                        >
                          {isSavingId === v.id ? (
                            <Loader2 size={12} className="animate-spin mx-auto text-white" />
                          ) : isSaved ? (
                            <span className="flex items-center justify-center gap-0.5"><BookmarkCheck size={11} /> Đã lưu</span>
                          ) : (
                            "Lưu mã"
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                    <Gift className="mx-auto text-zinc-300 mb-1.5" size={24} />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Không tìm thấy voucher đính kèm
                    </p>
                  </div>
                )}
              </div>

              {/* Điều khoản bổ sung */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex gap-2 items-start">
                <Info size={12} className="text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-zinc-400 leading-relaxed">
                  Số lượng mã ưu đãi có hạn và hệ thống có quyền kết thúc sớm hơn thời hạn dự kiến dựa trên lượt sử dụng thực tế tại quầy hoặc thanh toán trực tuyến.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}