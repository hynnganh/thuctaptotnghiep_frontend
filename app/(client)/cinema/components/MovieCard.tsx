import React from 'react';
import { Clock, Star } from 'lucide-react';
import { getImageUrl } from '@/app/lib/api';

export default function MovieCard({ movie, onSelect }: any) {
  return (
    <div className="group flex gap-4 p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-red-500/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
      
      {/* Poster thu nhỏ */}
      <div className="shrink-0 w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-slate-100">
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
            <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              {movie.tag}
            </span>
            <h4 className="text-sm font-black uppercase italic truncate text-slate-800 group-hover:text-red-600 transition-colors">
              {movie.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {movie.duration}'</span>
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Star size={10} className="text-amber-500 fill-amber-500" /> {movie.genre}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {movie.formats?.map((f: any, i: number) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1 h-1 bg-red-500 rounded-full" /> {f.type}
              </span>
              <div className="flex flex-wrap gap-2">
                {f.times.map((st: any) => {
                  const isCancelled = st.status === 'CANCELLED' || st.status === 'PENDING_CANCEL';

                  return (
                    <button 
                      key={st.id} 
                      disabled={isCancelled}
                      onClick={() => !isCancelled && onSelect(st.id)} 
                      title={isCancelled ? "Suất chiếu này đã bị hủy" : "Chọn suất chiếu này"}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-sm ${
                        isCancelled 
                          ? 'bg-slate-50 border border-slate-200 text-slate-300 line-through cursor-not-allowed opacity-60' 
                          : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95'
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