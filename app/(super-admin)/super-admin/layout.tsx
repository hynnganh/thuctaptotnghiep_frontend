"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Film, Users, MapPin, 
  LogOut, Search, Menu, Zap, Ticket, Tag, 
  Box, CalendarDays, ShoppingBag, Layers,
  Fingerprint, MonitorPlay, BarChart3
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiSuperAdminRequest } from '@/app/lib/api'; 

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null); 
  const pathname = usePathname();
  const router = useRouter();

  // Đăng xuất cô lập tài khoản Super Admin
  const handleLogout = useCallback(() => {
    const targetKeys = ['token_super_admin', 'roles'];
    targetKeys.forEach(key => {
      localStorage.removeItem(key);
      Cookies.remove(key, { path: '/' });
    });
    
    window.location.href = '/login';
  }, []);

  // Fetch dữ liệu hệ thống root
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token_super_admin');
      
      if (!token) {
        handleLogout();
        return;
      }

      try {
        // FIX: Bỏ tham số thứ 3 thừa vì apiSuperAdminRequest chỉ nhận (endpoint, options)
        const adminRes = await apiSuperAdminRequest('/api/v1/users/me', {});
        
        if (adminRes.ok) {
          const data = await adminRes.json();
          setAdminInfo(data.data?.user || data.data);
        } else if (adminRes.status === 401 || adminRes.status === 403) {
          handleLogout();
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu hệ thống:", error);
      }
    };

    fetchData();
  }, [handleLogout]);

  // Bọc vào useMemo để tránh khởi tạo lại mảng menu mỗi lần component re-render
  const MENU_ITEMS = useMemo(() => [
    { label: "Tổng quan", icon: <LayoutDashboard size={16} />, href: "/super-admin" },
    { label: "Thể loại Phim", icon: <Layers size={16} />, href: "/super-admin/genre" },
    { label: "Phim ảnh", icon: <Film size={16} />, href: "/super-admin/movie" },
    { label: "Hệ thống rạp", icon: <MapPin size={16} />, href: "/super-admin/cinema" },
    { label: "Lịch chiếu", icon: <CalendarDays size={16} />, href: "/super-admin/showtime" },
    { label: "Sự kiện & Ưu đãi", icon: <Tag size={16} />, href: "/super-admin/event" },
    { label: "Voucher", icon: <Zap size={16} />, href: "/super-admin/voucher" },
    { label: "Banner quảng cáo", icon: <MonitorPlay size={16} />, href: "/super-admin/banner" },
    { label: "Quản lý đơn hàng", icon: <ShoppingBag size={16} />, href: "/super-admin/order" },
    { label: "Người dùng", icon: <Users size={16} />, href: "/super-admin/user" },
    { label: "Giá vé & Ghế", icon: <Ticket size={16} />, href: "/super-admin/seat-price" },
    { label: "Combo bắp nước", icon: <Box size={16} />, href: "/super-admin/food-combo" },
    { label: "Thống kê doanh thu", icon: <BarChart3 size={16} />, href: "/super-admin/analytic" },
  ], []);

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-400 flex font-sans overflow-hidden select-none antialiased">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR TRÁI */}
      <aside className={`h-screen sticky top-0 transition-all duration-300 flex flex-col py-6 border-r border-zinc-900 bg-[#060608] shrink-0 z-40 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* LOGO BOX */}
        <div className="mb-8 px-5 flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => router.push('/super-admin')}>
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(220,38,38,0.2)] shrink-0">
            <Fingerprint size={18} className="animate-pulse" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-200">
              <span className="text-white font-black tracking-tight text-sm leading-none">HNA CINEMA</span>
              <span className="text-[8px] text-red-500 font-bold tracking-widest mt-1 uppercase">Root Executive</span>
            </div>
          )}
        </div>

        {/* MENU NAVIGATION */}
        <nav className="flex-1 w-full px-3 space-y-1 overflow-y-auto hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 group relative text-left ${
                  active 
                    ? 'bg-red-600 text-white font-bold shadow-[0_4px_12px_rgba(220,38,38,0.15)]' 
                    : 'hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <span className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-red-500'} transition-colors shrink-0`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="text-xs font-semibold tracking-wide truncate animate-in fade-in duration-150">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BUTTON ĐĂNG XUẤT */}
        <div className="w-full px-3 mt-4 shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-950/30 hover:text-red-500 transition-all group text-left"
          >
            <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Thoát Hệ Thống</span>}
          </button>
        </div>
      </aside>

      {/* DIỆN TÍCH HIỂN THỊ CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#020202]">
        {/* TOPBAR HEADER */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-zinc-900 bg-[#060608]/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-800"
            >
              <Menu size={16} />
            </button>
            
            {/* THANH TÌM KIẾM HỆ THỐNG */}
            <div className="relative max-w-sm w-full ml-2 group hidden md:block">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tra cứu log hệ thống, mã rạp, token..." 
                className="w-full bg-zinc-950 border border-zinc-900 py-2 pl-10 pr-4 rounded-lg text-xs font-medium outline-none focus:border-red-600/40 transition-all text-white placeholder:text-zinc-700" 
              />
            </div>
          </div>

          {/* THÔNG TIN TÀI KHOẢN ADMIN */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block space-y-0.5">
                <p className="text-xs font-bold text-white tracking-tight">
                  {adminInfo ? `${adminInfo.firstName} ${adminInfo.lastName}` : "SUPER ROOT"}
                </p>
                <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase">
                  {Array.isArray(adminInfo?.roles) ? adminInfo.roles[0].replace('ROLE_', '') : "SUPER_ADMIN"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-md flex-shrink-0">
                <img 
                  src={adminInfo?.avatar || "https://ui-avatars.com/api/?name=Super+Admin&background=020202&color=fff"} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* ROUTE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/[0.01] blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}