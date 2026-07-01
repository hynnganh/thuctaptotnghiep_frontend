"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiAdminRequest } from '@/app/lib/api';
import toast from 'react-hot-toast'; 

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

interface RowProgress {
  index: number;
  movieName: string;
  roomName: string;
  startTime: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  errorLog?: string;
}

export default function ImportExcelModal({ isOpen, onClose, onRefreshData }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RowProgress[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, error: 0 });

  if (!isOpen) return null;

  // 1. Đọc file Excel hiển thị lên màn hình xem trước (Preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setSummary({ total: 0, success: 0, error: 0 });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', raw: false });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
      if (data.length === 0) return;

      const parsedRows: RowProgress[] = data.slice(1).map((row, i): RowProgress => {
        return {
          index: i + 2,
          movieName: row[0]?.toString() || "N/A",
          roomName: row[1]?.toString() || "N/A",
          startTime: row[2]?.toString() || "N/A",
          status: 'pending'
        };
      }).filter(row => row.movieName !== "N/A" || row.roomName !== "N/A");

      setRows(parsedRows);
      setSummary({ total: parsedRows.length, success: 0, error: 0 });
    };
    reader.readAsBinaryString(selectedFile);
  };

  // 2. Tiến trình gửi FILE GỐC lên Backend với hiệu ứng quét mượt và tự động điều hướng đóng
  const startImportProcess = async () => {
    if (!file || rows.length === 0) return;
    setIsImporting(true);

    // HIỆU ỨNG MƯỢT: Chạy quét loading lướt tuần tự từ dòng đầu tiên đến dòng cuối cùng (Full Main)
    for (let i = 0; i < rows.length; i++) {
      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));
      await new Promise(resolve => setTimeout(resolve, 40)); 
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiAdminRequest("/api/v1/showtimes/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // TRƯỜNG HỢP 100% THÀNH CÔNG: Chuyển toàn bộ danh sách sang màu xanh lá 
        setRows(prev => prev.map(r => ({ ...r, status: 'success' })));
        setSummary({ total: rows.length, success: rows.length, error: 0 });

        // 🎉 TÁI SỬ DỤNG TOAST: Bắn tín hiệu thông báo lên container ở màn hình nền chính
        toast.success(`Thêm thành công ${rows.length} suất chiếu!`, {
          duration: 3000,
          style: {
            background: '#09090b',
            color: '#fff',
            border: '1px solid #27272a',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        });

        setTimeout(() => {
          setIsImporting(false);
          setFile(null);
          setRows([]);
          onRefreshData(); // Load lại lịch trục thời gian chính
          onClose(); // Đóng Modal ẩn đi
        }, 1200);
        return;

      } else {
        // TRƯỜNG HỢP PHÁT HIỆN DÒNG BỊ LỖI TRONG TỆP BIỂU MẪU
        const errorJson = await res.json().catch(() => ({}));
        const rawMessage = errorJson.message || "Lỗi xử lý tệp tin từ hệ thống";

        let errorLineNumber = -1;
        const lineMatch = rawMessage.match(/dòng\s+(\d+)/i) || rawMessage.match(/line\s+(\d+)/i);
        if (lineMatch && lineMatch[1]) {
          errorLineNumber = parseInt(lineMatch[1], 10);
        }

        setRows(prev => prev.map(r => {
          if (errorLineNumber === -1) {
            return { ...r, status: 'error', errorLog: rawMessage };
          }
          if (r.index === errorLineNumber) {
            return { ...r, status: 'error', errorLog: rawMessage };
          }
          if (r.index < errorLineNumber) {
            return { ...r, status: 'success' };
          }
          return { ...r, status: 'pending' };
        }));

        setSummary(prev => {
          const successCount = errorLineNumber > 2 ? errorLineNumber - 2 : 0;
          return {
            total: rows.length,
            success: successCount,
            error: rows.length - successCount
          };
        });

        // Bắn toast cảnh báo có dòng trục trặc
        toast.error("Phát hiện lỗi cấu trúc dữ liệu tệp Excel!", {
          style: {
            background: '#09090b',
            color: '#f87171',
            border: '1px solid #27272a',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        });
      }
    } catch (err) {
      setRows(prev => prev.map(r => ({ ...r, status: 'error', errorLog: "Mất kết nối với hệ thống máy chủ" })));
      setSummary({ total: rows.length, success: 0, error: rows.length });
      toast.error("Hệ thống mất kết nối mạng đột ngột!");
    }

    setIsImporting(false);
    onRefreshData();
  };

  const handleClose = () => {
    if (isImporting) return;
    setFile(null);
    setRows([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-900 w-full max-w-3xl h-[85vh] rounded-2xl flex flex-col relative shadow-2xl overflow-hidden text-zinc-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-red-600 rounded-full" />
            <div>
              <h3 className="text-base font-[1000] text-white uppercase tracking-tight">Thêm lịch chiếu Excel</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Kiểm tra & Phân tích cấu trúc file gốc</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isImporting} className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30">
            <X size={20} />
          </button>
        </div>

        {/* Nội dung vùng chọn file / Tiến trình chạy danh sách */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {!file && (
            <div className="border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 group hover:border-red-600/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:scale-105 transition-all duration-300">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Chọn tệp dữ liệu biểu mẫu Excel của bạn</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Hệ thống phân tích tự động các file định dạng .xlsx, .xls</p>
              </div>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" id="modalFilePicker" />
              <button onClick={() => document.getElementById("modalFilePicker")?.click()} className="mt-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-black text-xs text-white uppercase rounded-xl transition-all duration-200 active:scale-95">
                Duyệt tập tin
              </button>
            </div>
          )}

          {file && (
            <div className="grid grid-cols-3 gap-3 bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Tổng số lượng</p>
                <p className="text-xl font-[1000] text-white mt-0.5">{summary.total} <span className="text-xs font-normal text-zinc-500">hàng</span></p>
              </div>
              <div>
                <p className="text-[10px] text-green-600 font-black uppercase tracking-wider">Hợp lệ</p>
                <p className="text-xl font-[1000] text-green-500 mt-0.5">{summary.success}</p>
              </div>
              <div>
                <p className="text-[10px] text-red-600 font-black uppercase tracking-wider">Phát hiện lỗi</p>
                <p className="text-xl font-[1000] text-red-500 mt-0.5">{summary.error}</p>
              </div>
            </div>
          )}

          {file && (
            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950 divide-y divide-zinc-900/60 max-h-[42vh] overflow-y-auto">
              {rows.map((row) => (
                <div 
                  key={row.index} 
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-500 ease-in-out ${
                    row.status === 'processing' ? 'bg-zinc-900/80 border-l-2 border-red-500 pl-3' : 
                    row.status === 'success' ? 'bg-green-950/10 border-l-2 border-green-500 pl-3' : 
                    row.status === 'error' ? 'bg-red-950/10 border-l-2 border-red-600 pl-3' : 'bg-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
                      <span className={`w-12 text-[10px] font-black uppercase shrink-0 transition-colors duration-300 ${
                        row.status === 'processing' ? 'text-red-400' : 'text-zinc-600'
                      }`}>
                        Dòng {row.index}
                      </span>
                      <div className="min-w-0 flex-1 grid grid-cols-3 gap-2">
                        <p className="font-black text-zinc-200 truncate uppercase tracking-tight" title={row.movieName}>{row.movieName}</p>
                        <p className="font-bold text-zinc-400 truncate" title={row.roomName}>{row.roomName}</p>
                        <p className="text-zinc-500 font-mono font-medium">{row.startTime}</p>
                      </div>
                    </div>

                    {row.status === 'error' && (
                      <div className="mt-2 ml-16 p-2.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 font-medium text-[11px] leading-relaxed animate-in slide-in-from-top-1 duration-300">
                        ⚠️ <span className="font-black uppercase tracking-wide mr-1 text-[10px]">Lỗi hệ thống:</span> {row.errorLog}
                      </div>
                    )}
                  </div>

                  <div className="pl-4 shrink-0 flex items-center justify-end sm:justify-center w-full sm:w-12">
                    {row.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-zinc-800" />}
                    {row.status === 'processing' && <Loader2 className="animate-spin text-red-500" size={18} />}
                    {row.status === 'success' && <CheckCircle2 size={18} className="text-zinc-950 fill-green-500 scale-110 transition-all duration-300" />}
                    {row.status === 'error' && <XCircle size={18} className="text-zinc-950 fill-red-500 scale-110 transition-all duration-300" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thanh điều khiển bottom */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-2">
          <button onClick={handleClose} disabled={isImporting} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-bold text-xs uppercase text-zinc-400 transition-colors disabled:opacity-30">
            Hủy bỏ
          </button>
          {file && rows.length > 0 && (
            <button onClick={startImportProcess} disabled={isImporting} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-50 active:scale-98">
              {isImporting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Đang thêm...
                </>
              ) : (
                "Bắt đầu import"
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}