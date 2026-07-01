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
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden relative">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-350px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-red-600/10 blur-[180px]" />
        <div className="absolute bottom-[-300px] right-[-150px] w-[800px] h-[800px] rounded-full bg-red-500/10 blur-[180px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.3em]">
                <Sparkles size={13} />
                A&K Rewards
              </div>

              <h1 className="mt-8 text-5xl md:text-7xl font-black uppercase italic leading-[0.9] tracking-tight">
                Membership
              </h1>

              <p className="mt-6 text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                Hệ thống tích điểm thành viên của
                A&K Cinema.
              </p>

              {/* ACTION */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/movies"
                  className="group px-8 h-14 rounded-2xl bg-red-600 hover:bg-red-500 transition-all duration-300 font-black uppercase text-sm tracking-widest flex items-center gap-2 shadow-2xl shadow-red-600/20 hover:scale-[1.03]"
                >
                  Đặt vé ngay

                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                <Link
                  href="/discounts"
                  className="px-8 h-14 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 font-bold uppercase text-sm tracking-wider flex items-center"
                >
                  Kho voucher
                </Link>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                {[
                  {
                    icon: Coins,
                    title: "+1 điểm",
                    sub: "10.000 VNĐ",
                  },
                  {
                    icon: Gift,
                    title: "Voucher",
                    sub: "Đổi điểm",
                  },
                  {
                    icon: WalletCards,
                    title: "Reward",
                    sub: "Cinema",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl"
                  >
                    <item.icon
                      size={22}
                      className="text-red-500"
                    />

                    <h4 className="mt-4 font-black">
                      {item.title}
                    </h4>

                    <p className="text-zinc-500 text-xs mt-1">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px] overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-black">
                      Member Card
                    </p>

                    <h2 className="mt-3 text-2xl font-black italic leading-tight">
                      {fullName || "A&K MEMBER"}
                    </h2>

                    <p className="text-zinc-500 text-xs mt-2">
                      Cinema Rewards System
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                    <Gift size={28} />
                  </div>
                </div>

                {/* POINT */}
                <div className="mt-10">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest">
                    Reward Points
                  </p>

                  <h1 className="text-6xl font-black leading-none mt-2">
                    {points.toLocaleString()}
                  </h1>

                  <p className="mt-4 text-sm text-zinc-400">
                    Điểm hiện có trong tài khoản.
                  </p>
                </div>

                {/* MINI */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                    <Coins
                      size={20}
                      className="text-red-500"
                    />

                    <p className="mt-3 text-zinc-500 text-[10px] uppercase tracking-widest">
                      Tích điểm
                    </p>

                    <h4 className="mt-1 text-xl font-black">
                      +1 / 10K
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                    <Gift
                      size={20}
                      className="text-red-500"
                    />

                    <p className="mt-3 text-zinc-500 text-[10px] uppercase tracking-widest">
                      Voucher
                    </p>

                    <h4 className="mt-1 text-xl font-black">
                      Redeem
                    </h4>
                  </div>
                </div>

                {/* NOTICE */}
                <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-5">
                  <div className="flex items-center gap-3">
                    <Clock3
                      className="text-red-500"
                      size={18}
                    />

                    <div>
                      <p className="font-bold text-sm">
                        Điểm thưởng
                      </p>

                      <p className="text-zinc-500 text-xs mt-1">
                        Điểm được cộng tự động sau
                        mỗi lần thanh toán.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCKS */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">
            {[
              {
                icon: Ticket,
                title: "Đặt Vé",
                desc: "Đặt vé nhanh chóng.",
              },
              {
                icon: Coins,
                title: "Tích Điểm",
                desc: "Điểm cộng trực tiếp.",
              },
              {
                icon: WalletCards,
                title: "Đổi Voucher",
                desc: "Voucher redeem từ backend.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                  <item.icon size={28} />
                </div>

                <h3 className="mt-6 text-2xl font-black uppercase italic">
                  {item.title}
                </h3>

                <p className="mt-4 text-zinc-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOUCHERS */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-red-500 uppercase tracking-[0.3em] text-xs font-black">
              Voucher đổi điểm
            </p>

            <h2 className="mt-4 text-4xl md:text-5xl font-black uppercase italic">
              Kho Voucher
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03]">
            <Coins
              className="text-red-500"
              size={18}
            />

            <span className="text-sm font-bold text-zinc-300">
              {points.toLocaleString()} điểm
            </span>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-32 flex justify-center">
            <div className="w-16 h-16 border-[3px] border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-32 text-center">
            <Gift
              size={60}
              className="mx-auto text-zinc-700"
            />

            <h3 className="mt-5 text-2xl font-black">
              Chưa có voucher
            </h3>

            <p className="text-zinc-500 mt-3">
              Hiện chưa có voucher redeem.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {vouchers.map((voucher) => {
              const canRedeem = points >= voucher.costPoints;

              // check đã đổi
              const alreadyOwned = myVouchers.some(
                (myVoucher) =>
                  myVoucher.id === voucher.id ||
                  myVoucher.code === voucher.code
              );

              return (
                <div
                  key={voucher.id}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/[0.05] to-white/[0.02] hover:border-red-500/20 transition-all duration-300"
                >
                  <div className="relative p-6">
                    {/* HEADER */}
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center">
                        <Gift size={26} />
                      </div>

                      <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                        Redeem
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="mt-6">
                      <h3 className="text-xl font-black leading-tight line-clamp-2 min-h-[56px]">
                        {voucher.title}
                      </h3>

                      {/* DESCRIPTION GỌN */}
                      <p className="mt-2 text-zinc-500 text-xs leading-relaxed line-clamp-2 min-h-[36px]">
                        {voucher.description}
                      </p>
                    </div>

                    {/* INFO */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                          Giảm giá
                        </span>
                        <span className="text-red-500 font-black">
                          {Number(voucher.discountValue).toLocaleString()}đ
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                          Đổi điểm
                        </span>
                        <span className="font-black text-white text-sm">
                          {voucher.costPoints} điểm
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                          Đơn tối thiểu
                        </span>
                        <span className="font-bold text-zinc-300 text-xs">
                          {Number(voucher.minOrderAmount).toLocaleString()}đ
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                          HSD
                        </span>
                        <span className="font-bold text-zinc-300 text-xs">
                          {voucher.endDate
                            ? new Date(voucher.endDate).toLocaleDateString("vi-VN")
                            : "Không giới hạn"}
                        </span>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() => redeemVoucher(voucher)}
                      disabled={!canRedeem || alreadyOwned}
                      className={`mt-6 w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                        alreadyOwned
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : canRedeem
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      {alreadyOwned
                        ? "Đã đổi"
                        : canRedeem
                        ? "Đổi ngay"
                        : "Không đủ điểm"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RULES */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="rounded-[2.5rem] border border-red-500/10 bg-gradient-to-br from-red-600/10 to-transparent p-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shrink-0">
              <Coins size={28} />
            </div>

            <div>
              <h3 className="text-3xl font-black uppercase italic">
                Quy tắc tích điểm
              </h3>

              <div className="mt-6 grid md:grid-cols-2 gap-5">
                {[
                  "Mỗi 10.000 VNĐ = 1 điểm thưởng.",
                  "Điểm cộng tự động từ hệ thống.",
                  "Voucher redeem bằng điểm thật.",
                  "Không thể đổi điểm thành tiền.",
                  "Voucher có hạn sử dụng riêng.",
                  "Điểm dùng để đổi ưu đãi hấp dẫn.",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-red-500 mt-0.5 shrink-0"
                    />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOAST */}
      <div
        className={`fixed inset-0 z-[999] flex items-center justify-center transition-all duration-300 ${
          toast.show
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      >
        <div
          className={`relative overflow-hidden min-w-[320px] max-w-[380px] rounded-2xl border backdrop-blur-xl px-6 py-5 ${
            toast.type === "success"
              ? "bg-[#0c1110]/96 border-emerald-500/20"
              : "bg-[#161010]/96 border-red-500/20"
          }`}
        >
          <button
            onClick={() =>
              setToast((prev) => ({
                ...prev,
                show: false,
              }))
            }
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
          >
            <X size={16} />
          </button>

          <div className="relative flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            >
              {toast.type === "success" ? (
                <PartyPopper size={22} />
              ) : (
                <Gift size={20} />
              )}
            </div>

            <div>
              <h4 className="font-black text-lg">
                {toast.type === "success"
                  ? "Thành công"
                  : "Thông báo"}
              </h4>

              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}