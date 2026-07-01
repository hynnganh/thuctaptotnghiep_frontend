"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Ticket, CreditCard, Clock, Hash, 
  MapPin, ShoppingBag, Calendar, QrCode, Download
} from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [donHang, setDonHang] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    const layChiTietDonHang = async () => {
      try {
        const res = await apiSuperAdminRequest(`/api/v1/orders/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setDonHang(json.data);
        }
      } catch (e) {
        console.error("Lỗi tải chi tiết đơn hàng:", e);
      } finally {
        setDangTai(false);
      }
    };
    layChiTietDonHang();
  }, [params.id]);

  const layTrangThai = (status: string) => {
    switch (status?.toUpperCase()?.trim()) {
      case 'SUCCESS': 
      case 'PAID':
        return { nhan: 'ĐÃ THANH TOÁN', mau: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' };
      case 'PENDING': 
        return { nhan: 'CHỜ XỬ LÝ', mau: 'text-amber-400 bg-amber-500/5 border-amber-500/10' };
      case 'CANCELLED': 
        return { nhan: 'ĐÃ HỦY', mau: 'text-rose-500 bg-rose-500/5 border-rose-500/10' };
      default: 
        return { nhan: status || 'CHƯA RÕ', mau: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10' };
    }
  };

  if (dangTai) return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!donHang) return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center select-none">
      <div className="text-center text-red-500 font-black uppercase tracking-wider bg-red-500/5 px-5 py-2.5 rounded-xl border border-red-950/40 text-[9px]">
        Hệ thống: Không tìm thấy dữ liệu đơn hàng
      </div>
    </div>
  );

  const thongTinTrangThai = layTrangThai(donHang.status);
  const tongSoLuongVatPham = donHang.orderDetails?.reduce((tong: number, vatPham: any) => tong + (vatPham.quantity || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#060608] text-white p-5 font-sans selection:bg-red-600 selection:text-white select-none tracking-tight">
      
      {/* THANH ĐIỀU HƯỚNG PHẲNG */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-5 border-b border-zinc-900 pb-3">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900"
        >
          <ArrowLeft size={12} />
          <span className="text-[9px] font-black uppercase tracking-wider">Trở lại</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">Máy chủ: HCM_D01</span>
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_6px_rgba(220,38,38,0.5)]" />
        </div>
      </div>

      {/* BỐ CỤC CHÍNH */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* CỘT TRÁI (7/12) - THÔNG TIN CHI TIẾT ĐƠN HÀNG */}
        <div className="md:col-span-7 space-y-4">
          
          {/* HỒ SƠ TỔNG QUÁT */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm">
            <div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-wider mb-1">
                HỒ SƠ GIAO DỊCH HỆ THỐNG
              </p>
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
                Chi tiết <br /><span className="text-zinc-800">đơn hàng</span>
              </h1>
            </div>
            
            <div className="flex items-end justify-between relative z-10 mt-4 border-t border-zinc-900/60 pt-3">
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider mb-0.5">Mã hóa đơn</p>
                <p className="text-lg font-black text-white tracking-tight">#{donHang.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-red-500 uppercase tracking-wider mb-0.5">Tổng thanh toán</p>
                <p className="text-2xl font-black text-red-600 tracking-tight leading-none">
                  {donHang.totalAmount?.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
            <Hash className="absolute -bottom-6 -right-6 text-zinc-900/10 pointer-events-none" size={140} />
          </div>

          {/* DANH SÁCH VẬT PHẨM */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-red-500"><ShoppingBag size={12} /></div>
                <h3 className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Danh sách vật phẩm</h3>
              </div>
              <span className="text-[8px] font-black px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-white tracking-wider">
                SỐ LƯỢNG: {tongSoLuongVatPham}
              </span>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {donHang.orderDetails?.map((vatPham: any) => (
                <div key={vatPham.id} className="flex justify-between items-center p-3 bg-[#060608] border border-zinc-900 rounded-xl group hover:border-zinc-800 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-900 text-zinc-500 group-hover:text-red-500 group-hover:border-zinc-800 transition-colors">
                      <Ticket size={13} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-1 text-zinc-300 group-hover:text-red-500 transition-colors">
                        {vatPham.itemType === 'TICKET'
                          ? vatPham.itemName
                          : vatPham.itemName}
                      </p>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">
                        ĐƠN GIÁ: {vatPham.price?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-500 uppercase">x{vatPham.quantity}</p>
                    <p className="text-xs font-black text-white tracking-tight">
                      {((vatPham.price || 0) * (vatPham.quantity || 0)).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CỘT PHẢI (5/12) - TRẠNG THÁI & HẬU CẦN */}
        <div className="md:col-span-5 space-y-4">
          
          {/* TRẠNG THÁI VẬN HÀNH */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-800 transition-all shadow-sm">
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase mb-1.5 tracking-wider">Trạng thái xử lý</p>
              <span className={`inline-block text-[9px] font-black uppercase tracking-wider leading-none px-2 py-0.5 rounded border ${thongTinTrangThai.mau}`}>
                 • {thongTinTrangThai.nhan}
              </span>
            </div>
            <QrCode size={28} className="text-zinc-900 group-hover:text-zinc-800 transition-all" />
          </div>

          {/* THỜI GIAN GHI NHẬN */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 shadow-sm">
            <p className="text-[8px] font-black text-zinc-500 uppercase mb-2.5 tracking-wider">Thời gian ghi nhận</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-[#060608] border border-zinc-900 rounded-xl">
                <Calendar size={12} className="text-zinc-500" />
                <span className="text-[9px] font-black text-zinc-400">
                  {donHang.createdAt ? new Date(donHang.createdAt).toLocaleDateString('vi-VN') : '---'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#060608] border border-zinc-900 rounded-xl">
                <Clock size={12} className="text-red-500" />
                <span className="text-[9px] font-black text-white">
                  {donHang.createdAt ? new Date(donHang.createdAt).toLocaleTimeString('vi-VN') : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* ĐỊA ĐIỂM THỰC HIỆN */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 relative overflow-hidden group shadow-sm">
            <MapPin className="absolute -top-3 -right-3 text-zinc-900/20 group-hover:scale-105 transition-transform duration-500 pointer-events-none" size={80} />
            <p className="text-[8px] font-black text-red-500 uppercase mb-1 tracking-wider leading-none">Địa điểm áp dụng</p>
            <h4 className="text-base font-black uppercase leading-tight tracking-tight mb-2 text-white">{donHang.cinemaName || 'Chưa cập nhật rạp'}</h4>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#060608] text-zinc-400 text-[8px] font-black rounded-md border border-zinc-900">
              <Hash size={8} className="text-red-500" /> ID: {donHang.cinemaItemId || 'N/A'}
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN & BUTTON */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Phương thức thanh toán</p>
              <span className="text-[8px] font-black text-red-500 bg-red-500/5 border border-red-950/40 px-1.5 py-0.5 rounded uppercase">BẢO MẬT</span>
            </div>
            
            <div className="flex items-center gap-2.5 p-2.5 bg-[#060608] rounded-xl border border-zinc-900">
              <div className="p-1.5 bg-zinc-950 rounded-lg text-red-500 border border-zinc-900"><CreditCard size={12} /></div>
              <p className="text-[11px] font-black uppercase tracking-tight text-white">{donHang.paymentMethod || 'Không rõ'}</p>
            </div>
            
            <button className="w-full h-10 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-98 hover:bg-red-600 hover:text-white hover:border-transparent shadow-sm">
              <Download size={12} /> Xuất hóa đơn
            </button>
          </div>

        </div>

      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}