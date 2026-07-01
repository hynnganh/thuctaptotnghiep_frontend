"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Pencil, Upload } from "lucide-react";
import { BASE_URL } from "@/app/lib/api";
import toast from "react-hot-toast";

interface FormProps {
  dangSua: boolean;
  idHienTai: number | null;
  duLieu: any;
  setDuLieu: (data: any) => void;
  onLuu: (formData: FormData) => Promise<any>;
  onDong: () => void;
}

export default function FormBanner({
  dangSua,
  idHienTai,
  duLieu,
  setDuLieu,
  onLuu,
  onDong,
}: FormProps) {

  const [anhXemTruoc, setAnhXemTruoc] = useState<string | null>(null);
  const [fileAnh, setFileAnh] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (duLieu.imageUrl) {
      if (
        duLieu.imageUrl.startsWith("http") ||
        duLieu.imageUrl.startsWith("blob:")
      ) {
        setAnhXemTruoc(duLieu.imageUrl);
      } else {
        const cleanPath = duLieu.imageUrl.startsWith("/")
          ? duLieu.imageUrl.slice(1)
          : duLieu.imageUrl;

        setAnhXemTruoc(`${BASE_URL}/uploads/banners/${cleanPath}`);
      }
    } else {
      setAnhXemTruoc(null);
    }

    setFileAnh(null);
    setFieldErrors({});
  }, [duLieu.imageUrl]);

  const thayDoiFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    setFileAnh(file);
    setAnhXemTruoc(URL.createObjectURL(file));
  };

const guiForm = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors: any = {};

  if (!duLieu.title?.trim() || duLieu.title.trim().length < 5) {
    errors.title = "Tiêu đề phải >= 5 ký tự";
  }

  if (!duLieu.linkUrl?.trim()) {
    errors.linkUrl = "Link không được để trống";
  }

  if (!dangSua && !fileAnh) {
    toast.error("Vui lòng tải ảnh banner!");
    return;
  }

  if (Object.keys(errors).length > 0) {
    toast.error(Object.values(errors)[0] as string);
    return;
  }

  const data = new FormData();

  data.append(
    "banner",
    new Blob(
      [
        JSON.stringify({
          title: duLieu.title.trim(),
          linkUrl: duLieu.linkUrl.trim(),
          status: duLieu.status || "ACTIVE",
        }),
      ],
      { type: "application/json" }
    )
  );

  if (fileAnh) {
    data.append("file", fileAnh);
  }

  onLuu(data);
};
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button type="button" onClick={onDong} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <form onSubmit={guiForm} className="p-8 space-y-6" noValidate>
          <header className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-black uppercase italic text-red-600 flex items-center gap-2">
              {dangSua ? <Pencil size={14} /> : <Plus size={14} />}
              {dangSua ? `Cập nhật Banner #${idHienTai}` : "Tạo Banner Chiến Dịch Mới"}
            </h2>
          </header>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex justify-between">
                Hình ảnh banner (1920x800)
              </label>
              <div className="relative group aspect-video rounded-2xl border-2 border-dashed border-white/5 bg-zinc-900 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-red-600/40">
                {anhXemTruoc ? (
                  <>
                    <img src={anhXemTruoc} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 text-zinc-700">
                    <Upload className="mx-auto" size={24} />
                    <p className="text-[9px] font-bold uppercase">Click hoặc kéo thả ảnh vào đây</p>
                    <p className="text-[8px] italic">JPG, PNG hoặc WEBP (Max 2MB)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={thayDoiFile} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <input 
                  type="text"
                  value={duLieu.title || ""} 
                  onChange={e => setDuLieu({...duLieu, title: e.target.value})} 
                  placeholder="Tiêu đề banner..." 
                  className={`w-full bg-black border ${fieldErrors.title ? 'border-red-600/70' : 'border-white/5'} rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-red-600/50 transition-all`}
                />
                {fieldErrors.title && <p className="text-[10px] text-red-500 mt-1 pl-1">{fieldErrors.title}</p>}
              </div>

              <div>
                <input 
                  type="text"
                  value={duLieu.linkUrl || ""} 
                  onChange={e => setDuLieu({...duLieu, linkUrl: e.target.value})} 
                  placeholder="Đường dẫn điều hướng (URL)..." 
                  className={`w-full bg-black border ${fieldErrors.linkUrl ? 'border-red-600/70' : 'border-white/5'} rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-red-600/50 transition-all`}
                />
                {fieldErrors.linkUrl && <p className="text-[10px] text-red-500 mt-1 pl-1">{fieldErrors.linkUrl}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={duLieu.status || "ACTIVE"} 
                  onChange={e => setDuLieu({...duLieu, status: e.target.value})} 
                  className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold uppercase text-white outline-none focus:border-red-600/50 cursor-pointer"
                >
                  <option value="ACTIVE">Trạng thái: Hoạt động</option>
                  <option value="INACTIVE">Trạng thái: Không hoạt động</option>
                  <option value="PENDING">Trạng thái: Chờ duyệt (Lỗi BE)</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black py-4 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Save size={14} className="inline mr-2" /> 
            {dangSua ? "Lưu thay đổi" : "Kích hoạt Banner"}
          </button>
        </form>
      </div>
    </div>
  );
}