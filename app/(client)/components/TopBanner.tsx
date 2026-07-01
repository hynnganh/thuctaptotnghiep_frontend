"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ImageOff } from "lucide-react";
import { BASE_URL, apiRequest } from "../../lib/api";

export default function TopBanner() {
  const [activeBanner, setActiveBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchTopBanner = async () => {
      try {
        const res = await apiRequest("/api/v1/banners");
        const json = await res.json();

        if (json.status === 200 && Array.isArray(json.data)) {
          const banner = json.data
            .filter(
              (b: any) =>
                b.position === "HOME_TOP" &&
                b.status === "ACTIVE"
            )
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)[0];

          setActiveBanner(banner);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBanner();
  }, []);

  if (loading || !activeBanner) return null;

  // ✅ FIX ẢNH (QUAN TRỌNG)
  const imageUrl =
    activeBanner.imageUrl?.startsWith("http")
      ? activeBanner.imageUrl
      : `${BASE_URL}${activeBanner.imageUrl}`;

  return (
    <a
      href={activeBanner.linkUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block h-10 bg-zinc-900 overflow-hidden group"
    >
      <div className="absolute inset-0">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={activeBanner.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[5000ms]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <ImageOff size={14} className="text-white/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-red-600/70 to-red-950/90" />
      </div>

      <div className="relative z-20 h-full flex items-center justify-center gap-3 text-white px-4">
        <Sparkles size={12} className="text-yellow-300 animate-pulse" />
        <span className="text-[10px] md:text-xs font-black uppercase italic tracking-[0.2em] drop-shadow-md">
          {activeBanner.title}
        </span>
        <Sparkles size={12} className="text-yellow-300 animate-pulse" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.1),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />

      <style jsx>{`
        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite linear;
        }
      `}</style>
    </a>
  );
}