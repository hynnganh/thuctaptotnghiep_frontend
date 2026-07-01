"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; 
import { MessageCircle, X, Send, Bot, Loader2, Film, ArrowRight, Move, MapPin, Trash2, Headset, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { apiRequest, BASE_URL } from '../../../lib/api'; 

interface ChatMessage {
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string; 
  timestamp?: string;
  cinemaItemId?: number | null; 
}

interface Cinema {
  id: number;
  name: string;
}

interface CinemaItem {
  id: number;
  name: string;
  city: string;
  cinema?: Cinema; 
  cinemaId?: number; 
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 🔥 CHAT MODE: BOT (Mặc định) | SELECT_CINEMA (Đang chọn rạp) | ADMIN (Đã nối máy với quản lý)
  const [chatMode, setChatMode] = useState<"BOT" | "SELECT_CINEMA" | "ADMIN">(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem("guest_chat_mode") as any) || "BOT";
    return "BOT";
  }); 

  // 🔥 DANH SÁCH TIN NHẮN GỘP CHUNG (UNIFIED THREAD)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaItems, setCinemaItems] = useState<CinemaItem[]>([]);
  const [selectedParentCinema, setSelectedParentCinema] = useState<Cinema | null>(null);
  
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("guest_cinema_id");
      return saved ? parseInt(saved) : null;
    }
    return null;
  });

  const [isLoadingCinemas, setIsLoadingCinemas] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [roomId] = useState(() => {
    if (typeof window !== 'undefined') {
      let savedRoom = localStorage.getItem("guest_room_id");
      if (!savedRoom) {
        savedRoom = "ROOM_" + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem("guest_room_id", savedRoom);
      }
      return savedRoom;
    }
    return "ROOM_TEMP";
  });

  // Đồng bộ trạng thái vào LocalStorage để khách F5 không bị mất kết nối với Admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("guest_chat_mode", chatMode === "SELECT_CINEMA" ? "BOT" : chatMode);
      if (selectedCinemaId) localStorage.setItem("guest_cinema_id", selectedCinemaId.toString());
      else localStorage.removeItem("guest_cinema_id");
    }
  }, [chatMode, selectedCinemaId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 150);
  }, [messages, isOpen, chatMode]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && position.x === 0 && position.y === 0) {
      setPosition({ x: window.innerWidth - 390, y: window.innerHeight - 600 });
    }
  }, [isOpen]);

  const resetAutoCloseTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (chatMode !== "ADMIN" || !selectedCinemaId) return;

    timeoutRef.current = setTimeout(() => {
      handleCloseChatBySystem();
    }, 180000); // 3 phút không ai chat sẽ tự đóng Admin
  };

  const handleCloseChatBySystem = async () => {
    try {
      await apiRequest(`/api/v1/chat/close/${roomId}`, { method: 'POST' });
    } catch (e) {
      console.error("Lỗi đóng cuộc chat tự động", e);
    }
  };

  const handleUserActiveCancel = async () => {
    if (window.confirm("Kết thúc phiên trò chuyện với quản lý rạp và quay lại dùng AI?")) {
      await handleCloseChatBySystem();
      setChatMode("BOT");
      setSelectedCinemaId(null);
    }
  };

  // Tải danh sách rạp
  useEffect(() => {
    if (isOpen && cinemas.length === 0 && cinemaItems.length === 0) {
      setIsLoadingCinemas(true);
      Promise.all([
        apiRequest('/api/v1/cinemas').then(res => res.json()).catch(() => []),
        apiRequest('/api/v1/cinema-items').then(res => res.json()).catch(() => [])
      ]).then(([parentData, childData]) => {
        const safeParents = Array.isArray(parentData) ? parentData : (parentData?.data || parentData?.content || []);
        const safeChildren = Array.isArray(childData) ? childData : (childData?.data || childData?.content || []);
        
        const activeParentIds = new Set(
          safeChildren
            .map((child: any) => child.cinema?.id || child.cinemaId || child.cinema)
            .filter((id: number | null | undefined) => id !== null && id !== undefined)
        );

        setCinemas(safeParents.filter((parent: any) => activeParentIds.has(parent.id)));
        setCinemaItems(safeChildren);
        setIsLoadingCinemas(false);
      }).catch(() => setIsLoadingCinemas(false));
    }
  }, [isOpen]);

  // Kết nối WebSocket
  const connectWebSocket = () => {
    if (stompClientRef.current?.active) return;
    setIsConnecting(true);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
    });

    client.onConnect = function () {
      setIsConnecting(false);
      
      // Lắng nghe tin nhắn mới
      client.subscribe(`/topic/room/${roomId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);
        
        // Bắt lệnh mở lại phòng chat để tẩy cờ đóng
        if (newMsg.content === "[SYSTEM_OPEN]") {
            setMessages((prev) => prev.filter((m) => m.content !== "[SYSTEM_CLOSE]"));
            return;
        }

        // Nhận lệnh đóng từ hệ thống Backend
        if (newMsg.content === "[SYSTEM_CLOSE]") {
          setChatMode("BOT");
          setSelectedCinemaId(null);
          return; 
        }

        setMessages((prev) => [...prev, newMsg]);

        if (newMsg.receiverRole === "ADMIN" || newMsg.senderRole === "ADMIN") {
          resetAutoCloseTimeout(); 
        }
      });

      // Tải lịch sử tin nhắn
      apiRequest(`/api/v1/chat/history/${roomId}`)
        .then(res => res.json())
        .then((data: ChatMessage[]) => {
          if (data && data.length > 0) {
            // Kiểm tra xem phòng Admin có bị đóng không
            let isCurrentlyClosed = false;
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].content === "[SYSTEM_CLOSE]") {
                    isCurrentlyClosed = true;
                    break;
                } else if (data[i].receiverRole === "ADMIN" || data[i].senderRole === "ADMIN") {
                    isCurrentlyClosed = false;
                    break;
                }
            }
            
            if (isCurrentlyClosed && chatMode === "ADMIN") {
                setChatMode("BOT");
                setSelectedCinemaId(null);
            }

            // Lọc sạch cả 2 mã hệ thống ra khỏi giao diện
            const validMessages = data.filter(m => m.content !== "[SYSTEM_CLOSE]" && m.content !== "[SYSTEM_OPEN]");
            setMessages(validMessages);
          }
        }).catch(err => console.error(err));
    };

    client.activate();
    stompClientRef.current = client;
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    connectWebSocket();
  };

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !stompClientRef.current || !stompClientRef.current.connected) return;

    // Lọc bỏ hệ thống rác trước khi gửi lên API
    if (chatMode === "ADMIN") {
        setMessages(prev => prev.filter(m => m.content !== "[SYSTEM_CLOSE]" && m.content !== "[SYSTEM_OPEN]"));
    }

    const payload = {
      roomId: roomId,
      sender: "Khách Hàng",
      content: inputValue,
      senderRole: "USER",
      receiverRole: chatMode === "ADMIN" ? "ADMIN" : "BOT",
      cinemaItemId: chatMode === "ADMIN" ? selectedCinemaId : null
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload)
    });
    
    setInputValue("");
    if (chatMode === "ADMIN") resetAutoCloseTimeout();
  };

  // Logic Kéo thả khung chat (Draggable)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.btn-no-drag')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;
    if (typeof window !== 'undefined') {
      newX = Math.max(0, Math.min(newX, window.innerWidth - 380));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 600));
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Trình hiển thị nội dung tin nhắn (Xử lý đậm, thẻ phim)
  const renderMessageContent = (text: string, role: string) => {
    if (role === "USER") return text.split('\n').map((item, i) => <span key={i}>{item}<br/></span>);
    
    const parts = text.split(/(\$\$MOVIE\|[^$]+\$\$|\$\$SEEMORE\$\$)/g);
    
    const parseInlineFormat = (rawText: string) => {
      const subParts = rawText.split(/(\*\*[^*]+\*\*)/g);
      return subParts.map((subPart, subIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIdx} className="font-extrabold text-white mx-0.5 drop-shadow-md">{subPart.slice(2, -2)}</strong>;
        }
        return subPart.split('\n').map((line, lineIdx) => (
          <React.Fragment key={`${subIdx}-${lineIdx}`}>{line}{lineIdx < subPart.split('\n').length - 1 && <br />}</React.Fragment>
        ));
      });
    };

    return parts.map((part, index) => {
      if (part.startsWith('$$MOVIE|')) {
        const cleanPart = part.replace('$$MOVIE|', '').replace(/\$\$$/, ''); 
        const [id, title, ...posterUrlParts] = cleanPart.split('|');
        const poster = posterUrlParts.join('|'); 

        return (
          <Link href={`/movies/${id}`} key={index} className="block mt-3 mb-2 group">
            <div className="relative flex items-center bg-[#0a0a0c] border border-white/10 p-2.5 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 group-hover:border-red-500/50 group-hover:shadow-[0_8px_25px_rgba(220,38,38,0.25)]">
              <img src={poster} alt={title} className="w-14 h-20 object-cover rounded-xl shadow-md bg-zinc-800" />
              <div className="flex-1 ml-3">
                <h4 className="text-zinc-100 font-black text-[13px] leading-tight line-clamp-2 mb-1">{title}</h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                  <Film size={12}/> Đặt vé ngay
                </p>
              </div>
            </div>
          </Link>
        );
      }
      if (part === '$$SEEMORE$$') {
        return (
          <Link href="/movies" key={index} className="block mt-4 mb-1">
            <div className="w-full py-3 bg-gradient-to-r from-zinc-900 to-[#121215] border border-zinc-800 hover:border-red-600/50 text-center rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 group">
              <span className="text-[11px] font-black text-red-500 uppercase tracking-widest group-hover:text-red-400">Khám phá kho phim</span>
              <ArrowRight size={14} className="text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      }
      return <React.Fragment key={index}>{parseInlineFormat(part)}</React.Fragment>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end select-none font-sans">
      
      {/* ======================================================== */}
      {/* KHUNG CHAT (WIDGET) */}
      {/* ======================================================== */}
      <div 
        className={`fixed bg-[#0d0d12]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transform transition-all ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
        style={{ width: "380px", height: "600px", left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.4s, left 0.1s ease-out, top 0.1s ease-out' }}
      >
        
        {/* HEADER */}
        <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className={`p-4 flex justify-between items-center relative overflow-hidden shadow-lg cursor-move touch-none shrink-0 transition-colors duration-500 ${chatMode === "ADMIN" ? 'bg-gradient-to-r from-emerald-700 to-teal-900' : 'bg-gradient-to-r from-red-600 to-rose-800'}`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10 pointer-events-none">
            <div className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 p-2.5 shadow-inner">
              {chatMode === "ADMIN" ? <Headset size={24} className="text-white drop-shadow-md" /> : <Bot size={24} className="text-white drop-shadow-md" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-[1000] text-white text-[15px] tracking-widest uppercase italic drop-shadow-md">
                  {chatMode === "ADMIN" ? "Quản lý rạp" : "Trợ lý AI A&K"}
                </h3>
                <Move size={12} className="text-white/40" />
              </div>
              <p className="text-[10px] text-white/80 font-bold flex items-center gap-1.5 tracking-widest mt-0.5 uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'}`}></span>
                {isConnecting ? "Đang kết nối..." : "Hệ thống Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {/* Nút Gọi Quản Lý / Hủy Quản Lý */}
            {chatMode === "BOT" ? (
               <button onClick={() => setChatMode("SELECT_CINEMA")} className="btn-no-drag w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 shadow-md" title="Gặp Quản Lý">
                 <Headset size={14} />
               </button>
            ) : chatMode === "ADMIN" ? (
               <button onClick={handleUserActiveCancel} className="btn-no-drag w-8 h-8 rounded-full bg-black/20 hover:bg-red-500/80 border border-transparent hover:border-white/30 text-white flex items-center justify-center transition-all active:scale-95" title="Kết thúc trò chuyện">
                 <Trash2 size={13} />
               </button>
            ) : null}

            {/* Nút Đóng Khung Chat */}
            <button onClick={() => setIsOpen(false)} className="btn-no-drag w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-all active:scale-90 border border-transparent hover:border-white/10" title="Thu nhỏ">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BODY TÙY THUỘC VÀO CHAT MODE */}
        {/* ======================================================== */}
        
        {chatMode === "SELECT_CINEMA" ? (
          // --- MÀN HÌNH CHỌN RẠP ĐỂ NỐI MÁY ADMIN ---
          <div className="flex-1 overflow-y-auto bg-[#0d0d12] p-5 flex flex-col items-center custom-scrollbar animate-in slide-in-from-right-4 duration-300">
            
            <button onClick={() => setChatMode("BOT")} className="self-start text-[10px] font-black uppercase text-zinc-500 hover:text-white mb-6 flex items-center gap-1 transition-colors">
               <ChevronLeft size={14} /> Quay lại trò chuyện AI
            </button>

            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
               <MapPin size={26} className="text-emerald-500 animate-bounce" />
            </div>

            {!selectedParentCinema ? (
              <>
                <h4 className="text-white font-black text-[15px] mb-1">Xác định Hệ thống rạp</h4>
                <p className="text-zinc-500 text-xs font-medium text-center mb-6 px-4 leading-relaxed">Để kết nối chính xác tới nhân viên hỗ trợ, vui lòng chọn cụm rạp bạn đang quan tâm.</p>
                <div className="w-full space-y-2.5">
                  {cinemas.map(parent => (
                    <button key={parent.id} onClick={() => setSelectedParentCinema(parent)} className="w-full bg-[#16161a] border border-white/5 p-4 rounded-xl text-left text-[13px] font-bold text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex justify-between items-center group shadow-sm">
                      <span className="uppercase tracking-wider">{parent.name}</span>
                      <ArrowRight size={16} className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full animate-in slide-in-from-right-4 duration-200">
                <h4 className="text-white font-black text-[15px] mb-1 text-center">Chọn Chi nhánh cụ thể</h4>
                <p className="text-zinc-500 text-xs font-medium text-center mb-4">Thuộc hệ thống {selectedParentCinema.name}</p>
                
                <button onClick={() => setSelectedParentCinema(null)} className="w-full mb-4 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 py-2.5 bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20">
                   Đổi hệ thống rạp khác
                </button>

                <div className="w-full space-y-2.5">
                  {cinemaItems.filter(i => i.cinema?.id === selectedParentCinema.id || i.cinemaId === selectedParentCinema.id || (i as any).cinema === selectedParentCinema.id).map(item => (
                    <button key={item.id} onClick={() => { 
                      setSelectedCinemaId(item.id); 
                      setChatMode("ADMIN"); 
                      resetAutoCloseTimeout(); 
                    }} className="w-full bg-[#16161a] border border-white/5 p-4 rounded-xl text-left text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex justify-between items-center group shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] uppercase tracking-wider">{item.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium mt-0.5">{item.city}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          
          // --- MÀN HÌNH CHAT CHÍNH (GỘP CHUNG BOT VÀ ADMIN) ---
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[#0d0d12]">
              
              {/* Lời chào mở đầu cố định của AI */}
              <div className="text-center mb-6 mt-2">
                 <span className="text-[9px] bg-white/5 px-4 py-1.5 rounded-full text-zinc-500 font-black border border-white/5 uppercase tracking-[0.2em]">Mã hóa đầu cuối 256-bit</span>
              </div>
              
              <div className="flex flex-col items-start animate-in fade-in duration-500">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 pl-1 flex items-center gap-1.5">
                   <Sparkles size={10} className="text-red-500"/> Trợ lý AI A&K
                </span>
                <div className="max-w-[85%] text-[13px] px-5 py-4 rounded-2xl rounded-tl-sm shadow-md leading-relaxed bg-[#16161a] border border-white/5 text-zinc-300">
                  Xin chào! Tôi là siêu trí tuệ nhân tạo của A&K Cinema. Bạn cần kiểm tra lịch chiếu phim, giá vé hay muốn nhận gợi ý phim hay hôm nay?
                </div>
              </div>

              {/* Lời chào khi kết nối Admin */}
              {chatMode === "ADMIN" && selectedCinemaId && (
                <div className="flex flex-col items-center my-6 animate-in zoom-in-95 duration-300">
                   <div className="bg-emerald-950/30 border border-emerald-900/50 px-5 py-3 rounded-2xl text-center max-w-[90%] shadow-inner">
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Đã kết nối Tổng đài viên</p>
                      <p className="text-xs text-emerald-100/70 font-medium leading-relaxed">
                         Hỗ trợ viên tại <b>{cinemaItems.find(c => c.id === selectedCinemaId)?.name}</b> đã tham gia trò chuyện. Vui lòng cung cấp mã vé hoặc vấn đề bạn cần xử lý.
                      </p>
                   </div>
                </div>
              )}

              {/* Render danh sách tin nhắn gộp chung */}
              {messages.map((msg, idx) => {
                const isUser = msg.senderRole === "USER";
                const isAdmin = msg.senderRole === "ADMIN";
                
                return (
                  <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                      {isUser ? "Bạn" : isAdmin ? <><Headset size={10} className="text-emerald-500"/> CSKH A&K</> : <><Sparkles size={10} className="text-red-500"/> Trợ lý AI</>}
                    </span>
                    <div className={`max-w-[88%] text-[13px] px-5 py-3.5 rounded-2xl shadow-lg leading-relaxed border ${
                      isUser 
                        ? "bg-gradient-to-br from-red-600 to-rose-600 border-red-500/50 text-white rounded-tr-sm shadow-red-900/20" 
                        : isAdmin
                          ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-100 rounded-tl-sm shadow-emerald-900/10"
                          : "bg-[#16161a] border-white/5 text-zinc-300 rounded-tl-sm"
                    }`}>
                      {renderMessageContent(msg.content, msg.senderRole)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* KHUNG NHẬP TIN NHẮN */}
            <form onSubmit={sendMessage} className="p-4 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 flex gap-2.5 shrink-0 relative z-20">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                disabled={isConnecting} 
                placeholder={chatMode === "ADMIN" ? "Nhắn với quản lý rạp..." : "Hỏi AI A&K Cinema..."} 
                className="flex-1 bg-[#16161a] border border-white/10 rounded-xl px-4 py-3.5 text-[13px] font-medium text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 disabled:opacity-50 shadow-inner" 
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isConnecting} 
                className={`w-12 h-12 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${
                  chatMode === "ADMIN" 
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                    : "bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                }`}
              >
                {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* NÚT MỞ WIDGET */}
      <button onClick={handleOpenChat} className={`w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(220,38,38,0.5)] transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border-2 border-white/20 hover:border-white/40 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 animate-[bounce_3s_infinite]"}`}>
        <MessageCircle size={28} strokeWidth={2.5} />
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </div>
  );
}