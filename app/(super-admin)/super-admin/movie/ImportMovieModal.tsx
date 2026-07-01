"use client";

import React, { useState, useRef } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiSuperAdminRequest } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface ImportMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

interface MovieRowProgress {
  index: number;
  title: string;
  genre: string;
  duration: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  errorLog?: string;
}

export default function ImportMovieModal({ isOpen, onClose, onRefreshData }: ImportMovieModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<MovieRowProgress[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, error: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processExcelFile = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Vui lòng chọn đúng định dạng tệp Excel (.xlsx, .xls)!");
      return;
    }

    setFile(selectedFile);
    setSummary({ total: 0, success: 0, error: 0 });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataArray = evt.target?.result;
        const wb = XLSX.read(dataArray, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (data.length <= 1) {
          toast.error("File Excel trống hoặc thiếu dòng dữ liệu!");
          setFile(null);
          return;
        }

        const parsedRows: MovieRowProgress[] = data.slice(1).map((row, i): MovieRowProgress => {
          return {
            index: i + 2, // Dòng 2 trở đi trong Excel (Dòng 1 là tiêu đề cột)
            title: row[0]?.toString().trim() || "",
            genre: row[8]?.toString().trim() || "Chưa phân loại",
            duration: row[2]?.toString().trim() || "0",
            status: 'pending'
          };
        }).filter(row => row.title !== "");

        if (parsedRows.length === 0) {
          toast.error("Không tìm thấy dữ liệu hợp lệ trong file!");
          setFile(null);
          return;
        }

        setRows(parsedRows);
        setSummary({ total: parsedRows.length, success: 0, error: 0 });
      } catch (err) {
        toast.error("Cấu trúc tệp không tương thích hệ thống!");
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processExcelFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const startImportProcess = async () => {
    if (!file || rows.length === 0) return;
    setIsImporting(true);

    // Hiệu ứng quét giả lập các hàng
    for (let i = 0; i < rows.length; i++) {
      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiSuperAdminRequest("/api/v1/movies/import", {
        method: "POST",
        body: formData,
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        const backendErrors: string[] = responseData.errors || [];
        
        // Chuyển mảng lỗi của backend thành cấu trúc Object Tra cứu nhanh nhanh theo số dòng
        const errorMap: { [key: number]: string } = {};
        backendErrors.forEach((errStr) => {
          const match = errStr.match(/Dòng\s+(\d+):/i) || errStr.match(/Line\s+(\d+):/i);
          if (match && match[1]) {
            const lineNum = parseInt(match[1], 10);
            errorMap[lineNum] = errStr.replace(/^Dòng\s+\d+:\s*/i, "").replace(/^Line\s+\d+:\s*/i, "");
          }
        });

        // Áp trạng thái thật từ database trả ra lên từng dòng UI
        setRows(prev => prev.map(r => {
          if (errorMap[r.index]) {
            return { ...r, status: 'error', errorLog: errorMap[r.index] };
          }
          return { ...r, status: 'success' };
        }));

        const totalError = Object.keys(errorMap).length;
        const totalSuccess = rows.length - totalError;

        setSummary({
          total: rows.length,
          success: totalSuccess,
          error: totalError
        });

        if (totalError === 0) {
          toast.success(`Thêm hoàn thành! Toàn bộ ${totalSuccess} phim đã vào hệ thống.`);
          setTimeout(() => {
            handleClose();
            onRefreshData();
          }, 1500);
        } else if (totalSuccess > 0) {
          toast.success(`Thành công nạp ${totalSuccess} phim. Bỏ qua ${totalError} dòng lỗi.`);
          onRefreshData();
        } else {
          toast.error("Không có bộ phim nào được thêm. Toàn bộ file bị lỗi dữ liệu!");
        }

      } else {
        const rawMessage = responseData.message || "Lỗi cấu trúc hoặc kết nối từ chối.";
        setRows(prev => prev.map(r => ({ ...r, status: 'error', errorLog: rawMessage })));
        setSummary({ total: rows.length, success: 0, error: rows.length });
        toast.error("Tệp tin bị máy chủ từ chối tiếp nhận!");
      }
    } catch (err) {
      setRows(prev => prev.map(r => ({ ...r, status: 'error', errorLog: "Ngắt kết nối máy chủ dữ liệu hoặc mất tín hiệu mạng." })));
      setSummary({ total: rows.length, success: 0, error: rows.length });
      toast.error("Lỗi đường truyền hệ thống!");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    setFile(null);
    setRows([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-zinc-900 w-full max-w-xl max-h-[85vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden text-zinc-400 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#09090b]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Import Kho Phim Hệ Thống</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Xử lý thêm tập tin Excel dữ liệu lõi</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isImporting} className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all disabled:opacity-30">
            <X size={18} />
          </button>
        </div>

        {/* Thân máy */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center flex flex-col items-center justify-center gap-3 group transition-all duration-300 cursor-pointer ${
                isDragActive 
                  ? 'border-red-600 bg-red-950/10' 
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/80'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:border-red-900/40 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.1)] transition-all duration-300 ${isDragActive ? 'text-red-500 border-red-500 scale-110' : ''}`}>
                <Upload size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">Kéo thả file Excel của bạn vào đây</p>
                <p className="text-[10px] text-zinc-500 mt-1">hoặc click để duyệt tìm kiếm tập tin nguồn (.xlsx, .xls)</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 px-4 bg-zinc-950 border border-zinc-900 rounded-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-950/30 border border-emerald-900/30 text-emerald-500 rounded-lg shrink-0">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{file.name}</p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setRows([]); }} 
                disabled={isImporting}
                className="text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-wider px-2.5 py-1.5 rounded-md hover:bg-zinc-900/60 transition-colors disabled:opacity-20"
              >
                Thay đổi
              </button>
            </div>
          )}

          {file && (
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 border border-zinc-900/80 p-3.5 rounded-xl text-center">
              <div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Hàng đợi</p>
                <p className="text-lg font-black text-white mt-0.5">{summary.total}</p>
              </div>
              <div>
                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Thành công</p>
                <p className="text-lg font-black text-emerald-500 mt-0.5">{summary.success}</p>
              </div>
              <div>
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">Thất bại</p>
                <p className="text-lg font-black text-red-500 mt-0.5">{summary.error}</p>
              </div>
            </div>
          )}

          {file && (
            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950 divide-y divide-zinc-900/40 max-h-[32vh] overflow-y-auto custom-scrollbar shadow-inner">
              {rows.map((row) => (
                <div 
                  key={row.index} 
                  className={`p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] transition-all duration-200 ${
                    row.status === 'processing' ? 'bg-zinc-900/40 border-l-2 border-red-500' : 
                    row.status === 'success' ? 'bg-emerald-950/5 border-l-2 border-emerald-500/60' : 
                    row.status === 'error' ? 'bg-red-950/5 border-l-2 border-red-600/60' : 'bg-transparent pl-4'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-14 text-[9px] font-mono font-bold shrink-0 ${row.status === 'processing' ? 'text-red-500' : 'text-zinc-600'}`}>
                        ROW {row.index.toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1 grid grid-cols-12 gap-2 items-center">
                        <p className="col-span-6 font-black text-zinc-200 truncate uppercase tracking-wide" title={row.title}>{row.title}</p>
                        <p className="col-span-4 font-bold text-zinc-500 truncate text-[10px]" title={row.genre}>{row.genre}</p>
                        <p className="col-span-2 text-zinc-600 font-mono text-[10px] text-right font-bold">{row.duration}M</p>
                      </div>
                    </div>

                    {row.status === 'error' && (
                      <div className="mt-2 ml-14 p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-[10px] flex gap-2 items-start leading-relaxed animate-in slide-in-from-top-1 duration-200">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5 text-red-500" />
                        <div><span className="font-black uppercase tracking-wider text-[9px] mr-1">Lỗi logic:</span> {row.errorLog}</div>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-end sm:justify-center w-5">
                    {row.status === 'pending' && <div className="w-3 h-3 rounded-full border border-zinc-800" />}
                    {row.status === 'processing' && <Loader2 className="animate-spin text-red-500" size={13} />}
                    {row.status === 'success' && <CheckCircle2 size={14} className="text-[#09090b] fill-emerald-500" />}
                    {row.status === 'error' && <XCircle size={14} className="text-[#09090b] fill-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 bg-[#09090b] flex justify-end gap-2">
          <button onClick={handleClose} disabled={isImporting} className="px-4 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-all disabled:opacity-20">
            Hủy bỏ
          </button>
          {file && rows.length > 0 && (
            <button onClick={startImportProcess} disabled={isImporting} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-red-900/10 flex items-center gap-1.5 disabled:opacity-40 active:scale-98">
              {isImporting ? (
                <>
                  <Loader2 className="animate-spin" size={12} /> Đang thêm...
                </>
              ) : (
                "Bắt đầu xử lý"
              )}
            </button>
          )}
        </div>

        {/* Style Thanh Cuộn Nhẹ Nhàng */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2e2e33; }
        `}</style>
      </div>
    </div>
  );
}