"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getImageUrl } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';
import { 
  Loader2, ChevronLeft, TicketPercent, Tag, Info, 
  CreditCard, Wallet, User, MapPin, Calendar, 
  Clock, Monitor, ShieldCheck, CheckCircle2, Armchair
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
      
      // 1. Kiểm tra tất cả các token đang có trong hệ thống để xem có bị dẫm chân nhau không
      const tokenUser = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
      const tokenAdmin = typeof window !== "undefined" ? localStorage.getItem('token_admin') : null;
      const tokenSuperAdmin = typeof window !== "undefined" ? localStorage.getItem('token_super_admin') : null;
      
      console.log("Token User hiện tại:", tokenUser);
      console.log("Token Admin hiện tại (nếu có):", tokenAdmin);
      console.log("Token SuperAdmin hiện tại (nếu có):", tokenSuperAdmin);

      // 2. Decode thử Token đang dùng xem thực tế bên trong chứa thông tin của ai
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
          console.error("Không thể decode token, có thể token không đúng định dạng JWT:", e);
        }
      } else {
        console.warn("⚠️ CẢNH BÁO: Không tìm thấy token_user trong localStorage!");
      }
      console.log("==================================");
      // --------------------------------------------

      try {
        const [userRes, vRes] = await Promise.all([
          apiRequest('/api/v1/users/me', {}, 'USER'),
          apiRequest('/api/v1/vouchers/my-vouchers', {}, 'USER')
        ]);

        if (userRes.ok) {
          const uResult = await userRes.json();
          console.log("Kết quả trả về từ /users/me:", uResult);
          setUserData(uResult.data?.user || uResult.data || uResult);
        } else {
          console.error("API /users/me thất bại, status:", userRes.status);
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

  // TỔNG HỢP LOGIC TÍNH TOÁN TIỀN BẠC
  const calculateTotals = () => {
    const seatPrice = Number(bookingData?.seatPrice) || 0;
    const comboPrice = Number(bookingData?.comboPrice) || 0;
    const subTotal = seatPrice + comboPrice;
    
    const discount = selectedVoucher ? Number(selectedVoucher.discountValue) : 0;
    const finalTotal = Math.round(Math.max(0, subTotal - discount));
    
    return { subTotal, discount, finalTotal };
  };

  const { subTotal, discount, finalTotal } = calculateTotals();

  // BỘ LỌC VOUCHER THỎA MÃN ĐIỀU KIỆN
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
// --- KHỐI CONSOLE LOG CHI TIẾT ĐƠN HÀNG GỬI ĐI ---
      console.clear(); // Xóa bớt log cũ cho sạch
      console.log("%c🎬 === THÔNG TIN CHI TIẾT ĐƠN HÀNG GỬI ĐI ===", "color: #ea580c; font-weight: bold; font-size: 14px;");
      
      // 1. Thông tin chung về phim & Khách hàng
      console.log("🎟️ Phim:", bookingData.movieTitle);
      console.log("👤 Khách hàng:", userData?.fullName || "Khách hàng", `(${userData?.email || "Chưa có email"})`);
      console.log("📅 Suất chiếu:", `${bookingData.time} - Ngày ${bookingData.date} | Phòng: ${bookingData.roomName}`);
      console.log("🏢 Rạp phim:", bookingData.cinemaName);
      
      // 2. Chi tiết Vé ghế (In dạng bảng)
      const seatDetails = bookingData.selectedSeats.map((s: any) => ({
        "ID Ghế": s.id,
        "Vị trí": `${s.seatRow}${s.seatNumber}`,
        "Loại ghế": s.seatType || "Thường"
      }));
      console.log("💺 Danh sách ghế đặt:");
      console.table(seatDetails);

      // 3. Chi tiết đồ ăn nước uống (Combo)
      if (bookingData.selectedCombos && bookingData.selectedCombos.length > 0) {
        const comboDetails = bookingData.selectedCombos.map((c: any) => ({
          "ID Combo": c.id,
          "Tên Combo": c.name || c.title || "Combo",
          "Số lượng": c.quantity
        }));
        console.log("🍿 Danh sách Combo kèm theo:");
        console.table(comboDetails);
      } else {
        console.log("🍿 Combo: Không chọn đồ ăn/nước uống.");
      }

      // 4. Chi tiết tiền bạc & Khuyến mãi
      console.log("💰 Tạm tính:", subTotal.toLocaleString() + "đ");
      console.log("🎫 Mã giảm giá áp dụng:", selectedVoucher ? `${selectedVoucher.code} (-${discount.toLocaleString()}đ)` : "Không áp dụng");
      console.log("💳 Phương thức thanh toán:", paymentMethod);
      console.log("%c🔥 TỔNG TIỀN THỰC TẾ GỬI LÊN SERVER: " + finalTotal.toLocaleString() + "đ", "color: #22c55e; font-weight: bold;");
      
      // 5. In ra object Payload thô (Raw object) gửi lên API
      console.log("📦 Body Payload gửi API:", payload);
      console.log("=======================================================");
      // apiRequest tự động tiêm Token & gán Content-Type: application/json chuẩn xác
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
          }, 1500);
        } else {
          toast.success("Thanh toán thành công!");
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        const errorMessage = resData.message || resData.error || "Lỗi đặt vé!";
        toast.error(errorMessage);
      }
    } catch (err) { 
      toast.error("Lỗi kết nối hệ thống!"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (loading || !bookingData) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Nút quay lại */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest mb-8">
          <ChevronLeft size={14}/> Quay lại chọn ghế
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: THÔNG TIN VÉ & VOUCHER */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Thẻ phim chính */}
            <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                {/* CẬP NHẬT: Bọc qua hàm getImageUrl chuẩn hóa link ảnh từ Cloudinary/Local */}
                <img src={getImageUrl(bookingData.movieImage)} alt="Poster" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter mb-4 leading-none">
                  {bookingData.movieTitle}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full"><Calendar size={12} className="text-red-600"/> {bookingData.date}</div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full"><Clock size={12} className="text-red-600"/> {bookingData.time}</div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full"><Monitor size={12} className="text-red-600"/> {bookingData.roomName}</div>
                </div>
              </div>
            </div>

            {/* Thông tin rạp & Khách hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem]">
                <p className="text-[9px] font-black text-red-600 uppercase mb-2">Vị trí ghế</p>
                <div className="flex flex-wrap gap-2">
                  {bookingData.selectedSeats?.map((s: any) => (
                    <span key={s.id} className="text-sm font-black text-white">{s.seatRow}{s.seatNumber}</span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{bookingData.cinemaName}</p>
              </div>
              <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem]">
                <p className="text-[9px] font-black text-red-600 uppercase mb-2">Người đặt</p>
                <p className="text-sm font-black uppercase italic">{userData?.fullName || "Khách hàng"}</p>
                <p className="text-[10px] text-zinc-600 font-bold">{userData?.email}</p>
              </div>
            </div>

            {/* PHẦN VOUCHER */}
            <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2"><TicketPercent size={14}/> Ưu đãi dành cho bạn</h3>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{validVouchers.length} mã khả dụng</span>
              </div>
              
              {validVouchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validVouchers.map((v) => {
                    const isSelected = selectedVoucher?.id === v.id;
                    return (
                      <button 
                        key={v.id}
                        onClick={() => setSelectedVoucher(isSelected ? null : v)}
                        className={`p-5 rounded-[2rem] border text-left transition-all relative overflow-hidden group ${
                          isSelected ? 'bg-red-600 border-red-600 shadow-xl' : 'bg-black/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-sm font-[1000] italic uppercase block leading-none">{v.code}</span>
                            <p className="text-[9px] font-bold text-zinc-500 line-clamp-1">{v.title}</p>
                            <p className={`text-[8px] font-black uppercase ${isSelected ? 'text-white/60' : 'text-zinc-700'}`}>Hạn: {new Date(v.endDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div className={`text-xs font-[1000] italic ${isSelected ? 'text-white' : 'text-red-600'}`}>
                            -{v.discountValue.toLocaleString()}đ
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="absolute -right-2 -bottom-2 text-white/10" size={60} />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Không có voucher phù hợp</p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: HÓA ĐƠN & THANH TOÁN */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-8 sticky top-10 space-y-8">
              <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter border-b border-white/5 pb-4">Tóm tắt đơn</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                  <span>Tạm tính</span>
                  <span className="text-white">{subTotal.toLocaleString()}đ</span>
                </div>
                
                {selectedVoucher && (
                  <div className="flex justify-between text-[10px] font-black uppercase text-green-500 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <p className="text-[9px] font-black uppercase text-zinc-600 text-center tracking-widest">Phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['VNPAY', 'MOMO'].map(method => (
                      <button 
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${paymentMethod === method ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
                      >
                        {method === 'VNPAY' ? <Wallet size={16}/> : <CreditCard size={16}/>}
                        <span className="text-[8px] font-black">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-zinc-500 mb-1">Tổng thanh toán:</span>
                  <span className="text-4xl font-[1000] italic text-red-600 tracking-tighter leading-none">{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>

              <button 
                onClick={handleFinalCheckout}
                disabled={isProcessing}
                className="w-full py-6 bg-red-600 rounded-[2rem] font-[1000] italic uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Xác nhận ngay</>}
              </button>
              
              <p className="text-[8px] text-center text-zinc-600 font-bold uppercase tracking-tighter">
                Bằng việc xác nhận, bạn đồng ý với các điều khoản của A&K Cinema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hiệu ứng nền Blur */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-900/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}