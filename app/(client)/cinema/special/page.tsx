"use client";
import React from 'react';
import { ArrowUpRight, Sparkles, Compass, Leaf, Clapperboard } from 'lucide-react';

const STORIES = {
  highlight: {
    title: "Kiến trúc tương lai của điện ảnh xanh",
    desc: "HNA chính thức vận hành tổ hợp phòng chiếu sử dụng 100% năng lượng tái tạo và vật liệu tái chế, thiết lập tiêu chuẩn mới cho mô hình rạp phim thân thiện với môi trường tại Việt Nam.",
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000",
    tag: "Tiêu Điểm"
  },
  subStories: [
    {
      title: "Không gian sảnh kết nối văn hóa",
      desc: "Không chỉ là nơi chờ xem phim, sảnh rạp mới được thiết kế như một triển lãm nghệ thuật thu nhỏ, nơi trưng bày các tác phẩm hội họa và điện ảnh kinh điển.",
      img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000",
      tag: "Không Gian"
    },
    {
      title: "Ẩm thực điện ảnh hữu cơ",
      desc: "Ra mắt menu bắp nước hoàn toàn mới sử dụng nguyên liệu hữu cơ bản địa, đóng gói trong bao bì tự phân hủy sinh học.",
      img: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=1000",
      tag: "Dịch Vụ"
    }
  ],
  values: [
    {
      icon: <Compass className="text-emerald-600" size={18} />,
      title: "Định hướng trải nghiệm",
      desc: "Cá nhân hóa tối đa hành trình từ lúc đặt vé đến khi rời phòng chiếu."
    },
    {
      icon: <Leaf className="text-emerald-600" size={18} />,
      title: "Cam kết bền vững",
      desc: "Giảm thiểu 80% rác thải nhựa dùng một lần tại tất cả các cụm rạp."
    },
    {
      icon: <Clapperboard className="text-emerald-600" size={18} />,
      title: "Tôn vinh nghệ thuật",
      desc: "Dành riêng các suất chiếu đặc biệt để hỗ trợ phim độc lập Việt Nam."
    }
  ]
};

export default function CultureCinemasPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 pt-20 pb-16 px-6 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* TIÊU ĐỀ CHÍNH - PHONG CÁCH TẠP CHÍ */}
        <header className="border-b border-slate-200 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <Sparkles className="text-emerald-600" size={10} />
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Tạp Chí Điện Ảnh HNA</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-[1000] tracking-tight text-slate-900 leading-tight">
              HƠN CẢ MỘT BỘ PHIM, <br />
              ĐÓ LÀ <span className="text-emerald-600 italic font-serif">Hành Trình Văn Hóa</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-medium leading-relaxed md:text-right">
            Khám phá những bước chuyển mình mạnh mẽ trong kiến trúc, công nghệ xanh và tư duy điện ảnh bền vững tại hệ thống rạp HNA.
          </p>
        </header>

        {/* BỐ CỤC ĐA CỘT BẤT ĐỐI XỨNG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (CHIẾM 7 CỘT): BÀI VIẾT TIÊU ĐIỂM LỚN */}
          <section className="lg:col-span-7 space-y-6">
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                <img 
                  src={STORIES.highlight.img} 
                  alt={STORIES.highlight.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider rounded-md">
                  {STORIES.highlight.tag}
                </span>
              </div>
              <div className="pt-4 px-2 space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2">
                  {STORIES.highlight.title}
                  <ArrowUpRight size={18} className="inline opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  {STORIES.highlight.desc}
                </p>
              </div>
            </div>

            {/* BA GIÁ TRỊ CỐT LÕI HÀNG NGANG */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {STORIES.values.map((val, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-1.5">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    {val.icon}
                  </div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-tight">{val.title}</h4>
                  <p className="text-slate-400 text-[10px] font-medium leading-normal">{val.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CỘT PHẢI (CHIẾM 5 CỘT): DANH SÁCH BÀI VIẾT PHỤ THEO CHIỀU DỌC */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Khám phá thêm</h3>
            
            {STORIES.subStories.map((story, i) => (
              <div 
                key={i} 
                className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                <div className="sm:w-28 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={story.img} 
                    alt={story.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center space-y-1 min-w-0">
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">
                    {story.tag}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] font-medium leading-snug line-clamp-2">
                    {story.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* KHỐI HÀNH ĐỘNG (CTA) LỒNG VÀO BÊN PHẢI */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 mt-auto space-y-4 shadow-md">
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-tight text-emerald-400">Trở thành một phần của cộng đồng xanh</h4>
                <p className="text-slate-400 text-[11px] font-medium leading-normal">
                  Nhận ngay thẻ thành viên Eco-Pass tích điểm gấp đôi khi mang theo bình nước cá nhân đến cụm rạp.
                </p>
              </div>
              <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-98 shadow-sm">
                Đăng ký thành viên ngay
              </button>
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}