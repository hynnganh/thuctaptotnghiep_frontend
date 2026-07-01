"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiSuperAdminRequest } from '@/app/lib/api';
import { 
  Loader2, Calendar, Clock, Film, 
  MapPin, ChevronLeft, Monitor, Ticket,
  Star, Globe, User, Layers, Info
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function ShowtimeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showtime, setShowtime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiSuperAdminRequest(`/api/v1/showtimes/${id}`);
        const responseData = await res.json();
        setShowtime(responseData.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết suất chiếu:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600 opacity-80" size={28} />
    </div>
  );

  if (!showtime) return <div className="text-zinc-500 text-xs uppercase tracking-widest text-center py-20 bg-[#020202] min-h-screen">Không tìm thấy suất chiếu hệ thống!</div>;

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* TOP NAV BUTTON */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider"
        >
          <ChevronLeft size={14} /> Quay lại
        </button>

        {/* DETAILS GRID ROW */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* POSTER WRAPPER */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-zinc-900 relative shadow-md bg-zinc-950">
              <img 
                src={showtime.movie?.posterUrl || "/placeholder-movie.jpg"} 
                alt={showtime.movie?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                 <span className="px-2.5 py-1 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-wider">
                    {showtime.movie?.status || "Now Showing"}
                 </span>
              </div>
            </div>
          </div>

          {/* MAIN INFO STREAM */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                {showtime.movie?.title}
              </h1>
              <p className="text-zinc-500 text-[13px] font-medium leading-relaxed max-w-2xl">
                {showtime.movie?.description}
              </p>
            </div>

            {/* QUICK METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoItem icon={<Clock size={13}/>} label="Thời lượng" value={`${showtime.movie?.duration} Phút`} />
              <InfoItem icon={<Star size={13}/>} label="Đánh giá" value={`${showtime.movie?.rating} / 5`} />
              <InfoItem icon={<Globe size={13}/>} label="Quốc gia" value={showtime.movie?.country || "N/A"} />
              <InfoItem icon={<Layers size={13}/>} label="Thể loại" value={showtime.movie?.genre?.name} />
            </div>

            {/* LOCATION AND TIME DETAILS */}
            <div className="p-6 bg-[#060608] border border-zinc-900 rounded-xl space-y-6">
              <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest border-b border-zinc-900 pb-3">
                <Info size={13} />
                <span>Cấu hình thời gian & Phân bổ</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500"><Calendar size={16}/></div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">Ngày khởi chiếu</p>
                      <p className="text-sm font-black text-zinc-200">{dayjs(showtime.startTime).format('DD [Tháng] MM, YYYY')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500"><Clock size={16}/></div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">Khung giờ vận hành</p>
                      <p className="text-sm font-black text-red-500">
                        {dayjs(showtime.startTime).format('HH:mm')} — {dayjs(showtime.endTime).format('HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500"><Monitor size={16}/></div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">Hệ thống phòng</p>
                      <p className="text-sm font-black text-zinc-200">Phòng {showtime.room?.name} ({showtime.room?.totalSeats} Ghế)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-500"><MapPin size={16}/></div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">Điểm đặt cụm rạp</p>
                      <p className="text-sm font-black text-zinc-200 truncate max-w-[280px]">{showtime.cinemaItem?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON TO SEAT MANAGEMENT */}
              <button 
                onClick={() => router.push(`/super-admin/seat/${showtime.room?.id}`)}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Ticket size={15} /> Quản lý sơ đồ ghế phòng
              </button>
            </div>

            {/* TALENT ATTRIBUTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl">
                <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <User size={12}/> Đạo diễn sản xuất
                </span>
                <span className="text-xs font-bold text-zinc-300">{showtime.movie?.director || "Đang cập nhật"}</span>
              </div>
              <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl">
                <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <Film size={12}/> Đội ngũ diễn viên chính
                </span>
                <span className="text-xs font-bold text-zinc-300 truncate block">{showtime.movie?.cast || "Đang cập nhật"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SUB-COMPONENT METRICS CARD
function InfoItem({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-[#060608]/40 p-3.5 rounded-lg border border-zinc-900/60 min-w-0">
      <div className="text-zinc-600 mb-1.5">{icon}</div>
      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs font-black text-zinc-300 uppercase truncate">{value || "N/A"}</p>
    </div>
  );
}