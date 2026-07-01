"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiSuperAdminRequest } from '@/app/lib/api';
import { 
  Loader2, ArrowLeft, LayoutGrid, 
  ChevronRight, Disc, ShieldCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SuperAdminRoomViewPage() {
  const params = useParams();
  const router = useRouter();
  const cinemaItemId = params?.id; // Lấy ID cụm rạp từ URL

  const [rooms, setRooms] = useState<any[]>([]);
  const [cinemaItem, setCinemaItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!cinemaItemId) return;
    try {
      setLoading(true);
      const [resItem, resRooms] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/cinema-items/${cinemaItemId}`),
        apiSuperAdminRequest(`/api/v1/rooms/cinema-item/${cinemaItemId}`)
      ]);
      
      const dataItem = await resItem.json();
      const dataRooms = await resRooms.json();
      
      setCinemaItem(dataItem.data || dataItem);
      setRooms(dataRooms.data || dataRooms || []);
    } catch (err) {
      toast.error("Lỗi kết nối dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [cinemaItemId]);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600 opacity-80" size={28} />
      <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase animate-pulse">Đang truy xuất dữ liệu phòng...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }} 
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* NÚT BACK TỐI GIẢN */}
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại
        </button>

        {/* HEADER CHUẨN HOÁ */}
        <header className="border-b border-zinc-900 pb-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-red-600" />
              <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                Giám sát nút: {cinemaItem?.name || "Cinema"}
              </span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Danh sách phòng chiếu
            </h1>
          </div>
        </header>

        {/* ROOM GRID LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id}
              className="group relative bg-[#060608] border border-zinc-900 rounded-xl p-6 transition-all hover:border-red-600/20 overflow-hidden shadow-md cursor-pointer flex flex-col justify-between"
              onClick={() => router.push(`/super-admin/seat/${room.id}`)}
            >
              {/* ID Mờ góc phải */}
              <span className="absolute top-3 right-4 text-3xl font-black text-white/[0.01] group-hover:text-red-600/[0.04] transition-colors tracking-tighter pointer-events-none">
                {String(room.id).padStart(2, '0')}
              </span>

              <div className="w-11 h-11 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-transparent transition-all duration-300 shadow-inner mb-8 relative z-10">
                <LayoutGrid size={18} />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-base font-bold uppercase text-zinc-200 group-hover:text-white transition-colors duration-200 tracking-tight truncate">
                    {room.name}
                  </h3>
                  <div className="w-fit px-2 py-0.5 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-500 tracking-wide">
                    {room.typeRoom || "Laser"}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between group-hover:border-red-600/10 transition-colors">
                  <div className="flex items-center gap-2">
                     <Disc className="text-red-600 opacity-60 group-hover:opacity-100 group-hover:animate-spin transition-all" size={12} />
                     <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 group-hover:text-zinc-400 transition-colors">
                       Cấu hình sơ đồ ghế
                     </span>
                  </div>
                  <ChevronRight size={12} className="text-zinc-600 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="col-span-full py-20 text-center border border-zinc-900 border-dashed bg-zinc-950/40 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Phân hệ chưa có dữ liệu phòng chiếu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}