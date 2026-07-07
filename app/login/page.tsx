"use client";

import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Film, Loader2, ArrowRight, Clapperboard, Sparkles, MonitorPlay } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { apiRequest } from "../lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Email hoặc mật khẩu không chính xác!");
        return;
      }

      const roles: string[] = result.data.roles || [];
      const token: string = result.data.token;

      if (!roles.length || !token) {
        toast.error("Dữ liệu đăng nhập không hợp lệ!");
        return;
      }

      let tokenKey = "token_user";
      let targetPath = "/";

      if (roles.includes("ROLE_SUPER_ADMIN")) {
        tokenKey = "token_super_admin";
        targetPath = "/super-admin";
      } else if (roles.includes("ROLE_ADMIN")) {
        tokenKey = "token_admin";
        targetPath = "/admin";
      }

      localStorage.setItem(tokenKey, token);
      localStorage.setItem(`${tokenKey}_roles`, JSON.stringify(roles));

      Cookies.set(tokenKey, token, { expires: 7, path: "/" });
      Cookies.set(`${tokenKey}_roles`, JSON.stringify(roles), { expires: 7, path: "/" });

      toast.success(`Đăng nhập thành công (${tokenKey.replace("token_", "")})`);

      setTimeout(() => {
        window.location.href = targetPath;
      }, 800);
    } catch (error) {
      toast.error("Không thể kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex antialiased font-sans text-zinc-200 selection:bg-red-500/20 selection:text-red-200 overflow-hidden">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#18181b', color: '#f4f4f5', border: '1px solid rgba(255,255,255,0.05)' }
        }} 
      />

      {/* ======================================================== */}
      {/* CỘT TRÁI: FORM ĐĂNG NHẬP CYBERPUNK GLOW                  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-28 relative z-10 bg-[#060608]">
        
        {/* Đèn viền hắt sáng (Glow Effect) cực sinh động phía sau Form */}
        <div className="absolute top-[30%] left-[-20%] w-[70%] h-[50%] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        <div className="w-full max-w-sm mx-auto space-y-10 relative z-10">
          
          {/* LOGO & TIÊU ĐỀ */}
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
              <Film size={26} strokeWidth={2} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl font-[1000] italic tracking-tight text-white uppercase">
                HNA<span className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"> CINEMA</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                Hệ thống quản trị trung tâm <Sparkles size={11} className="text-red-400 animate-spin [animation-duration:6s]" />
              </p>
            </div>
          </div>

          {/* FORM ĐIỀN THÔNG TIN */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block pl-1">
                Tài khoản Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors" size={16} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@hna-cinema.com"
                  className="w-full bg-zinc-900/40 hover:bg-zinc-900/80 focus:bg-zinc-950 border border-zinc-800/80 focus:border-red-500/80 rounded-2xl py-4 pl-12 pr-5 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-4 focus:ring-red-500/10 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block pl-1">
                Mật mã bảo mật
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-400 transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/40 hover:bg-zinc-900/80 focus:bg-zinc-950 border border-zinc-800/80 focus:border-red-500/80 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-4 focus:ring-red-500/10 transition-all backdrop-blur-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <button
              disabled={loading}
              className="group w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4 relative overflow-hidden"
            >
              {/* Lớp phản chiếu ánh sáng khi hover nút bấm */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_0.75s_ease-in-out]" />
              
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  Vào hệ thống <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER BẢO MẬT */}
          <p className="text-center text-[10px] text-zinc-600 font-bold tracking-wider uppercase">
            Mã hóa dữ liệu liên kết kết thúc TLS 1.3
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CỘT PHẢI: CINEMATIC GLOW DISPLAY BANNER (Ẩn trên Mobile) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-1 bg-[#09090c] p-8 items-center justify-center relative overflow-hidden border-l border-zinc-900">
        
        {/* Glow neon hắt bóng cực mạnh tạo chiều sâu không gian phòng chiếu */}
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="max-w-md w-full space-y-8 relative z-10 text-center">
          
          {/* HNA Glassmorphism Card */}
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/[0.04] p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] space-y-8 relative overflow-hidden group">
            
            {/* Đèn viền gradient chạy ẩn */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-red-500 flex items-center justify-center mx-auto shadow-xl group-hover:rotate-6 transition-transform duration-500">
              <Clapperboard size={24} strokeWidth={1.8} />
            </div>

            <div className="space-y-3">
              <span className="text-[9px] bg-red-950 border border-red-800/50 text-red-400 font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] inline-block shadow-inner">
                Hệ Thống Rạp Phim 2026
              </span>
              <h3 className="text-white font-black text-2xl tracking-tight leading-snug italic uppercase">
                "Kiến tạo vũ trụ điện ảnh số"
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed px-2">
                Tối ưu hóa quy trình phân phối lịch chiếu trực tuyến, kiểm soát cổng vé tự động và vận hành phòng máy chiếu thông minh hiệu suất cao.
              </p>
            </div>

            {/* Các icon trạng thái giả lập tính năng của admin */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.03] text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.02] flex flex-col items-center gap-1.5">
                <MonitorPlay size={16} className="text-zinc-400" />
                <span>Phòng Vé</span>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.02] flex flex-col items-center gap-1.5">
                <Film size={16} className="text-zinc-400" />
                <span>Lịch Chiếu</span>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/[0.02] flex flex-col items-center gap-1.5">
                <Sparkles size={16} className="text-zinc-400" />
                <span>Báo Cáo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}