"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiSuperAdminRequest } from '@/app/lib/api';

import {
  Loader2,
  Clapperboard,
  ArrowLeft,
  Plus,
  ChevronRight,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';

import toast, { Toaster } from 'react-hot-toast';

import AddCinemaItemModal from './CinemaItem';

// ================= CONFIRM DELETE MODAL =================
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title
}: any) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative bg-[#0f0f0f] border border-zinc-900 w-full max-w-[380px] rounded-xl p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">

        <div className="mx-auto w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center text-red-500">
          <AlertTriangle size={20} />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold uppercase text-white tracking-tight">
            Xóa mục này?
          </h2>

          <p className="text-xs text-zinc-500 font-medium px-2 leading-relaxed">
            Dữ liệu về cụm{" "}
            <span className="text-zinc-200 font-semibold">
              "{title}"
            </span>{" "}
            sẽ bị xóa khỏi hệ thống.
          </p>
        </div>

        <div className="flex w-full gap-2.5 pt-2">

          <button
            onClick={onClose}
            className="flex-1 bg-zinc-950 border border-zinc-900 py-3 rounded-lg text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300 transition"
          >
            Hủy bỏ
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg text-[10px] font-bold uppercase hover:bg-red-700 transition"
          >
            Xác nhận
          </button>

        </div>
      </div>
    </div>
  );
};

// ================= PAGE =================
export default function CinemaDetailPage() {

  const params = useParams();

  const id = params?.id;

  const router = useRouter();

  const [cinema, setCinema] = useState<any>(null);

  const [cinemaItems, setCinemaItems] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [modalData, setModalData] = useState<any>(undefined);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // ================= FETCH DATA =================
  const fetchData = async () => {

    if (!id) return;

    try {

      setLoading(true);

      const [resC, resI] = await Promise.all([

        apiSuperAdminRequest(
          `/api/v1/cinemas/${id}`
        ),

        apiSuperAdminRequest(
          `/api/v1/cinema-items`
        )
      ]);

      const dataC = await resC.json();

      const dataI = await resI.json();

      setCinema(
        dataC.data || dataC
      );

      const allItems = dataI.data || dataI;

      const filteredItems =
        Array.isArray(allItems)
          ? allItems.filter(
              (i: any) =>
                i.cinemaId === Number(id) ||
                i.cinema?.id === Number(id)
            )
          : [];

      setCinemaItems(filteredItems);

    } catch (err) {

      toast.error(
        "Lỗi đồng bộ dữ liệu hệ thống"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, [id]);

  // ================= DELETE =================
  const handleDelete = async () => {

    if (!deleteTarget) return;

    const t = toast.loading(
      "Đang tiến hành gỡ bỏ..."
    );

    try {

      const res =
        await apiSuperAdminRequest(

          `/api/v1/cinema-items/${deleteTarget.id}`,

          {
            method: 'DELETE'
          }
        );

      // ================= LẤY RESPONSE =================
      const result = await res.json();

      // ================= SUCCESS =================
      if (res.ok) {

        toast.success(

          result.message ||
          "Đã xóa thành công",

          {
            id: t
          }
        );

        setDeleteTarget(null);

        fetchData();
      }

      // ================= FAILED =================
      else {

        toast.error(

          result.message ||
          "Không thể xóa dữ liệu",

          {
            id: t
          }
        );
      }

    } catch (err) {

      toast.error(

        "Lỗi kết nối server",

        {
          id: t
        }
      );
    }
  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-3">

        <Loader2
          className="animate-spin text-red-600 opacity-80"
          size={28}
        />

        <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase animate-pulse">
          Đang đồng bộ cấu trúc hệ thống...
        </span>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= BACK ================= */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
        >

          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />

          Quay lại danh sách

        </button>

        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 gap-4">

          <div className="space-y-1">

            <div className="flex items-center gap-2">

              <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-bold uppercase text-red-500 tracking-wide">
                NODE_ID: #{id}
              </span>

              <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                Infrastructure Hub
              </p>

            </div>

            <h1 className="text-xl font-black uppercase tracking-tight text-white">

              {cinema?.name || "Cinema Detail"}

            </h1>
          </div>

          <button
            onClick={() => setModalData(null)}
            className="bg-white text-black px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] shadow-sm flex items-center gap-2"
          >

            <Plus size={14} />

            Thêm đơn vị

          </button>
        </header>

        {/* ================= LIST ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {cinemaItems.map((item) => (

            <div
              key={item.id}
              onClick={() =>
                router.push(
                  `/super-admin/room/${item.id}`
                )
              }
              className="group relative bg-[#060608] border border-zinc-900 rounded-xl p-6 transition-all hover:border-red-600/20 cursor-pointer overflow-hidden shadow-md flex flex-col justify-between"
            >

              <span className="absolute top-3 right-4 text-3xl font-black text-white/[0.01] group-hover:text-red-600/[0.04] transition-colors tracking-tighter">

                {String(item.id).padStart(2, '0')}

              </span>

              <div className="flex justify-between items-start mb-8 relative z-10">

                <div className="w-11 h-11 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-transparent transition-all duration-300 shadow-inner">

                  <Clapperboard size={18} />

                </div>

                {/* ================= ACTION ================= */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">

                  <button
                    onClick={(e) => {

                      e.stopPropagation();

                      setModalData(item);
                    }}
                    className="p-2 bg-zinc-950 border border-zinc-900 hover:bg-white hover:text-black rounded-md transition-all shadow-md"
                  >

                    <Edit3 size={12} />

                  </button>

                  <button
                    onClick={(e) => {

                      e.stopPropagation();

                      setDeleteTarget(item);
                    }}
                    className="p-2 bg-zinc-950 border border-zinc-900 hover:bg-red-600 hover:text-white hover:border-transparent rounded-md transition-all shadow-md"
                  >

                    <Trash2 size={12} />

                  </button>

                </div>
              </div>

              {/* ================= CONTENT ================= */}
              <div className="space-y-4 relative z-10">

                <h3 className="text-base font-bold uppercase text-zinc-200 group-hover:text-white transition-colors duration-200 tracking-tight truncate">

                  {item.name}

                </h3>

                <div className="grid grid-cols-2 gap-3">

                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-lg">

                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-wider mb-0.5">
                      Khu vực
                    </p>

                    <p className="text-xs font-bold text-zinc-400 uppercase truncate">
                      {item.city || "N/A"}
                    </p>

                  </div>

                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-lg">

                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-wider mb-0.5">
                      Capacity
                    </p>

                    <p className="text-xs font-bold text-zinc-400 uppercase">
                      {item.hoursPerRoom || 0}H/D
                    </p>

                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between group-hover:border-red-600/10 transition-colors">

                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 group-hover:text-zinc-400 transition-colors">

                    Quản lý danh sách phòng

                  </span>

                  <ChevronRight
                    size={12}
                    className="text-zinc-600 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all"
                  />

                </div>
              </div>
            </div>
          ))}

          {/* ================= EMPTY ================= */}
          {cinemaItems.length === 0 && (

            <div className="col-span-full py-20 text-center border border-zinc-900 border-dashed bg-zinc-950/40 rounded-xl">

              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">

                Trống - Chờ khởi tạo dữ liệu đơn vị cơ sở

              </p>

            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ADD/EDIT ================= */}
      <AddCinemaItemModal
        isOpen={modalData !== undefined}
        onClose={() => setModalData(undefined)}
        cinemaId={Number(id)}
        onSuccess={fetchData}
        initialData={modalData}
      />

      {/* ================= MODAL DELETE ================= */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

    </div>
  );
}