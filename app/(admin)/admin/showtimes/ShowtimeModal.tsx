"use client";
import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Monitor, Film } from "lucide-react";
import toast from "react-hot-toast";

export default function ShowtimeModal({ isOpen, onClose, onSave, editData, movies, rooms }: any) {
  const [formData, setFormData] = useState<any>({ movieId: 0, roomId: 0, startTime: "" });

  useEffect(() => {
    if (isOpen) {
      if (editData?.id) { // Trường hợp SỬA
        const date = new Date(editData.startTime);
        const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setFormData({
          id: editData.id,
          movieId: editData.movie?.id || editData.movieId,
          roomId: editData.room?.id || editData.roomId,
          startTime: localISO,
        });
      } else { // Trường hợp THÊM
        setFormData({ 
          movieId: 0, 
          roomId: editData?.roomId || 0, 
          startTime: editData?.startTime ? `${editData.startTime}T09:00` : "" 
        });
      }
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-[1000] italic uppercase text-white tracking-tighter">
            {editData?.id ? "Cập nhật" : "Thiết lập"} <span className="text-red-600">Suất chiếu</span>
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Chọn phim</label>
            <select value={formData.movieId} onChange={(e) => setFormData({ ...formData, movieId: Number(e.target.value) })} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm text-white">
              <option value={0} disabled>-- Danh sách phim --</option>
              {movies.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Phòng chiếu</label>
            <select value={formData.roomId} onChange={(e) => setFormData({ ...formData, roomId: Number(e.target.value) })} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm text-white">
              <option value={0} disabled>-- Chọn phòng --</option>
              {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Giờ bắt đầu</label>
            <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm text-white [color-scheme:dark]" />
          </div>

          <button onClick={() => onSave(formData)} className="w-full bg-white text-black py-5 rounded-2xl font-[1000] uppercase text-xs hover:bg-red-600 hover:text-white transition-all">
            Xác nhận hệ thống
          </button>
        </div>
      </div>
    </div>
  );
}