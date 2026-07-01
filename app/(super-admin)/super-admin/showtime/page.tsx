"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiSuperAdminRequest } from '@/app/lib/api';
import { 
  Loader2, Film, ChevronRight, 
  X, Building2, ShieldCheck, 
  Calendar as CalendarIcon, ArrowUpRight, CheckCircle2, XCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
dayjs.locale('vi');

export default function CinemaManagementPage() {
  const router = useRouter();
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'PENDING_CANCEL'>('ALL');
  const [timeView, setTimeView] = useState<'WEEK' | 'MONTH' | 'ALL'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  useEffect(() => { fetchShowtimes(); }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await apiSuperAdminRequest('/api/v1/showtimes');
      const responseData = await res.json();
      setShowtimes(responseData.data || []);
    } catch (err) { 
      toast.error("Lỗi đồng bộ dữ liệu hệ thống!"); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredShowtimes = useMemo(() => {
    const now = dayjs();
    return showtimes.filter(show => {
      const showTime = dayjs(show.startTime);
      
      if (filterStatus === 'PENDING_CANCEL') return show.status === 'PENDING_CANCEL';
      if (filterStatus === 'UPCOMING' && (!showTime.isAfter(now) || show.status === 'CANCELLED')) return false;
      if (filterStatus === 'PAST' && showTime.isAfter(now) && show.status !== 'CANCELLED') return false;
      
      if (timeView === 'WEEK') return showTime.isSame(now, 'week');
      if (timeView === 'MONTH') {
        return showTime.month() === selectedMonth && showTime.isSame(now, 'year');
      }
      return true;
    });
  }, [showtimes, filterStatus, timeView, selectedMonth]);

  const cinemaMap = useMemo(() => {
    return filteredShowtimes.reduce((acc: any, curr: any) => {
      const cinemaName = curr.cinemaItem?.cinema?.name || "Hệ thống rạp";
      const branchId = curr.cinemaItem?.id;
      if (!acc[cinemaName]) acc[cinemaName] = {};
      if (!acc[cinemaName][branchId]) acc[cinemaName][branchId] = { info: curr.cinemaItem, shows: [] };
      acc[cinemaName][branchId].shows.push(curr);
      return acc;
    }, {});
  }, [filteredShowtimes]);

  const handleApproveCancel = async (e: any, id: number) => {
    e.stopPropagation();
    const toastId = toast.loading("Đang xử lý duyệt hủy...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/showtimes/${id}/approve-cancel`, { method: "POST" });
      if (res.ok) {
        toast.success("Đã duyệt hủy và vô hiệu hóa các vé liên quan!", { id: toastId });
        fetchShowtimes();
      } else {
        toast.error("Lỗi duyệt hủy!", { id: toastId });
      }
    } catch (err) { toast.error("Lỗi kết nối!", { id: toastId }); }
  };

  const handleRejectCancel = async (e: any, id: number) => {
    e.stopPropagation();
    const toastId = toast.loading("Đang từ chối yêu cầu...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/showtimes/${id}/reject-cancel`, { method: "POST" });
      if (res.ok) {
        toast.success("Đã từ chối, suất chiếu hoạt động bình thường!", { id: toastId });
        fetchShowtimes();
      } else {
        toast.error("Lỗi xử lý!", { id: toastId });
      }
    } catch (err) { toast.error("Lỗi kết nối!", { id: toastId }); }
  };

  // 🔥 Tính tổng số yêu cầu hủy để hiển thị lên Badge
  const totalPendingCancel = useMemo(() => {
    return showtimes.filter(s => s.status === 'PENDING_CANCEL').length;
  }, [showtimes]);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600 opacity-80" size={32} />
      <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest animate-pulse">Đang đồng bộ trục thời gian...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster position="top-right" toastOptions={{ style: { background: '#060608', color: '#fff', border: '1px solid #18181b', borderRadius: '0.75rem', fontSize: '13px' }}} />
      
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-6 border-b border-zinc-900 pb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Phân hệ quản trị cao cấp</span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Tổng lịch chiếu phim
              </h1>
            </div>

            {/* 🔥 BỘ LỌC ĐÃ ĐƯỢC THIẾT KẾ LẠI: MÀU XÁM ĐỒNG BỘ */}
            <div className="flex bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800/80 shadow-lg overflow-x-auto [scrollbar-width:none]">
              {(['ALL', 'UPCOMING', 'PAST', 'PENDING_CANCEL'] as const).map((s) => {
                const labels: any = { ALL: 'Tất cả', UPCOMING: 'Sắp chiếu', PAST: 'Lịch sử', PENDING_CANCEL: 'Yêu cầu hủy' };
                const isActive = filterStatus === s;
                return (
                  <button 
                    key={s} 
                    onClick={() => setFilterStatus(s)}
                    className={`relative flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-200 whitespace-nowrap ${
                      isActive 
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50' // Trạng thái Active: Màu xám đẹp
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
                    }`}
                  >
                    {labels[s]}
                    
                    {/* Badge đếm số lượng cho nút Yêu cầu hủy */}
                    {s === 'PENDING_CANCEL' && totalPendingCancel > 0 && (
                      <span className={`px-1.5 py-0.5 rounded flex items-center justify-center text-[9px] font-black leading-none ${
                         isActive ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-orange-500'
                      }`}>
                        {totalPendingCancel}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-[#060608]/50 p-3 rounded-xl border border-zinc-900">
             <div className="flex items-center gap-3 px-3 border-r border-zinc-900 shrink-0">
                <CalendarIcon size={16} className="text-zinc-500" />
                <div className="flex bg-[#020202] p-1 rounded-md border border-zinc-900">
                   {(['WEEK', 'MONTH', 'ALL'] as const).map((v) => (
                      <button 
                        key={v} 
                        onClick={() => setTimeView(v)}
                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                          timeView === v ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {v === 'WEEK' ? 'Tuần' : v === 'MONTH' ? 'Tháng' : 'Tất cả'}
                      </button>
                   ))}
                </div>
             </div>

             <div className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedMonth(i); setTimeView('MONTH'); }}
                    className={`min-w-[42px] h-[42px] rounded-lg flex flex-col items-center justify-center transition-all border ${
                      selectedMonth === i && timeView === 'MONTH'
                        ? 'bg-red-600 border-transparent text-white shadow-md font-black' 
                        : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[7px] font-bold uppercase opacity-50 leading-none mb-0.5">Thg</span>
                    <span className="text-xs font-bold leading-none">{i + 1}</span>
                  </button>
                ))}
             </div>
          </div>
        </header>

        <div className="space-y-12">
          {Object.keys(cinemaMap).map((cinemaName) => (
            <div key={cinemaName} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-base font-black uppercase tracking-tight text-zinc-200">
                  {cinemaName}
                </h2>
                <div className="h-[1px] flex-1 bg-zinc-900" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(cinemaMap[cinemaName]).map((branch: any) => {
                  const pendingCount = branch.shows.filter((s:any) => s.status === 'PENDING_CANCEL').length;
                  
                  return (
                    <div 
                      key={branch.info.id}
                      onClick={() => { setSelectedBranch(branch); setIsModalOpen(true); }}
                      className="relative group/card bg-[#060608] border border-zinc-900 rounded-xl p-6 hover:border-zinc-800 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {pendingCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center border-2 border-[#020202] text-white text-[10px] font-black shadow-lg animate-bounce">
                          {pendingCount}
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-11 h-11 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 group-hover/card:bg-zinc-900 group-hover/card:text-white transition-all">
                              <Building2 size={18} />
                           </div>
                           <div className="text-right">
                              <span className="block text-2xl font-black text-zinc-800 group-hover/card:text-red-600/30 transition-colors leading-none tracking-tight">
                                 {String(branch.shows.length).padStart(2, '0')}
                              </span>
                              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Suất chiếu</span>
                           </div>
                        </div>
                        
                        <h3 className="text-sm font-bold uppercase text-zinc-200 group-hover/card:text-white transition-colors mb-1 truncate">
                          {branch.info.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 border-l border-zinc-800 pl-2.5 truncate mb-6">
                          {branch.info.address}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide group-hover/card:text-zinc-400 transition-colors flex items-center gap-1">
                           Xem chi tiết danh sách <ChevronRight size={12} />
                         </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {Object.keys(cinemaMap).length === 0 && (
            <div className="py-24 text-center border border-zinc-900 border-dashed bg-zinc-950/20 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Không tìm thấy dữ liệu nào</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#060608] border border-zinc-900 w-full max-w-3xl max-h-[85vh] rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all">
            
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <div className="space-y-0.5">
                <h2 className="text-base font-black uppercase tracking-tight text-white">{selectedBranch.info.name}</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Danh sách suất chiếu đang lọc</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:text-white rounded-md transition-all">
                <X size={16}/>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3 flex-1 [scrollbar-width:thin] border-zinc-900">
              {selectedBranch.shows.sort((a: any, b: any) => dayjs(b.startTime).unix() - dayjs(a.startTime).unix()).map((show: any) => (
                <div 
                  key={show.id} 
                  onClick={() => router.push(`/super-admin/showtime/${show.id}`)}
                  className={`group/item flex flex-col p-4 bg-zinc-950/50 border rounded-lg transition-all cursor-pointer ${
                    show.status === 'PENDING_CANCEL' ? 'border-orange-900/50 bg-orange-950/10' : 
                    show.status === 'CANCELLED' ? 'border-red-900/30 opacity-60' : 'border-zinc-900/60 hover:bg-zinc-900/40 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 border rounded-lg flex items-center justify-center shrink-0 transition-all ${
                         show.status === 'CANCELLED' ? 'bg-red-950/30 border-red-900/50 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 group-hover/item:text-white group-hover/item:bg-red-600 group-hover/item:border-transparent'
                      }`}>
                        <Film size={16} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                         <div className="flex items-center gap-2">
                           <span className="inline-block px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-500 rounded uppercase">
                             Phòng {show.room?.name}
                           </span>
                           {show.status === 'CANCELLED' && (
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">ĐÃ HỦY</span>
                           )}
                         </div>
                         <h4 className={`text-sm font-bold uppercase transition-colors truncate tracking-tight ${show.status === 'CANCELLED' ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover/item:text-white'}`}>
                           {show.movie?.title}
                         </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 shrink-0 text-right">
                       <div>
                          <span className="text-xl font-black text-white tracking-tight leading-none block">
                             {dayjs(show.startTime).format('HH:mm')}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                            {dayjs(show.startTime).format('DD/MM/YYYY')}
                          </span>
                       </div>
                       <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/item:bg-white group-hover/item:text-black group-hover/item:border-transparent transition-all">
                          <ArrowUpRight size={14} />
                       </div>
                    </div>
                  </div>

                  {/* 🔥 KHU VỰC HIỂN THỊ YÊU CẦU HỦY */}
                  {show.status === 'PENDING_CANCEL' && (
                    <div className="mt-4 pt-4 border-t border-orange-900/30">
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                             <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-1">Lý do xin hủy từ cơ sở:</span>
                             <p className="text-xs text-zinc-300 italic border-l-2 border-orange-600 pl-2">{show.cancelReason}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                             <button 
                               onClick={(e) => handleRejectCancel(e, show.id)}
                               className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all"
                             >
                                <XCircle size={14} /> Từ chối
                             </button>
                             <button 
                               onClick={(e) => handleApproveCancel(e, show.id)}
                               className="px-3 py-1.5 bg-orange-600 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
                             >
                                <CheckCircle2 size={14} /> Duyệt Hủy
                             </button>
                          </div>
                       </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}