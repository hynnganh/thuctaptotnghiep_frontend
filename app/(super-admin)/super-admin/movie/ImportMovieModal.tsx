"use client";

import React, { useState, useRef } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Upload, FileSpreadsheet, AlertTriangle, HelpCircle } from 'lucide-react';
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
            index: i + 2,
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
    setRows(prev => prev.map(r => ({ ...r, status: 'processing' })));
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiSuperAdminRequest("/api/v1/movies/import", {
        method: "POST",
        body: formData,
      });
      const responseData = await res.json().catch(() => ({}));
      
      if (responseData && Array.isArray(responseData.rowDetails)) {
        const backendDetails: any[] = responseData.rowDetails;
        const isSuccess = responseData.isSuccess;
        let errorCount = 0;
        let successCount = 0;
        
        const updatedRows = rows.map(r => {
          const matchedBackendRow = backendDetails.find(b => b.rowIndex === r.index);
          
          if (matchedBackendRow) {
            if (matchedBackendRow.status === "FAILED") {
              errorCount++;
              return { ...r, status: 'error' as const, errorLog: matchedBackendRow.errorMessage || "Lỗi logic dữ liệu." };
            } else if (matchedBackendRow.status === "SUCCESS") {
              if (isSuccess) {
                successCount++;
                return { ...r, status: 'success' as const };
              } else {
                return { ...r, status: 'pending' as const, errorLog: matchedBackendRow.errorMessage || "Bị hủy do hàng khác trong file lỗi." };
              }
            } else if (matchedBackendRow.status === "PENDING") {
              return { ...r, status: 'pending' as const, errorLog: "Chưa kiểm tra do tiến trình trước bị ngắt." };
            }
          }
          return r;
        });

        setRows(updatedRows);

        setSummary({
          total: rows.length,
          success: isSuccess ? successCount : 0, 
          error: errorCount
        });

        if (isSuccess) {
          toast.success(`Import thành công! Toàn bộ ${successCount} phim đã được thêm.`);
          setTimeout(() => {
            handleClose();
            onRefreshData();
          }, 1500);
        } else {
          toast.error("Import thất bại! Hệ thống đã hủy lưu toàn bộ danh sách.");
        }

      } else {
        const rawMessage = responseData.message || "Lỗi cấu trúc hoặc máy chủ từ chối.";
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
      <div className="bg-[#09090b] border border-zinc-900 w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden text-zinc-400 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#09090b]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Thêm Phim Mới Từ Excel</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Hỗ trợ kiểm tra toàn vẹn dữ liệu nguyên khối (Atomic)</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isImporting} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all disabled:opacity-30">
            <X size={16} />
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
              className={`border-2 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 group transition-all duration-300 cursor-pointer ${
                isDragActive 
                  ? 'border-red-600 bg-red-950/10 shadow-[0_0_15px_rgba(220,38,38,0.05)]' 
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/80'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:border-red-900/40 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.1)] transition-all duration-300 ${isDragActive ? 'text-red-500 border-red-500 scale-110' : ''}`}>
                <Upload size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">Kéo thả file dữ liệu Excel vào đây</p>
                <p className="text-[10px] text-zinc-500">Hệ thống xử lý định dạng tiêu chuẩn định dạng (.xlsx, .xls)</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 px-4 bg-zinc-950 border border-zinc-900 rounded-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/30 text-emerald-500 rounded-xl shrink-0">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{file.name}</p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-0.5">dung lượng: {(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setRows([]); }} 
                disabled={isImporting}
                className="text-[10px] font-black text-zinc-400 hover:text-red-500 uppercase tracking-wider px-3 py-2 border border-zinc-900 hover:border-zinc-800 bg-zinc-900/20 rounded-xl transition-all disabled:opacity-20"
              >
                Thay đổi file
              </button>
            </div>
          )}

          {/* Khối thống kê số lượng */}
          {file && (
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-center shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Tổng số phim</p>
                <p className="text-xl font-black text-white">{summary.total} <span className="text-[11px] font-bold text-zinc-600">vòng</span></p>
              </div>
              <div className="space-y-0.5 border-x border-zinc-900">
                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Hợp lệ lưu</p>
                <p className="text-xl font-black text-emerald-500">{summary.success}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Phát hiện lỗi</p>
                <p className="text-xl font-black text-red-500">{summary.error}</p>
              </div>
            </div>
          )}

          {/* Bảng kết quả quét dữ liệu */}
          {file && (
            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950 divide-y divide-zinc-900/40 max-h-[35vh] overflow-y-auto custom-scrollbar shadow-inner">
              {rows.map((row) => {
                const isAbortedRow = summary.error > 0 && row.status === 'pending';
                return (
                  <div 
                    key={row.index} 
                    className={`p-3.5 px-4 flex flex-col justify-between gap-2.5 text-[11px] transition-all duration-200 ${
                      row.status === 'processing' ? 'bg-zinc-900/40 border-l-2 border-red-500 pl-3.5' : 
                      row.status === 'success' ? 'bg-emerald-950/5 border-l-2 border-emerald-500/60' : 
                      row.status === 'error' ? 'bg-red-950/5 border-l-2 border-red-600/60' : 
                      isAbortedRow ? 'bg-zinc-950 opacity-60 border-l-2 border-zinc-800' : 'bg-transparent pl-4'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="min-w-0 flex-1 flex items-center gap-4">
                        <span className={`w-14 text-[10px] font-mono font-bold shrink-0 ${row.status === 'processing' ? 'text-red-500' : 'text-zinc-600'}`}>
                          DÒNG {row.index}
                        </span>
                        
                        <div className="min-w-0 flex-1 grid grid-cols-12 gap-3 items-center">
                          <p className="col-span-6 font-bold text-zinc-200 truncate uppercase tracking-wide" title={row.title}>
                            {row.title}
                          </p>
                          <p className="col-span-4 font-medium text-zinc-500 truncate text-[10px]" title={row.genre}>
                            {row.genre}
                          </p>
                          <p className="col-span-2 text-zinc-400 font-mono text-[10px] text-right font-semibold">
                            {row.duration} phút
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-center w-5">
                        {row.status === 'pending' && !isAbortedRow && <div className="w-3 h-3 rounded-full border-2 border-zinc-800" />}
                        {row.status === 'pending' && isAbortedRow && <HelpCircle size={14} className="text-zinc-600" />}
                        {row.status === 'processing' && <Loader2 className="animate-spin text-red-500" size={13} />}
                        {row.status === 'success' && <CheckCircle2 size={15} className="text-[#09090b] fill-emerald-500" />}
                        {row.status === 'error' && <XCircle size={15} className="text-[#09090b] fill-red-500" />}
                      </div>
                    </div>

                    {/* Hiển thị lỗi đỏ khi dòng bị lỗi logic dữ liệu */}
                    {row.status === 'error' && row.errorLog && (
                      <div className="ml-18 p-3 bg-red-950/20 border border-red-950/50 rounded-xl text-red-400 text-[10px] flex gap-2 items-start leading-relaxed animate-in slide-in-from-top-1 duration-200">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <span className="font-black uppercase tracking-wider text-[9px] bg-red-950 border border-red-900/50 px-1.5 py-0.5 rounded mr-1.5">Lỗi kiểm tra</span> 
                          {row.errorLog}
                        </div>
                      </div>
                    )}

                    {/* Hiển thị cảnh báo xám khi dòng đúng nhưng bị liên đới hủy */}
                    {row.status === 'pending' && isAbortedRow && row.errorLog && (
                      <div className="ml-18 p-2.5 bg-zinc-900/30 border border-zinc-900 rounded-xl text-zinc-500 text-[10px] flex gap-2 items-center">
                        <AlertTriangle size={12} className="shrink-0 text-zinc-600" />
                        <div className="italic">{row.errorLog}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 bg-[#09090b] flex justify-end gap-2">
          <button 
            onClick={handleClose} 
            disabled={isImporting} 
            className="px-4 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-all disabled:opacity-20"
          >
            Hủy bỏ
          </button>
          {file && rows.length > 0 && (
            <button 
              onClick={startImportProcess} 
              disabled={isImporting} 
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-red-900/10 flex items-center gap-1.5 disabled:opacity-40 active:scale-98"
            >
              {isImporting ? (
                <>
                  <Loader2 className="animate-spin" size={12} /> Đang đồng bộ...
                </>
              ) : (
                "Bắt đầu xử lý"
              )}
            </button>
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2e2e33; }
          .ml-18 { margin-left: 4.5rem; }
        `}</style>
      </div>
    </div>
  );
}