"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Loader2, Search, Clock, ChevronLeft, ChevronRight, FileSpreadsheet, MessageSquare, Star } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiSuperAdminRequest, getImageUrl } from '@/app/lib/api';
import ImportMovieModal from './ImportMovieModal'; 
import ReviewManagementModal from './ReviewManagementModal'; // 🎯 GỌI COMPONENT VÀO

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState({ isOpen: false, movieId: null, movieTitle: "" });

  const fetchMovies = async (search = "", pageNum = 0) => {
    setLoading(true);
    try {
      const url = `/api/v1/movies?search=${encodeURIComponent(search)}&page=${pageNum}&size=10`;
      const response = await apiSuperAdminRequest(url);
      const result = await response.json();
      
      if (response.ok) {
        setMovies(result.data?.content || []);
        setTotalPages(result.data?.totalPages || 0);
      } else {
        toast.error("Không có quyền truy cập dữ liệu lõi!");
      }
    } catch (error) { 
      toast.error("Lỗi kết nối máy chủ nguồn!"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => { 
      setPage(0); 
      fetchMovies(searchTerm, 0); 
    }, 550);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchMovies(searchTerm, page);
  }, [page]);

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="text-white p-1">
        <p className="text-[10px] font-bold uppercase mb-3 tracking-widest text-zinc-300">Xác nhận hủy phim này khỏi hệ thống?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const res = await apiSuperAdminRequest(`/api/v1/movies/${id}`, { method: 'DELETE' });
              if (res.ok) { 
                toast.success("Đã xóa phim thành công!"); 
                fetchMovies(searchTerm, page); 
              } else {
                toast.error("Không thể xóa phim này!");
              }
            }} 
            className="bg-red-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-all shadow-md shadow-red-900/20"
          >
            Xóa Vĩnh Viễn
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-zinc-800 px-4 py-2 rounded-lg text-[9px] font-bold uppercase hover:bg-zinc-700 transition-all text-zinc-300"
          >
            Hủy Bỏ
          </button>
        </div>
      </div>
    ), { style: { background: '#09090b', border: '1px solid #1c1c1f', borderRadius: '12px' } });
  };

  return (
    <div className="p-3 md:p-5 space-y-2 max-w-[1600px] mx-auto animate-in fade-in duration-300 min-h-screen bg-[#020202] text-zinc-400 select-none">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#060608] p-6 rounded-xl border border-zinc-900 shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
            Kho <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">Phim</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_6px_#dc2626]" />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Hệ thống quản lý nội dung phim</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="relative group flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={14} />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Tìm kiếm danh mục phim..."
              className="bg-zinc-950 border border-zinc-900 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 w-full transition-all placeholder:text-zinc-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsImportOpen(true)}
            className="bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-4 h-[42px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
          >
            <FileSpreadsheet size={14} className="text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]" /> Import Excel
          </button>

          <Link href="/super-admin/movie/create" className="bg-red-600 hover:bg-red-700 text-white px-5 h-[42px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-red-950/20 active:scale-98">
            <Plus size={15} /> Thêm Phim
          </Link>
        </div>
      </div>

      {/* CORE DATA TABLE */}
      <div className="bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden shadow-md min-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/60 text-[9px] font-black uppercase text-zinc-500 tracking-wider border-b border-zinc-900">
              <th className="px-8 py-4.5">Thông Tin Phim</th>
              <th className="px-8 py-4.5">Phân Loại / Thời Lượng</th>
              <th className="px-8 py-4.5">Trạng Thái</th>
              <th className="px-8 py-4.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/30">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-40 text-center">
                  <Loader2 className="animate-spin mx-auto text-red-600 opacity-80" size={26} />
                </td>
              </tr>
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-40 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Không tìm thấy dữ liệu phim
                </td>
              </tr>
            ) : (
              movies.map((movie: any) => (
                <tr key={movie.id} className="group hover:bg-zinc-950/30 transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-14 shrink-0 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-sm">
                        <img 
                          src={movie.posterUrl && movie.posterUrl.startsWith('http') 
                                ? movie.posterUrl 
                                : getImageUrl(movie.posterUrl)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/100x150?text=No+Poster")}
                          alt={movie.title}
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                       <Link
                        href={`/super-admin/movie/${movie.id}`}
                        className="text-zinc-200 font-black uppercase tracking-tight text-sm truncate group-hover:text-red-500 transition-colors"
                      >
                        {movie.title}
                      </Link>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-wider leading-none">
                            ID: {movie.id}
                          </p>
                          <span className="text-zinc-700 text-[8px]">•</span>
                          {movie.rating && movie.rating > 0 ? (
                            <p className="text-[10px] font-black text-amber-500 flex items-center gap-1">
                              <Star size={10} className="fill-amber-500" />
                              {Number(movie.rating).toFixed(1)}
                            </p>
                          ) : (
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                              Chưa có đánh giá
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {movie.genreNames && Array.isArray(movie.genreNames) && movie.genreNames.length > 0 ? (
                          movie.genreNames.map((genreName: string, index: number) => (
                            <span 
                              key={index} 
                              className="text-[8px] font-black text-red-400 bg-red-950/20 border border-red-900/40 px-2 py-0.5 rounded uppercase tracking-wider transition-all hover:bg-red-950/40"
                            >
                              {genreName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[8px] font-black text-zinc-600 bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            CHƯA PHÂN LOẠI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                        <Clock size={11} className="text-zinc-600" /> {movie.duration} PHÚT
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${movie.status === 'SHOWING' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${movie.status === 'SHOWING' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`} />
                      <span>{movie.status === 'SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2 transition-all">
                      <button 
                        onClick={() => setReviewModalData({ isOpen: true, movieId: movie.id, movieTitle: movie.title })}
                        className="w-8 h-8 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-lg text-zinc-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                        title="Quản lý đánh giá"
                      >
                        <MessageSquare size={13} />
                      </button>

                      <Link 
                        href={`/super-admin/movie/edit/${movie.id}`} 
                        className="w-8 h-8 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-lg text-zinc-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                        title="Chỉnh sửa phim"
                      >
                        <Edit3 size={13} />
                      </Link>

                      <button 
                        onClick={() => handleDelete(movie.id)} 
                        className="w-8 h-8 bg-zinc-950 border border-zinc-800 hover:border-red-900 hover:bg-red-950/20 rounded-lg text-zinc-500 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                        title="Xóa phim"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="px-8 py-4 flex items-center justify-between bg-zinc-950/40 border-t border-zinc-900">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
            Hiển thị trang <span className="text-zinc-300">{page + 1}</span> / <span className="text-zinc-300">{totalPages}</span>
          </div>
          <div className="flex gap-1.5">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(page - 1)}
              className="px-3 h-8 rounded-lg bg-zinc-950 text-zinc-500 border border-zinc-900 disabled:opacity-10 hover:text-white hover:border-zinc-800 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
            >
              <ChevronLeft size={13} /> Trước
            </button>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(page + 1)}
              className="px-3 h-8 rounded-lg bg-zinc-950 text-zinc-500 border border-zinc-900 disabled:opacity-10 hover:text-white hover:border-zinc-800 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
            >
              Sau <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      <ImportMovieModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onRefreshData={() => fetchMovies(searchTerm, page)} 
      />

      {/* RENDER MODAL */}
      <ReviewManagementModal
        isOpen={reviewModalData.isOpen}
        movieId={reviewModalData.movieId}
        movieTitle={reviewModalData.movieTitle}
        onClose={() => setReviewModalData({ isOpen: false, movieId: null, movieTitle: "" })}
      />
    </div>
  );
}