"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Calendar, Loader2, User, X, Maximize2, MoreVertical, Edit3, Trash2, Upload, Save, ShieldAlert } from 'lucide-react';
import { apiRequest, getImageUrl } from "@/app/lib/api";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ReviewList({ movieId }: { movieId: string | number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number>(0);
  
  // 🎯 UI States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // 🎯 Edit States
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const userRes = await apiRequest(`/api/v1/users/me`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.data || userData);
      }

      const reviewRes = await apiRequest(`/api/v1/reviews/movie/${movieId}`);
      if (reviewRes.ok) {
        const result = await reviewRes.json();
        const data = result.data || result;
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) fetchData();
  }, [movieId]);

  const filteredReviews = useMemo(() => {
    if (filterRating === 0) return reviews;
    return reviews.filter(r => Math.floor(r.rating) === filterRating);
  }, [reviews, filterRating]);

  const getFullName = (user: any) => {
    if (!user) return "Khán giả";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName !== "" ? fullName : (user.name || "Khán giả");
  };

  const handleDelete = (reviewId: number) => {
    setOpenMenuId(null);
    toast((t) => (
      <div className="text-white p-1">
        <p className="text-[10px] font-bold uppercase mb-3 tracking-widest text-zinc-300">Xác nhận xóa đánh giá này?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await apiRequest(`/api/v1/reviews/${reviewId}`, { method: 'DELETE' });
                if (res.ok) {
                  toast.success("Đã xóa đánh giá!");
                  fetchData(); 
                } else toast.error("Lỗi khi xóa!");
              } catch (err) { toast.error("Lỗi máy chủ!"); }
            }} 
            className="bg-red-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-all shadow-md shadow-red-900/20"
          >
            Xóa
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-zinc-800 px-4 py-2 rounded-lg text-[9px] font-bold uppercase hover:bg-zinc-700 transition-all text-zinc-300"
          >
            Hủy
          </button>
        </div>
      </div>
    ), { style: { background: '#09090b', border: '1px solid #1c1c1f', borderRadius: '12px' } });
  };

  const openEditModal = (review: any) => {
    setOpenMenuId(null);
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditPreview(review.imageUrl ? (review.imageUrl.startsWith('http') ? review.imageUrl : getImageUrl(review.imageUrl)) : null);
    setEditFile(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editComment.trim().length < 10) return toast.error("Nội dung đánh giá phải có ít nhất 10 ký tự!");

    setIsSubmittingEdit(true);
    const loadingToast = toast.loading("Đang cập nhật...");
    
    const formData = new FormData();
    formData.append("rating", editRating.toString());
    formData.append("comment", editComment);
    if (editFile) formData.append("image", editFile);

    try {
      const response = await apiRequest(`/api/v1/reviews/${editingReview.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast.success("Cập nhật thành công!", { id: loadingToast });
        setEditingReview(null);
        fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Lỗi cập nhật!", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!", { id: loadingToast });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8 relative z-0">
        <div className="space-y-2">
          <h3 className="text-red-600 font-black uppercase tracking-[0.4em] italic text-[10px]">Audience Voices</h3>
          <h2 className="text-4xl font-[1000] italic text-white uppercase tracking-tighter">Đánh giá từ người xem</h2>
        </div>
        
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {[0, 5, 4, 3, 2, 1].map((star) => (
            <button key={star} onClick={() => setFilterRating(star)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 shrink-0 ${
                filterRating === star ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}>
              {star === 0 ? "Tất cả" : `${star} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* 🎯 DANH SÁCH ĐÁNH GIÁ */}
      <div className="max-h-[600px] overflow-y-auto pr-3 modern-scrollbar space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const isOwner = currentUser && (currentUser.id === review.user?.userId || currentUser.userId === review.user?.userId || currentUser.email === review.user?.email);

            return (
              <div key={review.id} className={`bg-[#0a0a0a] border border-white/5 p-5 md:p-6 rounded-[1.5rem] hover:border-red-600/30 transition-all group hover:bg-[#0d0d0d] shadow-xl flex flex-col relative ${openMenuId === review.id ? 'z-50' : 'z-0'}`}>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white border border-white/5 group-hover:border-red-600/50 transition-colors shrink-0 shadow-inner overflow-hidden">
                      <User size={18} className="text-zinc-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black text-sm uppercase tracking-wider">{getFullName(review.user)}</p>
                        {isOwner && <span className="bg-red-600/20 text-red-500 border border-red-500/20 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Của Bạn</span>}
                      </div>
                      <p className="text-zinc-600 text-[9px] font-bold flex items-center gap-1 uppercase mt-0.5">
                        <Calendar size={10}/> {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5 bg-zinc-950 px-2.5 py-1 rounded-full border border-white/5 shadow-inner shrink-0">
                      {[...Array(5)].map((_, i) => {
                        const isFilled = i < Math.floor(review.rating);
                        return <Star key={i} size={11} fill={isFilled ? "#dc2626" : "none"} className={isFilled ? "text-red-600" : "text-zinc-800"} />;
                      })}
                    </div>

                    {/* 🎯 MENU 3 CHẤM ĐÃ FIX LỖI BỊ ĐÈ */}
                    {isOwner && (
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative z-20"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openMenuId === review.id && (
                          <>
                            {/* Màn chắn vô hình phía sau menu nhưng đè lên toàn trang */}
                            <div className="fixed inset-0 z-[60]" onClick={() => setOpenMenuId(null)} />
                            
                            {/* Menu thực sự */}
                            <div className="absolute right-0 top-full mt-2 w-36 bg-[#111116]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-[70] animate-in fade-in slide-in-from-top-2">
                              <button 
                                onClick={() => openEditModal(review)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-all"
                              >
                                <Edit3 size={14} /> Chỉnh sửa
                              </button>
                              <button 
                                onClick={() => handleDelete(review.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-lg transition-all mt-0.5"
                              >
                                <Trash2 size={14} /> Xóa bài
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {review.isHidden ? (
                  <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl flex items-center gap-2 mt-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <p className="text-red-400 text-xs font-bold italic">Đánh giá đã bị quản trị viên ẩn do vi phạm quy tắc cộng đồng: {review.hiddenReason}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-400 text-[13px] italic leading-relaxed pl-3 border-l-2 border-red-600/20 group-hover:border-red-600/60 transition-colors">
                      "{review.comment}"
                    </p>

                    {review.imageUrl && (
                      <div 
                        onClick={() => setSelectedImage(review.imageUrl.startsWith('http') ? review.imageUrl : getImageUrl(review.imageUrl))}
                        className="mt-4 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/10 relative cursor-pointer group/img shadow-md hover:border-red-600/50 transition-all"
                      >
                        <img 
                          src={review.imageUrl.startsWith('http') ? review.imageUrl : getImageUrl(review.imageUrl)} 
                          alt="Review Thumbnail" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Maximize2 size={16} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            );
          })
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-zinc-950/20">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">Chưa có đánh giá nào cho bộ phim này</p>
          </div>
        )}
      </div>

      {/* 🎯 MODAL SỬA ĐÁNH GIÁ */}
      {editingReview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-[#0a0a0f] to-[#050508] border border-white/10 rounded-3xl w-full max-w-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#050508]">
              <h2 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Edit3 size={18} className="text-red-500" /> Sửa đánh giá
              </h2>
              <button onClick={() => setEditingReview(null)} className="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-red-600 rounded-xl transition-all">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Đánh giá của bạn</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={28} 
                      onClick={() => setEditRating(star)}
                      fill={star <= editRating ? "#f59e0b" : "none"} 
                      className={`cursor-pointer transition-all hover:scale-110 ${star <= editRating ? "text-amber-500" : "text-zinc-700"}`} 
                    />
                  ))}
                  <span className="ml-3 text-amber-500 font-black text-xl italic">{editRating}.0</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cảm nhận (Tối thiểu 10 ký tự)</label>
                <textarea 
                  required
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all custom-scrollbar"
                  placeholder="Chia sẻ cảm nghĩ chân thực của bạn..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ảnh đính kèm (Thay ảnh mới nếu muốn)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-24 h-24 bg-black/40 border border-white/10 border-dashed hover:border-red-500/50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group transition-all"
                >
                  {editPreview ? (
                    <img src={editPreview} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" alt="Preview" />
                  ) : (
                    <div className="text-center text-zinc-600 group-hover:text-red-500 transition-colors">
                      <Upload size={20} className="mx-auto mb-1" />
                      <span className="text-[8px] font-black uppercase">Tải ảnh</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditFile(file);
                      setEditPreview(URL.createObjectURL(file));
                    }
                  }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingEdit}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmittingEdit ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Cập nhật đánh giá
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🎯 MODAL LIGHTBOX */}
      {selectedImage && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 hover:scale-110 shadow-2xl">
            <X size={20} />
          </button>
          <img src={selectedImage} alt="Review Fullsize" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .modern-scrollbar::-webkit-scrollbar { width: 6px; }
        .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modern-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}
