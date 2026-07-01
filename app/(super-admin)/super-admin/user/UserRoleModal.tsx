"use client";
import React from 'react';
import { Search, Building2, Check, X, ShieldCheck, User, MapPin, Lock } from 'lucide-react';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedCinema: number | string;
  setSelectedCinema: (id: number | string) => void;
  cinemaSearch: string;
  setCinemaSearch: (search: string) => void;
  filteredCinemas: any[];
  onConfirm: () => void;
  allUsers: any[]; // THÊM PROP NÀY ĐỂ CHECK RÀNG BUỘC
}

export default function UserRoleModal({
  isOpen, onClose, selectedUser, selectedRole, setSelectedRole,
  selectedCinema, setSelectedCinema, cinemaSearch, setCinemaSearch,
  filteredCinemas, onConfirm, allUsers
}: UserRoleModalProps) {
  if (!isOpen) return null;

  // HÀM KIỂM TRA RẠP ĐÃ CÓ ADMIN CHƯA
  const getAdminOfCinema = (cinemaId: number) => {
    return allUsers.find(u => 
      u.roles?.includes('ROLE_ADMIN') && 
      String(u.managedCinemaItemId) === String(cinemaId) &&
      u.userId !== selectedUser?.userId // Không tính chính người đang được sửa
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-[#0f0f0f] border border-white/10 w-full max-w-[420px] rounded-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-[1000] uppercase text-white tracking-tighter leading-none flex items-center gap-2">
                Cấp quyền <span className="text-red-600">Truy cập</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 bg-white/5 px-2 py-1 rounded w-fit">
                {selectedUser?.email}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Chọn vai trò */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">Vai trò hệ thống</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-900/80 rounded-xl border border-white/5">
                {[
                  { label: "Thành viên", val: "ROLE_USER", icon: <User size={14}/> },
                  { label: "Quản trị", val: "ROLE_ADMIN", icon: <ShieldCheck size={14}/> }
                ].map((item) => (
                  <button 
                    key={item.val}
                    type="button"
                    onClick={() => {
                        setSelectedRole(item.val);
                        if (item.val === "ROLE_USER") setSelectedCinema("");
                    }}
                    className={`py-3.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                      selectedRole === item.val 
                        ? 'bg-red-600 text-white' 
                        : 'text-zinc-500 hover:bg-white/5'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Rạp với ràng buộc 1-1 */}
            {selectedRole === "ROLE_ADMIN" && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={12} className="text-red-600"/> Chọn rạp quản lý
                </label>
                
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
                  <div className="relative mb-4 flex items-center bg-black/40 px-3 rounded-lg border border-white/5">
                    <Search size={14} className="text-zinc-700" />
                    <input 
                      type="text" 
                      placeholder="TÌM ĐỊA CHỈ RẠP..." 
                      className="w-full bg-transparent p-2.5 text-[11px] font-bold outline-none text-white uppercase"
                      value={cinemaSearch}
                      onChange={(e) => setCinemaSearch(e.target.value)}
                    />
                  </div>

                  {/* THÊM CLASS hiden-scrollbar ĐỂ ẨN THANH CUỘN */}
                  <div className="max-h-[160px] overflow-y-auto space-y-1.5 hiden-scrollbar">
                    {filteredCinemas.map((c) => {
                      const existingAdmin = getAdminOfCinema(c.id);
                      const isSelected = String(selectedCinema) === String(c.id);
                      const isOccupied = !!existingAdmin; // Rạp đã có Admin khác

                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={isOccupied} // Vô hiệu hóa nếu đã có chủ
                          onClick={() => setSelectedCinema(c.id)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-lg text-[10px] font-black uppercase transition-all text-left border ${
                            isSelected 
                              ? 'bg-red-600/20 text-white border-red-600/40' 
                              : isOccupied 
                                ? 'bg-zinc-950 text-zinc-800 border-transparent cursor-not-allowed opacity-50'
                                : 'bg-white/[0.02] text-zinc-500 hover:bg-white/[0.05] border-transparent'
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {isOccupied ? <Lock size={10} /> : <MapPin size={10} />}
                              <span>{c.address}</span>
                            </div>
                            {isOccupied && (
                              <span className="text-[7px] text-red-900 lowercase font-medium">
                                Đã được quản lý bởi: {existingAdmin.firstName} {existingAdmin.lastName}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check size={14} className="text-red-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button 
                onClick={onConfirm}
                className="w-full bg-white text-black py-5 rounded-lg font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-[0.98]"
              >
                Xác nhận thiết lập <Check size={18} className="inline ml-2"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS SCOPED ĐỂ ẨN HOÀN TOÀN SCROLLBAR TRÊN CÁC TRÌNH DUYỆT */}
      <style jsx>{`
        .hiden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hiden-scrollbar {
          -ms-overflow-style: none;  /* IE và Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}