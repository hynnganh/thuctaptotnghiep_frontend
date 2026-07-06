"use client";

import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Phone, Mail, Loader2, Calendar, 
  UserCircle, Save, Edit3, CheckCircle2, ArrowLeft, AlertCircle, X
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
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="w-9 h-9 border-2 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 antialiased selection:bg-red-50 pb-12">
      
      {/* Navigation Bar */}
      <nav className="px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 bg-white/80">
        <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-all">
          <ArrowLeft size={15} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Trang chủ</span>
        </Link>
        
        <div>
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 bg-red-600 text-white px-4 h-9 rounded-xl font-bold uppercase text-[10px] tracking-wider hover:bg-red-500 transition-all shadow-sm">
               <Edit3 size={13}/> Chỉnh sửa
             </button>
           ) : (
             <div className="flex items-center gap-4">
               <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors">Hủy</button>
               <button onClick={handleUpdate} disabled={updating} className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 h-9 rounded-xl font-bold uppercase text-[10px] tracking-wider hover:bg-zinc-800 transition-all shadow-sm disabled:opacity-50">
                 {updating ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>} Lưu lại
               </button>
             </div>
           )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex flex-col gap-6">
          
          {/* User Identity Header */}
          <header className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-red-600">Tài khoản thành viên</div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
                {userData?.firstName || "---"} <span className="text-red-600">{userData?.lastName || ""}</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">ID:</span>
              <span className="text-[11px] font-mono font-bold text-zinc-700">#{userData?.userId || '000000'}</span>
            </div>
          </header>

          {/* Form Container */}
          <section className="bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-3 border-b border-zinc-100">
               <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Thông tin cá nhân
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                  <div className="opacity-60"><ViewField label="Email" value={userData?.email} icon={Mail} isLocked /></div>
                  <EditField label="Số điện thoại" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} icon={Phone} />
                  <EditField label="Ngày sinh" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} icon={Calendar} type="date" />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-0.5">Giới tính</label>
                    <div className="relative">
                      <UserCircle size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
                      <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 p-3 pl-11 rounded-xl text-[12px] font-bold text-zinc-800 outline-none focus:border-red-500 focus:bg-white transition-all appearance-none cursor-pointer">
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

      {/* ================= TOAST NOTIFICATION - MINIMAL LIGHT ================= */}
      {toast && (
        <div className="fixed top-6 right-6 z-[1000] max-w-sm w-full animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`flex items-start gap-3 p-4 rounded-xl border bg-white shadow-lg ${
            toast.type === 'success' ? 'border-emerald-200' : 'border-red-200'
          }`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-zinc-900">
                {toast.type === 'success' ? 'Thành công' : 'Thông báo hệ thống'}
              </h4>
              <p className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed break-words">
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
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-0.5">{label}</label>
      <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl shadow-inner">
        <Icon size={16} className="text-zinc-400 shrink-0" />
        <span className={`text-[12px] font-bold truncate ${isLocked ? 'text-zinc-400 italic' : 'text-zinc-700'}`}>
          {value || "---"}
        </span>
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, icon: Icon, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-0.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
        <input 
          type={type} name={name} value={value} onChange={onChange} 
          className="w-full bg-zinc-50 border border-zinc-200 p-3 pl-11 rounded-xl text-[12px] font-bold text-zinc-800 outline-none focus:border-red-500 focus:bg-white transition-all [color-scheme:light]" 
        />
      </div>
    </div>
  );
}