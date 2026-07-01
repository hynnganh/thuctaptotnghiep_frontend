"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Ticket,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  Lock,
  Gift,
  Sparkles,
  Coins,
} from "lucide-react";

import { apiSuperAdminRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import VoucherModal from "./VoucherModal";

export interface Voucher {
  id: number;
  code: string;
  title: string;
  description?: string;
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  endDate: string;
  voucherType: "EVENT" | "REDEEM";
  costPoints?: number;
  promotion?: {
    id: number;
    title: string;
  };
}

interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  points?: number;
  roles?: any[];
}

export default function AdminVoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state để quản lý thông báo lỗi dưới ô nhập điểm
  const [rewardForm, setRewardForm] = useState({
    email: "",
    points: 0,
  });
  const [rewardError, setRewardError] = useState("");

  useEffect(() => {
    fetchVouchers();
    fetchUsers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await apiSuperAdminRequest("/api/v1/vouchers");
      if (!res.ok) {
        toast.error("Không thể tải danh sách voucher");
        return;
      }
      const json = await res.json();
      setVouchers(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      toast.error("Lỗi kết nối database");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiSuperAdminRequest("/api/v1/users");
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Không tải được users");
        return;
      }

      const rawUsers = result?.data?.content || [];
      const filteredUsers = rawUsers.filter((user: any) => {
        if (!Array.isArray(user.roles)) return false;
        return user.roles.some((role: any) => {
          const roleName = role?.name || role?.roleName || role?.authority || role;
          return String(roleName).toUpperCase() === "ROLE_USER";
        });
      });

      setUsers(filteredUsers);
    } catch (error) {
      toast.error("Lỗi tải danh sách user");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenModal = (voucher: Voucher | null = null) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const method = selectedVoucher ? "PUT" : "POST";
      const url = selectedVoucher
        ? `/api/v1/vouchers/${selectedVoucher.id}`
        : "/api/v1/vouchers";

      const res = await apiSuperAdminRequest(url, {
        method,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setTimeout(() => {
          fetchVouchers();
        }, 300);
      }

      return res;
    } catch (error) {
      console.error("Lỗi kết nối hệ thống:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;
    if (selectedVoucher.usedCount > 0) {
      toast.error("Voucher đã được sử dụng, không thể xóa");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiSuperAdminRequest(
        `/api/v1/vouchers/${selectedVoucher.id}`,
        { method: "DELETE" }
      );
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Không thể xóa");
        return;
      }

      toast.success("Đã xóa voucher");
      fetchVouchers();
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRewardPoints = async () => {
    if (!rewardForm.email) {
      toast.error("Vui lòng chọn user");
      return;
    }
    
    // Kiểm tra chặn nếu điểm không hợp lệ
    if (rewardForm.points <= 0) {
      setRewardError("Số điểm thưởng phải lớn hơn 0");
      toast.error("Số điểm phải lớn hơn 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiSuperAdminRequest("/api/v1/vouchers/reward-points", {
        method: "POST",
        body: JSON.stringify(rewardForm),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Tặng điểm thất bại");
        return;
      }

      toast.success("Đã tặng điểm thành công");
      setRewardForm({ email: "", points: 0 });
      setRewardError("");
      setUserSearch("");
      setIsRewardModalOpen(false);
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const filteredVouchers = vouchers.filter((v) => {
    const keyword =
      v.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === "ALL" || v.voucherType === filterType;
    return keyword && typeMatch;
  });

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.toLowerCase().trim();
    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = user.email?.toLowerCase() || "";
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [users, userSearch]);

  const getVoucherTypeBadge = (voucher: Voucher) => {
    if (voucher.voucherType === "REDEEM") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] font-black uppercase tracking-wider">
          <Gift size={10} /> Đổi điểm
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-wider">
        <Sparkles size={10} /> Sự kiện
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-4 md:p-6 font-sans tracking-tight select-none">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 border border-red-600/20 rounded-lg text-red-600">
              <Ticket size={16} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg font-black uppercase tracking-tight text-white leading-none">
                Trung tâm <span className="text-red-600">Voucher</span>
              </h1>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                Quản lý voucher sự kiện & voucher đổi điểm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="h-9 bg-yellow-500 hover:bg-yellow-400 text-black px-4 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Gift size={13} /> Tặng điểm
            </button>
            <button
              onClick={() => handleOpenModal(null)}
              className="h-9 bg-red-600 hover:bg-red-500 text-white px-4 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus size={13} /> Tạo mới
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
            <input
              type="text"
              placeholder="TÌM KIẾM MÃ VOUCHER..."
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 pl-11 text-[10px] font-black tracking-wider outline-none focus:border-zinc-800 placeholder:text-zinc-700 text-white uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-zinc-800"
          >
            <option value="ALL">Tất cả voucher</option>
            <option value="EVENT">Voucher sự kiện</option>
            <option value="REDEEM">Voucher đổi điểm</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden relative min-h-[400px] shadow-sm">
          {loading && (
            <div className="absolute inset-0 bg-[#020202]/80 z-10 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="animate-spin text-red-600" size={24} />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-900 text-[9px] font-black uppercase text-zinc-600 tracking-wider">
                  <th className="py-3.5 px-6">Voucher</th>
                  <th className="py-3.5 px-4">Loại</th>
                  <th className="py-3.5 px-4">Giảm giá</th>
                  <th className="py-3.5 px-4">Đổi điểm</th>
                  <th className="py-3.5 px-4">Sử dụng</th>
                  <th className="py-3.5 px-4">Hết hạn</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/30 text-[11px]">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-950/40 group transition-all">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-700">
                          <Hash size={12} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black tracking-tight text-zinc-200 uppercase">#{v.code}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase">{v.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getVoucherTypeBadge(v)}</td>
                    <td className="py-3 px-4 font-black text-zinc-200 tracking-tight">
                      {v.discountValue < 100 ? `-${v.discountValue}%` : `-${formatCurrency(v.discountValue)}`}
                    </td>
                    <td className="py-3 px-4">
                      {v.voucherType === "REDEEM" ? (
                        <span className="text-yellow-400 font-black">{v.costPoints || 0} điểm</span>
                      ) : (
                        <span className="text-zinc-700">---</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{v.usedCount}/{v.usageLimit}</td>
                    <td className="py-3 px-4 text-zinc-400 text-[10px] font-semibold">{formatDate(v.endDate)}</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(v)}
                          className="w-7 h-7 inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 hover:text-white rounded-lg"
                        >
                          <Edit3 size={12} />
                        </button>
                        {v.usedCount > 0 ? (
                          <button disabled className="w-7 h-7 inline-flex items-center justify-center bg-zinc-950 border border-zinc-900/40 text-zinc-800 rounded-lg cursor-not-allowed">
                            <Lock size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedVoucher(v);
                              setDeleteModalOpen(true);
                            }}
                            className="w-7 h-7 inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[9px] font-black uppercase text-zinc-600 tracking-widest">
                      Không tìm thấy voucher phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedVoucher}
        isSubmitting={isSubmitting}
      />

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-[#060608] border border-zinc-900 p-6 rounded-xl max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-black text-white text-center uppercase tracking-tight">Xác nhận xóa voucher?</h3>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-lg bg-zinc-950 border border-zinc-900">Hủy</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white">
                {isSubmitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REWARD MODAL */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => {
            setIsRewardModalOpen(false);
            setRewardError(""); // Reset lỗi khi đóng modal
          }} />
          <div className="relative bg-[#060608] border border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_-12px_rgba(234,179,8,0.2)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-400 mb-4">
                <Gift size={32} />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Tặng Điểm Thưởng</h2>
              <p className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Cộng điểm trực tiếp cho tài khoản</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Chọn người dùng</label>
                <div className="relative group">
                  <Search size={14} className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc email..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-yellow-500/50 transition-all"
                  />
                </div>
                <select
                  value={rewardForm.email}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl text-white font-bold text-sm outline-none focus:border-yellow-500/50 transition-all appearance-none"
                >
                  <option value="">{loadingUsers ? "Đang tải..." : "Chọn từ danh sách kết quả"}</option>
                  {filteredUsers.map((user) => (
                    <option key={user.userId} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Ô NHẬP ĐIỂM + CẢNH BÁO LỖI TRỰC TIẾP */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Số điểm cộng</label>
                <div className="relative">
                  <Coins size={14} className="absolute left-4 top-4 text-zinc-600" />
                  <input
                    type="number"
                    min={1}
                    value={rewardForm.points || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRewardForm(prev => ({ ...prev, points: val }));
                      // Kiểm tra trực tiếp khi người dùng gõ phím
                      if (val <= 0) {
                        setRewardError("Số điểm thưởng phải lớn hơn 0");
                      } else {
                        setRewardError("");
                      }
                    }}
                    placeholder="Nhập số điểm..."
                    // Nếu có lỗi, đổi viền sang màu đỏ (border-red-500/50)
                    className={`w-full bg-zinc-900 border ${rewardError ? "border-red-500/50" : "border-zinc-800"} p-3.5 pl-11 rounded-2xl text-white font-bold outline-none focus:border-yellow-500/50 transition-all`}
                  />
                </div>
                {/* Dòng hiển thị lỗi dưới ô nhập điểm */}
                {rewardError && (
                  <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wide px-1 mt-1 animate-pulse">
                    <AlertCircle size={12} />
                    <span>{rewardError}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleRewardPoints}
                disabled={isSubmitting || !!rewardError}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Xác nhận cộng điểm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}