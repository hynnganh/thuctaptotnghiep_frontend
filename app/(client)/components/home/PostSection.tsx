"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, ChevronLeft } from "lucide-react";
import { apiRequest } from "../../../lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  createdAt: string;
  published?: boolean;
}

export default function PostSectionCombined() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái điều khiển xem chi tiết bài viết tại chỗ
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [postDetail, setPostDetail] = useState<Post | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Fetch danh sách bài viết từ API
  useEffect(() => {
    apiRequest("/api/v1/posts")
      .then((res) => res.json())
      .then((resData) => {
        // Khử lỗi cấu trúc: chấp nhận cả mảng trực tiếp hoặc bọc trong thuộc tính .data
        const targetData = resData.data || resData;
        
        if (Array.isArray(targetData)) {
          // Lấy đúng 4 bài viết đầu tiên để giao diện lưới 4 cột nhỏ gọn nhất
          setPosts(targetData.slice(0, 4));
        } else {
          setPosts([]);
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách tin tức:", err))
      .finally(() => setLoading(false));
  }, []);

  // 2. Fetch chi tiết một bài viết cụ thể khi Click
  useEffect(() => {
    if (!selectedPostId) {
      setPostDetail(null);
      return;
    }

    setLoadingDetail(true);
    apiRequest(`/api/v1/posts/${selectedPostId}`)
      .then((res) => res.json())
      .then((resData) => {
        const targetDetail = resData.data || resData;
        setPostDetail(targetDetail);
      })
      .catch((err) => console.error("Lỗi tải chi tiết bài viết:", err))
      .finally(() => setLoadingDetail(false));
  }, [selectedPostId]);

  // Hàm helper bóc tách Ngày/Tháng từ chuỗi ISO "2026-05-19T13:20:56"
  const getCustomDate = (dateStr: string) => {
    if (!dateStr) return { day: "19", month: "05" };
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return { day, month };
    } catch {
      return { day: "19", month: "05" };
    }
  };

  // --- LOADING GIAO DIỆN KHUNG (SKELETON) ---
  if (loading) {
    return (
      <div className="px-6 md:px-12 py-16 bg-[#0a0a0c]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[290px] bg-zinc-900/40 animate-pulse rounded-[2rem] border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="px-6 md:px-12 py-16 bg-[#0a0a0c] relative overflow-hidden text-white">
      {/* Vệt sáng loang màu Pastel Đỏ - Cam chạy ẩn dưới nền */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-r from-red-600/5 to-orange-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* CHẾ ĐỘ VIEW CHI TIẾT (POST DETAIL) */}
        {selectedPostId ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPostId(null)}
              className="group flex items-center gap-2 mb-8 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-red-500" />
              Quay lại danh sách tin
            </button>

            {loadingDetail ? (
              <div className="space-y-6">
                <div className="w-full h-[380px] bg-zinc-900/50 animate-pulse rounded-[2.5rem]" />
                <div className="h-10 bg-zinc-900/50 animate-pulse w-3/4 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-900/50 animate-pulse w-full rounded" />
                  <div className="h-4 bg-zinc-900/50 animate-pulse w-5/6 rounded" />
                </div>
              </div>
            ) : (
              postDetail && (
                <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-md">
                  <div className="w-full h-[380px] overflow-hidden rounded-[1.8rem] mb-8 relative border border-white/5">
                    <img
                      src={postDetail.thumbnail}
                      alt={postDetail.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  </div>

                  <h1 className="text-xl md:text-3xl font-[1000] italic uppercase tracking-tight leading-snug mb-6 text-white">
                    {postDetail.title}
                  </h1>

                  <div className="w-12 h-0.5 bg-red-600 rounded-full mb-8 shadow-[0_0_15px_rgba(220,38,38,0.6)]" />

                  <p className="text-zinc-300 text-sm md:text-base leading-8 tracking-wide font-medium whitespace-pre-line">
                    {postDetail.content}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          
          /* CHẾ ĐỘ XEM DANH SÁCH LƯỚI (POST LIST GRID) */
          <>
            {/* --- HEADER HIỆN ĐẠI --- */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-1 h-7 bg-gradient-to-b from-red-500 to-orange-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-red-500 animate-pulse" />
                    <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.25em]">Bản tin nóng</span>
                  </div>
                  <h2 className="text-xl font-[1000] text-white tracking-tighter uppercase leading-none italic mt-0.5">
                    Tin Điện <span className="text-red-600">Ảnh</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* --- LƯỚI 4 CỘT TIN TỨC GỌN GÀNG --- */}
            {posts.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs uppercase tracking-widest font-mono">
                Hiện tại chưa có bài viết nào mới.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {posts.map((post) => {
                  const { day, month } = getCustomDate(post.createdAt);

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className="group relative flex flex-col h-[290px] rounded-[1.8rem] border border-white/5 bg-gradient-to-b from-zinc-900/30 to-zinc-950/80 hover:border-red-600/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Ảnh nền thu gọn độ cao */}
                      <div className="h-36 w-full overflow-hidden relative bg-zinc-900 rounded-t-[1.8rem]">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                        
                        {/* Floating Date Badge thiết kế tối giản */}
                        <div className="absolute top-3.5 left-3.5 flex flex-col items-center bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 min-w-[36px] text-center shadow-lg group-hover:border-red-500/30 transition-colors">
                          <span className="text-white text-xs font-[1000] font-mono leading-none">{day}</span>
                          <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider mt-0.5 border-t border-white/10 pt-0.5 w-full">T{month}</span>
                        </div>

                        {/* Mũi tên góc chuyển động nhẹ khi hover */}
                        <div className="absolute top-3.5 right-3.5 w-6 h-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center text-white opacity-0 scale-70 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 group-hover:bg-red-600 group-hover:border-transparent">
                          <ArrowUpRight size={12} />
                        </div>
                      </div>

                      {/* Content chữ bo đáy */}
                      <div className="p-4 flex flex-col flex-1 justify-between relative overflow-hidden">
                        {/* Text nước mờ ẩn */}
                        <div className="absolute -bottom-5 right-2 text-white/[0.01] font-[1000] text-5xl italic pointer-events-none select-none uppercase tracking-tighter transition-colors group-hover:text-white/[0.02]">
                          NEWS
                        </div>

                        <div className="space-y-1.5 relative z-10">
                          <h3 className="text-xs font-black text-white uppercase italic leading-snug tracking-tight group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-zinc-500 text-[10px] font-medium leading-relaxed line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        
                        {/* Line tiến trình trang trí ở đáy */}
                        <div className="relative h-[2px] w-6 bg-zinc-800 rounded-full overflow-hidden transition-all duration-500 group-hover:w-12">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}