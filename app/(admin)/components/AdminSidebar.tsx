"use client";
import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Calendar, 
  Users, 
  Ticket, 
  LogOut, 
  ShoppingBag,
  Film,
  ChevronRight,
  QrCode,
  MessageSquare // 🔥 THÊM ICON CHAT
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const danhSachMenu = [
    { name: 'Tổng quan', icon: LayoutDashboard, href: '/admin' },
    { name: 'Phòng chiếu', icon: Monitor, href: '/admin/rooms' }, 
    { name: 'Lịch chiếu', icon: Calendar, href: '/admin/showtimes' },
    { name: 'Quản lý Đơn hàng', icon: Ticket, href: '/admin/orders' }, 
    { name: 'Quản lý Combo', icon: ShoppingBag, href: '/admin/combos' },
    { name: 'Khách hàng', icon: Users, href: '/admin/users' },
    { name: 'Quét mã QR', icon: QrCode, href: '/admin/scanner' }, 
    // 🔥 THÊM MỚI MỤC CHAT VÀO ĐÂY
    { name: 'Hỗ trợ CSKH', icon: MessageSquare, href: '/admin/chat' }, 
  ];

  const xuLyDangXuat = () => {
    const keyToken = 'token_admin';

    localStorage.removeItem(keyToken);
    localStorage.removeItem('user_info_admin');
    Cookies.remove(keyToken, { path: '/' });

    window.dispatchEvent(new Event("auth-changed"));

    toast.success("Đã đăng xuất phân vùng quản trị!");
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <aside className="w-64 h-screen bg-[#060608] border-r border-zinc-900 flex flex-col sticky top-0 overflow-hidden z-[100]">
      
      {/* PHẦN LOGO THƯƠNG HIỆU */}
      <div className="p-6 flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => router.push('/admin')}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-9 h-9 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center font-black text-red-600 text-lg shadow-md">
            <Film size={18} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black uppercase tracking-tight text-base leading-none">
            HNA <span className="text-red-600">Admin</span>
          </span>
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-wider mt-1">Trung tâm điều hành</span>
        </div>
      </div>

      {/* DANH SÁCH ĐIỀU HƯỚNG */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-2">
        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-wider px-3 mb-3">Danh mục quản lý</p>
        
        {danhSachMenu.map((link) => {
          const dangKichHoat = pathname.startsWith(link.href) && (link.href !== '/admin' || pathname === '/admin');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                dangKichHoat 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10 translate-x-0.5' 
                  : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon 
                  size={16} 
                  className={`${dangKichHoat ? 'text-white' : 'group-hover:text-red-600 transition-colors'}`} 
                />
                <span className="text-[10px] font-black uppercase tracking-wider">{link.name}</span>
              </div>
              {dangKichHoat && <ChevronRight size={12} className="animate-in fade-in slide-in-from-left-1" />}
            </Link>
          );
        })}
      </nav>

      {/* PHẦN DƯỚI - TRẠNG THÁI MÁY CHỦ & ĐĂNG XUẤT */}
      <div className="p-3 mt-auto border-t border-zinc-900 shrink-0 bg-[#060608]">
        <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3.5">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-600/5 border border-red-600/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider leading-none mb-0.5">Trạng thái máy chủ</span>
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-wider">Đang hoạt động</span>
                </div>
            </div>

            <button 
              onClick={xuLyDangXuat}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-zinc-500 hover:text-white text-[9px] font-black uppercase tracking-wider transition-all bg-[#060608] hover:bg-red-600 border border-zinc-900 hover:border-transparent rounded-lg group"
            >
              <LogOut size={13} className="group-hover:-translate-x-0.5 transition-transform" /> 
              <span>Đăng xuất hệ thống</span>
            </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </aside>
  );
}