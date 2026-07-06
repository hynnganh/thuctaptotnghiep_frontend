"use client";
import React, { useState, useEffect, use } from 'react';
import { Play, Star, Award, Calendar, Globe, Film, Ticket, Loader2, X, ArrowLeft, Shield, Users, MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, getImageUrl } from "@/app/lib/api"; 
import toast, { Toaster } from 'react-hot-toast';
import ReviewModal from '../ReviewModal';
import ReviewList from '../ReviewList';

const resolveMovieImg = (url: string) => {
  if (!url) return "https://placehold.co/400x600?text=No+Poster";
  return url.startsWith('http') ? url : getImageUrl(url);
};

const formatReviewCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

function SidebarMovieList({ title, movies, loading }: { title: string, movies: any[], loading: boolean }) {
  if (loading) return <div className="flex justify-center py-6"><Loader2 className="animate-spin text-red-600" size={20} /></div>;
  if (movies.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">{title}</h3>
      <div className="space-y-3">
        {movies.slice(0, 4).map((m) => (
          <Link key={m.id} href={`/movies/${m.id}`} className="flex gap-3 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group">
            <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
              <img src={resolveMovieImg(m.posterUrl)} className="w-full h-full object-cover" alt={m.title} />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors uppercase truncate">{m.title}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.duration} phút</p>
              {m.rating > 0 && (
                <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5 mt-0.5">
                  ★ {Number(m.rating).toFixed(1)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState<any>(null);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      try {
        const resShowing = await apiRequest(`/api/v1/movies?status=SHOWING&size=6`);
        const resUpcoming = await apiRequest(`/api/v1/movies?status=COMING_SOON&size=6`);
        if (resShowing.ok) {
          const data = await resShowing.json();
          setShowingMovies((data.data?.content || []).filter((m: any) => m.id.toString() !== movieId));
        }
        if (resUpcoming.ok) {
          const data = await resUpcoming.json();
          setUpcomingMovies(data.data?.content || []);
        }
      } catch (err) { 
        console.error("Lỗi tải gợi ý:", err); 
      } finally { 
        setRelLoading(false); 
      }
    };

    const fetchMovieDetail = async () => {
      try {
        const response = await apiRequest(`/api/v1/movies/${movieId}`);
        if (response.ok) {
          const resData = await response.json();
          setMovie(resData.data || resData);
          fetchRelatedContent();
        }
      } catch (error) { 
        toast.error("Không thể tải thông tin phim"); 
      } finally { 
        setLoading(false); 
      }
    };

    if (movieId) fetchMovieDetail();
  }, [movieId]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 font-bold gap-4">
      <p>Không tìm thấy thông tin phim hoặc máy chủ lỗi!</p>
      <button onClick={() => router.push('/')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs uppercase font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm">Về trang chủ</button>
    </div>
  );

  const hasRating = movie.rating !== undefined && movie.rating !== null && Number(movie.rating) > 0;
  const movieGenresList = movie.genreNames || movie.genres?.map((g: any) => g.name) || [];
  const movieGenresString = movieGenresList.length > 0 ? movieGenresList.join(" • ") : "Đang cập nhật";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 font-sans pb-24 selection:bg-red-600 selection:text-white relative">
      <Toaster position="top-center" />

      {/* Vệt màu đỏ loang ẩn nhẹ nhàng dưới nền sáng */}
      <div className="absolute top-[50vh] left-1/4 w-[600px] h-[300px] bg-gradient-to-r from-red-500/5 to-rose-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Modal Trailer */}
      {showTrailer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowTrailer(false)} />
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-red-600 rounded-lg transition-colors text-white border border-white/10">
              <X size={16} />
            </button>
            <iframe src={getEmbedUrl(movie.trailerUrl)} className="w-full h-full" allow="autoplay" allowFullScreen />
          </div>
        </div>
      )}

      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} movieTitle={movie.title} movieId={movieId} />
      
      {/* ================= HERO BANNER ĐÃ ĐƯỢC TINH CHỈNH ĐẸP HƠN ================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-12 md:py-16 min-h-[450px] flex items-center">
        <div className="absolute inset-0">
          <img src={resolveMovieImg(movie.posterUrl)} className="w-full h-full object-cover opacity-25 blur-md scale-110" alt="backdrop" />          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        </div>

        {/* Nút Quay Lại đặt gọn gàng phía trên bên trong Container */}
        <div className="absolute top-6 left-6 md:left-12 z-[50]">
          <button onClick={() => router.push('/')} className="group flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md pl-3 pr-4 py-2 rounded-xl hover:bg-red-600 hover:border-red-600 transition-all duration-300">
            <ArrowLeft size={14} className="text-white/80 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">Về trang chủ</span>
          </button>
        </div>

        {/* Khối content chính có padding bottoms/top hợp lý không dính mép */}
        <div className="max-w-6xl mx-auto px-6 w-full relative z-10 mt-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-center">
            
            {/* Poster phẳng nét, đổ bóng sâu rực rỡ */}
            <div className="relative w-40 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 cursor-pointer group bg-slate-900" onClick={() => setShowTrailer(true)}>
              <img src={resolveMovieImg(movie.posterUrl)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="poster" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-red-600 rounded-full shadow-lg text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play size={20} className="fill-white translate-x-[1px]" />
                </div>
              </div>
            </div>

            {/* Thông tin chữ có khoảng trống, layout thoáng hơn hẳn */}
            <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider shadow-sm">{movie.status === "SHOWING" ? "Đang chiếu" : "Sắp chiếu"}</span>
                <span className="bg-white/10 text-white border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm">{movie.duration} PHÚT</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-white line-clamp-2 leading-tight drop-shadow-sm">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-white/90">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                  <Star size={14} fill={hasRating ? "#f59e0b" : "none"} className={hasRating ? "text-amber-500" : "text-slate-500"} />
                  <span className={hasRating ? "font-black text-white" : "font-bold text-slate-400"}>
                    {hasRating ? Number(movie.rating).toFixed(1) : "CHƯA CÓ ĐÁNH GIÁ"}
                  </span>
                  {hasRating && (
                    <span className="text-white/60 text-[11px] font-medium">({formatReviewCount(movie.reviewCount || 0)})</span>
                  )}
                </div>
                
                <span className="hidden md:inline text-white/20">|</span>
                
                <p className="font-semibold text-white/70 max-w-sm truncate">
                  {movieGenresString}
                </p>
              </div>
              
              {/* Cụm Nút Hành Động */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                {movie.status === "SHOWING" && (
                  <Link href={`/movies/${movieId}/booking/`} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]">
                    <Ticket size={14} /> Mua Vé Ngay
                  </Link>
                )}
                <button onClick={() => setShowTrailer(true)} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] backdrop-blur-sm">
                  Xem Trailer
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* ========================================================================= */}

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Cột trái: Chi tiết phim & Đánh giá */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Tóm tắt nội dung */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Tóm tắt cốt truyện
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal bg-white border border-slate-200/60 p-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] whitespace-pre-line">
                {movie.description || "Thông tin tóm tắt nội dung phim đang được cập nhật."}
              </p>
            </div>

            {/* Khối thông tin kỹ thuật hình hộp Light Mode sạch sẽ */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoBox icon={<Film size={14}/>} label="ĐẠO DIỄN" value={movie.director} />
                <InfoBox icon={<Award size={14}/>} label="QUỐC GIA" value={movie.country} />
                <InfoBox icon={<Globe size={14}/>} label="NĂM PHÁT HÀNH" value={movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : "2026"} />
                <InfoBox icon={<Shield size={14}/>} label="PHÂN LOẠI TUỔI" value={movie.ageRating || "P"} />
              </div>
              
              <div className="pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                  <Users size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">DIỄN VIÊN CHÍNH:</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {movie.cast ? movie.cast.split(',').map((a: string) => a.trim()).join(", ") : "Đang cập nhật..."}
                </span>
              </div>
            </div>

            {/* Phân đoạn danh sách Đánh giá */}
            <section className="space-y-6 border-t border-slate-200/80 pt-10">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Bình luận cộng đồng</h3>
                <button 
                  onClick={() => setIsReviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  <MessageSquarePlus size={14} className="text-red-600" /> Viết đánh giá
                </button>
              </div>
              <ReviewList movieId={movieId} />
            </section>
          </div>

          {/* Cột phải Sidebar: Tận dụng kéo traffic sang phim khác */}
          <div className="lg:col-span-4 space-y-6 lg:sticky top-6">
            <SidebarMovieList title="Phim Đang Chiếu Hot" movies={showingMovies} loading={relLoading} />
            <SidebarMovieList title="Phim Sắp Ra Mắt" movies={upcomingMovies} loading={relLoading} />
          </div>

        </div>
      </main>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
      <div className="text-red-600 flex justify-center mb-1">{icon}</div>
      <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">{label}</p>
      <p className="text-xs font-black text-slate-800 uppercase truncate">
        {value || "Cập nhật"}
      </p>
    </div>
  );
}