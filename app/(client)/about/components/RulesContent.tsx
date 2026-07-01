import React from 'react';
import { Ban, CameraOff, Cigarette, Baby } from 'lucide-react';

export default function ContentQuyDinh() {
  return (
    <div className="space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Quy định tại rạp</h2>
      <p>Để đảm bảo trải nghiệm điện ảnh tốt nhất cho tất cả khách hàng, A&K Cinema trân trọng yêu cầu Quý khách tuân thủ các quy định sau:</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="flex gap-4 p-5 bg-zinc-900/40 rounded-2xl border border-white/5">
          <Ban className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="text-white font-bold mb-1">Không mang đồ ăn thức uống bên ngoài</h4>
            <p className="text-xs">Quý khách vui lòng không mang đồ ăn, thức uống mua từ bên ngoài vào rạp. A&K Cinema có quầy bắp nước phục vụ đa dạng nhu cầu.</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 bg-zinc-900/40 rounded-2xl border border-white/5">
          <CameraOff className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="text-white font-bold mb-1">Không quay phim, chụp ảnh</h4>
            <p className="text-xs">Nghiêm cấm mọi hành vi quay phim, chụp ảnh, ghi âm trái phép trong phòng chiếu. Vi phạm sẽ bị mời ra khỏi rạp và xử lý theo luật sở hữu trí tuệ.</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 bg-zinc-900/40 rounded-2xl border border-white/5">
          <Cigarette className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="text-white font-bold mb-1">Không hút thuốc</h4>
            <p className="text-xs">Không hút thuốc lá (bao gồm cả thuốc lá điện tử, vape) trong toàn bộ khuôn viên rạp chiếu phim.</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 bg-zinc-900/40 rounded-2xl border border-white/5">
          <Baby className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="text-white font-bold mb-1">Quy định độ tuổi (Phân loại phim)</h4>
            <p className="text-xs">Khán giả cần mang theo CCCD/Thẻ HS-SV để chứng minh độ tuổi khi xem các phim có dán nhãn T13, T16, T18. Rạp có quyền từ chối nếu không đủ tuổi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}