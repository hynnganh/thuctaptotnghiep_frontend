import React from 'react';

export default function FAQContent() {
  return (
    <div className="space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Câu hỏi thường gặp</h2>
      <div className="space-y-4">
        <details className="group bg-zinc-900/40 p-4 rounded-xl cursor-pointer">
          <summary className="text-white font-bold outline-none">Làm sao để tôi lấy hóa đơn GTGT (VAT)?</summary>
          <p className="mt-3 text-sm">Quý khách vui lòng liên hệ Quầy vé (Box Office) ngay trong ngày xem phim và cung cấp Mã đặt vé để nhân viên xuất hóa đơn điện tử.</p>
        </details>
        <details className="group bg-zinc-900/40 p-4 rounded-xl cursor-pointer">
          <summary className="text-white font-bold outline-none">Tôi lỡ mua nhầm suất chiếu, tôi có thể đổi được không?</summary>
          <p className="mt-3 text-sm">Rất tiếc, theo quy định, A&K Cinema không hỗ trợ hủy hay đổi vé sau khi giao dịch đã hoàn tất.</p>
        </details>
      </div>
    </div>
  );
}