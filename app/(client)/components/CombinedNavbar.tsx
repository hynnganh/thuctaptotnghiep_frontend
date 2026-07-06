"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { 
  User, Ticket, Settings, LogOut, Tags, ChevronDown, 
  ShieldCheck, Loader2, Menu, X, ChevronRight, ShoppingBag 
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { getTokenByRole, RoleType } from "../../lib/auth";
import LiveSearchBar from "../components/home/LiveSearchBar";

export default function SingleRowNavbar() {
  // --- AUTH & PROFILE STATES ---
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
      {/* Khối đệm giữ chỗ tránh đè nền nội dung (Đổi sang nền sáng) */}
      <div className="h-[72px] md:h-[80px] bg-zinc-50 w-full" />

      {/* FIXED SINGLE ROW NAVBAR - LIGHT MODE */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${isScrolled ? "border-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.04)] py-3.5" : "border-zinc-100 py-4 md:py-5"}`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-8 lg:px-10 gap-4">
          
          {/* CỤM TRÁI: LOGO GRADIENT (Đổi điểm kết thúc sang Dark Zinc thay vì White để thấy rõ chữ trên nền sáng) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex flex-col items-start leading-none group no-underline select-none">
              <span className="text-2xl md:text-3xl font-[1000] tracking-tighter italic bg-gradient-to-r from-red-600 via-red-500 to-zinc-900 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                HNA
              </span>
              <span className="text-[7px] md:text-[8px] text-zinc-500 font-black tracking-[0.38em] uppercase mt-0.5 ml-0.5 transition-colors group-hover:text-red-600">
                Cinema
              </span>
            </Link>
          </div>

          {/* CỤM GIỮA: DESKTOP NAV MENU (Chuyển sang text-zinc-700 sẫm màu) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-5 mx-2">
            {navItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              return (
                <div key={item.title} className="relative group/menu">
                  {hasSubmenu ? (
                    <>
                      <div className="flex items-center gap-1 text-[11px] xl:text-xs font-black text-zinc-700 hover:text-zinc-950 transition-all tracking-[0.15em] uppercase px-3 py-2 cursor-pointer rounded-xl hover:bg-zinc-100/80">
                        {item.title}
                        <ChevronDown size={12} className="group-hover/menu:rotate-180 transition-transform duration-300 text-red-600" />
                      </div>
                      
                      {/* Submenu Dropdown Box (Nền trắng, đổ bóng nhẹ mềm mại) */}
                      <div className="absolute top-full left-0 pt-3 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0 z-[110]">
                        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] min-w-[220px]">
                          <div className="flex flex-col gap-3">
                            {item.submenu?.map((sub) => (
                              <Link key={sub.name} href={sub.href} className="text-[10px] font-bold text-zinc-500 hover:text-red-600 hover:translate-x-1.5 transition-all duration-200 uppercase tracking-widest flex items-center gap-2.5 group/item no-underline">
                                <div className="w-1 h-1 bg-red-600 rounded-full scale-0 group-hover/item:scale-100 transition-transform" />
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link href={item.href || "#"} className="flex items-center text-[11px] xl:text-xs font-black text-zinc-700 hover:text-zinc-950 transition-all tracking-[0.15em] uppercase px-3 py-2 rounded-xl hover:bg-zinc-100/80 no-underline">
                      {item.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CỤM PHẢI: SEARCH BAR + USER PROFILE / AUTH */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 max-w-lg lg:flex-1">
            <div className="w-full max-w-[180px] xl:max-w-[240px] hidden sm:block">
              {/* Lưu ý: Bạn cần đảm bảo component LiveSearchBar bên trong cũng có cấu trúc hiển thị hợp với nền sáng */}
              <LiveSearchBar />
            </div>

            <div className="flex items-center gap-3 border-l border-zinc-200 pl-3 sm:pl-4 h-8">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-red-600" />
              ) : user ? (
                /* DROPDOWN PROFILE KHÁCH HÀNG THÀNH VIÊN */
                <div className="relative group flex items-center h-full">
                  <div className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-xl overflow-hidden group-hover:border-red-600 transition-all shadow-sm shrink-0 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-200">
                          <span className="text-xs font-black">{user.firstName?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <span className="hidden md:inline-block text-[11px] font-black text-zinc-700 group-hover:text-red-600 max-w-[80px] truncate uppercase tracking-wider italic">
                      {user.firstName}
                    </span>
                    <ChevronDown size={12} className="hidden md:block text-zinc-400 group-hover:text-red-600 group-hover:rotate-180 transition-all duration-300" />
                  </div>

                  {/* Dropdown Content (Nền trắng tinh, text sẫm) */}
                  <div className="absolute right-0 top-[100%] pt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[110]">
                    <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-xl">
                      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                        <p className="text-[9px] font-black text-zinc-500 truncate uppercase italic">{user.lastName} {user.firstName}</p>
                      </div>
                      
                      <div className="p-1.5 space-y-0.5">
                        {/* 1. Tài khoản cá nhân */}
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 group/item transition-colors no-underline">
                          <Settings size={14} className="text-zinc-500 group-hover/item:text-red-600 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Tài khoản</span>
                        </Link>

                        {/* 2. Vé lịch sử đặt mua */}
                        <Link href="/ticket" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 group/item transition-colors no-underline">
                          <Ticket size={14} className="text-zinc-500 group-hover/item:text-red-600 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Vé của tôi</span>
                        </Link>

                        {/* 3. Mã giảm giá Voucher / Coupon */}
                        <Link href="/discounts" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 group/item transition-colors no-underline">
                          <Tags size={14} className="text-zinc-500 group-hover/item:text-red-600 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Mã giảm giá</span>
                        </Link>

                        {/* 4. Đơn hàng Combo bỏng nước */}
                        <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 group/item transition-colors no-underline">
                          <ShoppingBag size={14} className="text-zinc-500 group-hover/item:text-red-600 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Đơn hàng</span>
                        </Link>

                        {/* Phân quyền mở rộng Route Quản Trị Hệ Thống */}
                        {(isAdmin || isSuperAdmin) && (
                          <Link href={isSuperAdmin ? "/super-admin" : "/admin"} className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl bg-red-50 border border-red-100 hover:bg-red-600 group/admin transition-all no-underline">
                            <ShieldCheck size={14} className="text-red-600 group-hover/admin:text-white" />
                            <span className="text-[10px] font-black text-red-600 group-hover/admin:text-white uppercase tracking-widest">Quản trị</span>
                          </Link>
                        )}
                      </div>

                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all border-t border-zinc-100 font-black text-[9px] uppercase tracking-wider">
                        <LogOut size={12} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* NÚT ĐĂNG NHẬP KHI CHƯA AUTHENTICATED */
                <Link href="/auth" className="flex items-center gap-2 text-zinc-600 hover:text-red-600 transition-all text-[11px] font-black uppercase tracking-widest no-underline">
                  <User size={14} className="text-red-600" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Nút Hamburger menu kích hoạt Mobile Drawer */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-zinc-800 p-2 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors shrink-0">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE DRAWER SLIDE OUT MENU - LIGHT MODE --- */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className={`fixed top-0 right-0 h-screen w-[280px] bg-white border-l border-zinc-200 z-[210] lg:hidden transform transition-transform duration-500 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Mobile Header Drawer */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-100">
          <span className="text-xl font-[1000] text-red-600 tracking-tighter italic">HNA<span className="text-zinc-900">.C</span></span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 bg-zinc-100 rounded-xl text-zinc-500 hover:bg-zinc-200">
            <X size={18} />
          </button>
        </div>

        {/* Mobile Main Body Navigation */}
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="sm:hidden pb-4 mb-2 border-b border-zinc-100">
            <LiveSearchBar />
          </div>

          {user && (
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl mb-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0 flex items-center justify-center">
                {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-red-600">{user.firstName?.charAt(0)}</div>}
              </div>
              <span className="text-xs font-black text-zinc-800 truncate uppercase">{user.lastName} {user.firstName}</span>
            </div>
          )}
          
          {navItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            return (
              <div key={item.title} className="border-b border-zinc-100 last:border-0">
                {hasSubmenu ? (
                  <div>
                    <button onClick={() => setMobileExpandedItem(mobileExpandedItem === item.title ? null : item.title)} className="w-full flex justify-between items-center py-3 text-[11px] font-black text-zinc-700 uppercase tracking-wider">
                      {item.title}
                      <ChevronDown size={14} className={`transition-transform ${mobileExpandedItem === item.title ? "rotate-180 text-red-600" : "text-zinc-400"}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedItem === item.title ? "max-h-[200px] pb-3" : "max-h-0"}`}>
                      <div className="flex flex-col gap-2.5 pl-3 border-l border-zinc-200 ml-1">
                        {item.submenu?.map((sub) => (
                          <Link key={sub.name} href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 no-underline hover:text-red-600">
                            <ChevronRight size={10} className="text-zinc-300" /> {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={item.href || "#"} onClick={() => setIsMobileMenuOpen(false)} className="w-full flex justify-between items-center py-3 text-[11px] font-black text-zinc-700 uppercase tracking-wider no-underline hover:text-red-600">
                    {item.title}
                    <ChevronRight size={12} className="text-zinc-300" />
                  </Link>
                )}
              </div>
            );
          })}
          
          {/* Mobile User Profile QuickLinks */}
          {user && (
            <div className="pt-4 space-y-1">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-500 text-[10px] uppercase font-bold no-underline"><Settings size={13}/> Tài khoản</Link>
              <Link href="/ticket" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-500 text-[10px] uppercase font-bold no-underline"><Ticket size={13}/> Vé của tôi</Link>
              <Link href="/discounts" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-500 text-[10px] uppercase font-bold no-underline"><Tags size={13}/> Mã giảm giá</Link>
              <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2 text-zinc-500 text-[10px] uppercase font-bold no-underline"><ShoppingBag size={13}/> Đơn hàng</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 mt-4 text-red-600 font-black text-[10px] uppercase bg-red-50 px-3 rounded-xl border border-red-100"><LogOut size={13}/> Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}