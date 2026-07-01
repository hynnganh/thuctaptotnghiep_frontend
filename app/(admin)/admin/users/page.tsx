"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Loader2, RefreshCw, 
  User, Mail, Ticket, ChevronRight
} from 'lucide-react';
import { apiAdminRequest } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';

export default function TrangQuanLyKhachHang() {
  const [danhSachKhach, setDanhSachKhach] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const layDuLieu = async () => {
    try {
      setDangTai(true);
      const res = await apiAdminRequest('/api/v1/tickets'); 
      const ketQua = await res.json();
      
      if (res.ok && Array.isArray(ketQua.data)) {
        const mapKhachHang = new Map();
        ketQua.data.forEach((ticket: any) => {
          const u = ticket.user;
          if (u?.userId) {
            if (!mapKhachHang.has(u.userId)) {
              mapKhachHang.set(u.userId, { 
                ...u, 
                count: 0, 
                total: 0, 
                first: ticket.createdAt || new Date().toISOString() 
              });
            }
            const cur = mapKhachHang.get(u.userId);
            cur.count += 1;
            cur.total += Number(ticket.price) || 0;
          }
        });
        setDanhSachKhach(Array.from(mapKhachHang.values()));
      }
    } catch (err) {
      toast.error("Lỗi đồng bộ dữ liệu!");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => { layDuLieu(); }, []);

  const filtered = danhSachKhach.filter(k => 
    `${k.firstName} ${k.lastName} ${k.email}`.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-400 p-4 font-sans antialiased select-none tracking-tight">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-5">
        {/* --- HEADER THEO STYLE A&K THU NHỎ --- */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-7 bg-red-600 rounded-full" />
            <div className="space-y-0.5">
              <h1 className="text-base font-black text-white tracking-tight uppercase leading-none">
                Khách hàng <span className="text-red-600">Hệ thống</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-wider text-zinc-600">A&K Cinema Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="Tìm tên, mã khách, email..." 
                className="bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 pl-9 pr-4 text-[11px] font-bold outline-none focus:border-red-600/30 transition-all w-full sm:w-64 placeholder:text-zinc-700 text-white"
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              />
            </div>
            <button onClick={layDuLieu} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg hover:bg-zinc-900 transition-all active:scale-95 shrink-0">
              <RefreshCw size={14} className={dangTai ? "animate-spin text-red-600" : "text-zinc-600"} />
            </button>
          </div>
        </header>

        {/* --- LIST LAYOUT THU GỌN --- */}
        <div className="space-y-2">
          {/* Header Row */}
          <div className="px-4 py-1.5 flex items-center text-[9px] font-black uppercase tracking-wider text-zinc-600">
            <div className="w-12">ID</div>
            <div className="flex-1">Thông tin thành viên</div>
            <div className="w-24 hidden md:block text-center">Gia nhập</div>
            <div className="w-20 text-center">Số vé</div>
            <div className="w-28 text-right">Tổng chi</div>
            <div className="w-10"></div>
          </div>

          {dangTai ? (
            <div className="py-32 text-center">
              <Loader2 className="animate-spin mx-auto text-red-600 mb-2.5" size={26} />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">Đang bóc tách dữ liệu...</p>
            </div>
          ) : (
            filtered.map((khach) => (
              <div 
                key={khach.userId} 
                className="group flex items-center px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all duration-200 cursor-pointer"
              >
                {/* ID - Mono Style */}
                <div className="w-12 text-[11px] font-black text-zinc-600 group-hover:text-red-500/50 transition-colors tracking-tighter">
                  #{khach.userId}
                </div>

                {/* Member Info */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-zinc-700 transition-all">
                    {khach.avatar ? (
                      <img src={khach.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[11px] font-black text-zinc-200 uppercase tracking-tight truncate group-hover:text-white transition-colors">
                      {khach.firstName} {khach.lastName}
                    </p>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Mail size={9} className="text-red-500 shrink-0" />
                      <p className="text-[9px] text-zinc-500 font-medium truncate tracking-normal">{khach.email}</p>
                    </div>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="w-24 hidden md:block text-center text-[10px] font-bold text-zinc-600 uppercase">
                  {new Date(khach.first).toLocaleDateString('vi-VN')}
                </div>

                {/* Ticket Count */}
                <div className="w-20 text-center">
                   <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full group-hover:border-red-900/40">
                      <Ticket size={9} className="text-zinc-500 group-hover:text-red-500" />
                      <span className="text-[10px] font-black text-zinc-400 group-hover:text-red-500">
                        {khach.count}
                      </span>
                   </div>
                </div>

                {/* Total Spent */}
                <div className="w-28 text-right">
                  <p className="text-xs font-black text-white tracking-tight">
                    {(Number(khach.total) || 0).toLocaleString()}
                    <span className="text-[9px] ml-0.5 text-red-500 uppercase font-black">đ</span>
                  </p>
                </div>

                {/* Action Arrow */}
                <div className="w-10 flex justify-end">
                   <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all group-hover:translate-x-0.5">
                      <ChevronRight size={12} />
                   </div>
                </div>
              </div>
            ))
          )}

          {/* Empty State */}
          {!dangTai && filtered.length === 0 && (
            <div className="py-24 text-center border border-dashed border-zinc-900 rounded-lg bg-zinc-950/20">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Không tìm thấy dữ liệu thành viên</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}