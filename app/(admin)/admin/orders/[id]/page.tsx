"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, Ticket, Coffee, Calendar, 
  CheckCircle2, Loader2, Building2, Clock, Sparkles, AlertTriangle
} from 'lucide-react';
import { apiAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{show: boolean, status: string, title: string}>({
    show: false,
    status: '',
    title: ''
  });

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_admin") || "";
    }
    return "";
  };

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      const res = await apiAdminRequest(`/api/v1/orders/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await res.json();
      if (res.ok && result?.data) {
        setOrder(result.data);
      } else {
        toast.error(result.message || "Không thể tải hóa đơn");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrderDetail(); }, [id]);

  const handleUpdateStatus = async () => {
    setConfirmModal({ ...confirmModal, show: false });
    setUpdating(true);
    try {
      const token = getAdminToken();

      const res = await apiAdminRequest(`/api/v1/orders/${id}/status?status=${confirmModal.status}`, {
        method: 'PUT',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công");
        fetchOrderDetail();
      } else {
        toast.error(result.message || "Không có quyền cập nhật trạng thái");
      }
    } catch (err) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0c]">
      <Loader2 className="animate-spin text-orange-500" size={24} />
    </div>
  );

  const cleanStatus = order?.status ? order.status.trim() : '';
  const statusLabel = cleanStatus === 'PAID' || cleanStatus === 'SUCCESS' ? 'Đã thanh toán' : cleanStatus === 'CANCELLED' ? 'Đã hủy đơn' : 'Chờ xử lý';

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-400 p-5 font-sans relative select-none tracking-tight">
      <Toaster position="top-right" />

      {/* --- MODAL XÁC NHẬN --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal({...confirmModal, show: false})} />
          <div className="relative bg-zinc-950 border border-zinc-900 p-6 rounded-xl max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {confirmModal.status === 'SUCCESS' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h3 className="text-white font-black text-base uppercase tracking-tight">{confirmModal.title}</h3>
              <p className="text-zinc-500 text-[10px] mt-1.5 font-black uppercase tracking-wider">Hành động này sẽ cập nhật trực tiếp lên hệ thống quản trị.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button 
                onClick={() => setConfirmModal({...confirmModal, show: false})}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-[10px] font-black uppercase text-zinc-400 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleUpdateStatus}
                className={`py-2.5 px-4 rounded-lg text-[10px] font-black uppercase text-white shadow-sm transition-all ${confirmModal.status === 'SUCCESS' ? 'bg-green-600 hover:bg-green-500' : 'bg-rose-600 hover:bg-rose-500'}`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* --- BỐ CỤC CHÍNH --- */}
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-orange-500 transition-colors">
            <ChevronLeft size={14} /> Quay lại
          </button>
          <span className="text-[10px] font-mono text-zinc-600 font-bold">MÃ ĐƠN: #{order?.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT SẢN PHẨM */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div className="flex items-center gap-2.5 mb-2.5 text-orange-500">
                <Building2 size={16} />
                <h1 className="text-lg font-black text-white tracking-tight uppercase">{order?.cinemaName}</h1>
              </div>
              <div className="flex gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Clock size={12}/> {order?.createdAt && new Date(order.createdAt).toLocaleTimeString('vi-VN').substring(0, 5)}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12}/> {order?.createdAt && new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              {order?.orderDetails?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-lg ${item.itemType === 'TICKET' ? 'bg-orange-500/10 text-orange-500' : 'bg-pink-500/10 text-pink-500'}`}>
                      {item.itemType === 'TICKET' ? <Ticket size={18}/> : <Coffee size={18}/>}
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-200 uppercase tracking-tight">
                      {item.itemType === 'TICKET'
                          ? item.itemName
                          : item.itemName}
                      </p>                      
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider mt-0.5">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white tracking-tight">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: TRẠNG THÁI & TỔNG TIỀN */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-500/5 blur-[40px]" />

               <div className="relative z-10 space-y-6">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">Tổng hóa đơn</span>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {order?.totalAmount?.toLocaleString()}đ
                    </h2>
                  </div>

                  <div className="space-y-3 py-4 border-y border-zinc-900 text-[9px] font-black uppercase tracking-wider">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">Hình thức:</span>
                      <span className="text-zinc-300 font-bold">{order?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">Trạng thái:</span>
                      <span className={`px-2.5 py-0.5 rounded border text-[8px] font-black ${
                        cleanStatus === 'PAID' || cleanStatus === 'SUCCESS' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 
                        cleanStatus === 'CANCELLED' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 
                        'text-orange-400 border-orange-500/20 bg-orange-500/5'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {cleanStatus === 'PENDING' || !cleanStatus ? (
                    <div className="grid gap-2 pt-1">
                      <button 
                        disabled={updating}
                        onClick={() => setConfirmModal({show: true, status: 'SUCCESS', title: 'Xác nhận thanh toán'})}
                        className="w-full py-3.5 bg-white text-black hover:bg-orange-600 hover:text-white rounded-lg font-black text-[10px] uppercase shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                        Xác nhận thanh toán
                      </button>
                      <button 
                        disabled={updating}
                        onClick={() => setConfirmModal({show: true, status: 'CANCELLED', title: 'Xác nhận hủy đơn'})}
                        className="w-full py-2.5 text-zinc-600 hover:text-rose-500 font-black text-[9px] uppercase tracking-wider transition-colors"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-[#060608] border border-dashed border-zinc-900 rounded-lg">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-700">
                        <Sparkles size={11}/>
                        <p className="text-[9px] font-black uppercase tracking-wider">Hóa đơn đã đóng lịch sử</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}