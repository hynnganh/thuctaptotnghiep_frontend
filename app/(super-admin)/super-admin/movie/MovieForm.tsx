"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Film,
  Upload,
  Star,
  Clock,
  Calendar,
  Users,
  Globe,
  Youtube,
  ShieldAlert,
  Check
} from 'lucide-react';

import toast, { Toaster } from 'react-hot-toast';
import { apiSuperAdminRequest, getImageUrl } from '@/app/lib/api';

interface MovieFormProps {
  initialData?: any;
  type: 'create' | 'edit';
}

export default function MovieForm({
  initialData,
  type
}: MovieFormProps) {

  const router = useRouter();
  const pathname = usePathname();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [genres, setGenres] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ MẢNG ID THỂ LOẠI ĐƯỢC CHỌN
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // ✅ PREVIEW POSTER
  const [posterPreview, setPosterPreview] = useState("");

  const basePath = pathname.includes('/super-admin')
    ? '/super-admin/movie'
    : '/admin/movies';

  // =========================================================
  // LOAD DANH SÁCH THỂ LOẠI
  // =========================================================
  useEffect(() => {

    const fetchGenres = async () => {
      try {

        const res = await apiSuperAdminRequest('/api/v1/genres');

        if (res.ok) {
          const data = await res.json();

          const genresData = data.data || data || [];

          setGenres(genresData);
        }

      } catch (err) {
        console.error("Lỗi tải genres:", err);
      }
    };

    fetchGenres();

  }, []);

  // =========================================================
  // ĐỔ DỮ LIỆU EDIT
  // =========================================================
  useEffect(() => {

    if (!initialData) return;

    // =====================================================
    // POSTER
    // =====================================================
    if (initialData.posterUrl) {

      const preview = initialData.posterUrl.startsWith("http")
        ? initialData.posterUrl
        : getImageUrl(initialData.posterUrl);

      setPosterPreview(preview);
    }

    // =====================================================
    // GENRES
    // HỖ TRỢ MỌI FORMAT BACKEND
    // =====================================================

    let ids: number[] = [];

    // CASE 1:
    // genres = [{id,name}]
    if (
      initialData.genres &&
      Array.isArray(initialData.genres)
    ) {

      ids = initialData.genres
        .map((g: any) => Number(g.id))
        .filter(Boolean);
    }

    // CASE 2:
    // genreIds = [1,2,3]
    else if (
      initialData.genreIds &&
      Array.isArray(initialData.genreIds)
    ) {

      ids = initialData.genreIds
        .map((id: any) => Number(id))
        .filter(Boolean);
    }

    // CASE 3:
    // genreId = 1
    else if (initialData.genreId) {

      ids = [Number(initialData.genreId)];
    }

    setSelectedGenreIds(ids);

  }, [initialData]);

  // =========================================================
  // TOGGLE GENRE
  // =========================================================
  const handleToggleGenre = (genreId: number) => {

    setSelectedGenreIds(prev => {

      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }

      return [...prev, genreId];
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (type === 'create' && !selectedFile) {
      return toast.error("Vui lòng chọn poster!");
    }

    if (selectedGenreIds.length === 0) {
      return toast.error("Vui lòng chọn ít nhất 1 thể loại!");
    }

    setIsSubmitting(true);

    const loadingToast = toast.loading(
      type === 'edit'
        ? 'Đang cập nhật phim...'
        : 'Đang đăng phim...'
    );

    try {

      const form = e.currentTarget;
      const formData = new FormData(form);

      // ===================================================
      // PAYLOAD
      // ===================================================
      const movieData = {

        title: formData.get('title')?.toString().trim(),

        description: formData.get('description')
          ?.toString()
          .trim(),

        duration: Number(formData.get('duration')),

        director: formData.get('director')
          ?.toString()
          .trim(),

        cast: formData.get('cast')
          ?.toString()
          .trim(),

        country: formData.get('country')
          ?.toString()
          .trim(),

        trailerUrl: formData.get('trailerUrl')
          ?.toString()
          .trim(),

        releaseDate: formData.get('releaseDate'),

        status: formData.get('status'),

        ageRating: formData.get('ageRating'),

        // ✅ MANY TO MANY
        genreIds: selectedGenreIds
      };

      const payload = new FormData();

      payload.append(
        'movie',
        new Blob(
          [JSON.stringify(movieData)],
          { type: 'application/json' }
        )
      );

      if (selectedFile) {
        payload.append('file', selectedFile);
      }

      const url =
        type === 'edit'
          ? `/api/v1/movies/${initialData?.id}`
          : `/api/v1/movies`;

      const response = await apiSuperAdminRequest(
        url,
        {
          method: type === 'edit' ? 'PUT' : 'POST',
          body: payload
        }
      );

      // ===================================================
      // SUCCESS
      // ===================================================
      if (response.ok) {

        toast.success(
          type === 'edit'
            ? 'Cập nhật phim thành công!'
            : 'Đăng phim thành công!',
          { id: loadingToast }
        );

        router.push(basePath);
        router.refresh();

      } else {

        const errData = await response.json();

        toast.error(
          errData.message || "Xử lý thất bại!",
          { id: loadingToast }
        );
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Lỗi kết nối máy chủ!",
        { id: loadingToast }
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-2 text-white animate-in fade-in duration-500">

      <Toaster position="top-right" />

      {/* ================================================= */}
      {/* BACK */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => router.push(basePath)}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition-all mb-4 font-black text-[9px] uppercase tracking-widest"
      >
        <ArrowLeft size={12} />
        Quay lại
      </button>

      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-12 gap-4"
      >

        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="col-span-12 lg:col-span-8 space-y-4">

          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[1.5rem] backdrop-blur-sm">

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-600/10">
                <Film size={18} />
              </div>

              <h1 className="text-xl font-[1000] italic uppercase tracking-tighter">
                {type === 'edit'
                  ? 'Sửa'
                  : 'Thêm'}{" "}
                <span className="text-zinc-600">
                  Phim
                </span>
              </h1>
            </div>

            <div className="grid gap-4">

              {/* TITLE */}
              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Tiêu đề *
                </label>

                <input
                  name="title"
                  required
                  defaultValue={initialData?.title}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 transition-all text-[13px] font-bold"
                  placeholder="Tên phim..."
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Mô tả *
                </label>

                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={initialData?.description}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 text-[12px] leading-relaxed"
                  placeholder="Nội dung tóm tắt..."
                />
              </div>

              {/* COUNTRY + DIRECTOR */}
              <div className="grid grid-cols-2 gap-3">

                <div className="space-y-1">

                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1">
                    <Globe size={10} />
                    Quốc gia
                  </label>

                  <input
                    name="country"
                    required
                    defaultValue={initialData?.country}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]"
                  />
                </div>

                <div className="space-y-1">

                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1">
                    <Users size={10} />
                    Đạo diễn
                  </label>

                  <input
                    name="director"
                    defaultValue={initialData?.director}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]"
                  />
                </div>
              </div>

              {/* CAST */}
              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Diễn viên
                </label>

                <input
                  name="cast"
                  defaultValue={initialData?.cast}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]"
                  placeholder="Cách nhau bằng dấu phẩy..."
                />
              </div>

              {/* TRAILER */}
              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1">
                  <Youtube size={11} className="text-red-600" />
                  Youtube Trailer
                </label>

                <input
                  name="trailerUrl"
                  type="url"
                  defaultValue={initialData?.trailerUrl}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 outline-none text-[12px]"
                  placeholder="Link video..."
                />
              </div>

            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT */}
        {/* ================================================= */}

        <div className="col-span-12 lg:col-span-4 space-y-4">

          <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-[1.5rem] space-y-4">

            {/* POSTER */}
            <div className="space-y-1.5">

              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">
                Poster *
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[4/5] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center cursor-pointer group overflow-hidden"
              >

                {posterPreview ? (

                  <img
                    src={posterPreview}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    alt="Poster"
                  />

                ) : (

                  <div className="text-center opacity-20 group-hover:opacity-100 transition-opacity">

                    <Upload size={24} className="mx-auto mb-2" />

                    <p className="text-[8px] font-black uppercase">
                      Tải ảnh
                    </p>
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

                    setSelectedFile(file);

                    setPosterPreview(
                      URL.createObjectURL(file)
                    );
                  }
                }}
              />
            </div>

            {/* RATING */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center">

              <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-1">
                <Star size={10} className="text-yellow-600" />
                Rating
              </label>

              <span className="text-[10px] font-black italic">
                {initialData?.rating || "0.0"}
              </span>
            </div>

            {/* AGE */}
            <div className="space-y-1">

              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic flex items-center gap-1">
                <ShieldAlert size={10} />
                Phân loại độ tuổi *
              </label>

              <select
                name="ageRating"
                required
                defaultValue={initialData?.ageRating || 'P'}
                className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400"
              >
                <option value="P">P</option>
                <option value="K">K</option>
                <option value="T13">T13</option>
                <option value="T16">T16</option>
                <option value="T18">T18</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="space-y-1">

              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">
                Trạng thái
              </label>

              <select
                name="status"
                required
                defaultValue={initialData?.status || 'SHOWING'}
                className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black text-zinc-400"
              >
                <option value="SHOWING">
                  ĐANG CHIẾU
                </option>

                <option value="COMING_SOON">
                  SẮP CHIẾU
                </option>
              </select>
            </div>

            {/* ================================================= */}
            {/* GENRES */}
            {/* ================================================= */}

            <div className="space-y-2">

              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 italic">
                Thể loại *
                ({selectedGenreIds.length} đã chọn)
              </label>

              <div className="flex flex-wrap gap-1.5 p-3 bg-black/60 border border-white/10 rounded-xl max-h-[160px] overflow-y-auto custom-scrollbar">

                {genres.length === 0 ? (

                  <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest p-1">
                    Đang tải...
                  </span>

                ) : (

                  genres.map((g) => {

                    const isSelected =
                      selectedGenreIds.includes(Number(g.id));

                    return (

                      <button
                        type="button"
                        key={g.id}
                        onClick={() => handleToggleGenre(Number(g.id))}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1
                        ${
                          isSelected
                            ? 'bg-red-600/20 text-red-400 border-red-500/50'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-900/60 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                      >

                        {isSelected && (
                          <Check
                            size={10}
                            className="stroke-[3]"
                          />
                        )}

                        {g.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* DURATION + DATE */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">

              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1">
                  <Clock size={9} />
                  Thời lượng
                </label>

                <input
                  name="duration"
                  type="number"
                  required
                  min="1"
                  defaultValue={initialData?.duration}
                  className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black"
                />
              </div>

              <div className="space-y-1">

                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1 flex items-center gap-1">
                  <Calendar size={9} />
                  Ngày khởi chiếu
                </label>

                <input
                  name="releaseDate"
                  type="date"
                  required
                  defaultValue={initialData?.releaseDate?.split('T')[0]}
                  className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 outline-none text-[11px] font-black uppercase"
                />
              </div>
            </div>

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-white hover:text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >

            {isSubmitting ? (
              <Loader2
                className="animate-spin"
                size={14}
              />
            ) : (
              <Save size={14} />
            )}

            {type === 'edit'
              ? 'Cập nhật'
              : 'Đăng phim'}
          </button>

        </div>
      </form>
    </div>
  );
}