"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Clock, Monitor, MapPin, 
  Star, Loader2, Edit3, Trash2, Calendar, 
  AlertTriangle, X, Send
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiAdminRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import ShowtimeModal from '../ShowtimeModal'; 

export default function ChiTietSuatChieu() {
  const router = useRouter();
  const { id } = useParams();
  
  const [data, setData] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTickets, setHasTickets] = useState(false); // 🔥 State kiểm tra có vé hay chưa
  
  // Trạng thái đóng/mở các Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRequestCancelModalOpen, setIsRequestCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const resUser = await apiAdminRequest('/api/v1/users/me');
      if (!resUser.ok) throw new Error("Unauthorized");
      
      const userRes = await resUser.json();
      const idRapThat = userRes.data?.managedCinemaItemId;

      if (!idRapThat) {
        toast.error("Bạn không có quyền quản lý rạp nào!");
        router.push('/admin/showtimes');
        return;
      }
      setCinemaId(idRapThat);

      // 🔥 Fetch đồng thời Suất chiếu, Phòng, Phim và Vé của suất chiếu đó
      const [resShow, resRoom, resMovie, resTickets] = await Promise.all([
        apiAdminRequest(`/api/v1/showtimes/${id}`),
        apiAdminRequest(`/api/v1/rooms/cinema-item/${idRapThat}`),
        apiAdminRequest("/api/v1/movies?status=SHOWING"),
        apiAdminRequest(`/api/v1/tickets/showtime/${id}`).catch(() => null)
      ]);

      if (resShow.ok) {
        const result = await resShow.json();
        setData(result.data);
      } else {
        toast.error("Không tìm thấy suất chiếu!");
        router.push('/admin/showtimes');
      }

      if (resRoom.ok && resMovie.ok) {
        const r = await resRoom.json();
        const m = await resMovie.json();
        setRooms(Array.isArray(r.data) ? r.data : []);
        const movieList = m.data?.content || m.data || [];
        setMovies(Array.isArray(movieList) ? movieList : []);
      }

      // 🔥 Kiểm tra xem suất chiếu đã có vé PAID hoặc BOOKED chưa
      if (resTickets && resTickets.ok) {
        const tData = await resTickets.json();
        const booked = tData.data?.filter((t: any) => t.status === 'PAID' || t.status === 'BOOKED');
        if (booked && booked.length > 0) setHasTickets(true);
      }

    } catch (err) {
      toast.error("Phiên đăng nhập hết hạn hoặc lỗi kết nối!");
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveEdit = async (formData: any) => {
    if (!cinemaId) return;
    const toastId = toast.loading("Đang cập nhật hệ thống...");
    try {
      const res = await apiAdminRequest(`/api/v1/showtimes/${formData.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...formData, cinemaItemId: cinemaId, price: 75000 }),
      });

      if (res.ok) {
        toast.success("Cập nhật thành công!", { id: toastId });
        setIsEditModalOpen(false);
        fetchData(); 
      } else {
        const result = await res.json().catch(() => ({}));
        toast.error(result.message || "Không thể cập nhật! Có thể do trùng lịch hoặc đã có khách đặt vé.", { id: toastId });
      }
    } catch (e) {
      toast.error("Lỗi hệ thống!", { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false); 
    const toastId = toast.loading("Đang gỡ bỏ suất chiếu...");
    try {
      const res = await apiAdminRequest(`/api/v1/showtimes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa suất chiếu thành công!", { id: toastId });
        router.push('/admin/showtimes');
      } else {
        const result = await res.json().catch(() => ({}));
        toast.error(result.message || "Lỗi hệ thống", { id: toastId });
        
        // 🔥 Nếu Backend chửi là có vé, mở form xin phép hủy
        if (result.message && result.message.includes("xin phép")) {
           setTimeout(() => setIsRequestCancelModalOpen(true), 1000);
        }
      }
    } catch (e) { 
      toast.error("Lỗi kết nối máy chủ!", { id: toastId }); 
    }
  };

  // 🔥 GỬI YÊU CẦU HỦY LÊN SUPER ADMIN
  const handleRequestCancel = async () => {
    if (!cancelReason.trim()) return toast.error("Vui lòng nhập lý do hủy!");
    const toastId = toast.loading("Đang trình báo lên Super Admin...");
    try {
      const res = await apiAdminRequest(`/api/v1/showtimes/${id}/request-cancel?reason=${encodeURIComponent(cancelReason)}`, { method: "POST" });
      if (res.ok) {
        toast.success("Đã gửi yêu cầu hủy thành công. Vui lòng chờ duyệt!", { id: toastId });
        setIsRequestCancelModalOpen(false);
        fetchData(); // Load lại để thấy trạng thái PENDING_CANCEL
      } else {
        const result = await res.json().catch(() => ({}));
        toast.error(result.message || "Không thể gửi yêu cầu", { id: toastId });
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ!", { id: toastId });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600" size={36} />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Đang đồng bộ dữ liệu</span>
    </div>
  );

  if (!data) return null;

  const startTime = new Date(data.startTime);
  const movieDuration = data.movie.duration || 0;
  const endTime = new Date(startTime.getTime() + movieDuration * 60000);

  // 🔥 XÁM NÚT SỬA KHI CÓ VÉ HOẶC ĐANG CHỜ DUYỆT HOẶC ĐÃ HỦY
  const isEditDisabled = hasTickets || data.status === 'PENDING_CANCEL' || data.status === 'CANCELLED';
  const isDeleteDisabled = data.status === 'PENDING_CANCEL' || data.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 p-6 font-sans antialiased select-none tracking-tight">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto space-y-6"> 
        
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft size={16} className="text-red-600" /> Trở về quản lý lịch chiếu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-900 shadow-xl group">
              <img 
                src={data.movie.posterUrl} 
                alt={data.movie.title}
                className={`w-full aspect-[2/3] object-cover transition-transform duration-500 ${data.status === 'CANCELLED' ? 'grayscale opacity-50' : 'group-hover:scale-102'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              {/* HIỂN THỊ TRẠNG THÁI SUẤT CHIẾU */}
              <div className="absolute top-4 right-4">
                 {data.status === 'PENDING_CANCEL' && (
                    <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg animate-pulse">Đang chờ duyệt hủy</span>
                 )}
                 {data.status === 'CANCELLED' && (
                    <span className="px-3 py-1 bg-red-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">Đã hủy</span>
                 )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
                <span className="px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md inline-block">
                  {data.movie.genre?.name || "Premium"}
                </span>
                <h1 className={`text-xl font-[1000] uppercase text-white tracking-tighter leading-tight drop-shadow-md ${data.status === 'CANCELLED' ? 'line-through decoration-red-600 decoration-2' : ''}`}>
                  {data.movie.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <button 
                 disabled={isEditDisabled}
                 onClick={() => setIsEditModalOpen(true)}
                 className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                    isEditDisabled 
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
                      : 'bg-white text-black hover:bg-red-600 hover:text-white active:scale-[0.99]'
                 }`}
               >
                 <Edit3 size={16} /> Chỉnh sửa lịch {hasTickets && data.status === 'ACTIVE' && "(Đã có vé)"}
               </button>
               
               <button 
                 disabled={isDeleteDisabled}
                 onClick={() => setIsDeleteModalOpen(true)}
                 className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase border transition-all ${
                    isDeleteDisabled 
                      ? 'bg-zinc-950 text-zinc-700 border-zinc-900 cursor-not-allowed' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-[0.99]'
                 }`}
               >
                 <Trash2 size={16} /> Gỡ bỏ suất
               </button>
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-px bg-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6 bg-zinc-950/60 backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-1.5 uppercase font-black text-[9px] text-zinc-500 tracking-wider">
                  <Clock size={12} className="text-red-600"/> Giờ khởi chiếu
                </div>
                <p className="text-4xl font-[1000] italic text-white tracking-tighter">
                  {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] font-black text-zinc-400 mt-2 uppercase inline-flex items-center gap-1.5">
                  <Calendar size={12} className="text-red-600"/> {startTime.toLocaleDateString('vi-VN')}
                </p>
              </div>
              
              <div className="p-6 bg-zinc-950/60 backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-1.5 uppercase font-black text-[9px] text-zinc-500 tracking-wider">
                  <Clock size={12} className="text-zinc-600" /> Hạ màn dự kiến
                </div>
                <p className="text-4xl font-[1000] italic text-zinc-500 tracking-tighter">
                  {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] font-black text-red-600 mt-2.5 uppercase tracking-widest">
                  {movieDuration} PHÚT TRÌNH CHIẾU
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl group transition-all">
                <Monitor size={16} className="text-zinc-600 group-hover:text-red-500 mb-2.5 transition-colors"/>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mb-0.5">Phòng chiếu</p>
                <h3 className="text-lg font-black uppercase text-zinc-200 group-hover:text-white transition-colors">{data.room.name}</h3>
                <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-tight">{data.room.totalSeats} Ghế thiết lập</p>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl group transition-all">
                <MapPin size={16} className="text-zinc-600 group-hover:text-red-500 mb-2.5 transition-colors"/>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mb-0.5">Cơ sở hiển thị</p>
                <h3 className="text-lg font-black uppercase text-zinc-200 group-hover:text-white truncate">
                  {data.cinemaItem.name}
                </h3>
                <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-tight">{data.cinemaItem.city || "Hệ thống"}</p>
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-zinc-900 pb-4">
                  <div>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-0.5">Đạo diễn</p>
                    <p className="text-xs text-zinc-300 font-bold truncate">{data.movie.director || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-0.5">Quốc gia</p>
                    <p className="text-xs text-zinc-300 font-bold">{data.movie.country || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-0.5">Đánh giá</p>
                    <div className="flex items-center gap-1 text-red-500 mt-0.5">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-black text-white">{data.movie.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Nội dung tóm tắt</span>
                   </div>
                   <p className="text-xs leading-relaxed text-zinc-400 font-medium pl-3 border-l border-zinc-900">
                     {data.movie.description || "Chưa có nội dung mô tả cụ thể cho phim này."}
                   </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <ShowtimeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} editData={data} movies={movies} rooms={rooms} />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle size={20} /></div>
              <div>
                <h3 className="text-sm font-[1000] uppercase tracking-wide text-white">Xác nhận gỡ suất chiếu</h3>
                <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Hành động không thể hoàn tác</p>
              </div>
            </div>
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5 text-xs">
              <p className="text-zinc-400 font-medium">Bạn đang thực hiện lệnh xóa suất chiếu của bộ phim:</p>
              <p className="text-white font-black uppercase text-sm truncate">{data.movie.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-black uppercase text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">Hủy yêu cầu</button>
              <button onClick={handleConfirmDelete} className="w-full py-3 bg-red-600 text-white rounded-xl font-black uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODAL YÊU CẦU HỦY KHI CÓ VÉ */}
      {isRequestCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsRequestCancelModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-950/50 border border-orange-900/50 flex items-center justify-center text-orange-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-[1000] uppercase tracking-wide text-white">Yêu Cầu Phê Duyệt Hủy</h3>
                <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Suất chiếu đã có khách đặt vé</p>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-black uppercase text-zinc-400">Lý do hủy bắt buộc</label>
               <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Rạp bị cúp điện, hỏng máy chiếu..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-sm rounded-xl p-3 h-24 focus:outline-none focus:border-orange-600 transition-colors resize-none"
               />
            </div>

            <button
               onClick={handleRequestCancel}
               className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-600 text-white rounded-xl font-black text-xs uppercase hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
            >
               <Send size={16} /> Gửi trình báo Super Admin
            </button>
          </div>
        </div>
      )}

    </div>
  );
}