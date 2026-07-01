"use client";

import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Film, Loader2, ArrowRight, Ticket } from "lucide-react";
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

      /* ==============================
         ✅ XÁC ĐỊNH ROLE
      ============================== */

      let tokenKey = "token_user";
      let targetPath = "/";

      if (roles.includes("ROLE_SUPER_ADMIN")) {
        tokenKey = "token_super_admin";
        targetPath = "/super-admin";
      } else if (roles.includes("ROLE_ADMIN")) {
        tokenKey = "token_admin";
        targetPath = "/admin";
      }

      /* ==============================
         ✅ LƯU TOKEN (KHÔNG ĐỤNG ROLE KHÁC)
      ============================== */

      // LocalStorage (client)
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(`${tokenKey}_roles`, JSON.stringify(roles));

      // Cookie (middleware)
      Cookies.set(tokenKey, token, {
        expires: 7,
        path: "/",
      });

      Cookies.set(`${tokenKey}_roles`, JSON.stringify(roles), {
        expires: 7,
        path: "/",
      });

      /* ==============================
         ✅ REDIRECT
      ============================== */

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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />

      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
            <Film size={48} className="text-red-600" />
          </div>

          <h1 className="text-5xl font-[1000] italic text-white">
            A&K<span className="text-red-600"> CINEMA</span>
          </h1>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <Ticket className="absolute -right-12 -top-12 text-white/[0.02]" size={240} />

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* EMAIL */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                Tài khoản
              </label>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                Mật khẩu
              </label>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Truy cập <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}