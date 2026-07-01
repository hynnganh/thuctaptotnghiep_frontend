"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Loader2, ChevronDown, 
  CreditCard, ArrowLeft, Ticket, Coffee, Receipt, ChevronUp
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import Link from 'next/link';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/api/v1/orders/my-history');
        if (res.ok) {
          const result = await res.json();
          setOrders((result.data || []).sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    })();
  }, []);

  const fmtVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 no-scrollbar">
      <nav className="max-w-4xl mx-auto flex justify-between mb-10 opacity-70">
        <Link href="/profile" className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter hover:text-red-600">
          <ArrowLeft size={14} /> Quay lại hồ sơ
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống giao dịch A&K</span>
      </nav>

      <main className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter">Lịch sử <span className="text-zinc-800">Giao dịch</span></h1>
          <div className="h-1 w-12 bg-red-600 mt-2 rounded-full" />
        </header>

        <div className="space-y-4">
          {orders.length > 0 ? orders.map((o) => (
            <div key={o.id} className={`bg-[#0a0a0a] border rounded-[2rem] transition-all overflow-hidden ${activeId === o.id ? 'border-red-600/50 shadow-2xl' : 'border-white/5'}`}>
              <div onClick={() => setActiveId(activeId === o.id ? null : o.id)} className="p-6 cursor-pointer flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${activeId === o.id ? 'bg-red-600' : 'bg-zinc-900 text-zinc-500'}`}><Receipt size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Mã: AK-{o.id}</p>
                    <p className="text-sm font-bold text-zinc-300">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-[9px] font-black text-zinc-600 uppercase">Tổng tiền</p>
                  <p className="font-black italic text-red-600">{fmtVND(o.totalAmount)}</p>
                </div>
                <div className="flex items-center gap-4">
  <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
    o.status === 'PAID' 
      ? 'text-green-500 border-green-500/20 bg-green-500/5' 
      : o.status === 'CANCELLED' 
        ? 'text-red-500 border-red-500/20 bg-red-500/5' 
        : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
  }`}>
    {o.status === 'PAID' ? 'HOÀN TẤT' : o.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'CHỜ XỬ LÝ'}
  </span>
  {activeId === o.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
</div>
              </div>

              {activeId === o.id && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                  <div className="bg-black/50 rounded-3xl p-5 border border-white/5 space-y-3">
                    {o.orderDetails.map((i: any) => (
                      <div key={i.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          {i.itemType === 'TICKET' ? <Ticket size={14} className="text-red-500"/> : <Coffee size={14} className="text-amber-500"/>}
<span className="font-bold text-zinc-400">
  {i.itemName || (i.itemType === 'TICKET' ? 'Vé phim' : 'Combo')} x{i.quantity}
</span>                        </div>
                        <span className="font-black text-zinc-200">{fmtVND(i.price)}</span>
                      </div>
                    ))}
                    <div className="pt-3 flex justify-between items-center opacity-50">
                      <div className="flex gap-2 items-center text-[10px] uppercase font-bold"><CreditCard size={12}/> {o.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest text-xs">Chưa có giao dịch nào</div>
          )}
        </div>
      </main>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}