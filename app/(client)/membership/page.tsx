"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Sparkles,
  Ticket,
  Coins,
  ChevronRight,
  CheckCircle2,
  WalletCards,
  PartyPopper,
  Clock3,
  X,
} from "lucide-react";

import Link from "next/link";
import { apiRequest } from "@/app/lib/api";

type Voucher = {
  id: number;
  code: string;
  title: string;
  description: string;
  discountValue: number;
  minOrderAmount: number;
  costPoints: number;
  endDate?: string;
  voucherType?: string;
  usageLimit?: number;
  usedCount?: number;
};

type UserProfile = {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  points: number;
};

export default function MembershipPage() {
  const router = useRouter();

  const [points, setPoints] = useState<number>(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  
  // voucher đã đổi
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // ================= LẤY TOKEN AN TOÀN =================
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_user");
    }
    return null;
  };

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const token = getToken();

      // Nếu chưa đăng nhập, tự động đẩy về trang Login
      if (!token) {
        router.push("/auth");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        userRes,
        voucherRes,
        myVoucherRes,
      ] = await Promise.all([
        apiRequest("/api/v1/users/me", { method: "GET", headers }),
        apiRequest("/api/v1/vouchers/redeemable", { method: "GET", headers }),
        apiRequest("/api/v1/vouchers/my-vouchers", { method: "GET", headers }),
      ]);

      // Nếu Token hết hạn hoặc không hợp lệ (lỗi 401/403), bắt đi đăng nhập lại
      if (userRes.status === 401 || userRes.status === 403) {
        localStorage.removeItem("token_user");
        router.push("/auth/login");
        return;
      }

      const [userJson, voucherJson, myVoucherJson] = await Promise.all([
        userRes.json(),
        voucherRes.json(),
        myVoucherRes.json(),
      ]);

      const userData = userJson?.data || {};
      const voucherData = Array.isArray(voucherJson?.data) ? voucherJson.data : [];
      const ownedVouchers = Array.isArray(myVoucherJson?.data) ? myVoucherJson.data : [];

      setUser(userData);
      setPoints(userData?.points || 0);
      setMyVouchers(ownedVouchers);

      const redeemVouchers = voucherData.filter(
        (v: Voucher) => !v.voucherType || v.voucherType === "REDEEM"
      );

      setVouchers(redeemVouchers);
    } catch (error) {
      console.error(error);
      showToastMessage("error", "Không thể tải dữ liệu thành viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // ================= TOAST =================
  const showToastMessage = (type: "success" | "error", message: string) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);
  };

  // ================= REDEEM =================
  const redeemVoucher = async (voucher: Voucher) => {
    try {
      const token = getToken();
      
      // Phòng hờ nếu User mở sẵn tab rồi mới bấm đăng xuất ở tab khác
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const res = await apiRequest(`/api/v1/vouchers/redeem/${voucher.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token_user");
        router.push("/auth/login");
        return;
      }

      const json = await res.json();

      showToastMessage(
        "success",
        json?.message || `Đổi voucher thành công`
      );

      fetchData();
    } catch (error: any) {
      console.error(error);
      showToastMessage(
        "error",
        error?.message || "Đổi voucher thất bại"
      );
    }
  };

  // ================= NAME =================
  const fullName = useMemo(() => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 antialiased selection:bg-red-50">
      
      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* HERO SECTION - COMPACT LAYOUT */}
        <section className="grid md:grid-cols-12 gap-6 items-center bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          {/* LEFT: TEXT & ACTION */}
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={11} />
              HNA Rewards
            </div>

            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
              Membership
            </h1>

            <p className="text-zinc-500 text-xs md:text-sm max-w-md leading-relaxed">
              Hệ thống tích điểm thành viên chính thức của HNA Cinema. Tích lũy điểm thưởng qua mỗi lần mua vé và đổi lấy các phần quà, voucher ưu đãi đặc quyền.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href="/movies"
                className="group px-4 h-9 rounded-xl bg-red-600 hover:bg-red-500 transition-all text-white font-bold uppercase text-[11px] tracking-wider flex items-center gap-1 shadow-sm"
              >
                Đặt vé ngay
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/discounts"
                className="px-4 h-9 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all text-zinc-700 font-bold uppercase text-[11px] tracking-wider flex items-center"
              >
                Kho voucher
              </Link>
            </div>
          </div>

          {/* RIGHT: COMPACT MEMBER CARD */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="w-full max-w-[320px] rounded-2xl border border-zinc-200/50 bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 text-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full blur-xl" />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Member Card</p>
                  <h2 className="mt-1 text-base font-black tracking-wide truncate max-w-[170px]">
                    {fullName || "HNA MEMBER"}
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Gift size={16} className="text-red-400" />
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400">Reward Points</p>
                  <h3 className="text-2xl font-black tracking-tight mt-0.5 text-red-400">
                    {points.toLocaleString()}
                  </h3>
                </div>
                <div className="text-right text-[10px] text-zinc-400 space-y-0.5">
                  <p className="font-bold text-white">10.000đ = 1đ</p>
                  <p>Tự động tích điểm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VOUCHERS SECTION */}
        <section className="space-y-4">
          {/* SECTION HEADER */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
            <div>
              <p className="text-red-600 uppercase tracking-wider text-[10px] font-bold">Voucher đổi điểm</p>
              <h2 className="text-lg font-bold text-zinc-900">Kho Voucher Hiện Có</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white shadow-sm">
              <Coins className="text-amber-500" size={13} />
              <span className="text-xs font-bold text-zinc-700">{points.toLocaleString()} điểm</span>
            </div>
          </div>

          {/* LOADING / EMPTY / GRID */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-9 h-9 border-2 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="py-16 text-center bg-white border border-zinc-200 rounded-2xl">
              <Gift size={36} className="mx-auto text-zinc-300" />
              <h3 className="mt-2 text-sm font-bold text-zinc-700">Chưa có voucher</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Hiện chưa có voucher redeem khả dụng.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vouchers.map((voucher) => {
                const canRedeem = points >= voucher.costPoints;

                const alreadyOwned = myVouchers.some(
                  (myVoucher) =>
                    myVoucher.id === voucher.id ||
                    myVoucher.code === voucher.code
                );

                return (
                  <div
                    key={voucher.id}
                    className="group bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between hover:border-red-200 transition-all hover:shadow-sm"
                  >
                    <div>
                      {/* CARD HEADER */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <Gift size={15} className="text-red-600" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[9px] font-medium">
                          Cần: {voucher.costPoints} điểm
                        </span>
                      </div>

                      {/* CARD CONTENT */}
                      <div className="mt-3 space-y-1">
                        <h3 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {voucher.title}
                        </h3>
                        <p className="text-zinc-400 text-[11px] line-clamp-2 min-h-[32px] leading-relaxed">
                          {voucher.description}
                        </p>
                      </div>

                      {/* DETAILS LIST */}
                      <div className="mt-3 pt-2 border-t border-zinc-100 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Giảm giá</span>
                          <span className="font-bold text-red-600">
                            {Number(voucher.discountValue).toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Đơn tối thiểu</span>
                          <span className="font-medium text-zinc-700">
                            {Number(voucher.minOrderAmount).toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Hạn sử dụng</span>
                          <span className="font-medium text-zinc-500">
                            {voucher.endDate
                              ? new Date(voucher.endDate).toLocaleDateString("vi-VN")
                              : "Không giới hạn"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() => redeemVoucher(voucher)}
                      disabled={!canRedeem || alreadyOwned}
                      className={`mt-4 w-full h-8.5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all ${
                        alreadyOwned
                          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                          : canRedeem
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-sm"
                          : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      {alreadyOwned
                        ? "Đã đổi"
                        : canRedeem
                        ? "Đổi ngay"
                        : "Không đủ điểm"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RULES BANNER - ULTRA COMPACT */}
        <section className="bg-zinc-900 text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
              <Clock3 size={14} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400">Quy tắc tích điểm</h4>
              <p className="text-[10px] text-zinc-400">Hệ thống xử lý và cộng điểm tự động sau mỗi giao dịch.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-300 md:max-w-xl">
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-red-500" /> Mỗi 10.000 VNĐ = 1 điểm</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-red-500" /> Không quy đổi thành tiền mặt</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-red-500" /> Voucher áp dụng theo HSD riêng</span>
          </div>
        </section>
      </main>

      {/* TOAST - MINIMAL LIGHT */}
      <div
        className={`fixed bottom-4 right-4 z-[999] transition-all duration-300 transform ${
          toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-start gap-3 w-[300px] rounded-xl border p-3.5 bg-white shadow-lg ${
            toast.type === "success" ? "border-emerald-200" : "border-red-200"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {toast.type === "success" ? <PartyPopper size={14} /> : <Gift size={14} />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-zinc-900">
              {toast.type === "success" ? "Thành công" : "Thông báo"}
            </h4>
            <p className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-zinc-400 hover:text-zinc-600 transition shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}