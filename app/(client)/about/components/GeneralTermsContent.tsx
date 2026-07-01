import React from 'react';

export default function ContentDieuKhoanChung() {
  return (
    <div className="space-y-4 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Điều khoản chung</h2>
      <p>Chào mừng Quý khách đến với website/ứng dụng của A&K Cinema. Khi sử dụng dịch vụ của chúng tôi, Quý khách mặc nhiên đồng ý với các điều khoản dưới đây:</p>
      <ul className="list-decimal pl-5 space-y-3">
        <li><strong>Bản quyền:</strong> Toàn bộ hình ảnh, thiết kế, nội dung trên website đều thuộc bản quyền của A&K Cinema. Không được phép sao chép khi chưa có sự đồng ý.</li>
        <li><strong>Tài khoản:</strong> Khách hàng có trách nhiệm bảo mật tài khoản và mật khẩu của mình. A&K Cinema không chịu trách nhiệm cho những thiệt hại do việc lộ tài khoản gây ra.</li>
        <li><strong>Hành vi cấm:</strong> Nghiêm cấm sử dụng website cho các mục đích gian lận, spam, can thiệp vào hệ thống dữ liệu của A&K Cinema.</li>
        <li><strong>Cập nhật điều khoản:</strong> A&K Cinema có quyền thay đổi các điều khoản này bất kỳ lúc nào mà không cần báo trước. Vui lòng theo dõi thường xuyên.</li>
      </ul>
    </div>
  );
}