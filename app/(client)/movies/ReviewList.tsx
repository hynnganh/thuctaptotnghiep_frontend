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
  
  // UI States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // Edit States
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="text-slate-800 p-1">
        <p className="text-xs font-bold mb-3 tracking-wide text-slate-700">Xác nhận xóa đánh giá này?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-200 transition-all text-slate-600 border border-slate-200"
          >
            Hủy
          </button>
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
            className="bg-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700 text-white transition-all shadow-sm"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    ), { style: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' } });
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
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 text-slate-600">
      
      {/* Thanh bộ lọc thiết kế Light Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Audience Voice</span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Cộng đồng đánh giá</h2>
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
          {[0, 5, 4, 3, 2, 1].map((star) => (
            <button 
              key={star} 
              onClick={() => setFilterRating(star)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 whitespace-nowrap ${
                filterRating === star 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
            >
              {star === 0 ? "Tất cả" : `${star} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Cards Light Mode trắng giấy tinh tế */}
      <div className="max-h-[650px] overflow-y-auto pr-2 modern-scrollbar space-y-4 relative">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const isOwner = currentUser && (currentUser.id === review.user?.userId || currentUser.userId === review.user?.userId || currentUser.email === review.user?.email);

            return (
              <div 
                key={review.id} 
                className={`bg-white border border-slate-200/80 p-5 rounded-2xl hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all flex flex-col relative ${
                  openMenuId === review.id ? 'z-40' : 'z-0'
                }`}
              >
                {/* Dải line màu đỏ tinh tế phía góc trái khi là review của chính mình */}
                {isOwner && (
                  <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-red-600 rounded-l-2xl" />
                )}

                {/* Phần thông tin User Header */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0 overflow-hidden">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-800 font-bold text-xs uppercase tracking-wide truncate">{getFullName(review.user)}</span>
                        {isOwner && (
                          <span className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Của Bạn
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[9px] font-medium flex items-center gap-1 mt-0.5">
                        <Calendar size={10}/> {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cụm sao đỏ sang trọng & Menu tác vụ */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                      {[...Array(5)].map((_, i) => {
                        const isFilled = i < Math.floor(review.rating);
                        return <Star key={i} size={10} fill={isFilled ? "#dc2626" : "none"} className={isFilled ? "text-red-600" : "text-slate-200"} />;
                      })}
                    </div>

                    {isOwner && (
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative z-20"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {openMenuId === review.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-[70] animate-in fade-in slide-in-from-top-1">
                              <button 
                                onClick={() => openEditModal(review)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all"
                              >
                                <Edit3 size={12} className="text-slate-400" /> Chỉnh sửa
                              </button>
                              <button 
                                onClick={() => handleDelete(review.id)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg transition-all mt-0.5"
                              >
                                <Trash2 size={12} /> Xóa bài
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thân bình luận */}
                {review.isHidden ? (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 mt-1">
                    <ShieldAlert size={14} className="text-red-500 shrink-0" />
                    <p className="text-red-700 text-[11px] font-medium">Bình luận bị ẩn do vi phạm tiêu chuẩn: {review.hiddenReason}</p>
                  </div>
                ) : (
                  <div className="space-y-3 pl-1">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-normal">
                      {review.comment}
                    </p>

                    {review.imageUrl && (
                      <div 
                        onClick={() => setSelectedImage(review.imageUrl.startsWith('http') ? review.imageUrl : getImageUrl(review.imageUrl))}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer group/img shadow-sm hover:border-slate-300 transition-all"
                      >
                        <img 
                          src={review.imageUrl.startsWith('http') ? review.imageUrl : getImageUrl(review.imageUrl)} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chưa có đánh giá nào cho phim này</p>
          </div>
        )}
      </div>

      {/* MODAL SỬA ĐÁNH GIÁ (Light Mode đồng bộ) */}
      {editingReview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-wide flex items-center gap-2">
                <Edit3 size={16} className="text-red-600" /> Cập nhật đánh giá
              </h2>
              <button onClick={() => setEditingReview(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                <X size={14} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Điểm đánh giá</label>
                <div className="flex items-center gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={22} 
                      onClick={() => setEditRating(star)}
                      fill={star <= editRating ? "#eab308" : "none"} 
                      className={`cursor-pointer transition-all ${star <= editRating ? "text-yellow-500" : "text-slate-200"}`} 
                    />
                  ))}
                  <span className="ml-2 text-yellow-600 font-black text-sm italic">{editRating}.0</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cảm nhận của bạn (Tối thiểu 10 ký tự)</label>
                <textarea 
                  required
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all custom-scrollbar resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hình ảnh đính kèm</label>
                <div 
                  onClick={() => editFileInputRef.current?.click()} 
                  className="w-20 h-20 bg-slate-50 border border-slate-200 border-dashed hover:border-slate-300 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group transition-all"
                >
                  {editPreview ? (
                    <img src={editPreview} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Preview" />
                  ) : (
                    <div className="text-center text-slate-400 hover:text-slate-600">
                      <Upload size={16} className="mx-auto mb-1" />
                      <span className="text-[8px] font-black uppercase">Tải ảnh</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={editFileInputRef} 
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
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-red-600/10"
              >
                {isSubmittingEdit ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PHÓNG TO ẢNH (Giữ phông nền mờ mượt mà) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-5 right-5 p-2 bg-white/10 text-white rounded-lg hover:bg-red-600 transition-all border border-white/10">
            <X size={16} />
          </button>
          <img src={selectedImage} alt="Fullsize" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Tinh chỉnh thanh Scrollbar mượt mà cho Light Mode */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .modern-scrollbar::-webkit-scrollbar { width: 5px; }
        .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modern-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 4px; }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}