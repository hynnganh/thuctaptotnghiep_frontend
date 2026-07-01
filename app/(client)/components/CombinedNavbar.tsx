"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { 
  User, Ticket, Settings, CreditCard, LogOut, Tags,
  ChevronDown, ShieldCheck, Loader2, Menu, X, ChevronRight, ShoppingBag
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { getTokenByRole, RoleType } from "../../lib/auth";
import LiveSearchBar from "../components/home/LiveSearchBar";

export default function SingleRowNavbar() {
  // --- LOGIC AUTH & PROFILE ---
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const getCurrentRole = useCallback((): RoleType => {
    if (pathname.startsWith("/super-admin")) return "SUPER_ADMIN";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "USER";
  }, [pathname]);

  const handleClearAuth = useCallback((role: RoleType) => {
    const tokenKey = role === "SUPER_ADMIN" ? "token_super_admin" : role === "ADMIN" ? "token_admin" : "token_user";
    localStorage.removeItem(tokenKey);
    Cookies.remove(tokenKey, { path: '/' });
    localStorage.removeItem(`user_info_${role.toLowerCase()}`);
    setUser(null);
  }, []);

  const fetchLatestProfile = useCallback(async () => {
    const role = getCurrentRole();
    const token = getTokenByRole(role);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/api/v1/users/me', { method: "GET" }, role);
      if (res.ok) {
        const result = await res.json();
        const rawData = result.data?.user || result.data || result;
        const accountRoles: string[] = rawData?.roles?.map((r: any) => r.roleName || r) || [];
        
        if (role === "USER" && !accountRoles.includes("ROLE_USER") && !accountRoles.includes("USER")) {
          setUser(null);
        } else {
          setUser(rawData);
          localStorage.setItem(`user_info_${role.toLowerCase()}`, JSON.stringify(rawData));
        }
      } else {
        handleClearAuth(role);
      }
    } catch (err) {
      const stored = localStorage.getItem(`user_info_${role.toLowerCase()}`);
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, [getCurrentRole, handleClearAuth]);

  useEffect(() => {
    fetchLatestProfile();
    const handleAuthChange = () => fetchLatestProfile();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [fetchLatestProfile]);

  const handleLogout = () => {
    const currentRole = getCurrentRole();
    handleClearAuth(currentRole);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = (currentRole === "SUPER_ADMIN" || currentRole === "ADMIN") ? "/auth" : "/";
  };

  const isSuperAdmin = user?.roles?.some((r: any) => ["ROLE_SUPER_ADMIN", "SUPER_ADMIN"].includes(r.roleName || r));
  const isAdmin = user?.roles?.some((r: any) => ["ROLE_ADMIN", "ADMIN"].includes(r.roleName || r));

  // --- UI STATES ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      title: "PHIM",
      href: "/movies",
      submenu: [
        { name: "Phim Đang Chiếu", href: "/movies/now" },
        { name: "Phim Sắp Chiếu", href: "/movies/coming" },
      ],
    },
    {
      title: "RẠP HNA",
      submenu: [
        { name: "Tất Cả Các Rạp", href: "/cinema" },
        { name: "Rạp Đặc Biệt (Gold Class)", href: "/cinema/special" },
        { name: "Rạp 3D / Công Nghệ Mới", href: "/cinema/3d" },
      ],
    },
    {
      title: "THÀNH VIÊN",
      submenu: [
        { name: "Tài Khoản Của Tôi", href: "/profile" },
        { name: "Quyền Lợi Thành Viên", href: "/membership" },
      ],
    },
    { title: "SỰ KIỆN", href: "/events" },
    { title: "COMBO", href: "/combos" },
  ];

  return (
    <>
      {/* KHỐI ĐỆM GIỮ CHỖ (FIX LỖI ĐÈ NỀN): Chiếm diện tích bằng đúng Navbar để đẩy nội dung trang xuống */}
      <div className="h-[72px] md:h-[80px] bg-black w-full" />

      {/* FIXED NAVBAR CHẠY TRÊN 1 HÀNG */}
      <div className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 bg-black/95 border-b ${isScrolled ? "border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3.5" : "border-white/5 py-4 md:py-5"}`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-8 lg:px-10 gap-4">
          
          {/* CỤM TRÁI: LOGO */}
<div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-1 group no-underline select-none">
              <div className="flex flex-col items-start leading-none">
                {/* Chữ HNA cách điệu với Gradient Đỏ - Trắng bạc */}
                <span className="text-2xl md:text-3xl font-[1000] tracking-tighter italic bg-gradient-to-r from-red-600 via-red-500 to-white bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                  HNA
                </span>
                {/* Chữ CINEMA nhỏ tinh tế bo đều phía dưới */}
                <span className="text-[7px] md:text-[8px] text-zinc-400 font-black tracking-[0.38em] uppercase mt-0.5 ml-0.5 transition-colors group-hover:text-red-500">
                  Cinema
                </span>
              </div>
            </Link>
          </div>

          {/* CỤM GIỮA: NAV MENU */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-5 mx-2">
            {navItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              return (
                <div key={item.title} className="relative group/menu">
                  {hasSubmenu ? (
                    <>
                      <div className="flex items-center gap-1 text-[11px] xl:text-xs font-black text-zinc-300 hover:text-white transition-all tracking-[0.15em] uppercase px-3 py-2 cursor-pointer rounded-xl hover:bg-white/5">
                        {item.title}
                        <ChevronDown size={12} className="group-hover/menu:rotate-180 transition-transform duration-300 text-red-600" />
                      </div>
                      {/* Submenu Dropdown */}
                      <div className="absolute top-full left-0 pt-3 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0 z-[110]">
                        <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[220px]">
                          <div className="flex flex-col gap-3">
                            {item.submenu.map((sub) => (
                              <Link key={sub.name} href={sub.href} className="text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:translate-x-1.5 transition-all duration-200 uppercase tracking-widest flex items-center gap-2.5 group/item no-underline">
                                <div className="w-1 h-1 bg-red-600 rounded-full scale-0 group-hover/item:scale-100 transition-transform" />
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link href={item.href || "#"} className="flex items-center text-[11px] xl:text-xs font-black text-zinc-300 hover:text-white transition-all tracking-[0.15em] uppercase px-3 py-2 rounded-xl hover:bg-white/5 no-underline">
                      {item.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CỤM PHẢI: SEARCH + PROFILE / AUTH */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 max-w-lg lg:flex-1">
            <div className="w-full max-w-[180px] xl:max-w-[240px] hidden sm:block">
              <LiveSearchBar />
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-4 h-8">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-red-600" />
              ) : user ? (
                <div className="relative group flex items-center h-full">
                  <div className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="w-8 h-8 bg-zinc-900 border border-white/15 rounded-xl overflow-hidden group-hover:border-red-600 transition-all shadow-lg shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-zinc-800">
                          <span className="text-xs font-black">{user.firstName?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <span className="hidden md:inline-block text-[11px] font-black text-zinc-200 group-hover:text-red-500 max-w-[80px] truncate uppercase tracking-wider italic">
                      {user.firstName}
                    </span>
                    <ChevronDown size={12} className="hidden md:block text-zinc-500 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-300" />
                  </div>

                  {/* ─── DROPDOWN HOÀN CHỈNH ĐỦ ĐIỀU KIỆN ĐỦ 4 MỤC ─── */}
                  <div className="absolute right-0 top-[100%] pt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[110]">
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                        <p className="text-[9px] font-black text-zinc-400 truncate uppercase italic">{user.lastName} {user.firstName}</p>
                      </div>
                      
                      <div className="p-1.5 space-y-0.5">
                        {/* 1. TÀI KHOẢN */}
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group/item transition-colors no-underline">
                          <Settings size={14} className="text-zinc-400 group-hover/item:text-red-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Tài khoản</span>
                        </Link>

                        {/* 2. VÉ CỦA TÔI */}
                        <Link href="/ticket" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group/item transition-colors no-underline">
                          <Ticket size={14} className="text-zinc-400 group-hover/item:text-red-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Vé của tôi</span>
                        </Link>

                        {/* 3. MÃ GIẢM GIÁ */}
                        <Link href="/discounts" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group/item transition-colors no-underline">
                          <Tags size={14} className="text-zinc-400 group-hover/item:text-red-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Mã giảm giá</span>
                        </Link>

                        {/* 4. ĐƠN HÀNG */}
                        <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group/item transition-colors no-underline">
                          <ShoppingBag size={14} className="text-zinc-400 group-hover/item:text-red-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Đơn hàng</span>
                        </Link>

                        {/* ADMIN DASHBOARD (NẾU CÓ) */}
                        {(isAdmin || isSuperAdmin) && (
                          <Link href={isSuperAdmin ? "/super-admin" : "/admin"} className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl bg-red-600/10 border border-red-600/10 hover:bg-red-600 group/admin transition-all no-underline">
                            <ShieldCheck size={14} className="text-red-500 group-hover/admin:text-white" />
                            <span className="text-[10px] font-black text-red-500 group-hover/admin:text-white uppercase tracking-widest">Quản trị</span>
                          </Link>
                        )}
                      </div>

                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all border-t border-white/5 font-black text-[9px] uppercase tracking-wider">
                        <LogOut size={12} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/auth" className="flex items-center gap-2 text-zinc-300 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-widest no-underline">
                  <User size={14} className="text-red-600" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shrink-0">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsMobileMenuOpen(false)} />
      <div className={`fixed top-0 right-0 h-screen w-[280px] bg-zinc-950 border-l border-white/10 z-[210] lg:hidden transform transition-transform duration-500 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <span className="text-xl font-[1000] text-red-600 tracking-tighter italic">A<span className="text-white">&</span>K</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 bg-white/5 rounded-xl text-zinc-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="sm:hidden pb-4 mb-2 border-b border-white/5">
            <LiveSearchBar />
          </div>
          {user && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl mb-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
                {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-red-500">{user.firstName?.charAt(0)}</div>}
              </div>
              <span className="text-xs font-black text-zinc-200 truncate uppercase">{user.lastName} {user.firstName}</span>
            </div>
          )}
          
          {navItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            return (
              <div key={item.title} className="border-b border-white/5 last:border-0">
                {hasSubmenu ? (
                  <div>
                    <button onClick={() => setMobileExpandedItem(mobileExpandedItem === item.title ? null : item.title)} className="w-full flex justify-between items-center py-3 text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                      {item.title}
                      <ChevronDown size={14} className={`transition-transform ${mobileExpandedItem === item.title ? "rotate-180 text-red-500" : "text-zinc-600"}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedItem === item.title ? "max-h-[200px] pb-3" : "max-h-0"}`}>
                      <div className="flex flex-col gap-2.5 pl-3 border-l border-zinc-800 ml-1">
                        {item.submenu.map((sub) => (
                          <Link key={sub.name} href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 no-underline">
                            <ChevronRight size={10} className="text-zinc-700" /> {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={item.href || "#"} onClick={() => setIsMobileMenuOpen(false)} className="w-full flex justify-between items-center py-3 text-[11px] font-black text-zinc-300 uppercase tracking-wider no-underline">
                    {item.title}
                    <ChevronRight size={12} className="text-zinc-700" />
                  </Link>
                )}
              </div>
            );
          })}
          
          {/* MOBILE USER EXPANDED */}
          {user && (
            <div className="pt-4 space-y-1">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-400 text-[10px] uppercase font-bold no-underline"><Settings size={13}/> Tài khoản</Link>
              <Link href="/ticket" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-400 text-[10px] uppercase font-bold no-underline"><Ticket size={13}/> Vé của tôi</Link>
              <Link href="/discounts" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-400 text-[10px] uppercase font-bold no-underline"><Tags size={13}/> Mã giảm giá</Link>
              <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-400 text-[10px] uppercase font-bold no-underline"><ShoppingBag size={13}/> Đơn hàng</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 mt-4 text-red-500 font-black text-[10px] uppercase bg-red-600/5 px-3 rounded-xl border border-red-600/10"><LogOut size={13}/> Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}