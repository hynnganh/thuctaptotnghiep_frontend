"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Info, Loader2, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { apiAdminRequest } from '@/app/lib/api'; // Sử dụng hàm admin chuyên dụng đã có sẵn token logic

export default function OrderHistoryTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [myCinemaId, setMyCinemaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin người quản lý rạp (Đã đổi sang dùng apiAdminRequest tự xử lý Token)
        const userRes = await apiAdminRequest('/api/v1/users/me');
        const userData = await userRes.json();
        const cinemaId = userData.data?.managedCinemaItemId || userData.data?.cinemaId;
        setMyCinemaId(cinemaId);

        // 2. Tải danh sách đơn hàng thực tế
        const res = await apiAdminRequest('/api/v1/orders');
        const result = await res.json();
        
        if (res.ok && result?.data) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu hệ thống:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter(o => {
    const cleanStatus = o.status ? o.status.trim() : '';
    
    let matchesStatus = false;
    if (activeFilter === 'ALL') {
      matchesStatus = true;
    } else if (activeFilter === 'PAID') {
      matchesStatus = cleanStatus === 'PAID' || cleanStatus === 'SUCCESS';
    } else {
      matchesStatus = cleanStatus === activeFilter;
    }

    const matchesCinema = myCinemaId ? Number(o.cinemaItemId) === Number(myCinemaId) : true;
    return matchesStatus && matchesCinema;
  });

  const getStatusInfo = (status: string) => {
    const cleanStatus = status ? status.trim() : '';
    switch (cleanStatus) {
      case 'PAID': 
      case 'SUCCESS':
        return { label: 'Thành công', color: 'text-green-500 bg-green-500/5 border-green-500/10', icon: <CheckCircle2 size={11}/> };
      case 'CANCELLED': 
        return { label: 'Đã hủy', color: 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10', icon: <XCircle size={11}/> };
      default: 
        return { label: 'Chờ xử lý', color: 'text-amber-500 bg-amber-500/5 border-amber-500/10', icon: <Clock size={11}/> };
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const [date, time] = dateStr.split('T');
    const [year, month, day] = date.split('-');
    return `${time.substring(0, 5)} - ${day}/${month}/${year}`;
  };

  if (loading) return (
    <div className="py-16 text-center flex flex-col items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-red-600 mb-2" size={24} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Đang đồng bộ giao dịch...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-3 font-sans text-white">
      
      {/* --- BỘ LỌC ĐẦU BẢNG TINH GỌN --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#0c0c0e] p-3 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/10 rounded-lg text-red-500">
            <Receipt size={14}/>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wide">Giao dịch rạp</h2>
            <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Mã cơ sở hiện tại: {myCinemaId || "Tất cả"}</p>
          </div>
        </div>
        
        {/* Thanh chuyển tab phẳng, chữ nhỏ */}
        <div className="flex bg-black p-1 rounded-lg border border-zinc-900 w-full sm:w-auto justify-center">
          {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveFilter(t)} 
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                activeFilter === t ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'PAID' ? 'Thành công' : t === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* --- DANH SÁCH ĐƠN HÀNG THU NHỎ CHIỀU CAO --- */}
      <div className="grid gap-1.5">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const status = getStatusInfo(order.status);
          return (
            <Link 
              key={order.id} 
              href={`/admin/orders/${order.id}`}
              className="group flex items-center justify-between p-3 bg-[#0c0c0e] border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* ID Đơn hàng dẹt nhỏ */}
                <div className="w-8 h-8 shrink-0 bg-black border border-zinc-900 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
                  #{order.id}
                </div>

                {/* Nội dung thông tin căn lề trái */}
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-200 truncate uppercase tracking-wide">
                    {order.cinemaName || "Rạp chưa cập nhật"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium">
                    <span className="flex items-center gap-1 text-red-500/80 font-bold uppercase tracking-tight">
                      <CreditCard size={9} /> {order.paymentMethod}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Trạng thái và Tổng tiền bên phải */}
              <div className="flex items-center gap-4 shrink-0 text-right">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-white font-mono tracking-tight">
                    {order.totalAmount?.toLocaleString()}đ
                  </div>
                  {/* Tag trạng thái bo viền dẹt tinh xảo */}
                  <div className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                </div>
                
                <Info size={12} className="text-zinc-800 group-hover:text-red-500 transition-colors hidden sm:block" />
              </div>
            </Link>
          );
        }) : (
          <div className="py-12 text-center border border-dashed border-zinc-900 rounded-xl bg-[#0c0c0e]/30">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Không có dữ liệu giao dịch</p>
          </div>
        )}
      </div>
    </div>
  );
}