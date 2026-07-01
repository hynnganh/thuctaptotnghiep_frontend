"use client";
import React from 'react';
import Link from 'next/link';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full text-center">
        {/* Visual 404 */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[150px] font-black text-white/5 leading-none select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle size={64} className="text-red-600 animate-pulse" />
          </div>
        </div>

        {/* Thông báo thân thiện */}
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic mb-4">
          Không tìm thấy <span className="text-red-600">trang yêu cầu</span>
        </h2>
        <p className="text-zinc-500 text-sm mb-10 leading-relaxed px-4">
          Rất tiếc, đường dẫn bạn đang truy cập không tồn tại hoặc đã được chuyển dời. 
          Vui lòng quay lại trang chủ để tiếp tục trải nghiệm.
        </p>

        {/* Nút bấm chuyên nghiệp */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/"
            className="w-full sm:w-auto bg-red-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20"
          >
            <Home size={16} /> Quay về trang chủ
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto bg-zinc-900 border border-white/10 text-zinc-400 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all hover:bg-zinc-800 active:scale-95"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {/* Footer trang lỗi */}
        <div className="mt-16 pt-8 border-t border-white/5 opacity-50">
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
            A&K Cinema • Support Center
          </p>
        </div>
      </div>
    </div>
  );
}