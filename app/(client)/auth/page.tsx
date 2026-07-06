"use client";
import { useState } from "react";
import { 
  User, Phone, Mail, Lock, Calendar, Eye, EyeOff, 
  ShieldCheck, Loader2, ArrowRight, Fingerprint, ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import Cookies from "js-cookie";
import { apiRequest } from "../../lib/api";

// ==========================================
// COMPONENT: QUÊN MẬT KHẨU (GỒM 2 BƯỚC)
// ==========================================
const ForgotPasswordView = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<"REQUEST_OTP" | "RESET_PASSWORD">("REQUEST_OTP");
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resData = await response.json();
      
      if (!response.ok) throw new Error(resData.message || "Gửi mã OTP thất bại!");

      toast.success(resData.message || "Mã xác thực đã được gửi tới email của bạn!");
      setStep("RESET_PASSWORD");
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });
      const resData = await response.json();
      
      if (!response.ok) throw new Error(resData.message || "Xác thực thất bại!");

      toast.success(resData.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập.");
      onBack();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra trong quá trình xác thực!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-all tracking-[0.2em] group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Quay lại
      </button>

      {step === "REQUEST_OTP" ? (
        <div className="space-y-6 text-left animate-in fade-in duration-500">
          <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter mb-2 italic">Quên mật khẩu?</h2>
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={18} />
              <input required type="email" placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-100/70 focus:bg-white border border-zinc-200 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 shadow-inner" />
            </div>
            <button disabled={loading} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/20">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Gửi mã xác nhận"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6 text-left animate-in fade-in duration-500">
          <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter mb-2 italic">Xác thực</h2>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={18} />
              <input required placeholder="Nhập mã OTP (VD: 123456)" value={otp} onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-zinc-100/70 focus:bg-white border border-zinc-200 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 shadow-inner" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={18} />
              <input required minLength={6} type={showPass ? "text" : "password"} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-100/70 focus:bg-white border border-zinc-200 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 shadow-inner" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button disabled={loading} className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-md shadow-zinc-900/10">
              {loading ? <Loader2 className="animate-spin text-white" size={20} /> : "Xác nhận đổi mật khẩu"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENT CHÍNH: TRANG AUTHENTICATION
// ==========================================
export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "MALE",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleManualSwitchView = (newView: 'login' | 'register' | 'forgot') => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      mobileNumber: "",
      dateOfBirth: "",
      gender: "MALE",
    });
    setFormErrors({});
    setView(newView);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (view === 'register') {
      if (formData.password.length < 6) {
        setFormErrors(prev => ({ ...prev, password: "Mật khẩu phải có ít nhất 6 ký tự!" }));
        return;
      }
      if (!/^0[0-9]{9}$/.test(formData.mobileNumber)) {
        setFormErrors(prev => ({ ...prev, mobileNumber: "Số điện thoại không hợp lệ!" }));
        return;
      }
    }

    setLoading(true);
    const endpoint = view === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
    
    try {
      const payload = view === 'login' 
        ? { email: formData.email, password: formData.password } 
        : formData;

      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        if (view === 'login') {
          const rawUser = resData.data;
          const token = rawUser?.token;
          const roles: string[] = rawUser?.roles || [];

          if (!token) {
            toast.error("Không nhận được token từ hệ thống!");
            return;
          }

          const primaryRole = roles[0] || "USER";
          let targetTokenKey = "token_user";
          let redirectUrl = "/";

          if (primaryRole.includes("SUPER_ADMIN")) {
            targetTokenKey = "token_super_admin";
            redirectUrl = "/super-admin";
          } else if (primaryRole.includes("ADMIN")) {
            targetTokenKey = "token_admin";
            redirectUrl = "/admin";
          }

          localStorage.setItem(targetTokenKey, token);
          Cookies.set(targetTokenKey, token, { expires: 7, path: '/' });

          const infoKey = primaryRole.includes("SUPER_ADMIN") ? "user_info_super_admin" : 
                          primaryRole.includes("ADMIN") ? "user_info_admin" : "user_info_user";

          localStorage.setItem(infoKey, JSON.stringify({
            firstName: rawUser?.firstName,
            lastName: rawUser?.lastName,
            avatar: rawUser?.avatar,
            roles: roles
          }));
          
          localStorage.setItem("roles", JSON.stringify(roles));
          window.dispatchEvent(new Event("auth-changed"));

          toast.success(`Chào mừng ${rawUser?.lastName || ''} ${rawUser?.firstName || ''} đã trở lại!`);
          setTimeout(() => { window.location.href = redirectUrl; }, 800);
        } else {
          toast.success(resData.message || "Đăng ký thành công! Mời bạn đăng nhập.");
          
          setFormData({
            email: formData.email,
            password: formData.password,
            firstName: "",
            lastName: "",
            mobileNumber: "",
            dateOfBirth: "",
            gender: "MALE",
          });
          setFormErrors({});
          setView('login');
        }
      } else {
        const errorsToMap = resData.errors || resData.data; 

        if (errorsToMap && typeof errorsToMap === "object" && !Array.isArray(errorsToMap)) {
          setFormErrors(errorsToMap);
          const firstKey = Object.keys(errorsToMap)[0];
          toast.error(errorsToMap[firstKey]);
          return;
        }

        if (resData.message) {
          const errorMsg = resData.message.toLowerCase();
          if (errorMsg.includes("số điện thoại")) {
            setFormErrors(prev => ({ ...prev, mobileNumber: resData.message }));
            toast.error(resData.message);
          } else if (errorMsg.includes("email")) {
            setFormErrors(prev => ({ ...prev, email: resData.message }));
            toast.error(resData.message);
          } else {
            toast.error(resData.message);
          }
          return;
        }
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi kết nối:", error);
      toast.error(error.message || "Không thể kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-800 font-sans overflow-x-hidden selection:bg-red-100 selection:text-red-900">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* BÊN TRÁI: FORM */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-20 py-12 overflow-y-auto relative z-10 bg-white">
        <div className="max-w-[480px] mx-auto w-full">
          {view !== 'forgot' ? (
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
              {/* Tabs */}
              <div className="flex gap-8 mb-10 border-b border-zinc-200 relative">
                <button type="button" onClick={() => handleManualSwitchView('login')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'login' ? "text-red-600" : "text-zinc-400 hover:text-zinc-600"}`}>Đăng Nhập</button>
                <button type="button" onClick={() => handleManualSwitchView('register')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'register' ? "text-red-600" : "text-zinc-400 hover:text-zinc-600"}`}>Đăng Ký</button>
                <div className={`absolute bottom-0 h-0.5 bg-red-600 transition-all duration-500 shadow-[0_2px_8px_rgba(220,38,38,0.2)] ${view === 'login' ? "left-0 w-[90px]" : "left-[120px] w-[80px]"}`} />
              </div>

              <form className="space-y-5" onSubmit={handleAuth}>
                {view === 'register' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Họ</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" placeholder="Nguyễn" 
                          className={`w-full bg-zinc-100/70 focus:bg-white border p-3.5 pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-900 transition-all shadow-inner ${formErrors.lastName ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                      </div>
                      {formErrors.lastName && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.lastName}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Tên</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" placeholder="An" 
                          className={`w-full bg-zinc-100/70 focus:bg-white border p-3.5 pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-900 transition-all shadow-inner ${formErrors.firstName ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                      </div>
                      {formErrors.firstName && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.firstName}</p>}
                    </div>

                    <div className="col-span-2 space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Số điện thoại</label>
                      <div className="relative group">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                        <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required type="tel" placeholder="09xxxxxxxx" 
                          className={`w-full bg-zinc-100/70 focus:bg-white border p-3.5 pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-900 transition-all shadow-inner ${formErrors.mobileNumber ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                      </div>
                      {formErrors.mobileNumber && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.mobileNumber}</p>}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Email</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                    <input name="email" value={formData.email} onChange={handleChange} required type="text" placeholder="example@gmail.com" 
                      className={`w-full bg-zinc-100/70 focus:bg-white border p-3.5 pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-900 transition-all shadow-inner ${formErrors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                  </div>
                  {formErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.email}</p>}
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Mật khẩu</label>
                    {view === 'login' && <button type="button" onClick={() => handleManualSwitchView('forgot')} className="text-[10px] text-red-600 font-black uppercase hover:text-red-500 transition-colors">Quên mật khẩu?</button>}
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                    <input name="password" value={formData.password} onChange={handleChange} required type={showPass ? "text" : "password"} placeholder="••••••••" 
                      className={`w-full bg-zinc-100/70 focus:bg-white border p-3.5 pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-900 transition-all shadow-inner ${formErrors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.password}</p>}
                </div>

                {view === 'register' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Ngày sinh</label>
                      <div className="relative group">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                        <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required type="date" 
                          className={`w-full bg-zinc-100/70 focus:bg-white border p-[13px] pl-12 rounded-2xl outline-none focus:ring-4 text-sm text-zinc-500 transition-all shadow-inner ${formErrors.dateOfBirth ? 'border-red-500 focus:ring-red-500/10' : 'border-zinc-200 focus:border-red-500 focus:ring-red-500/10'}`} />
                      </div>
                      {formErrors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.dateOfBirth}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Giới tính</label>
                      <div className="relative flex bg-zinc-100 border border-zinc-200 rounded-2xl p-1 h-[52px]">
                        <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-xl transition-all shadow-md shadow-red-600/20 ${formData.gender === "FEMALE" ? "left-[calc(50%+2px)]" : "left-1"}`} />
                        <button type="button" onClick={() => setFormData({...formData, gender: "MALE"})} className={`relative z-10 flex-1 text-[11px] font-black uppercase transition-colors ${formData.gender === "MALE" ? "text-white" : "text-zinc-400 hover:text-zinc-600"}`}>Nam</button>
                        <button type="button" onClick={() => setFormData({...formData, gender: "FEMALE"})} className={`relative z-10 flex-1 text-[11px] font-black uppercase transition-colors ${formData.gender === "FEMALE" ? "text-white" : "text-zinc-400 hover:text-zinc-600"}`}>Nữ</button>
                      </div>
                      {formErrors.gender && <p className="text-red-500 text-[10px] mt-1 ml-2 font-medium italic animate-in fade-in">{formErrors.gender}</p>}
                    </div>
                  </div>
                )}

                <button disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/20 transition-all uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-2 mt-6 group disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (view === 'login' ? "Vào Rạp Ngay" : "Tạo Tài Khoản")}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          ) : (
            <ForgotPasswordView onBack={() => handleManualSwitchView('login')} />
          )}
        </div>
      </div>

      {/* BÊN PHẢI: DECOR */}
      <div className="hidden lg:flex w-[45%] bg-zinc-50 relative items-center justify-center p-20 border-l border-zinc-200/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-[360px] h-[520px] rounded-[3.5rem] overflow-hidden border border-zinc-200/80 bg-white p-2 group shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="w-full h-full rounded-[2.8rem] overflow-hidden relative">
            <img src={view === 'login' ? "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000" : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" alt="Cinema" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-16 left-0 right-0 px-10 text-center">
              <Fingerprint className="text-red-500 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" size={32} />
              <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">HNA Experience</h2>
              <p className="text-zinc-300 text-[10px] mt-2 leading-relaxed">Đắm chìm trong không gian điện ảnh đỉnh cao cùng hệ thống rạp hiện đại nhất.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0); opacity: 0.4; cursor: pointer; transition: opacity 0.3s; }
        input[type="date"]:focus::-webkit-calendar-picker-indicator { opacity: 0.8; }
      `}</style>
    </div>
  );
}