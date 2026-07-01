import React from 'react';

export default function ContentGioiThieu() {
  return (
    <div className="space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Giới thiệu A&K Cinema</h2>
      <p>
        <strong className="text-red-500">A&K Cinema</strong> là một trong những cụm rạp chiếu phim phát triển nhanh nhất tại Việt Nam, mang đến tiêu chuẩn giải trí quốc tế cho khán giả Việt. Khởi nguồn từ niềm đam mê điện ảnh bất tận, A&K Cinema không ngừng đổi mới và nâng cấp để trở thành điểm đến văn hóa, giải trí hàng đầu.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5">
          <h3 className="text-white font-black uppercase tracking-widest mb-3">Tầm nhìn</h3>
          <p className="text-sm">Trở thành chuỗi rạp chiếu phim được yêu thích nhất, tiên phong mang các công nghệ trình chiếu điện ảnh tiên tiến nhất thế giới (IMAX, 4DX, ScreenX) đến gần hơn với người dân Việt Nam.</p>
        </div>
        <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5">
          <h3 className="text-white font-black uppercase tracking-widest mb-3">Sứ mệnh</h3>
          <p className="text-sm">Vượt qua giới hạn của một rạp chiếu phim thông thường, A&K Cinema cam kết tạo ra một không gian văn hóa đa dạng, nơi mọi người không chỉ xem phim mà còn trải nghiệm, chia sẻ và kết nối.</p>
        </div>
      </div>
      <p>
        Đến với A&K Cinema, khán giả sẽ được tận hưởng không gian thiết kế sang trọng, ghế ngồi cao cấp, cùng hệ thống âm thanh vòm Dolby Atmos và màn hình chiếu siêu nét. Hãy cùng chúng tôi chia sẻ những khoảnh khắc điện ảnh tuyệt vời nhất!
      </p>
    </div>
  );
}