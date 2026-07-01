import React from 'react';
import { Clock, Star } from 'lucide-react';
import { getImageUrl } from '@/app/lib/api';

export default function MovieCard({ movie, onSelect }: any) {
  return (
    <div className="group flex gap-4 p-3.5 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-red-600/30 hover:bg-zinc-900/40 transition-all duration-300">
      
      {/* Poster thu nhỏ */}
      <div className="shrink-0 w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5">
        <img 
          src={getImageUrl(movie.image)} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={movie.title} 
        />
      </div>

      {/* Thông tin & Suất chiếu */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-600/20 text-red-500 border border-red-600/30 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              {movie.tag}
            </span>
            <h4 className="text-sm font-black uppercase italic truncate text-white group-hover:text-red-400 transition-colors">
              {movie.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 opacity-60">
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {movie.duration}'</span>
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Star size={10} className="text-amber-500" /> {movie.genre}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {movie.formats?.map((f: any, i: number) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1 h-1 bg-red-500 rounded-full" /> {f.type}
              </span>
              <div className="flex flex-wrap gap-2">
                {f.times.map((st: any) => {
                  // 🔥 KIỂM TRA TRẠNG THÁI SUẤT CHIẾU
                  const isCancelled = st.status === 'CANCELLED' || st.status === 'PENDING_CANCEL';

                  return (
                    <button 
                      key={st.id} 
                      disabled={isCancelled} // Khóa nút
                      onClick={() => !isCancelled && onSelect(st.id)} 
                      title={isCancelled ? "Suất chiếu này đã bị hủy" : "Chọn suất chiếu này"}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-sm ${
                        isCancelled 
                          ? 'bg-zinc-950 border border-zinc-900 text-zinc-700 line-through cursor-not-allowed opacity-60' // Hiệu ứng đã hủy
                          : 'bg-[#0a0a0a] border border-zinc-800 text-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-90' // Hiệu ứng bình thường
                      }`}
                    >
                      {st.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}