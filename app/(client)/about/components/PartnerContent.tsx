import React from 'react';
import { Phone, FileText, Briefcase } from 'lucide-react';

export default function ContentDoiTac() {
  return (
    <div className="space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-8">Kính gửi Quý Đối Tác,</h2>
      <p>Đầu tiên, chúng tôi đánh giá cao vai trò của Quý Đối Tác trong việc cung cấp các sản phẩm và dịch vụ chất lượng. Vai trò của Quý Đối Tác rất quan trọng đối với sự thành công của chúng tôi.</p>
      <p>Để giữ vững vị thế là doanh nghiệp hàng đầu, <strong className="text-red-500">A&K Cinema</strong> cam kết tuân thủ mọi luật lệ và Giá trị cốt lõi. Chúng tôi kỳ vọng Quý Đối Tác sẵn sàng duy trì các giá trị về đạo đức và tính chính trực.</p>
      
      <div className="p-6 rounded-2xl bg-red-600/5 border border-red-500/20 my-6">
        <p className="text-white font-bold mb-4 italic">Bộ Quy tắc Ứng xử dành cho Nhà Cung Cấp yêu cầu:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Sự liêm chính trong kinh doanh</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Quyền lợi người lao động</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Sức khỏe và an toàn</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Quản lý môi trường</li>
        </ul>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
        <p className="font-bold text-white uppercase tracking-widest text-xs">Thông tin liên hệ:</p>
        <ul className="space-y-3 text-zinc-300">
          <li className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg text-red-500"><Phone size={16} /></div>
            <span><strong>Hotline:</strong> 1900 8888</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg text-red-500"><FileText size={16} /></div>
            <span><strong>Email:</strong> doitac@akcinema.vn</span>
          </li>
        </ul>
      </div>
    </div>
  );
}