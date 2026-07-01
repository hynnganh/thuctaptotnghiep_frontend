import React from 'react';

export default function ContentGiaoDich() {
  return (
    <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Điều khoản giao dịch</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">1. Quy định về mua vé trực tuyến</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Khách hàng có thể đặt vé trực tuyến thông qua Website hoặc Ứng dụng di động của A&K Cinema.</li>
            <li>Sau khi thanh toán thành công, hệ thống sẽ gửi Mã Đặt Vé (Booking Code) qua Email hoặc tin báo trên ứng dụng. Quý khách dùng mã này để lấy vé tại rạp.</li>
            <li>A&K Cinema không chịu trách nhiệm nếu khách hàng làm lộ Mã Đặt Vé cho người khác.</li>
          </ul>
        </div>
        
        <div className="p-5 bg-red-600/10 border border-red-500/20 rounded-2xl">
          <h3 className="text-lg font-bold text-red-500 mb-2">2. Chính sách Hủy / Đổi / Trả vé</h3>
          <p className="font-medium text-white mb-2">Theo quy định chung của hệ thống rạp:</p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300">
            <li><strong>KHÔNG</strong> chấp nhận yêu cầu hủy, đổi hoặc trả vé đã thanh toán thành công trong mọi trường hợp.</li>
            <li>Giao dịch trực tuyến đã mua sẽ không được hoàn tiền. Vui lòng kiểm tra kỹ thông tin Phim, Rạp, Ngày giờ và Chỗ ngồi trước khi nhấn "Thanh toán".</li>
            <li>Trường hợp lỗi hệ thống (đã trừ tiền nhưng không nhận được mã vé), quý khách vui lòng liên hệ Hotline trong vòng 30 phút để được hỗ trợ.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}