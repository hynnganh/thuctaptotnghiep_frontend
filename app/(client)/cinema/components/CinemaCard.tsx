import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CinemaCard({ cinema, isActive, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
        isActive 
          ? 'bg-red-50 border-red-200 shadow-sm' 
          : 'bg-white border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 text-left pr-2">
        <h3 className={`text-[11px] font-black uppercase truncate transition-colors ${isActive ? 'text-red-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
          {cinema.name}
        </h3>
        <p className={`text-[9px] mt-0.5 truncate transition-colors ${isActive ? 'text-red-500/70' : 'text-slate-400'}`}>
          {cinema.address}
        </p>
      </div>
      <ChevronRight 
        size={14} 
        className={isActive ? 'text-red-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'} 
      />
    </div>
  );
}