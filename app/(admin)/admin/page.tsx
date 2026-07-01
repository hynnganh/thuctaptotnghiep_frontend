"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Ticket,
  Film,
  TrendingUp,
  Loader2,
  BarChart3,
  Download,
  RefreshCw,
  Sparkles,
  CalendarDays,
  Gift,
  Layers,
  Percent,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { apiAdminRequest } from "@/app/lib/api";

/* ================= TYPES ================= */
interface DashboardStats {
  todayRevenue: number;
  todayTickets: number;
  todayShowtimes: number;
  occupancy: number;
}

interface ChartItem {
  day: string;
  revenue: number;
}

interface ComboReport {
  comboId: number;
  comboName: string;
  totalQuantity: number;
  totalRevenue: number;
}

/* ================= ĐỊNH DẠNG TIỀN TỆ VNĐ ================= */
const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

/* ================= TRANG CHÍNH ================= */
export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState<number>(10); // 🔥 Thêm state quản lý mức thuế suất (mặc định 10%)

  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayTickets: 0,
    todayShowtimes: 0,
    occupancy: 0,
  });

  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [comboReport, setComboReport] = useState<ComboReport[]>([]);

  /* ================= 1. TẢI THÔNG TIN TÀI KHOẢN ADMIN ================= */
  const fetchMe = async () => {
    try {
      const res = await apiAdminRequest("/api/v1/users/me");
      if (!res.ok) return;
      const json = await res.json();
      const id = json?.data?.managedCinemaItemId;
      if (id) setCinemaId(Number(id));
    } catch (err) {
      console.error("❌ Lỗi cấu hình tài khoản:", err);
    }
  };

  /* ================= 2. TẢI DỮ LIỆU BÁO CÁO TỔNG HỢP ================= */
  const fetchDashboard = async (cid: number) => {
    try {
      setLoading(true);
      const query = `?cinemaId=${cid}`;

      const [dashRes, chartRes, comboRes] = await Promise.all([
        apiAdminRequest(`/api/v1/reports/dashboard${query}`),
        apiAdminRequest(`/api/v1/reports/revenue-7days${query}`),
        apiAdminRequest(`/api/v1/reports/combo-best-selling${query}`),
      ]);

      if (dashRes.ok) setStats(await dashRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (comboRes.ok) setComboReport(await comboRes.json());
    } catch (err) {
      console.error("❌ Lỗi tải hệ thống số liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const format = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
    return { start: format(start), end: format(end) };
  };

  /* ================= 3. TRÍCH XUẤT EXCEL HÔM NAY ================= */
  const exportExcel = async () => {
    if (!cinemaId) return;
    try {
      setExporting(true);
      const range = getTodayRange();
      
      // 🔥 Gửi kèm param taxRate lên Backend xử lý tính toán động
      const query = new URLSearchParams({
        cinemaId: String(cinemaId),
        start: range.start,
        end: range.end,
        taxRate: String(taxRate), 
      });

      const res = await apiAdminRequest(`/api/v1/reports/download?${query}`);
      if (!res.ok) return;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-doanh-thu-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Lỗi xuất tệp Excel:", err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (cinemaId !== null) fetchDashboard(cinemaId);
  }, [cinemaId]);

  return (
    <div className="min-h-screen bg-[#060608] p-4 sm:p-8 md:p-10 text-zinc-400 font-sans antialiased relative overflow-hidden selection:bg-rose-500/30 selection:text-rose-300">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-rose-950/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] bg-emerald-950/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">

        {/* ================= THANH TIÊU ĐỀ CHÍNH (HEADER) ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-[11px] font-black uppercase tracking-[0.2em] mb-1.5">
              <Sparkles size={12} className="animate-pulse" /> Live Monitoring Center
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Thống kê & Báo cáo
            </h1>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
              Chi nhánh quản lý: 
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 font-mono font-bold text-zinc-300">
                #{cinemaId ?? "---"}
              </span>
            </p>
          </div>

{/* ================= NHÓM TÁC VỤ ĐIỀU KHIỂN & Ô NHẬP THUẾ ĐỘNG ================= */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* KHUNG NHẬP THUẾ SUẤT - MINI & CLEAN */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#0c0c10] px-4 h-[46px] shadow-md group/tax transition-all duration-300 hover:border-zinc-700/80">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Percent size={13} className="text-zinc-500 group-hover/tax:text-rose-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Thuế suất
                </span>
              </div>
              
              <div className="flex items-center gap-0.5 border-b border-zinc-800 focus-within:border-rose-500/50 pb-0.5 transition-all">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="bg-transparent text-white font-mono font-bold text-sm outline-none w-8 text-center border-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-zinc-600 font-mono select-none">%</span>
              </div>
            </div>

            {/* NÚT XUẤT EXCEL */}
            <button
              onClick={exportExcel}
              disabled={!cinemaId || exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-[46px] rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-bold uppercase tracking-wider text-rose-400 transition-all duration-300 hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-40 shadow-lg"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Đang trích xuất..." : "Xuất file Excel"}
            </button>

            {/* NÚT LÀM MỚI DỮ LIỆU */}
            <button
              onClick={() => cinemaId && fetchDashboard(cinemaId)}
              className="group flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#0c0c10] px-5 h-[46px] text-xs font-bold uppercase tracking-wider text-zinc-300 transition-all duration-300 hover:border-zinc-700 hover:text-white active:scale-95 shadow-md"
            >
              <RefreshCw size={14} className={`transition-transform duration-700 ${loading ? "animate-spin text-rose-500" : "group-hover:rotate-180"}`} />
              Làm mới dữ liệu
            </button>
          </div>
        </div>

        {/* ================= TRẠNG THÁI LOADING ================= */}
        {loading ? (
          <div className="flex h-[55vh] flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-900 border-t-rose-500 animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 animate-pulse">
              Đang đồng bộ dữ liệu rạp thời gian thực...
            </span>
          </div>
        ) : (
          <>
            {/* ================= KHỐI THẺ CHỈ SỐ CAO CẤP ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatCard title="Doanh thu ngày hôm nay" value={formatVND(stats.todayRevenue)} icon={<DollarSign size={18} />} theme="rose" />
              <StatCard title="Tổng lượng vé đã bán hôm nay" value={`${(stats.todayTickets || 0).toLocaleString()} vé`} icon={<Ticket size={18} />} theme="blue" />
              <StatCard title="Suất chiếu đang vận hành" value={`${stats.todayShowtimes} suất`} icon={<Film size={18} />} theme="amber" />
              <StatCard title="Tỷ lệ lấp đầy ghế rạp" value={`${(stats.occupancy || 0).toFixed(0)}%`} icon={<TrendingUp size={18} />} theme="emerald" />
            </div>

            {/* ================= KHỐI CẤU TRÚC BIỂU ĐỒ DOANH THU ================= */}
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0c0c10]/60 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
              
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/40 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Phân tích xu hướng doanh thu
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Biến động chu kỳ lịch sử 7 ngày gần nhất</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-500 self-start sm:self-auto">
                  Đơn vị hiển thị: VNĐ
                </span>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 5, top: 10 }}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#15151a" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      cursor={{ stroke: "#27272a", strokeWidth: 1 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-zinc-800 bg-[#0c0c10]/95 backdrop-blur-md p-4 shadow-2xl min-w-[160px]">
                            <div className="mb-2 flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                              <CalendarDays size={11} className="text-rose-500" />
                              <span>{label}</span>
                            </div>
                            <p className="font-extrabold text-white text-base">{formatVND(Number(payload[0].value))}</p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f43f5e" fill="url(#chartGlow)" strokeWidth={3} dot={{ r: 4, fill: "#060608", stroke: "#f43f5e", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#fff", stroke: "#e11d48", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ================= KHỐI DANH SÁCH COMBO BÁN CHẠY ================= */}
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0c0c10]/60 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

              <div className="mb-6 flex items-center justify-between border-b border-zinc-800/40 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                    <Gift size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Bảng xếp hạng Combo bán chạy hôm nay
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Thống kê dịch vụ quầy bắp nước thời gian thực</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-md">
                  <Layers size={10} /> Đang hoạt động
                </div>
              </div>

              {comboReport.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-600 gap-2">
                  <Gift size={28} className="stroke-[1.5]" />
                  <span className="text-xs font-medium">Hôm nay chưa phát sinh giao dịch quầy Combo</span>
                </div>
              ) : (
                <div className="overflow-x-auto w-full rounded-xl border border-zinc-800/50 bg-[#08080b]">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80">
                        <th className="text-left p-4 pl-6">Tên vật phẩm Combo</th>
                        <th className="text-center p-4 w-32">Số lượng bán</th>
                        <th className="text-right p-4 pr-6 w-44">Tổng doanh thu quầy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {comboReport.map((c, index) => (
                        <tr 
                          key={c.comboId} 
                          className="hover:bg-zinc-900/30 transition-colors group/row"
                        >
                          <td className="p-4 pl-6 font-semibold text-zinc-200 group-hover/row:text-white transition-colors flex items-center gap-3">
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 group-hover/row:border-zinc-700 group-hover/row:text-zinc-400">
                              {index + 1}
                            </span>
                            {c.comboName}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-300">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs">
                              {c.totalQuantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-400 font-mono pr-6">
                            {formatVND(c.totalRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENT CON: THẺ CHỈ SỐ CAO CẤP ================= */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  theme: "rose" | "blue" | "amber" | "emerald";
}

function StatCard({ title, value, icon, theme }: StatCardProps) {
  const themeMap = {
    rose: {
      border: "hover:border-rose-500/30",
      bg: "bg-gradient-to-br from-[#0c0c10] to-[#1a0f12]",
      icon: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      text: "text-white"
    },
    blue: {
      border: "hover:border-blue-500/30",
      bg: "bg-gradient-to-br from-[#0c0c10] to-[#0f141c]",
      icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      text: "text-zinc-100"
    },
    amber: {
      border: "hover:border-amber-500/30",
      bg: "bg-gradient-to-br from-[#0c0c10] to-[#1c160f]",
      icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      text: "text-zinc-100"
    },
    emerald: {
      border: "hover:border-emerald-500/30",
      bg: "bg-gradient-to-br from-[#0c0c10] to-[#0f1c14]",
      icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      text: "text-emerald-400"
    }
  };

  const currentTheme = themeMap[theme];

  return (
    <div className={`rounded-2xl border border-zinc-800/70 p-6 flex flex-col justify-between min-h-[135px] transition-all duration-300 hover:-translate-y-1 shadow-lg group relative overflow-hidden ${currentTheme.bg} ${currentTheme.border}`}>
      <div className="flex items-start justify-between gap-4 relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {title}
        </p>
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${currentTheme.icon}`}>
          {icon}
        </div>
      </div>
      <h3 className={`text-2xl font-black tracking-tight mt-4 truncate relative z-10 ${currentTheme.text}`}>
        {value}
      </h3>
    </div>
  );
}