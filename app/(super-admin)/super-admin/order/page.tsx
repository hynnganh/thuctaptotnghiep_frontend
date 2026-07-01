"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Search, ChevronRight, Hash, 
  Ticket, Loader2, RefreshCcw, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { apiSuperAdminRequest } from '@/app/lib/api';

export interface OrderDetail {
  id: number;
  itemType: string;
  itemId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  cinemaItemId: number;
  cinemaName: string;
  orderDetails: OrderDetail[];
  paymentUrl: string;
}

export default function SuperAdminHCMPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiSuperAdminRequest('/api/v1/orders', { 
        method: 'GET'
      });

      // 1. Kiểm tra trực tiếp mã lỗi phân quyền mạng từ Gateway
      if (response.status === 401 || response.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        
        // 2. Sửa logic: Khớp với `"status": "OK"` trong ảnh Swagger thực tế của bạn
        if (result.status === "OK" || result.status === 200 || result.status === 0) {
          setIsAuthorized(true);
          // Sắp xếp đơn hàng mới nhất lên đầu dựa theo ID
          const sorted = (result.data || []).sort((a: Order, b: Order) => b.id - a.id);
          setOrders(sorted);
        } else {
          setOrders([]);
          setIsAuthorized(true); 
        }
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Lỗi kết nối core hệ thống:", error);
      setIsAuthorized(true); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchOrders(); 
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order: Order) => 
    order.id?.toString().includes(searchTerm) ||
    order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cinemaName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center select-none">
        <ShieldAlert className="text-red-600 animate-pulse mb-4" size={56} />
        <h1 className="text-xl font-black uppercase tracking-tight text-red-600">Truy cập bị từ chối</h1>
        <p className="text-[11px] font-bold uppercase text-zinc-600 tracking-wider mt-1.5 max-w-sm leading-relaxed">
          Tài khoản không có vai trò [SUPER_ADMIN]. Vui lòng đăng nhập lại bằng thực thể cấp cao.
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-6 flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 font-bold uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-lg transition-all"
        >
          <ArrowLeft size={13} /> Đi đến Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-10 font-sans tracking-tight select-none">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-red-600/10 border border-red-600/20 rounded-lg text-red-600">
            <MapPin size={20} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">
              Khu vực <span className="text-red-600">Hồ Chí Minh</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
              Hệ thống quản lý giao dịch thực tế • Quyền SUPER_ADMIN
            </p>
          </div>
        </div>
        <button 
          onClick={fetchOrders} 
          className="w-10 h-10 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-800 transition-all flex items-center justify-center"
          title="Làm mới dữ liệu"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* FILTER SEARCH INPUT */}
      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={15} />
        <input 
          type="text" 
          placeholder="TÌM KIẾM MÃ GIAO DỊCH, TRẠNG THÁI VẬN HÀNH, TÊN RẠP, PHƯƠNG THỨC..." 
          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3.5 pl-12 text-xs font-bold outline-none focus:border-zinc-800 placeholder:text-zinc-700 text-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CORE DATA TABLE */}
      <div className="bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden relative min-h-[400px] shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-[#020202]/80 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-red-600 opacity-80" size={32} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Đang truy xuất...</span>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-900 text-[9px] font-bold uppercase text-zinc-600 tracking-wider">
                <th className="p-5 pl-8">Mã giao dịch</th>
                <th className="p-5">Chi nhánh rạp</th>
                <th className="p-5">Chi tiết sản phẩm</th>
                <th className="p-5">Thanh toán</th>
                <th className="p-5 text-right">Tổng tiền</th>
                <th className="p-5 text-right pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {filteredOrders.length > 0 ? filteredOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-zinc-950/40 group transition-all">
                  {/* Mã giao dịch */}
                  <td className="p-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-red-600 group-hover:border-red-900/20 transition-colors">
                        <Hash size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black tracking-tight text-zinc-200">#{order.id}</p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase leading-none">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '---'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Chi nhánh rạp */}
                  <td className="p-5 text-[11px] font-bold uppercase text-zinc-400">
                    {order.cinemaName || 'Hệ thống HCM'}
                  </td>

                  {/* Chi tiết sản phẩm */}
                  <td className="p-5">
                    <div className="flex items-center gap-1.5">
                      <Ticket size={11} className="text-red-800" />
                      <span className="text-[10px] font-bold uppercase text-zinc-500">
                        {order.orderDetails?.length || 0} mục hàng
                      </span>
                    </div>
                  </td>

                  {/* Phương thức thanh toán */}
                  <td className="p-5 text-[10px] font-bold uppercase text-zinc-500">
                    {order.paymentMethod || 'Không xác định'}
                  </td>

                  {/* Tổng tiền & Trạng thái */}
                  <td className="p-5 text-right space-y-0.5">
                    <p className="text-sm font-black text-zinc-200 tracking-tight">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                    </p>
                    <span className={`text-[9px] font-bold uppercase tracking-wide block leading-none ${
                      order.status === 'PAID' ? 'text-amber-500' : 
                      order.status === 'CANCELLED' ? 'text-red-600' : 'text-zinc-500'
                    }`}>
                      • {
                        order.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 
                        order.status === 'CANCELLED' ? 'ĐÃ HỦY' : order.status || 'CHƯA RÕ'
                      }
                    </span>
                  </td>

                  {/* Thao tác chi tiết */}
                  <td className="p-5 text-right pr-8">
                    <button 
                      onClick={() => router.push(`/super-admin/order/${order.id}`)}
                      className="w-8 h-8 inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-white rounded-md transition-all active:scale-95"
                      title="Chi tiết đơn hàng"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan={6} className="p-24 text-center text-[11px] font-bold uppercase text-zinc-600 tracking-wider">
                    Không tìm thấy dữ liệu đơn hàng tương thích
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}