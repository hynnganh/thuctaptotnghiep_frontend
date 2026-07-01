"use client";

import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Phone, Mail, Loader2, Calendar, 
  UserCircle, Save, Edit3, CheckCircle2, ArrowLeft, AlertCircle 
} from 'lucide-react';
import { apiRequest } from '../../lib/api'; 
import Link from 'next/link';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState<any>({}); 
  const [updating, setUpdating] = useState(false); 
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Thay đổi vị trí Toast & Tự động tắt sau 3.5 giây
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfile = async () => {
    try {
      const res = await apiRequest('/api/v1/users/me');
      if (res.ok) {
        const result = await res.json();
        const rawData = result.data; 
        setUserData(rawData);
        
        // Nhận trực tiếp mọi giá trị kể cả rỗng/null, không ép khuôn mặc định để BE xử lý lý thuyết validation
        setFormData({
          firstName: rawData.firstName,
          lastName: rawData.lastName,
          mobileNumber: rawData.mobileNumber,
          gender: rawData.gender,
          dateOfBirth: rawData.dateOfBirth
        });
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await apiRequest('/api/v1/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData) 
      });

      const result = await res.json();

      if (res.ok) {
        showToast("Cập nhật thành công!", "success");
        setIsEditing(false);
        fetchProfile();
      } else { 
        // Đọc thông báo lỗi trực tiếp từ Backend gửi về thay vì hardcode chữ "Thất bại"
        showToast(result?.message || "Cập nhật thất bại từ hệ thống", "error"); 
      }
    } catch (err) { 
      showToast("Lỗi kết nối mạng", "error"); 
    } finally { 
      setUpdating(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={28} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-12 overflow-x-hidden relative">
      {/* Nền đỏ Neon mờ phía sau */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[110px] -z-10" />

      {/* Navigation Bar */}
      <nav className="px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-black/60">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Trang chủ</span>
        </Link>
        
        <div>
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]">
               <Edit3 size={14}/> Chỉnh sửa
             </button>
           ) : (
             <div className="flex items-center gap-4">
               <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-200">Hủy</button>
               <button onClick={handleUpdate} disabled={updating} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-zinc-200 transition-all shadow-lg">
                 {updating ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Lưu lại
               </button>
             </div>
           )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-10 px-6">
        <div className="flex flex-col gap-8">
          
          {/* User Identity Header */}
          <header className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none text-white">
                {userData?.firstName || "---"} <span className="text-red-600">{userData?.lastName || ""}</span>
              </h1>
              <div className="h-[2px] w-12 bg-red-600 rounded-full mt-1" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-[9px] font-black uppercase tracking-widest">Mã người dùng:</span>
              <span className="text-[9px] font-mono font-bold text-zinc-300 italic">#{userData?.userId || '000000'}</span>
            </div>
          </header>

          {/* Form Container */}
          <section className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="mb-10">
               <h2 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-4">
                Thông tin cá nhân
                <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/40 to-transparent" />
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {!isEditing ? (
                <>
                  <ViewField label="Họ & Tên đệm" value={userData?.firstName} icon={UserIcon} />
                  <ViewField label="Tên người dùng" value={userData?.lastName} icon={UserIcon} />
                  <ViewField label="Email đăng ký" value={userData?.email} icon={Mail} isLocked />
                  <ViewField label="Số điện thoại" value={userData?.mobileNumber} icon={Phone} />
                  <ViewField label="Ngày sinh" value={userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : "---"} icon={Calendar} />
                  <ViewField label="Giới tính" value={userData?.gender === 'MALE' ? 'Nam' : userData?.gender === 'FEMALE' ? 'Nữ' : userData?.gender === 'OTHER' ? 'Khác' : '---'} icon={UserCircle} />
                </>
              ) : (
                <>
                  <EditField label="Họ & Tên đệm" name="firstName" value={formData.firstName || ''} onChange={handleChange} icon={UserIcon} />
                  <EditField label="Tên" name="lastName" value={formData.lastName || ''} onChange={handleChange} icon={UserIcon} />
                  <div className="opacity-50"><ViewField label="Email" value={userData?.email} icon={Mail} isLocked /></div>
                  <EditField label="Số điện thoại" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} icon={Phone} />
                  <EditField label="Ngày sinh" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} icon={Calendar} type="date" />
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-red-600 ml-1">Giới tính</label>
                    <div className="relative">
                      <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 z-10" />
                      <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full bg-black border border-white/20 p-3.5 pl-12 rounded-2xl text-[13px] font-bold text-white outline-none focus:border-red-600 transition-all appearance-none cursor-pointer">
                        <option value="">-- Chọn giới tính --</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ================= TOAST NOTIFICATION TRÊN GÓC PHẢI (TOP-RIGHT) ================= */}
      {toast && (
        <div className="fixed top-6 right-6 z-[1000] max-w-sm w-full animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border-b-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#0d0d11]/95 border-x border-t border-white/5 ${
            toast.type === 'success' 
              ? 'border-b-green-500 text-green-400' 
              : 'border-b-red-500 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">
                {toast.type === 'success' ? 'Hệ thống thành công' : 'Lỗi phản hồi hệ thống'}
              </p>
              <p className="text-[12px] font-bold text-zinc-200 leading-tight truncate">
                {toast.msg}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewField({ label, value, icon: Icon, isLocked = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
      <div className="flex items-center gap-4 p-4 bg-black border border-white/10 rounded-2xl shadow-inner transition-all hover:border-red-600/30">
        <Icon size={18} className="text-red-600 shrink-0" />
        <span className={`text-[13px] font-bold truncate ${isLocked ? 'text-zinc-500 italic' : 'text-zinc-100'}`}>
          {value || "---"}
        </span>
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, icon: Icon, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-red-600 ml-1">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 z-10" />
        <input 
          type={type} name={name} value={value} onChange={onChange} 
          className="w-full bg-black border border-white/20 p-3.5 pl-12 rounded-2xl text-[13px] font-bold text-white outline-none focus:border-red-600 transition-all [color-scheme:dark]" 
        />
      </div>
    </div>
  );
}