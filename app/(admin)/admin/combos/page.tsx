"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag, Loader2, Search, CheckCircle2, XCircle, Package } from "lucide-react";
import { apiRequest } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

interface ComboAdmin {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean; 
  stock: number;
}

export default function AdminComboPage() {
  const [combos, setCombos] = useState<ComboAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_admin") || "";
    }
    return "";
  };

  const loadCombos = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = getAdminToken();

      const res = await apiRequest("/api/v1/cinema-combos", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await res.json();
      
      if (res.ok) {
        const data = Array.isArray(result) ? result : (result.data || []);
        const formattedData = data.map((c: any) => ({
          ...c,
          stock: c.stock !== undefined ? c.stock : 0
        }));
        setCombos(formattedData);
      } else {
        toast.error(result.message || "Không thể tải danh mục combo");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleToggle = async (comboId: number) => {
    if (togglingId) return;
    setTogglingId(comboId);

    try {
      const token = getAdminToken();

      const res = await apiRequest(`/api/v1/cinema-combos/${comboId}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setCombos((prev) =>
          prev.map((c) =>
            c.id === comboId ? { ...c, available: !c.available } : c
          )
        );
        toast.success("Đã cập nhật trạng thái combo thành công");
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } catch (e) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateStock = async (comboId: number) => {
    const numericStock = parseInt(editValue, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      toast.error("Số lượng tồn kho phải là số lớn hơn hoặc bằng 0");
      setEditingId(null);
      return;
    }

    const currentCombo = combos.find(c => c.id === comboId);
    if (currentCombo && currentCombo.stock === numericStock) {
      setEditingId(null);
      return;
    }

    setUpdatingStockId(comboId);
    try {
      const token = getAdminToken();

      const res = await apiRequest(
        `/api/v1/cinema-combos/${comboId}/stock`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            stock: numericStock
          })
        }
      );

      if (res.ok) {
        setCombos((prev) =>
          prev.map((c) =>
            c.id === comboId ? { ...c, stock: numericStock } : c
          )
        );
        toast.success("Cập nhật số lượng tồn kho thành công");
      } else {
        const errResult = await res.json().catch(() => ({}));
        toast.error(errResult.message || "Không thể cập nhật số lượng tồn kho");
      }
    } catch (e) {
      toast.error("Lỗi kết nối mạng khi cập nhật kho");
    } finally {
      setUpdatingStockId(null);
      setEditingId(null);
    }
  };

const startEditing = (combo: ComboAdmin) => {

  if (updatingStockId !== null) return;

  setEditingId(combo.id);

  setEditValue(
    combo.stock !== null &&
    combo.stock !== undefined
      ? combo.stock.toString()
      : "0"
  );
};

  const filteredCombos = combos.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-6 md:p-8 font-sans antialiased select-none tracking-tight">      
      
      {/* Container max-w rộng hơn chút để chứa layout lớn */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header to và thoáng hơn */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">Thực đơn chi nhánh</h1>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Chi nhánh quản lý: <span className="text-red-500">Hệ thống A&K Cinema</span>
            </p>
          </div>

          {/* Ô input tìm kiếm to hơn */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="Tìm tên combo bắp nước..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-red-600 outline-none transition-all placeholder:text-zinc-600 text-white shadow-inner"
            />
          </div>
        </div>

        {/* LOADING STATE HOÀNH TRÁNG */}
        {loading ? (
          <div className="py-44 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <span className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">Đang đồng bộ dữ liệu thực đơn...</span>
          </div>
        ) : (
          /* LƯỚI GRID ĐƯỢC PHÓNG TO: 2 cột (mobile) -> 3 cột (tablet) -> 4 cột (màn hình lớn) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCombos.map((combo) => (
              <div 
                key={combo.id} 
                className={`group bg-[#0c0c0e] border border-zinc-900 transition-all duration-300 rounded-xl overflow-hidden flex flex-col shadow-md ${
                  combo.available 
                    ? "hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50" 
                    : "bg-zinc-950/40 opacity-50 grayscale"
                }`}
              >
                {/* Phần hình ảnh tỷ lệ 4:3 phóng to */}
                <div className="aspect-[4/3] w-full bg-zinc-950 border-b border-zinc-900 relative overflow-hidden">
                  <img 
                    src={combo.imageUrl || "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400"} 
                    alt={combo.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Badge trạng thái to góc ảnh */}
                  <div className="absolute top-3 right-3 scale-110">
                    {combo.available ? (
                      <div className="bg-green-600 text-white p-1 rounded-full shadow-md">
                        <CheckCircle2 size={12} />
                      </div>
                    ) : (
                      <div className="bg-zinc-950 text-zinc-500 p-1 rounded-full border border-zinc-800">
                        <XCircle size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Nội dung card được nới rộng text */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-wide line-clamp-1 transition-colors ${combo.available ? 'text-zinc-100 group-hover:text-white' : 'text-zinc-600'}`}>
                      {combo.name}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-zinc-500 line-clamp-2 leading-relaxed min-h-[32px]">
                      {combo.description}
                    </p>
                  </div>

                  {/* Giá tiền to rõ ràng hơn */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className={`text-xs md:text-sm font-extrabold tracking-wide ${combo.available ? 'text-white' : 'text-zinc-600'}`}>
                      {Number(combo.price).toLocaleString()}đ
                    </span>
                  </div>

                  {/* FOOTER CARD: ĐIỀU CHỈNH KHO & TOGGLE TO HƠN */}
                  <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between gap-2">
                    
                    {/* Bấm vào để sửa tồn kho */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Package size={13} className={combo.available ? "text-zinc-400" : "text-zinc-700"} />
                      {editingId === combo.id ? (
                        <input
                          ref={inputRef}
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleUpdateStock(combo.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateStock(combo.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-16 bg-black text-white text-xs font-black px-2 py-1 rounded border border-red-600 outline-none text-center shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                        />
                      ) : (
                        <span 
                          onClick={() => startEditing(combo)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-all cursor-pointer truncate flex items-center gap-1 ${
                            updatingStockId === combo.id
                              ? "bg-zinc-900 border-zinc-800 text-zinc-600"
                              : combo.available
                              ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-red-600/60 hover:text-white hover:bg-zinc-950"
                              : "bg-zinc-950 border-zinc-900 text-zinc-600"
                          }`}
                          title="Click để sửa số lượng kho nhanh"
                        >
                          {updatingStockId === combo.id ? (
                            <Loader2 size={10} className="animate-spin text-zinc-500" />
                          ) : (
                            <>Kho: <span className="font-black text-red-500">{combo.stock}</span></>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Nút gạt Toggle to hơn, dễ tương tác */}
                    <button
                      onClick={() => handleToggle(combo.id)}
                      disabled={togglingId === combo.id}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                        combo.available ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                          combo.available ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                      {togglingId === combo.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                          <Loader2 size={10} className="animate-spin text-white" />
                        </div>
                      )}
                    </button>
                    
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trạng thái danh sách rỗng */}
        {!loading && filteredCombos.length === 0 && (
          <div className="py-28 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
            <ShoppingBag className="mx-auto text-zinc-800 mb-3" size={32} />
            <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Không tìm thấy combo bắp nước phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
