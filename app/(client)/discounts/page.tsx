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
  CalendarDays,
  BadgePercent,
  CircleDollarSign,
  Gift,
  Flame
} from 'lucide-react';

import { apiRequest } from '@/app/lib/api';

// Bộ lọc voucher còn thời hạn sử dụng
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

  const validMyVouchers = vouchers.filter(isNotExpired);
  const validMarketVouchers = marketVouchers.filter(isNotExpired);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-700 p-4 md:p-8 no-scrollbar selection:bg-red-600 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* THẺ TÍCH ĐIỂM SANG TRỌNG - TÔNG SÁNG ĐỎ */}
        <div className="relative overflow-hidden bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-zinc-100 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-extrabold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Tài khoản tích điểm chính thức
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-[1000] tracking-tight text-zinc-900 italic">
                  {userInfo.points.toLocaleString()}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-red-600">
                  Điểm thưởng
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenHistory}
              className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 shadow-sm group/btn text-xs font-bold uppercase tracking-widest"
            >
              <History size={15} className="group-hover/btn:rotate-[-15deg] text-red-600 transition-transform" />
              Lịch sử biến động điểm
            </button>
          </div>
        </div>

        {/* THANH CHUYỂN TAB TÔNG SÁNG TINH TẾ */}
        <div className="flex bg-white border border-zinc-200/80 p-1.5 rounded-2xl shadow-sm max-w-md mx-auto">
          {(['my', 'market'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-red-600 text-white shadow-[0_4px_15px_rgba(220,38,38,0.15)] scale-[1.01]'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {tab === 'my' ? 'Ví mã giảm giá của tôi' : 'Cửa hàng đổi quà'}
            </button>
          ))}
        </div>

        {/* DANH SÁCH THẺ VOUCHER BỐ CỤC LƯỚI 2 CỘT MỚI TỐI ƯU KHÔNG GIAN */}
        <div className="relative">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={28} />
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Đang tải dữ liệu...</p>
            </div>
          ) : activeTab === 'my' ? (
            validMyVouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {validMyVouchers.map((v) => <VoucherCard key={v.id} v={v} />)}
              </div>
            ) : (
              <EmptyState message="Ví ưu đãi của bạn đang trống! Hãy tích thêm điểm tại quầy hoặc đặt vé để quy đổi các phần quà hấp dẫn nhé." />
            )
          ) : validMarketVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {validMarketVouchers.map((v) => {
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
              })}
            </div>
          ) : (
            <EmptyState message="Cửa hàng quà tặng hiện tại đã hết suất hoặc đang bảo trì định kỳ." />
          )}
        </div>
      </div>

      {/* CỬA SỔ LỊCH SỬ ĐIỂM THƯỞNG (MODAL TÔNG SÁNG) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[75vh]">
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
              <div className="flex items-center gap-2">
                <History size={16} className="text-red-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">
                  Lịch sử biến động điểm số
                </h3>
              </div>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto pr-1 no-scrollbar relative z-10 flex-1 pb-4">
              {pointHistory.length > 0 ? (
                pointHistory.map((h: any) => {
                  const typeStr = String(h.type || '').toUpperCase();
                  const isAddType = typeStr.includes('ADD') || typeStr.includes('EARN') || typeStr.includes('REWARD') || typeStr.includes('REFUND');
                  const isMinusType = typeStr.includes('DEDUCT') || typeStr.includes('USE') || typeStr.includes('REDEEM') || typeStr.includes('SUB');
                  
                  let isPositive = true;
                  if (isAddType) isPositive = true;
                  else if (isMinusType) isPositive = false;
                  else isPositive = Number(h.amount) > 0;

                  return (
                    <div
                      key={h.id}
                      className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-4 flex items-center justify-between hover:border-zinc-200 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-zinc-800 truncate">
                          {h.description}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">
                          {new Date(h.createdAt).toLocaleDateString('vi-VN')} {new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black font-mono shrink-0 ${
                          isPositive ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'}{Math.abs(Number(h.amount))}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-400 text-[10px] uppercase tracking-widest font-extrabold">
                  Chưa ghi nhận giao dịch biến động nào
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* THÈ VOUCHER CỦA TÔI (BỐ CỤC NGANG - ĐƯỜNG RĂNG CƯA TÔNG SÁNG) */
function VoucherCard({ v }: { v: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 transition-all duration-300 group flex gap-3 shadow-sm hover:shadow-md">
      
      {/* Vết cắt răng cưa cuống vé */}
      <div className="flex flex-col items-center justify-center pr-3 border-r-2 border-dashed border-zinc-100 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-inner">
          <Ticket size={20} className="group-hover:scale-105 transition-transform duration-300" />
        </div>
        {v.voucherType && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-zinc-50 text-[8px] tracking-wider font-black uppercase text-zinc-400 border border-zinc-100">
            {v.voucherType === 'TICKET' ? 'Vé xem' : v.voucherType === 'FOOD' ? 'Đồ ăn' : 'Mã giảm'}
          </span>
        )}
      </div>

      {/* Chi tiết nội dung mã ưu đãi */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wide truncate">
            {v.title}
          </h4>

          {v.description && (
            <p className="text-[10.5px] text-zinc-400 leading-normal line-clamp-2">
              {v.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-[9.5px]">
            {v.discountValue && (
              <div className="flex items-center gap-1 font-extrabold text-red-600">
                <CircleDollarSign size={11} />
                Giảm {Number(v.discountValue).toLocaleString()}đ
              </div>
            )}
            {v.minOrderAmount && (
              <div className="flex items-center gap-1 text-zinc-400">
                <BadgePercent size={11} />
                Đơn từ {Number(v.minOrderAmount).toLocaleString()}đ
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-zinc-50">
            <div className="bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold tracking-wider text-zinc-600 select-all group-hover:border-red-200 transition-colors">
              {v.code}
            </div>
            {v.endDate && (
              <div className="flex items-center gap-0.5 text-[9px] text-zinc-400 font-mono">
                <CalendarDays size={10} />
                HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nút Sao chép (Copy) */}
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition-all shrink-0 self-center group/copy shadow-sm"
      >
        {copied ? (
          <CheckCircle2 size={14} className="text-emerald-600" />
        ) : (
          <Copy size={13} className="group-hover/copy:scale-105 transition-transform" />
        )}
      </button>
    </div>
  );
}

/* THÈ ĐỔI ĐIỂM THƯỞNG (MARKET) CHIA THEO GRID LƯỚI */
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
  const canAfford = balance >= v.costPoints;

  const handleRedeem = async () => {
    if (alreadyOwned || !canAfford) return;

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
    <div className="relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-4 transition-all duration-300 group flex gap-3 shadow-sm hover:shadow-md">
      
      {/* Cuống quà tặng vật phẩm */}
      <div className="flex flex-col items-center justify-center pr-3 border-r-2 border-dashed border-zinc-100 shrink-0">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-inner ${
          alreadyOwned ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          <Gift size={18} />
        </div>
        {alreadyOwned && (
          <span className="mt-2 px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-[8px] font-black uppercase tracking-wider text-zinc-400">
            Đã có
          </span>
        )}
      </div>

      {/* Chi tiết vật phẩm trao đổi */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wide truncate">
            {v.title}
          </h4>

          {v.description && (
            <p className="text-[10.5px] text-zinc-400 leading-normal line-clamp-2">
              {v.description}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
              <Flame size={11} className="fill-red-600/10" />
              {v.costPoints.toLocaleString()} Điểm
            </div>
            {v.usageLimit !== undefined && (
              <p className="text-[8.5px] uppercase tracking-widest text-zinc-400 font-bold">
                Còn lại {Math.max(0, (v.usageLimit || 0) - (v.usedCount || 0))} suất đổi
              </p>
            )}
          </div>

          {/* Nút thao tác đổi quà */}
          <button
            disabled={!canAfford || submitting || alreadyOwned}
            onClick={handleRedeem}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-[9.5px] font-black uppercase tracking-widest transition-all duration-300 border ${
              alreadyOwned
                ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                : !canAfford
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white border-transparent active:scale-95 shadow-sm'
            }`}
          >
            {submitting ? '...' : alreadyOwned ? 'Đã sở hữu' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* KHÔNG CÓ DỮ LIỆU */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-300 shadow-sm">
        <Ticket size={20} className="stroke-[1.5]" />
      </div>
      <p className="text-xs font-medium text-zinc-400 leading-relaxed px-4">
        {message}
      </p>
    </div>
  );
}