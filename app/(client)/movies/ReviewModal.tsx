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
  
  // 🎯 Thêm State để khóa màn hình khi đánh giá thành công
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHover(0);
      setComment("");
      setImage(null);
      setImagePreview(null);
      setIsSuccess(false); // Reset lại trạng thái
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
    formData.append("rating", String(rating)); // Backend sẽ nhận số chẵn 1.0, 2.0...
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
        setIsSuccess(true); // Khóa Form và hiện thông báo thành công
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 2500); // Đóng modal và reload sau 2.5s
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
      <Toaster position="top-center" toastOptions={{ style: { background: '#0c0c0e', color: '#fff' } }} />
      
      <div className="absolute inset-0" onClick={!isSubmitting ? onClose : undefined} />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-hidden">
        {!isSubmitting && !isSuccess && (
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
        )}
        
        {/* 🎯 GIAO DIỆN KHÓA KHI ĐÁNH GIÁ THÀNH CÔNG */}
        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-[1000] italic text-white uppercase text-center">BẠN ĐÃ ĐÁNH GIÁ</h2>
            <p className="text-zinc-400 text-sm font-medium text-center px-4">
              Cảm ơn bạn đã chia sẻ cảm nhận về tác phẩm <span className="text-red-500 font-bold">"{movieTitle}"</span>. Đánh giá của bạn đã được ghi nhận vào hệ thống!
            </p>
          </div>
        ) : (
          /* GIAO DIỆN FORM ĐÁNH GIÁ BÌNH THƯỜNG */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 italic">Đánh giá phim</h3>
              <h2 className="text-2xl font-[1000] italic uppercase text-white leading-tight">{movieTitle}</h2>
            </div>

            {/* VÙNG CHỌN SAO (ĐÃ ĐƯỢC CHỈNH THÀNH SỐ CHẴN 1,2,3,4,5) */}
            <div className="flex flex-col items-center gap-2 py-6 bg-white/5 rounded-[2rem] border border-white/5">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = hover || rating;
                  const isFilled = active >= s;
                  return (
                    <div 
                      key={s} 
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                      onMouseEnter={() => setHover(s)} 
                      onMouseLeave={() => setHover(0)} 
                      onClick={() => setRating(s)}
                    >
                      <Star 
                        size={36} 
                        fill={isFilled ? "#f59e0b" : "none"} 
                        className={`transition-all duration-300 ${isFilled ? "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "text-zinc-700"}`} 
                      />
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase mt-1">
                {rating > 0 ? `${rating} SAO` : hover > 0 ? `${hover} SAO` : "CHƯA CHỌN"}
              </span>
            </div>

            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Phim có gì ấn tượng với bạn..."
              className="w-full h-24 bg-zinc-900 border border-white/5 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-red-600 resize-none italic" />

            {/* UPLOAD ẢNH */}
            <div className="flex items-center gap-4">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-red-500 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 transition-all">
                <ImageIcon size={16} /> {image ? image.name : "Thêm ảnh"}
              </button>
              {imagePreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <button onClick={() => {setImage(null); setImagePreview(null)}} className="absolute top-0 right-0 bg-black/60 p-0.5"><X size={12}/></button>
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting}
              className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl active:scale-95 disabled:opacity-30">
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Gửi đánh giá ngay"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}