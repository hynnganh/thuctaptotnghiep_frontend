import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CinemaCard({ cinema, isActive, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
        isActive 
          ? 'bg-red-600/10 border-red-500/50 shadow-sm' 
          : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60 hover:border-white/10'
      }`}
    >
      <div className="min-w-0 text-left pr-2">
        <h3 className={`text-[11px] font-black uppercase truncate transition-colors ${isActive ? 'text-red-500' : 'text-zinc-300 group-hover:text-white'}`}>
          {cinema.name}
        </h3>
        <p className={`text-[9px] mt-0.5 truncate transition-colors ${isActive ? 'text-red-400/70' : 'text-zinc-500'}`}>
          {cinema.address}
        </p>
      </div>
      <ChevronRight 
        size={14} 
        className={isActive ? 'text-red-500 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity'} 
      />
    </div>
  );
}