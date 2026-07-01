"use client";
import React, { useState } from 'react';
import { Megaphone, Percent, ChevronRight, Clock, ExternalLink, Bookmark } from 'lucide-react';

export default function NewsOffersPage() {
  const [activeTab, setActiveTab] = useState('all');

  const content = [
    {
      id: 1,
      category: 'promotion',
      title: "ƯU ĐÃI THẺ HSSV - ĐỒNG GIÁ 45K",
      desc: "Chỉ cần xuất trình thẻ HSSV/CMND dưới 22 tuổi để nhận ngay giá vé ưu đãi mọi khung giờ cho các phim 2D.",
      date: "Hiệu lực: Vô thời hạn",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000",
      tag: "Permanent Deal",
      color: "text-green-500"
    },
    {
      id: 2,
      category: 'news',
      title: "A&K CINEMA KHAI TRƯƠNG CỤM RẠP THỨ 10",
      desc: "Tọa lạc tại trung tâm Quận 1 với hệ thống phòng chiếu IMAX Laser hiện đại nhất khu vực Đông Nam Á.",
      date: "Đăng ngày: 01/03/2026",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000",
      tag: "Grand Opening",
      color: "text-blue-500"
    },
    {
      id: 3,
      category: 'promotion',
      title: "GIẢM 20% KHI THANH TOÁN QUA APPLE PAY",
      desc: "Nhập mã AKAPPLE khi thanh toán qua ví Apple Pay cho mọi giao dịch đặt vé trực tuyến và bắp nước.",
      date: "Hạn dùng: 31/05/2026",
      image: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=1000",
      tag: "Payment",
      color: "text-orange-500"
    },
    {
      id: 4,
      category: 'news',
      title: "LỘ DIỆN BOM TẤN ĐƯỢC MONG ĐỢI NHẤT HÈ 2026",
      desc: "Hãng phim công bố trailer chính thức của siêu phẩm hành động viễn tưởng mới, xác nhận lịch chiếu tại A&K.",
      date: "Đăng ngày: 28/02/2026",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000",
      tag: "Cinema News",
      color: "text-purple-500"
    },
    {
      id: 5,
      category: 'promotion',
      title: "COMBO AVATAR 3: THE SEED BEARER",
      desc: "Sở hữu ngay bình nước tạo hình nhân vật Neytiri phiên bản giới hạn khi mua kèm Combo bắp nước lớn.",
      date: "Hạn dùng: Đến khi hết quà",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000",
      tag: "Exclusive Combo",
      color: "text-cyan-400"
    },
    {
      id: 6,
      category: 'news',
      title: "TUYỂN DỤNG: ĐỒNG ĐỘI A&K CINEMA 2026",
      desc: "Chúng tôi tìm kiếm những tâm hồn yêu điện ảnh cho các vị trí: Quản lý sảnh, Nhân viên quầy vé và Kỹ thuật viên.",
      date: "Đăng ngày: 25/02/2026",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1000",
      tag: "Recruitment",
      color: "text-yellow-500"
    },
    {
      id: 7,
      category: 'promotion',
      title: "HAPPY DAY - ĐỒNG GIÁ THỨ TƯ HÀNG TUẦN",
      desc: "Trải nghiệm rạp chiếu sang trọng với giá vé chỉ từ 50.000đ vào mỗi thứ Tư hàng tuần cho mọi suất chiếu.",
      date: "Hiệu lực: Thứ 4 hàng tuần",
      image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1000",
      tag: "Weekly Offer",
      color: "text-pink-500"
    },
    {
      id: 8,
      category: 'news',
      title: "CẬP NHẬT CÔNG NGHỆ GHẾ RUNG 4DX MỚI",
      desc: "Hệ thống ghế 4DX thế hệ thứ 5 đã được lắp đặt hoàn tất tại rạp A&K Thủ Đức, sẵn sàng phục vụ khán giả.",
      date: "Đăng ngày: 20/02/2026",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000",
      tag: "Tech Update",
      color: "text-red-400"
    }
  ];

  const filteredContent = activeTab === 'all' ? content : content.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter">
              TIN MỚI & <span className="text-red-600">ƯU ĐÃI</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm tracking-widest uppercase">Cập nhật tin tức điện ảnh và khuyến mãi mới nhất</p>
          </div>

          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'all', label: 'Tất cả', icon: Bookmark },
              { id: 'news', label: 'Tin mới', icon: Megaphone },
              { id: 'promotion', label: 'Ưu đãi', icon: Percent },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredContent.map((item, idx) => (
            <div 
              key={item.id} 
              className="group relative flex flex-col md:flex-row bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500"
            >
              {/* Image Side */}
              <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="" 
                />
                <div className={`absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${item.color}`}>
                  {item.tag}
                </div>
              </div>

              {/* Text Side */}
              <div className="md:w-3/5 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <Clock size={14} /> {item.date}
                  </div>
                  <h3 className="text-2xl font-[1000] italic uppercase tracking-tighter leading-tight group-hover:text-red-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <button className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] group/btn">
                  Xem chi tiết <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TIN TỨC ĐIỆN ẢNH PHỤ (List Style) */}
        <section className="bg-zinc-900/10 rounded-[3rem] p-10 border border-white/5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 text-center">Tin vắn điện ảnh</h4>
            <div className="divide-y divide-white/5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="py-6 flex justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-6">
                            <span className="text-red-600 font-black italic text-xl">0{i}</span>
                            <p className="font-bold uppercase tracking-tight group-hover:translate-x-2 transition-transform">Dự án phim mới của đạo diễn Christopher Nolan khởi động...</p>
                        </div>
                        <ChevronRight className="text-zinc-700 group-hover:text-white transition-colors" />
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}