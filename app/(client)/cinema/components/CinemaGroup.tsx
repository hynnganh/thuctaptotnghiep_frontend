import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import CinemaCard from './CinemaCard';

export default function CinemaGroup({ parentName, childrenCinemas, activeChildId, onChildSelect, isExpanded, onToggle }: any) {
  return (
    <div className="mb-1.5 animate-in fade-in slide-in-from-bottom-2">
      {/* THANH RẠP CHA (TONE SÁNG) */}
      <div 
        onClick={onToggle}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
          isExpanded 
            ? 'bg-slate-100/80 border-slate-200 shadow-sm' 
            : 'bg-white border-slate-200/60 hover:bg-slate-50/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPin size={12} className={isExpanded ? 'text-red-600' : 'text-slate-400'} />
          <h2 className={`text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'text-slate-800' : 'text-slate-500'}`}>
            {parentName}
          </h2>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-red-600' : 'text-slate-400'}`} 
        />
      </div>

      {/* DANH SÁCH RẠP CON */}
      <div 
        className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100 mt-2 mb-3' : 'max-h-0 opacity-0 mt-0 mb-0'
        }`}
      >
        <div className="pl-3 border-l border-slate-200 ml-3 mt-1 flex flex-col gap-2">
          {childrenCinemas.map((cinema: any) => (
            <CinemaCard 
              key={cinema.id}
              cinema={cinema}
              isActive={activeChildId === cinema.id}
              onClick={() => onChildSelect(cinema.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}