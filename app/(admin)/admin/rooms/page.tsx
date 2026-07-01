"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Monitor,
  Armchair,
  Trash2,
  Building2,
  AlertTriangle,
  Settings2,
  ChevronRight,
  Eye
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiAdminRequest } from '@/app/lib/api';
import FormPhongChieu from './RoomForm';

export default function QuanLyPhongCompact() {
  const router = useRouter();

  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState<string>("");
  const [phongChieu, setPhongChieu] = useState<any[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [hienModal, setHienModal] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [duLieuForm, setDuLieuForm] = useState({ name: '', totalSeats: 0 });
  const [errors, setErrors] = useState<any>({});
  const [phongDangChonXoa, setPhongDangChonXoa] =
    useState<{ id: number, name: string } | null>(null);

  const safeParse = async (res: Response) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

  const taiLaiDanhSach = async (targetId: number) => {
    try {
      const res = await apiAdminRequest(`/api/v1/rooms/cinema-item/${targetId}`);
      if (res.ok) {
        const ketQua = await safeParse(res);
        setPhongChieu(ketQua.data || []);
      }
    } catch (err) {
      console.error("Lỗi cập nhật danh sách phòng:", err);
    }
  };

  useEffect(() => {
    const khoiTao = async () => {
      try {
        setDangTai(true);

        const resUser = await apiAdminRequest('/api/v1/users/me');
        if (!resUser.ok) throw new Error();

        const userRes = await safeParse(resUser);
        const idRap = userRes.data?.managedCinemaItemId;

        if (idRap) {
          setCinemaId(idRap);

          const resCinema = await apiAdminRequest(`/api/v1/cinema-items/${idRap}`);
          const dataCinema = await safeParse(resCinema);

          setCinemaName(dataCinema.data?.name || `Cơ sở ${idRap}`);
          await taiLaiDanhSach(idRap);
        }
      } catch (err) {
        toast.error("Phiên đăng nhập hết hạn!");
        router.push('/login');
      } finally {
        setDangTai(false);
      }
    };

    khoiTao();
  }, [router]);

  const xuLyLuu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaId) return;

    const dangSua = !!dangSuaId;
    const url = dangSua ? `/api/v1/rooms/${dangSuaId}` : '/api/v1/rooms';

    const thongBao = toast.loading("Đang xử lý dữ liệu...");

    try {
      const res = await apiAdminRequest(url, {
        method: dangSua ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...duLieuForm,
          cinemaItemId: cinemaId
        })
      });

      const data = await safeParse(res);

      if (res.ok) {
        toast.success(
          dangSua ? "Cập nhật thành công!" : "Đã thêm phòng mới!",
          { id: thongBao }
        );

        setHienModal(false);
        setErrors({});
        await taiLaiDanhSach(cinemaId);
      } else {
        toast.error(data.message || "Thao tác thất bại!", { id: thongBao });
        if (data.data) setErrors(data.data);
      }

    } catch (err) {
      toast.error("Lỗi kết nối máy chủ!", { id: thongBao });
    }
  };

  const xacNhanXoa = async () => {
    if (!phongDangChonXoa || !cinemaId) return;

    const thongBao = toast.loading("Đang thực hiện xóa...");

    try {
      const res = await apiAdminRequest(
        `/api/v1/rooms/${phongDangChonXoa.id}`,
        { method: "DELETE" }
      );

      const data = await safeParse(res);

      if (res.ok) {
        toast.success(data.message || "Đã xóa phòng thành công!", { id: thongBao });
        setPhongDangChonXoa(null);
        await taiLaiDanhSach(cinemaId);
      } else {
        toast.error(data.message || "Phòng đang có suất chiếu chưa diễn ra!", { id: thongBao });
      }

    } catch (err) {
      toast.error("Không kết nối được máy chủ!", { id: thongBao });
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-400 p-6 font-sans select-none tracking-tight">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6 border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-5 bg-zinc-950 rounded-xl text-red-600 border border-zinc-900 shadow-lg hover:scale-105 transition">
              <Building2 size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                Rạp <span className="text-red-600">{cinemaName}</span>
              </h1>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mt-2">
                Hệ thống quản lý phòng chiếu nội bộ
              </p>
            </div>
          </div>

          {!dangTai && (
            <button
              onClick={() => {
                setDangSuaId(null);
                setDuLieuForm({ name: '', totalSeats: 0 });
                setErrors({});
                setHienModal(true);
              }}
              className="px-6 py-3 bg-white text-black rounded-xl font-black text-[11px]
              uppercase hover:bg-red-600 hover:text-white transition-all
              active:scale-95 shadow-lg hover:shadow-red-500/20"
            >
              + Thêm phòng chiếu
            </button>
          )}
        </header>

        {/* LOADING */}
        {dangTai ? (
          <div className="flex flex-col items-center py-40 gap-3 opacity-40">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              Đang đồng bộ dữ liệu...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {phongChieu.map((phong) => (
              <motion.div
                key={phong.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-xl p-6
                hover:border-red-700/40 transition-all duration-300 overflow-hidden shadow-lg"
              >

                <div className="flex justify-between items-start mb-8">

                  <div className="w-12 h-12 bg-[#060608] border border-zinc-900 rounded-xl flex items-center justify-center
                  group-hover:bg-red-600 transition-colors shadow-md">
                    <Monitor size={24} className="text-white" />
                  </div>

                  <div className="flex gap-2 relative z-10">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDangSuaId(phong.id);
                        setDuLieuForm({
                          name: phong.name,
                          totalSeats: phong.totalSeats
                        });
                        setErrors({});
                        setHienModal(true);
                      }}
                      className="p-2 hover:text-white transition hover:scale-110"
                    >
                      <Settings2 size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhongDangChonXoa({ id: phong.id, name: phong.name });
                      }}
                      className="p-2 hover:text-red-500 transition hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                </div>

                <h3 className="text-xl font-black text-zinc-200 mb-5 group-hover:text-white">
                  {phong.name}
                </h3>

                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Armchair size={16} className="text-zinc-500 group-hover:text-red-500 transition" />
                    <span className="text-[10px] font-black uppercase">
                      {phong.totalSeats} Ghế
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/admin/rooms/${phong.id}`)}
                    className="text-[10px] font-black uppercase flex items-center gap-1 hover:text-red-500 transition"
                  >
                    Xem <Eye size={14} />
                  </button>

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL GIỮ NGUYÊN */}
      {hienModal && (
        <FormPhongChieu
          dangSuaId={dangSuaId}
          duLieuForm={duLieuForm}
          setDuLieuForm={setDuLieuForm}
          errors={errors}
          onSubmit={xuLyLuu}
          onDong={() => {
            setHienModal(false);
            setErrors({});
          }}
        />
      )}

      {/* DELETE MODAL GIỮ NGUYÊN */}
      {phongDangChonXoa && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPhongDangChonXoa(null)} />

          <div className="relative bg-zinc-950 border border-zinc-900 rounded-xl p-8 w-full max-w-sm text-center">
            <AlertTriangle size={34} className="text-red-600 mx-auto mb-4" />

            <h2 className="text-xl font-black text-white mb-2 uppercase">
              Xác nhận xóa phòng?
            </h2>

            <p className="text-zinc-500 text-[10px] font-black mb-6 uppercase">
              {phongDangChonXoa.name}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPhongDangChonXoa(null)}
                className="py-3 bg-zinc-900"
              >
                Hủy
              </button>

              <button
                onClick={xacNhanXoa}
                className="py-3 bg-red-600 hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}