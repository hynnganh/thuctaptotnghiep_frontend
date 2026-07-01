"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Loader2,
  Copy,
  History,
  Ticket,
  X,
  CheckCircle2,
  Wallet,
  CalendarDays,
  BadgePercent,
  CircleDollarSign,
} from 'lucide-react';

import { apiRequest } from '@/app/lib/api';

// Hàm helper lọc các voucher còn hạn (hoặc không có HSD)
const isNotExpired = (voucher: any) => {
  if (!voucher.endDate) return true;
  return new Date(voucher.endDate).getTime() >= new Date().getTime();
};

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [marketVouchers, setMarketVouchers] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  const [userInfo, setUserInfo] = useState({
    points: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'market'>('my');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token_user')
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes, voucherRes, marketRes] = await Promise.all([
        apiRequest('/api/v1/users/me', { headers }),
        apiRequest('/api/v1/vouchers/my-vouchers', { headers }),
        apiRequest('/api/v1/vouchers/redeemable', { headers }),
      ]);

      const [u, v, m] = await Promise.all([
        userRes.json(),
        voucherRes.json(),
        marketRes.json(),
      ]);

      setUserInfo({
        points: u.data?.points || 0,
      });

      setVouchers(Array.isArray(v.data) ? v.data : []);
      setMarketVouchers(Array.isArray(m.data) ? m.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenHistory = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token_user')
        : null;

    try {
      const res = await apiRequest('/api/v1/vouchers/point-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      setPointHistory(Array.isArray(json.data) ? json.data : []);
      setIsHistoryOpen(true);
    } catch (e) {
      console.error('Lỗi:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lọc sẵn danh sách hiển thị đã loại bỏ voucher hết hạn
  const validMyVouchers = vouchers.filter(isNotExpired);
  const validMarketVouchers = marketVouchers.filter(isNotExpired);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#101010] to-[#181818] border border-zinc-800 rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-52 h-52 bg-red-600/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-2">
                Ví điểm thành viên
              </p>

              <div className="flex items-end gap-3">
                <Wallet size={38} className="text-red-500 mb-1" />
                <div className="text-5xl font-black text-white tracking-tight">
                  {userInfo.points.toLocaleString()}
                </div>
                <span className="text-lg font-bold text-red-500 mb-1">
                  Điểm
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenHistory}
              className="bg-zinc-900/80 border border-zinc-700 px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-zinc-800 transition"
            >
              <History size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                Lịch sử điểm
              </span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-[#0f0f0f] border border-zinc-800 p-1.5 rounded-2xl mb-6">
          {(['my', 'market'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab === 'my' ? 'Voucher của tôi' : 'Đổi điểm thưởng'}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-red-600" />
            </div>
          ) : activeTab === 'my' ? (
            validMyVouchers.length > 0 ? (
              validMyVouchers.map((v) => <VoucherCard key={v.id} v={v} />)
            ) : (
              <EmptyState />
            )
          ) : validMarketVouchers.length > 0 ? (
            validMarketVouchers.map((v) => {
              const alreadyOwned = vouchers.some(
                (myVoucher) =>
                  myVoucher.id === v.id ||
                  myVoucher.code === v.code ||
                  myVoucher.title === v.title
              );

              return (
                <MarketCard
                  key={v.id}
                  v={v}
                  balance={userInfo.points}
                  onRedeem={fetchData}
                  alreadyOwned={alreadyOwned}
                />
              );
            })
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* HISTORY MODAL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Lịch sử điểm
              </h3>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {pointHistory.length > 0 ? (
                pointHistory.map((h: any) => {
                  const typeStr = String(h.type || '').toUpperCase();
                  
                  const isAddType = typeStr.includes('ADD') || typeStr.includes('EARN') || typeStr.includes('REWARD') || typeStr.includes('REFUND');
                  const isMinusType = typeStr.includes('DEDUCT') || typeStr.includes('USE') || typeStr.includes('REDEEM') || typeStr.includes('SUB');
                  
                  let isPositive = true;
                  if (isAddType) isPositive = true;
                  else if (isMinusType) isPositive = false;
                  else isPositive = Number(h.amount) > 0;

                  const displayAmount = Math.abs(Number(h.amount));

                  return (
                    <div
                      key={h.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {h.description}
                        </p>

                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`text-sm font-black ${
                          isPositive ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {displayAmount}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-zinc-600 text-xs uppercase tracking-widest font-bold">
                  Chưa có lịch sử
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VoucherCard({ v }: { v: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#101010] to-[#161616] border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all duration-300">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 blur-3xl rounded-full" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <Ticket size={28} className="text-red-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black uppercase tracking-wide text-white">
              {v.title}
            </h4>

            {v.voucherType && (
              <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] uppercase tracking-widest font-black text-red-400">
                {v.voucherType}
              </span>
            )}
          </div>

          {v.description && (
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
              {v.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {v.discountValue && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                <CircleDollarSign size={13} className="text-red-500" />
                Giảm{' '}
                <span className="text-red-500">
                  {Number(v.discountValue).toLocaleString()}đ
                </span>
              </div>
            )}

            {v.minOrderAmount && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <BadgePercent size={12} />
                Đơn tối thiểu {Number(v.minOrderAmount).toLocaleString()}đ
              </div>
            )}

            {v.endDate && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <CalendarDays size={12} />
                HSD: {new Date(v.endDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="bg-black/50 border border-zinc-800 px-3 py-2 rounded-xl text-[11px] tracking-[0.25em] font-mono text-zinc-300 uppercase">
              {v.code}
            </div>

            {v.usageLimit !== undefined && (
              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                Còn lại:{' '}
                {Math.max(0, (v.usageLimit || 0) - (v.usedCount || 0))}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition shrink-0"
        >
          {copied ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Copy size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

function MarketCard({
  v,
  balance,
  onRedeem,
  alreadyOwned,
}: {
  v: any;
  balance: number;
  onRedeem: () => void;
  alreadyOwned: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleRedeem = async () => {
    if (alreadyOwned) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token_user');

      await apiRequest(`/api/v1/vouchers/redeem/${v.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onRedeem();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#101010] to-[#161616] border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all duration-300">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 blur-3xl rounded-full" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Ticket size={28} className="text-red-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-black uppercase tracking-wide text-white">
                {v.title}
              </h4>

              {alreadyOwned && (
                <span className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] uppercase tracking-widest font-black text-zinc-400">
                  Đã đổi
                </span>
              )}

              {v.voucherType && (
                <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] uppercase tracking-widest font-black text-red-400">
                  {v.voucherType}
                </span>
              )}
            </div>

            {v.description && (
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                {v.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {v.discountValue && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                  <CircleDollarSign size={13} className="text-red-500" />
                  Giảm{' '}
                  <span className="text-red-500">
                    {Number(v.discountValue).toLocaleString()}đ
                  </span>
                </div>
              )}

              {v.minOrderAmount && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <BadgePercent size={12} />
                  Đơn tối thiểu {Number(v.minOrderAmount).toLocaleString()}đ
                </div>
              )}

              {v.endDate && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <CalendarDays size={12} />
                  HSD: {new Date(v.endDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-black uppercase tracking-widest">
                {v.costPoints} điểm
              </div>

              {v.usageLimit !== undefined && (
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                  Còn lại:{' '}
                  {Math.max(0, (v.usageLimit || 0) - (v.usedCount || 0))}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          disabled={balance < v.costPoints || submitting || alreadyOwned}
          onClick={handleRedeem}
          className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            alreadyOwned
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-20'
          }`}
        >
          {submitting ? '...' : alreadyOwned ? 'Đã đổi' : 'Đổi thưởng'}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5">
        <Ticket size={32} className="text-zinc-700" />
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-zinc-600">
        Không có dữ liệu
      </p>
    </div>
  );
}