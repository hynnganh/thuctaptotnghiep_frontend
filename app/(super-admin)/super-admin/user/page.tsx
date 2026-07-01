"use client";
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Building2, User as UserIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiSuperAdminRequest } from '@/app/lib/api'; 
import UserRoleModal from './UserRoleModal';

export default function SuperAdminUserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("ROLE_USER");
  const [selectedCinema, setSelectedCinema] = useState<number | string>("");
  const [cinemaSearch, setCinemaSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, cinemaRes] = await Promise.all([
        apiSuperAdminRequest('/api/v1/users'),
        apiSuperAdminRequest('/api/v1/cinema-items')
      ]);
      const userData = await userRes.json();
      const cinemaData = await cinemaRes.json();
      setUsers(userData.data?.content || userData.data || []);
      setCinemas(cinemaData.data || []);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openRoleModal = (user: any) => {
    const isAdmin = user.roles?.includes('ROLE_ADMIN');
    setSelectedUser(user);
    setSelectedRole(isAdmin ? "ROLE_ADMIN" : "ROLE_USER");
    setSelectedCinema(user.managedCinemaItemId || ""); 
    setCinemaSearch("");
    setIsModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (selectedRole === "ROLE_ADMIN" && !selectedCinema) {
      return toast.error("Vui lòng chọn cơ sở cho Quản trị viên!");
    }

    const loadingToast = toast.loading("Đang cập nhật...");
    try {
      const res = await apiSuperAdminRequest(`/api/v1/users/${selectedUser.userId}/assign-role`, {
        method: 'PUT',
        body: JSON.stringify({ 
          roles: [selectedRole], 
          cinemaItemId: selectedRole === "ROLE_ADMIN" ? Number(selectedCinema) : null 
        })
      });

      if (res.ok) {
        toast.success("Thành công!", { id: loadingToast });
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Lỗi!", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Máy chủ không phản hồi!", { id: loadingToast });
    }
  };

  const filteredUsers = users.filter(u => {
    // 1. Kiểm tra nếu là SUPER_ADMIN thì ẩn hoàn toàn khỏi danh sách nhân sự
    const isSuperAdmin = u.roles?.includes('ROLE_SUPER_ADMIN') || u.roles?.includes('SUPER_ADMIN');
    if (isSuperAdmin) return false;

    // 2. Tìm kiếm theo Tên, Họ hoặc Email
    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase());
    
    // 3. Phân loại theo các Tab chuyển đổi
    if (activeTab === "ALL") return matchSearch;
    
    const isAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ADMIN');
    return activeTab === "ADMIN" ? (isAdmin && matchSearch) : (!isAdmin && matchSearch);
  });

  const filteredCinemas = cinemas.filter(c => 
    (c.address || "").toLowerCase().includes(cinemaSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12">
      <Toaster position="top-right" />
      
      {/* KHU VỰC TIÊU ĐỀ & THANH CÔNG CỤ (ĐÃ SỬA CHUẨN HOÁ) */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-zinc-900 pb-5 mb-10 gap-6">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Phân hệ SuperAdmin</p>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Nhân Sự <span className="text-zinc-500">Hệ Thống</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-zinc-950 p-1 rounded-lg border border-zinc-900 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="TÌM KIẾM NHÂN VIÊN..."
              className="w-full bg-transparent py-2 pl-10 pr-4 text-xs font-semibold uppercase outline-none text-white placeholder:text-zinc-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {["ALL", "ADMIN", "USER"].map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t as any)} 
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all tracking-wide ${
                  activeTab === t 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === "ALL" ? "Tất cả" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KHU VỰC BẢNG DỮ LIỆU */}
      <div className="max-w-7xl mx-auto bg-[#060608] border border-zinc-900 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.01] text-[10px] font-bold uppercase text-zinc-500 tracking-wider border-b border-zinc-900">
            <tr>
              <th className="p-6">Người dùng</th>
              <th className="p-6">Quyền hạn</th>
              <th className="p-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {loading ? (
              <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></td></tr>
            ) : filteredUsers.map((user) => {
              const isAdmin = user.roles?.includes('ROLE_ADMIN');
              return (
                <tr key={user.userId} className="hover:bg-zinc-900/10 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-red-600 font-bold overflow-hidden shadow-inner">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-zinc-200 group-hover:text-white transition-all tracking-tight">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-zinc-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wide ${isAdmin ? 'border-red-600/20 text-red-500 bg-red-600/5' : 'border-zinc-800 text-zinc-500 bg-zinc-900/20'}`}>
                      {isAdmin ? 'Quản trị' : 'Người dùng'}
                    </span>
                    {isAdmin && (
                      <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5 font-medium">
                        <Building2 size={12} className="text-zinc-600"/> 
                        {cinemas.find(c => String(c.id) === String(user.managedCinemaItemId))?.address || "Chưa gán địa chỉ"}
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => openRoleModal(user)} 
                      className="bg-zinc-950 px-4 py-2 rounded-lg text-[10px] font-bold uppercase border border-zinc-900 text-zinc-400 hover:border-red-600/30 hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] tracking-wide"
                    >
                      Sửa quyền
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <UserRoleModal 
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  selectedUser={selectedUser}
  selectedRole={selectedRole}
  setSelectedRole={setSelectedRole}
  selectedCinema={selectedCinema}
  setSelectedCinema={setSelectedCinema}
  cinemaSearch={cinemaSearch}
  setCinemaSearch={setCinemaSearch}
  filteredCinemas={filteredCinemas}
  onConfirm={handleUpdateRole}
  // Thay vì truyền 'users' gốc, hãy truyền danh sách đã lọc bỏ SUPER_ADMIN
  allUsers={users.filter(u => !u.roles?.includes('ROLE_SUPER_ADMIN') && !u.roles?.includes('SUPER_ADMIN'))} 
/>
      
      <style jsx>{`
        .custom-scrollbar-mini::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 10px; }
      `}</style>
    </div>
  );
}