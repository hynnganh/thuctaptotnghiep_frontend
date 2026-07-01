"use client";
import React, { useState, useEffect, use } from 'react';
import { Play, Star, Award, Calendar, Globe, Film, Ticket, Loader2, X, ArrowLeft, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, getImageUrl } from "@/app/lib/api"; 
import toast, { Toaster } from 'react-hot-toast';
import ReviewModal from '../ReviewModal';
import ReviewList from '../ReviewList';

// --- HÀM TRỢ GIÚP ---
const resolveMovieImg = (url: string) => {
  if (!url) return "https://placehold.co/400x600?text=No+Poster";
  return url.startsWith('http') ? url : getImageUrl(url);
};

// 👥 FORMAT TỔNG LƯỢT ĐÁNH GIÁ
const formatReviewCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// --- COMPONENT: DANH SÁCH PHIM GỢI Ý ---
function MovieHorizontalList({ title, subTitle, movies, loading }: { title: string, subTitle: string, movies: any[], loading: boolean }) {
  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" /></div>;
  if (movies.length === 0) return null;
  return (
    <section className="space-y-6 mt-16">
      <div className="flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em]">{subTitle}</p>
          <h3 className="text-xl font-black uppercase italic text-white">{title}</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {movies.map((m) => {
          const hasListRating = m.rating !== undefined && m.rating !== null && Number(m.rating) > 0;
          const displayGenres = m.genreNames || m.genres?.map((g: any) => g.name) || [];

          return (
            <Link key={m.id} href={`/movies/${m.id}`} className="group space-y-3 block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-lg bg-zinc-900">
                <img src={resolveMovieImg(m.posterUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Play size={24} className="text-white fill-white" />
                </div>
              </div>
              <div className="px-1">
                <h4 className="text-[11px] font-black text-white uppercase truncate group-hover:text-red-500 transition-colors">{m.title}</h4>
                <div className="flex items-center justify-between mt-1">
                   <p className="text-[9px] font-bold text-zinc-600 uppercase line-clamp-1 max-w-[60%]">
                     {displayGenres.length > 0 ? displayGenres.join(" • ") : "Phim"}
                   </p>
                   
                   {hasListRating ? (
                     <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5 shrink-0">
                       ★ {Number(m.rating).toFixed(1)}
                     </span>
                   ) : (
                     <span className="text-[8px] font-black text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded uppercase shrink-0">Mới</span>
                   )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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
        const resShowing = await apiRequest(`/api/v1/movies?status=SHOWING&size=5`);
        const resUpcoming = await apiRequest(`/api/v1/movies?status=COMING_SOON&size=5`);
        if (resShowing.ok) {
          const data = await resShowing.json();
          setShowingMovies((data.data?.content || []).filter((m: any) => m.id.toString() !== movieId));
        }
        if (resUpcoming.ok) {
          const data = await resUpcoming.json();
          setUpcomingMovies(data.data?.content || []);
        }
      } catch (err) { 
        console.error("Lỗi tải danh sách gợi ý", err); 
      } finally { 
        setRelLoading(false); 
      }
    };

    const fetchMovieDetail = async () => {
      try {
        const response = await apiRequest(`/api/v1/movies/${movieId}`);
        if (response.ok) {
          const resData = await response.json();
          const movieData = resData.data || resData;
          setMovie(movieData);
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

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

  if (!movie) return <div className="min-h-screen bg-[#050505] text-center pt-20 text-zinc-500 font-bold">Không tìm thấy thông tin phim hoặc máy chủ lỗi!</div>;

  const hasRating = movie.rating !== undefined && movie.rating !== null && Number(movie.rating) > 0;
  
  const movieGenresList = movie.genreNames || movie.genres?.map((g: any) => g.name) || [];
  const movieGenresString = movieGenresList.length > 0 ? movieGenresList.join(" • ") : "Đang cập nhật";

  // 🎯 FIX: Hiển thị TOÀN BỘ diễn viên và bắt buộc thêm đuôi ",..."
  const formatCast = (castStr: string) => {
    if (!castStr) return "Đang cập nhật...";
    
    // Tách chuỗi bằng dấu phẩy, xóa khoảng trắng thừa ở 2 đầu mỗi tên
    const castList = castStr.split(',').map(a => a.trim());
    
    // Ghép tất cả lại bằng dấu ", " cho đẹp, sau đó nối thêm ",..." ở cuối
    return `${castList.join(", ")},...`; 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans pb-20">
      <Toaster position="top-center" />

      {/* Modal Trailer */}
      {showTrailer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowTrailer(false)} />
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button onClick={() => setShowTrailer(false)} className="absolute top-5 right-5 z-10 p-2 bg-white/10 hover:bg-red-600 rounded-full transition-colors">
              <X size={20} className="text-white" />
            </button>
            <iframe src={getEmbedUrl(movie.trailerUrl)} className="w-full h-full" allow="autoplay" allowFullScreen />
          </div>
        </div>
      )}

      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} movieTitle={movie.title} movieId={movieId} />
      
      {/* Hero Banner */}
      <section className="relative h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={resolveMovieImg(movie.posterUrl)} className="w-full h-full object-cover opacity-30 blur-md scale-110" alt="nền" />          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>

        {/* NÚT QUAY LẠI */}
        <div className="absolute top-8 left-8 z-[50]">
          <button onClick={() => router.push('/')} className="group flex items-center gap-2 transition-all duration-300">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
              <ArrowLeft size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Về trang chủ
            </span>
          </button>
        </div>

        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-6xl mx-auto px-24 w-full flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="relative w-44 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 cursor-pointer group" onClick={() => setShowTrailer(true)}>
              <img src={resolveMovieImg(movie.posterUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="poster" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-4 bg-red-600 rounded-full scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                  <Play size={30} className="text-white fill-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-5 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md text-[9px] uppercase tracking-widest italic">{movie.status === "SHOWING" ? "ĐANG CHIẾU" : "SẮP CHIẾU"}</span>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[9px] font-black uppercase border border-white/10">{movie.duration} PHÚT</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-[0.9] drop-shadow-2xl">{movie.title}</h1>
              
              <div className="flex items-center justify-center md:justify-start gap-6">
                 <div className="flex items-end gap-2">
                    <Star size={20} fill={hasRating ? "#f59e0b" : "none"} className={`mb-1 ${hasRating ? "text-amber-500 animate-pulse" : "text-zinc-600"}`} />
                    <span className={hasRating ? "text-2xl font-black italic text-white leading-none" : "text-[10px] font-black uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-zinc-500"}>
                      {hasRating ? Number(movie.rating).toFixed(1) : "CHƯA CÓ ĐÁNH GIÁ"}
                    </span>
                    {hasRating && (
                      <span className="text-[12px] font-bold text-zinc-400 mb-[2px]">({formatReviewCount(movie.reviewCount || 0)} đánh giá)</span>
                    )}
                 </div>
                 
                 <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-[0.2em] border-l border-white/20 pl-6 line-clamp-1 max-w-sm">
                   {movieGenresString}
                 </p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                {movie.status === "SHOWING" && (
                  <Link href={`/movies/${movieId}/booking/`} className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                    <Ticket size={18} /> ĐẶT VÉ NGAY
                  </Link>
                )}
                <button onClick={() => setShowTrailer(true)} className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">XEM TRAILER</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-red-600" /> TÓM TẮT NỘI DUNG
              </h3>
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed italic font-medium bg-gradient-to-r from-zinc-900/40 to-transparent p-8 rounded-3xl border-l-2 border-red-600/30">{movie.description}</p>
            </div>

            {/* 🎯 KHỐI THÔNG TIN CHÍNH + DIỄN VIÊN */}
            <div className="p-8 bg-zinc-900/20 rounded-3xl border border-white/5 backdrop-blur-sm space-y-8">
              {/* Đạo diễn không truncate, các trường khác truncate */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <InfoBox icon={<Film size={18}/>} label="ĐẠO DIỄN" value={movie.director} truncate={false} />
                <InfoBox icon={<Award size={18}/>} label="QUỐC GIA" value={movie.country} truncate={true} />
                <InfoBox icon={<Globe size={18}/>} label="NĂM" value={movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : "2026"} truncate={true} />
                <InfoBox icon={<Shield size={18}/>} label="ĐỘ TUỔI" value={movie.ageRating || "P"} truncate={true} />
              </div>
              
              {/* Gọi movie.cast thay vì movie.actor */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <Users size={16} className="text-red-600" />
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">DIỄN VIÊN:</span>
                  </div>
                  <span className="text-sm font-bold text-white italic line-clamp-2 leading-relaxed">
                    {formatCast(movie.cast)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
             <div className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-24">
                <div className="space-y-3 text-center">
                  <p className="text-[10px] font-black tracking-[0.3em] text-red-600 uppercase">Cộng đồng đánh giá</p>
                  <p className="text-sm text-zinc-500 font-bold italic px-4">Chia sẻ cảm nhận của bạn về siêu phẩm này</p>
                </div>
                <button onClick={() => setIsReviewOpen(true)} className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">GỬI ĐÁNH GIÁ</button>
             </div>
          </div>
        </div>

        <MovieHorizontalList title="Phim Đang Chiếu" subTitle="Cùng thể loại" movies={showingMovies} loading={relLoading} />
        <MovieHorizontalList title="Phim Sắp Chiếu" subTitle="Sắp ra mắt" movies={upcomingMovies} loading={relLoading} />

        <section className="border-t border-white/10 pt-20 mt-20">
          <ReviewList movieId={movieId} />
        </section>
      </main>
    </div>
  );
}

function InfoBox({ icon, label, value, truncate }: { icon: any, label: string, value: string, truncate: boolean }) {
  return (
    <div className="space-y-2">
      <div className="text-red-600 flex justify-center mb-2">{icon}</div>
      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{label}</p>
      <p className={`text-sm font-black text-white uppercase italic ${truncate ? 'truncate' : 'line-clamp-2 leading-tight'}`}>
        {value || "Đang cập nhật"}
      </p>
    </div>
  );
}