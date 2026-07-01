"use client";

import React, { useEffect, useState, use } from "react";
import MovieForm from "../../MovieForm";
import { apiRequest } from "@/app/lib/api";
import { Loader2, ShieldAlert } from "lucide-react";
import Cookies from "js-cookie";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMoviePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(false);

        const token =
          localStorage.getItem("token") || Cookies.get("token");

        const res = await apiRequest(`/api/v1/movies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const responseData = await res.json();

        // API có thể trả về data hoặc object trực tiếp
        const movieData = responseData.data || responseData;

        console.log("🎬 RAW MOVIE:", movieData);

        // ==========================================
        // FIX THỂ LOẠI KHI EDIT
        // ==========================================

        let normalizedGenres: any[] = [];
        let normalizedGenreIds: number[] = [];

        // CASE 1: genres object
        if (
          movieData.genres &&
          Array.isArray(movieData.genres)
        ) {
          normalizedGenres = movieData.genres;

          normalizedGenreIds = movieData.genres.map(
            (g: any) => Number(g.id)
          );
        }

        // CASE 2: genreIds array
        else if (
          movieData.genreIds &&
          Array.isArray(movieData.genreIds)
        ) {
          normalizedGenreIds = movieData.genreIds.map((id: any) =>
            Number(id)
          );
        }

        // CASE 3: genreNames only
        else if (
          movieData.genreNames &&
          Array.isArray(movieData.genreNames)
        ) {
          normalizedGenres = movieData.genreNames.map(
            (name: string, index: number) => ({
              id: index + 1,
              name,
            })
          );

          normalizedGenreIds = normalizedGenres.map(
            (g: any) => g.id
          );
        }

        // ==========================================
        // CHUẨN HÓA DỮ LIỆU
        // ==========================================

        const normalizedMovie = {
          ...movieData,

          genres: normalizedGenres,

          genreIds: normalizedGenreIds,

          title: movieData.title || "",

          description: movieData.description || "",

          duration: movieData.duration || 0,

          director: movieData.director || "",

          cast: movieData.cast || "",

          country: movieData.country || "",

          status: movieData.status || "SHOWING",

          ageRating: movieData.ageRating || "P",

          trailerUrl: movieData.trailerUrl || "",

          posterUrl: movieData.posterUrl || "",

          rating: movieData.rating || 0,

          reviewCount: movieData.reviewCount || 0,

          releaseDate: movieData.releaseDate || "",
        };

        console.log(
          "✅ NORMALIZED MOVIE:",
          normalizedMovie
        );

        setMovie(normalizedMovie);
      } catch (error) {
        console.error("❌ Fetch movie error:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  // ==========================================
  // LOADING UI
  // ==========================================
  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2
          className="animate-spin text-red-600"
          size={40}
        />

        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          Đang đồng bộ dữ liệu phim...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR UI
  // ==========================================
  if (error || !movie) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <ShieldAlert
          size={40}
          className="text-red-600"
        />

        <p className="font-black uppercase italic text-white tracking-tighter">
          Lỗi xác thực (403 / 404)
        </p>

        <p className="text-[9px]">
          ID phim {id} không tồn tại hoặc token hết hạn.
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER FORM
  // ==========================================
  return (
    <MovieForm
      type="edit"
      initialData={movie}
    />
  );
}