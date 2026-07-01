import React from 'react';

export default function ContentThanhToan() {
  return (
    <div className="space-y-4 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Chính sách thanh toán</h2>
      <p>Hệ thống đặt vé trực tuyến của A&K Cinema cung cấp nhiều phương thức thanh toán an toàn, tiện lợi cho khách hàng:</p>
      
      <div className="space-y-4 mt-6">
        <div className="p-4 border border-white/10 rounded-xl hover:bg-zinc-900/50 transition-colors">
          <h4 className="text-white font-bold">1. Thẻ Thanh Toán Quốc Tế (Visa / Mastercard / JCB)</h4>
          <p className="text-xs mt-1">Hỗ trợ tất cả các thẻ tín dụng và ghi nợ quốc tế phát hành tại Việt Nam.</p>
        </div>
        <div className="p-4 border border-white/10 rounded-xl hover:bg-zinc-900/50 transition-colors">
          <h4 className="text-white font-bold">2. Thẻ ATM Nội Địa / Internet Banking</h4>
          <p className="text-xs mt-1">Hỗ trợ thẻ ATM của hơn 40 ngân hàng nội địa (yêu cầu thẻ đã đăng ký thanh toán trực tuyến).</p>
        </div>
        <div className="p-4 border border-white/10 rounded-xl hover:bg-zinc-900/50 transition-colors">
          <h4 className="text-white font-bold">3. Ví Điện Tử (MoMo, ZaloPay, VNPay)</h4>
          <p className="text-xs mt-1">Thanh toán nhanh chóng qua QR Code hoặc ứng dụng ví điện tử liên kết.</p>
        </div>
      </div>
      <p className="mt-6 text-xs italic opacity-70">
        *Lưu ý: Mọi thông tin thẻ thanh toán của quý khách được mã hóa và bảo mật bởi các đối tác cổng thanh toán được cấp phép (VNPay, Payoo...), A&K Cinema không trực tiếp lưu trữ thông tin thẻ của khách hàng.
      </p>
    </div>
  );
}