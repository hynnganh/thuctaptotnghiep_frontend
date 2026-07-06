"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiRequest } from "@/app/lib/api"; 

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: string | number;
}

export default function ReviewModal({ isOpen, onClose, movieTitle, movieId }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Đổi tên ref rõ ràng để tránh xung đột DOM chéo
  const createFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHover(0);
      setComment("");
      setImage(null);
      setImagePreview(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh quá lớn (tối đa 5MB)!");
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Vui lòng chọn số sao đánh giá!");
    if (comment.trim().length < 10) return toast.error("Cảm nhận tối thiểu 10 ký tự!");

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("movieId", String(movieId));
    formData.append("rating", String(rating));
    formData.append("comment", comment.trim());
    if (image) formData.append("image", image);

    try {
      const response = await apiRequest("/api/v1/reviews", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Gửi đánh giá thành công!");
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 2500);
      } else {
        toast.error(result.message || "Bạn chưa đủ điều kiện đánh giá phim này!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
      <Toaster position="top-center" toastOptions={{ style: { background: '#09090b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="absolute inset-0" onClick={!isSubmitting ? onClose : undefined} />
      
      <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Khung viền Led trang trí mỏng phía trên */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        {!isSubmitting && !isSuccess && (
          <button onClick={onClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-800 transition-all">
            <X size={18}/>
          </button>
        )}
        
        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black tracking-wider text-white uppercase text-center">ĐÃ GHI NHẬN ĐÁNH GIÁ</h2>
            <p className="text-zinc-400 text-xs font-medium text-center px-4 leading-relaxed">
              Cảm ơn bạn đã chia sẻ cảm nhận về tác phẩm <span className="text-red-500 font-bold">"{movieTitle}"</span>. Hệ thống đang tải lại dữ liệu...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Review Box</span>
              <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">{movieTitle}</h2>
            </div>

            {/* Khu vực chấm sao hình hộp hiện đại */}
            <div className="flex flex-col items-center gap-3 py-5 bg-zinc-900/30 rounded-xl border border-zinc-800/60">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = hover || rating;
                  const isFilled = active >= s;
                  return (
                    <button 
                      key={s} 
                      type="button"
                      className="transition-all hover:scale-110 active:scale-95 p-0.5"
                      onMouseEnter={() => setHover(s)} 
                      onMouseLeave={() => setHover(0)} 
                      onClick={() => setRating(s)}
                    >
                      <Star 
                        size={28} 
                        fill={isFilled ? "#eab308" : "none"} 
                        className={`transition-all duration-150 ${isFilled ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" : "text-zinc-700"}`} 
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                {rating > 0 ? `${rating} SAO` : hover > 0 ? `${hover} SAO` : "CHỌN MỨC ĐỘ"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Nội dung bình luận</label>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Bộ phim này có gì để lại ấn tượng sâu sắc cho bạn không..."
                className="w-full h-28 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all resize-none custom-scrollbar" 
              />
            </div>

            {/* Upload ảnh */}
            <div className="flex items-center gap-3 bg-zinc-900/20 p-3 rounded-xl border border-zinc-800/40">
              <input type="file" ref={createFileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button 
                type="button"
                onClick={() => createFileInputRef.current?.click()} 
                className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 transition-all shrink-0"
              >
                <ImageIcon size={14} /> {image ? "Đổi ảnh khác" : "Thêm hình ảnh"}
              </button>
              
              {image && (
                <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{image.name}</span>
              )}

              {imagePreview && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shadow-md ml-auto shrink-0">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => {setImage(null); setImagePreview(null)}} 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Gửi đánh giá ngay"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}