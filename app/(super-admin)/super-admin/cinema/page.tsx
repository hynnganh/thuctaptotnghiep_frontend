"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Building2,
  ChevronRight,
  Fingerprint,
  Edit3,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

import { apiSuperAdminRequest } from "@/app/lib/api";
import AddCinemaModal from "./AddCinemaModal";

// ================= DELETE MODAL =================
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#0f0f0f] border border-zinc-800 w-full max-w-[380px] rounded-2xl p-6 text-center space-y-5 shadow-2xl">
        
        <div className="mx-auto w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
          <AlertTriangle size={24} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            Xóa cụm rạp?
          </h2>

          <p className="text-sm text-zinc-500 leading-relaxed">
            Bạn đang chuẩn bị xóa cụm rạp
            <span className="text-zinc-200 font-semibold">
              {" "}
              "{title}"
            </span>
            .
          </p>

          <p className="text-xs text-red-400">
            Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-sm font-semibold hover:bg-zinc-900 hover:text-white transition"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN PAGE =================
export default function CinemaPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalItem, setModalItem] = useState<any>(undefined);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // ================= FETCH =================
  const fetchCinemas = async () => {
    setLoading(true);

    try {
      const res = await apiSuperAdminRequest("/api/v1/cinemas");

      const result = await res.json();

      setItems(
        Array.isArray(result.data || result)
          ? result.data || result
          : []
      );
    } catch (err) {
      toast.error("Không thể kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const loadingToast = toast.loading(
      "Đang kiểm tra dữ liệu..."
    );

    try {
      const res = await apiSuperAdminRequest(
        `/api/v1/cinemas/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      // ================= SUCCESS =================
      if (res.ok) {
        toast.success(
          data?.message ||
            "Đã xóa cụm rạp thành công",
          {
            id: loadingToast,
          }
        );

        setDeleteTarget(null);

        fetchCinemas();

        return;
      }

      // ================= HANDLE BUSINESS ERROR =================
      const errorMessage =
        data?.message ||
        data?.error ||
        "Không thể xóa cụm rạp";

      // ❌ KHÔNG LOG ERROR ĐỎ NỮA
      toast.error(errorMessage, {
        id: loadingToast,
      });

    } catch (err: any) {
      // ❌ KHÔNG console.error nữa để mất lỗi đỏ

      toast.error(
        "Hệ thống đang bận, vui lòng thử lại",
        {
          id: loadingToast,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      
      {/* ================= TOAST ================= */}
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,

          style: {
            background: "#09090b",
            color: "#fff",
            border: "1px solid #27272a",
            borderRadius: "16px",
            padding: "14px 16px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.45)",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },

          error: {
            icon: <XCircle size={18} />,
            style: {
              border: "1px solid rgba(239,68,68,.25)",
            },
          },

          loading: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* ================= MODAL ADD / EDIT ================= */}
      <AddCinemaModal
        isOpen={modalItem !== undefined}
        onClose={() => setModalItem(undefined)}
        onSuccess={fetchCinemas}
        initialData={modalItem}
      />

      {/* ================= MODAL DELETE ================= */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* ================= HEADER ================= */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 mb-10 gap-4">

        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Chi nhánh
            <span className="text-red-600">
              Cinema
            </span>
          </h1>

          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <LayoutGrid
              size={11}
              className="text-zinc-600"
            />
            Phân hệ quản lý rạp chiếu
          </p>
        </div>

        <button
          onClick={() => setModalItem(null)}
          className="h-11 px-5 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Thêm cơ sở
        </button>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="max-w-6xl mx-auto">

        {/* ================= LOADING ================= */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2
              className="animate-spin text-red-600"
              size={30}
            />

            <span className="text-[11px] font-bold tracking-[0.25em] text-zinc-600 uppercase">
              Đang tải dữ liệu...
            </span>
          </div>

        ) : items.length > 0 ? (

          // ================= LIST =================
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  router.push(
                    `/super-admin/cinema/${item.id}`
                  )
                }
                className="group relative bg-[#060608] border border-zinc-900 rounded-2xl p-6 hover:border-red-600/20 transition-all cursor-pointer overflow-hidden shadow-lg"
              >
                {/* BACKGROUND ID */}
                <span className="absolute top-3 right-4 text-4xl font-black text-white/[0.02] group-hover:text-red-600/[0.05] transition">
                  {String(item.id).padStart(2, "0")}
                </span>

                {/* TOP */}
                <div className="flex justify-between items-start mb-10 relative z-10">
                  
                  <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Building2 size={20} />
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    
                    {/* EDIT */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalItem(item);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900 hover:bg-white hover:text-black transition"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900 hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* BODY */}
                <div className="space-y-3 relative z-10">
                  <h3 className="text-lg font-bold uppercase text-zinc-200 group-hover:text-white transition truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Đang hoạt động
                    </span>

                    <ChevronRight
                      size={13}
                      className="ml-auto text-zinc-600 group-hover:text-red-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (

          // ================= EMPTY =================
          <div className="py-24 text-center border border-zinc-900 border-dashed bg-zinc-950/40 rounded-2xl">
            <Fingerprint
              className="mx-auto mb-4 text-zinc-800"
              size={40}
            />

            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-600">
              Chưa có cụm rạp nào
            </p>
          </div>
        )}
      </main>
    </div>
  );
}