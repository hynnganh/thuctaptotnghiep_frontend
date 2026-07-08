"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { apiAdminRequest } from '@/app/lib/api';
import { ChevronLeft, Heart, Trash2, Plus, Save, RefreshCcw, AlertTriangle, Lock } from 'lucide-react';

export default function SeatDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;

  // ===== STATES =====
  const [danhSachGhe, setDanhSachGhe] = useState<any[]>([]);
  const [deletedSeatIds, setDeletedSeatIds] = useState<number[]>([]); // 🎯 Hàng đợi lưu các ID ghế thật đã bị xóa ảo
  
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  
  const [config, setConfig] = useState({ rows: 10, cols: 12 });
  const [manualSeat, setManualSeat] = useState({ row: 'A', num: '1' });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning'
  });

  const whiteToast: any = {
    style: { background: '#ffffff', color: '#000000', fontSize: '12px', fontWeight: '900', borderRadius: '12px', padding: '16px', border: '1px solid #eee' }
  };

  // ===== TẢI DỮ LIỆU GỐC =====
  const taiDuLieu = useCallback(async () => {
    if (!roomId) return;
    try {
      setDangTai(true);
      setDeletedSeatIds([]); // 🎯 Reset hàng đợi xóa mỗi khi load lại data gốc

      const resSeats = await apiAdminRequest(`/api/v1/seats/room/${roomId}`);
      const resultSeats = await resSeats.json();
      const seatsData = resultSeats.data || [];
      setDanhSachGhe(seatsData);

      if (seatsData.length > 0 && seatsData[0]?.room) {
        const roomData = seatsData[0].room;
        setRoomInfo({ id: roomData.id, name: roomData.name, totalSeats: roomData.totalSeats || 0 });
        return;
      }

      const resRoom = await apiAdminRequest(`/api/v1/rooms/${roomId}`);
      if (!resRoom.ok) throw new Error("Không load được room");
      const roomResult = await resRoom.json();
      const rawRoom = roomResult.data;
      setRoomInfo({ id: rawRoom.id, name: rawRoom.name, totalSeats: rawRoom.totalSeats || 0 });

    } catch (err) {
      console.error("Load error:", err);
      toast.error("Lỗi tải dữ liệu!", whiteToast);
    } finally {
      setDangTai(false);
    }
  }, [roomId]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  // ===== MODAL =====
  const openConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setModalConfig({ isOpen: true, title, message, onConfirm, type });
  };
  const closeConfirm = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const checkSeatEligibility = async (seatId: any) => {
    try {
      const res = await apiAdminRequest(`/api/v1/seats/${seatId}/check-tickets`);
      if (res.ok) {
        const result = await res.json();
        return result.data.canDelete; 
      }
      return false;
    } catch { return false; }
  };

  // ===== XÓA GHẾ LẺ (ẢO) =====
  const handleXoaGhe = async (ghe: any) => {
    const isTemp = String(ghe.id).startsWith('temp-');
    if (isTemp) {
      setDanhSachGhe(prev => prev.filter(s => s.id !== ghe.id)); // Ảo thì bay luôn
      return;
    }

    const loadingCheck = toast.loading("Đang kiểm tra dữ liệu...", whiteToast);
    const canDelete = await checkSeatEligibility(ghe.id);
    toast.dismiss(loadingCheck);

    if (!canDelete) {
      return openConfirm(
        "Không thể thao tác!",
        `Phòng chiếu này hiện đã có lịch suất chiếu hoạt động hoặc sắp diễn ra. Không thể xóa ghế này.`,
        closeConfirm, 'info'
      );
    }

    openConfirm(
      "Xác nhận xóa ghế (Ảo)?",
      `Ghế ${ghe.seatRow}${ghe.seatNumber} sẽ biến mất khỏi sơ đồ. Bấm LƯU DATABASE để xóa thật.`,
      () => {
        closeConfirm();
        setDeletedSeatIds(prev => [...prev, ghe.id]); // Đưa vào hàng đợi xóa
        setDanhSachGhe(prev => prev.filter(s => s.id !== ghe.id)); // Ẩn khỏi màn hình
        toast.success(`Đã xóa ảo ghế ${ghe.seatRow}${ghe.seatNumber}!`, whiteToast);
      },
      'danger'
    );
  };

  // ===== XÓA SẠCH SẼ (ẢO) =====
  const handleResetSạchSẽ = () => {
    if (danhSachGhe.length === 0) return toast.error("Phòng đang trống!", whiteToast);
    
    openConfirm(
      "Dọn sạch sơ đồ?",
      `Toàn bộ ghế sẽ bị gỡ khỏi màn hình. Cần bấm LƯU DATABASE để cập nhật vào máy chủ.`,
      async () => {
        closeConfirm();
        const realSeats = danhSachGhe.filter(g => !String(g.id).startsWith('temp-'));
        
        if (realSeats.length > 0) {
          const loadingCheck = toast.loading("Đang kiểm tra điều kiện...", whiteToast);
          const isEligible = await checkSeatEligibility(realSeats[0].id);
          toast.dismiss(loadingCheck);
          if (!isEligible) {
            return openConfirm(
              "Không thể dọn sạch!",
              "Phòng chiếu này hiện đã có lịch suất chiếu hoạt động. Không thể thực hiện dọn sạch sơ đồ mẫu!",
              closeConfirm, 'info'
            );
          }
        }

        // Nếu hợp lệ -> Đưa toàn bộ ID thật vào hàng đợi xóa, rồi dọn sạch màn hình
        setDeletedSeatIds(prev => [...prev, ...realSeats.map(g => g.id)]);
        setDanhSachGhe([]);
        toast.success(`Đã dọn sạch ảo! Hãy bấm LƯU DATABASE để xác nhận.`, whiteToast);
      },
      'danger'
    );
  };

  // ===== TẠO SƠ ĐỒ HÀNG LOẠT (ẢO) =====
  const handleGenerateMultiple = () => {
    const totalToGenerate = config.rows * config.cols;
    const maxCapacity = roomInfo?.totalSeats || 0;
    if (totalToGenerate > maxCapacity) return toast.error(`Vượt sức chứa cấu hình rạp (${maxCapacity})!`, whiteToast);

    openConfirm(
      "Tạo sơ đồ hàng loạt?",
      `Tạo ma trận ${config.rows}x${config.cols}. Thao tác này sẽ gỡ bỏ các ghế cũ trên màn hình. Cần bấm LƯU DATABASE để áp dụng.`,
      async () => {
        closeConfirm();
        const realSeats = danhSachGhe.filter(g => !String(g.id).startsWith('temp-'));
        
        if (realSeats.length > 0) {
          const loadingCheck = toast.loading("Đang kiểm tra dữ liệu...", whiteToast);
          const isEligible = await checkSeatEligibility(realSeats[0].id);
          toast.dismiss(loadingCheck);
          if (!isEligible) {
            return openConfirm(
              "Không thể tạo hàng loạt!",
              "Phòng chiếu này đã có suất chiếu. Vui lòng đợi các suất chiếu kết thúc để cấu hình lại sơ đồ.",
              closeConfirm, 'info'
            );
          }
        }

        // Tạo danh sách ghế ảo mới
        const newSeats = [];
        let currentRow = 65; // 'A'
        for (let r = 0; r < config.rows; r++) {
          const rowChar = String.fromCharCode(currentRow + r);
          for (let c = 1; c <= config.cols; c++) {
            newSeats.push({
              id: `temp-gen-${Date.now()}-${r}-${c}`, // Tạo ID tạm
              seatRow: rowChar,
              seatNumber: c,
              seatType: 'NORMAL',
              price: 80000,
              roomId: Number(roomId)
            });
          }
        }

        // Đưa các ghế thật hiện tại vào hàng đợi xóa
        setDeletedSeatIds(prev => [...prev, ...realSeats.map(g => g.id)]);
        setDanhSachGhe(newSeats);
        toast.success("Đã khởi tạo ma trận ảo! Hãy bấm LƯU DATABASE để hoàn tất.", whiteToast);
      }
    );
  };

  // ===== THÊM 1 GHẾ (ẢO) =====
  const handleAddSingleSeat = () => {
    const row = manualSeat.row.trim().toUpperCase();
    const num = parseInt(manualSeat.num);
    const maxCapacity = roomInfo?.totalSeats || 0;
    if (!row || isNaN(num)) return toast.error("Nhập đủ thông tin!", whiteToast);
    if (danhSachGhe.length >= maxCapacity) return toast.error("Phòng đầy!", whiteToast);
    if (danhSachGhe.some(g => g.seatRow === row && Number(g.seatNumber) === num)) return toast.error("Trùng vị trí ghế!", whiteToast);

    const newSeat = { id: `temp-add-${Date.now()}`, seatRow: row, seatNumber: num, seatType: 'NORMAL', price: 60000, roomId: Number(roomId) };
    setDanhSachGhe(prev => [...prev, newSeat]);
    setManualSeat(prev => ({ ...prev, num: (num + 1).toString() }));
  };

  // ===== ĐỔI LOẠI GHẾ (ẢO) =====
  const toggleSeatType = (ghe: any) => {
    const types = ['NORMAL', 'VIP', 'SWEETBOX'];
    const prices: any = { 'NORMAL': 80000, 'VIP': 120000, 'SWEETBOX': 250000 };
    const nextType = types[(types.indexOf(ghe.seatType) + 1) % types.length];
    setDanhSachGhe(danhSachGhe.map(s => s.id === ghe.id ? { ...s, seatType: nextType, price: prices[nextType] } : s));
  };

  // 🎯 LƯU VÀO DATABASE (CHẠY TUẦN TỰ ĐỂ AN TOÀN TUYỆT ĐỐI)
  const handleSaveAll = async () => {
    setDangLuu(true);
    const loading = toast.loading("Đang đồng bộ dữ liệu... Vui lòng không đóng trang!", whiteToast);

    try {
      // BƯỚC 1: Xóa thật những ghế nằm trong hàng đợi (deletedSeatIds)
      for (const id of deletedSeatIds) {
        const res = await apiAdminRequest(`/api/v1/seats/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const result = await res.json().catch(()=>({}));
          throw new Error(result.message || "Lỗi khi xóa ghế cũ!");
        }
      }

      // BƯỚC 2: Thêm mới (POST) và Cập nhật (PUT) các ghế trên màn hình
      for (const ghe of danhSachGhe) {
        const isNew = String(ghe.id).startsWith('temp-');
        const body = { seatRow: ghe.seatRow, seatNumber: ghe.seatNumber, seatType: ghe.seatType, price: ghe.price, roomId: Number(roomId) };
        
        const res = await apiAdminRequest(isNew ? `/api/v1/seats` : `/api/v1/seats/${ghe.id}`, { 
          method: isNew ? 'POST' : 'PUT', 
          body: JSON.stringify(body) 
        });

        if (!res.ok) {
          const result = await res.json().catch(()=>({}));
          throw new Error(result.message || `Lỗi khi lưu ghế ${ghe.seatRow}${ghe.seatNumber}!`);
        }
      }

      toast.success("Đã đồng bộ sơ đồ thiết kế xuống máy chủ thành công!", { id: loading, ...whiteToast });
      taiDuLieu(); // Load lại data từ DB để dọn dẹp hàng đợi và lấy ID thật cho các ghế mới
    } catch (err: any) { 
      toast.error(err.message || "Lỗi đồng bộ dữ liệu hệ thống!", { id: loading, ...whiteToast }); 
    } finally { 
      setDangLuu(false); 
    }
  };

  const groupedSeats: any = useMemo(() => {
    return danhSachGhe.reduce((acc: any, ghe: any) => {
      const row = ghe.seatRow;
      if (!acc[row]) acc[row] = [];
      acc[row].push(ghe);
      return acc;
    }, {});
  }, [danhSachGhe]);

  const sortedRows = useMemo(() => Object.keys(groupedSeats).sort(), [groupedSeats]);
  const maxColNum = useMemo(() => Math.max(config.cols, ...danhSachGhe.map(g => Number(g.seatNumber) || 0)), [danhSachGhe, config.cols]);

  const CustomModal = () => {
    if (!modalConfig.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeConfirm}></div>
        <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden relative z-10 shadow-2xl">
          <div className="p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 
              ${modalConfig.type === 'danger' ? 'bg-red-500/10 text-red-500' : 
                modalConfig.type === 'info' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {modalConfig.type === 'info' ? <Lock size={24} /> : <AlertTriangle size={24} />}
            </div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-wider mb-2">{modalConfig.title}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-medium">{modalConfig.message}</p>
          </div>
          <div className="flex border-t border-white/5">
            {modalConfig.type !== 'info' && (
              <button onClick={closeConfirm} className="flex-1 px-6 py-4 text-[10px] font-black uppercase text-zinc-500 hover:bg-white/5 transition-all">Hủy bỏ</button>
            )}
            <button onClick={modalConfig.type === 'info' ? closeConfirm : modalConfig.onConfirm} 
              className={`flex-1 px-6 py-4 text-[10px] font-black uppercase text-white transition-all 
                ${modalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
                  modalConfig.type === 'info' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
              {modalConfig.type === 'info' ? 'Đã hiểu' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (dangTai) return <div className="h-screen bg-black flex items-center justify-center font-black text-red-600 animate-pulse uppercase tracking-[0.5em]">Loading Designer...</div>;

  return (
    <div className="h-screen bg-[#050505] text-zinc-400 flex flex-col overflow-hidden font-sans">
      <CustomModal />
      
      <header className="h-[70px] px-6 border-b border-white/5 flex justify-between items-center bg-[#050505] z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-white hover:text-black transition-all">
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">
              {roomInfo?.name || "PHÒNG CHƯA ĐẶT TÊN"}
            </h1>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-1.5">
              Sức chứa: {danhSachGhe.length} / {roomInfo?.totalSeats || 0}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleResetSạchSẽ} className="px-4 py-2 bg-zinc-900 border border-white/5 hover:bg-red-600 text-white rounded-lg font-black text-[9px] uppercase transition-all flex items-center gap-2">
            <Trash2 size={12} /> Reset Sạch
          </button>
          <button onClick={handleSaveAll} disabled={dangLuu} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-[9px] uppercase transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
            <Save size={12} /> {dangLuu ? "Saving..." : "Lưu database"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[260px] bg-[#0a0a0a] border-r border-white/5 p-5 flex flex-col gap-6">
          <div className="space-y-4">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 italic"><RefreshCcw size={10} /> Tạo tự động</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={config.rows} onChange={(e) => setConfig({...config, rows: +e.target.value})} className="bg-zinc-900 border border-white/5 rounded-lg py-2 text-white text-center text-xs outline-none" />
              <input type="number" value={config.cols} onChange={(e) => setConfig({...config, cols: +e.target.value})} className="bg-zinc-900 border border-white/5 rounded-lg py-2 text-white text-center text-xs outline-none" />
            </div>
            <button onClick={handleGenerateMultiple} className="w-full py-3 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black text-[9px] uppercase transition-all italic">Tạo hàng loạt</button>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 italic"><Plus size={10} /> Thêm ghế lẻ</label>
            <div className="flex gap-2">
              <input type="text" value={manualSeat.row} onChange={(e) => setManualSeat({...manualSeat, row: e.target.value})} className="w-1/2 bg-zinc-900 border border-white/5 rounded-lg py-2 text-center text-white text-xs font-bold uppercase" />
              <input type="number" value={manualSeat.num} onChange={(e) => setManualSeat({...manualSeat, num: e.target.value})} className="w-1/2 bg-zinc-900 border border-white/5 rounded-lg py-2 text-center text-white text-xs font-bold" />
            </div>
            <button onClick={handleAddSingleSeat} className="w-full py-3 bg-zinc-800 text-white hover:bg-zinc-700 rounded-xl font-black text-[9px] uppercase italic">Chèn ghế</button>
          </div>

          <div className="mt-auto p-4 bg-zinc-900/30 rounded-xl border border-white/5">
              <p className="text-[8px] font-bold text-zinc-500 uppercase mb-2">Chú thích</p>
              <div className="space-y-1.5 text-[9px]">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-zinc-800 rounded-sm"></div> Normal</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500/40 rounded-sm"></div> VIP</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-pink-500/40 rounded-sm"></div> Sweetbox</div>
              </div>
          </div>
        </aside>

        <main className="flex-1 bg-[#050505] overflow-auto p-12 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-xl mb-20 relative opacity-40">
            <div className="w-full h-[1px] bg-white"></div>
            <p className="text-[8px] font-black tracking-[1.5em] text-white text-center mt-2 uppercase italic">Screen Area</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 pb-32">
            {sortedRows.map((rowLetter) => (
              <div key={rowLetter} className="flex items-center gap-5">
                <span className="w-5 text-right font-black text-zinc-800 text-[10px] uppercase italic">{rowLetter}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: maxColNum }).map((_, index) => {
                    const seatNum = index + 1;
                    const ghe = (groupedSeats[rowLetter] || []).find((g: any) => Number(g.seatNumber) === seatNum);
                    if (!ghe) return <div key={index} className="w-7 h-7 border border-dashed border-white/5 rounded-md" />;
                    const isSweet = ghe.seatType === 'SWEETBOX';
                    const isVip = ghe.seatType === 'VIP';
                    return (
                      <div key={ghe.id} onClick={() => toggleSeatType(ghe)}
                        className={`h-7 flex-shrink-0 rounded-lg flex flex-col items-center justify-center border relative group cursor-pointer transition-all active:scale-90
                          ${isSweet ? 'w-[59px] bg-pink-500/10 border-pink-500/30 text-pink-400' : 
                            isVip ? 'w-7 bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                            'w-7 bg-zinc-900 border-white/5 text-zinc-500'}`}>
                        {isSweet && <Heart size={8} fill="currentColor" className="mb-0.5 animate-pulse" />}
                        <span className="text-[8px] font-black select-none tracking-tighter">{ghe.seatRow}{ghe.seatNumber}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleXoaGhe(ghe); }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 text-[10px] font-bold">×</button>
                      </div>
                    );
                  })}
                </div>
                <span className="w-5 text-left font-black text-zinc-800 text-[10px] uppercase italic">{rowLetter}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
