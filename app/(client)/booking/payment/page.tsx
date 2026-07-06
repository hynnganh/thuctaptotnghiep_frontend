"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getImageUrl } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';
import { 
  Loader2, ChevronLeft, TicketPercent, Calendar, 
  Clock, Monitor, ShieldCheck, CheckCircle2, CreditCard, Wallet
} from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const sData = sessionStorage.getItem('booking_data');
      if (!sData) {
        toast.error("Phiên làm việc đã kết thúc!");
        router.push('/');
        return;
      }
      
      const parsedData = JSON.parse(sData);
      setBookingData(parsedData);

      // --- KHỐI CONSOLE LOG DEBUG TOKEN VÀ ROLE ---
      console.log("=== DEBUG MULTI-TAB MULTI-ROLE ===");
      const tokenUser = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
      const tokenAdmin = typeof window !== "undefined" ? localStorage.getItem('token_admin') : null;
      const tokenSuperAdmin = typeof window !== "undefined" ? localStorage.getItem('token_super_admin') : null;
      
      console.log("Token User hiện tại:", tokenUser);
      console.log("Token Admin hiện tại (nếu có):", tokenAdmin);
      console.log("Token SuperAdmin hiện tại (nếu có):", tokenSuperAdmin);

      if (tokenUser) {
        try {
          const base64Url = tokenUser.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const decoded = JSON.parse(jsonPayload);
          console.log("👉 Dữ liệu thực tế bên trong tokenUser:", decoded);
          console.log("👉 Role trong token:", decoded.role || decoded.roles || decoded.authorities || "Không tìm thấy");
        } catch (e) {
          console.error("Không thể decode token:", e);
        }
      } else {
        console.warn("⚠️ CẢNH BÁO: Không tìm thấy token_user!");
      }
      console.log("==================================");

      try {
        const [userRes, vRes] = await Promise.all([
          apiRequest('/api/v1/users/me', {}, 'USER'),
          apiRequest('/api/v1/vouchers/my-vouchers', {}, 'USER')
        ]);

        if (userRes.ok) {
          const uResult = await userRes.json();
          setUserData(uResult.data?.user || uResult.data || uResult);
        }
        if (vRes.ok) {
          const vResult = await vRes.json();
          setVouchers(vResult.data || []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [router]);

  const calculateTotals = () => {
    const seatPrice = Number(bookingData?.seatPrice) || 0;
    const comboPrice = Number(bookingData?.comboPrice) || 0;
    const subTotal = seatPrice + comboPrice;
    
    const discount = selectedVoucher ? Number(selectedVoucher.discountValue) : 0;
    const finalTotal = Math.round(Math.max(0, subTotal - discount));
    
    return { subTotal, discount, finalTotal };
  };

  const { subTotal, discount, finalTotal } = calculateTotals();

  const validVouchers = vouchers.filter(v => {
    const now = new Date();
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    
    const isMinAmountMet = subTotal >= (v.minOrderAmount || 0);
    const isWithinTime = now >= start && now <= end;
    const hasUsageLeft = (v.usageLimit || 0) > (v.usedCount || 0);

    return isMinAmountMet && isWithinTime && hasUsageLeft;
  });

  const handleFinalCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const payload = {
        showtimeId: Number(bookingData.showtimeId),
        seatIds: bookingData.selectedSeats.map((s: any) => Number(s.id)),
        combos: (bookingData.selectedCombos || []).map((c: any) => ({ 
          comboId: Number(c.id), 
          quantity: Number(c.quantity) 
        })),
        totalAmount: finalTotal, 
        paymentMethod: paymentMethod, 
        voucherCode: selectedVoucher?.code || "" 
      };

      console.clear();
      console.log("%c🎬 === THÔNG TIN ĐƠN HÀNG ===", "color: #ea580c; font-weight: bold; font-size: 14px;");
      console.log("💰 Tạm tính:", subTotal.toLocaleString() + "đ");
      console.log("🔥 TỔNG TIỀN GỬI SERVER: " + finalTotal.toLocaleString() + "đ");
      
      const res = await apiRequest(`/api/v1/orders`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, 'USER');
      
      const resData = await res.json();
      
      if (res.ok) {
        sessionStorage.removeItem('booking_data');
        if (resData.data?.paymentUrl) {
          toast.success("Đang chuyển hướng thanh toán...");
          setTimeout(() => {
            window.location.href = resData.data.paymentUrl;
          }, 1200);
        } else {
          toast.success("Thanh toán thành công!");
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        toast.error(resData.message || "Lỗi đặt vé!");
      }
    } catch (err) { 
      toast.error("Lỗi kết nối hệ thống!"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (loading || !bookingData) return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 p-4 md:p-8 font-sans selection:bg-red-600 selection:text-white">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto">
        {/* Nút Quay Lại Sáng */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-700 transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
          <ChevronLeft size={14}/> Quay lại chọn combo
        </button>

        {/* Khung Grid Bố Cục Mới (7.5 : 4.5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (Bên Nhẹ): Thông Tin & Ưu Đãi */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Banner Phim Minimalist Sáng */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-center shadow-xs">
              <div className="w-24 h-36 rounded-2xl overflow-hidden shadow-md border border-zinc-100 shrink-0">
                <img src={getImageUrl(bookingData.movieImage)} alt="Poster" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <h1 className="text-2xl font-[1000] uppercase italic text-zinc-900 tracking-tight leading-tight">
                  {bookingData.movieTitle}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 text-[10px] font-extrabold uppercase text-zinc-500">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-100 rounded-lg"><Calendar size={11} className="text-red-600"/> {bookingData.date}</div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-100 rounded-lg"><Clock size={11} className="text-red-600"/> {bookingData.time}</div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-100 rounded-lg"><Monitor size={11} className="text-red-600"/> {bookingData.roomName}</div>
                </div>
              </div>
            </div>

            {/* Grid Thông Tin Khách Hàng & Ghế */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-[10px] font-black text-red-600 uppercase mb-1.5 tracking-wider">Vị trí ghế ngồi</p>
                <div className="flex flex-wrap gap-1.5">
                  {bookingData.selectedSeats?.map((s: any) => (
                    <span key={s.id} className="text-xs font-black bg-zinc-900 text-white px-2 py-0.5 rounded-md">{s.seatRow}{s.seatNumber}</span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2">{bookingData.cinemaName}</p>
              </div>
              
              <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
                <p className="text-[10px] font-black text-red-600 uppercase mb-1 tracking-wider">Thông tin người đặt</p>
                <p className="text-xs font-extrabold text-zinc-900 uppercase truncate">{userData?.fullName || "Khách hàng"}</p>
                <p className="text-[10px] text-zinc-400 font-medium truncate">{userData?.email}</p>
              </div>
            </div>

            {/* Khối Voucher Thiết Kế Sáng Chuyên Nghiệp */}
            <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="text-xs font-black uppercase text-zinc-900 flex items-center gap-2">
                  <TicketPercent size={15} className="text-red-600"/> Voucher của bạn
                </h3>
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{validVouchers.length} mã sẵn sàng</span>
              </div>
              
              {validVouchers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {validVouchers.map((v) => {
                    const isSelected = selectedVoucher?.id === v.id;
                    return (
                      <button 
                        key={v.id}
                        onClick={() => setSelectedVoucher(isSelected ? null : v)}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-red-50/50 border-red-500 shadow-xs' 
                            : 'bg-zinc-50/50 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="relative z-10 flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-zinc-900 block tracking-tight">{v.code}</span>
                            <p className="text-[10px] font-bold text-zinc-400 line-clamp-1">{v.title}</p>
                            <p className="text-[9px] font-medium text-zinc-400">Hạn: {new Date(v.endDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div className="text-xs font-black text-red-600 shrink-0">
                            -{v.discountValue.toLocaleString()}đ
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute right-2 bottom-2 text-red-600/10">
                            <CheckCircle2 size={24} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-zinc-200 rounded-xl">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Bạn chưa có mã ưu đãi phù hợp</p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (Trọng Tâm): Biên Lai & Nút Xác Nhận */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 lg:sticky top-6 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3">Chi tiết thanh toán</h2>
              
              <div className="space-y-3.5">
                <div className="flex justify-between text-xs font-extrabold text-zinc-500">
                  <span>Giá vé & Combo</span>
                  <span className="text-zinc-900 font-black">{subTotal.toLocaleString()}đ</span>
                </div>
                
                {selectedVoucher && (
                  <div className="flex justify-between text-xs font-extrabold text-emerald-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <span>Khuyến mãi ({selectedVoucher.code})</span>
                    <span className="font-black">-{discount.toLocaleString()}đ</span>
                  </div>
                )}

                {/* Khối Cổng Thanh Toán Sáng Sạch */}
                <div className="pt-3 space-y-3">
                  <p className="text-[10px] font-black uppercase text-zinc-400 text-center tracking-wider">Chọn phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['VNPAY', 'MOMO'].map(method => {
                      const isActive = paymentMethod === method;
                      return (
                        <button 
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-xs transition-all ${
                            isActive 
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100/70'
                          }`}
                        >
                          {method === 'VNPAY' ? <Wallet size={15}/> : <CreditCard size={15}/>}
                          <span>{method}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tổng Tiền Chốt */}
                <div className="pt-5 border-t border-zinc-100 flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-zinc-400 mb-0.5">Số tiền cần trả:</span>
                  <span className="text-3xl font-[1000] italic text-red-600 tracking-tight leading-none">
                    {finalTotal.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Nút Đặt Vé Chính */}
              <button 
                onClick={handleFinalCheckout}
                disabled={isProcessing}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-red-700 shadow-[0_4px_20px_rgba(220,38,38,0.18)] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <ShieldCheck size={16}/> 
                    Xác nhận &amp; Thanh toán
                  </>
                )}
              </button>
              
              <p className="text-[9px] text-center text-zinc-400 font-semibold uppercase leading-normal px-2">
                Vé đã mua không thể đổi trả. Bạn đồng ý với quy định đặt vé của chúng tôi.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}