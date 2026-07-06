"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; 
import { MessageCircle, X, Send, Bot, Loader2, Film, ArrowRight, Move, MapPin, Trash2, Headset, Sparkles, ChevronLeft, ShieldCheck, HelpCircle } from 'lucide-react';
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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false); // State quản lý cụm 2 options bật ra
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false); // State hiển thị modal confirm custom thay confirm hệ thống
  
  const [chatMode, setChatMode] = useState<"BOT" | "SELECT_CINEMA" | "ADMIN">(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem("guest_chat_mode") as any) || "BOT";
    return "BOT";
  }); 

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
      setPosition({ x: window.innerWidth - 410, y: window.innerHeight - 640 });
    }
  }, [isOpen]);

  const resetAutoCloseTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (chatMode !== "ADMIN" || !selectedCinemaId) return;

    timeoutRef.current = setTimeout(() => {
      handleCloseChatBySystem();
    }, 180000);
  };

  const handleCloseChatBySystem = async () => {
    try {
      await apiRequest(`/api/v1/chat/close/${roomId}`, { method: 'POST' });
    } catch (e) {
      console.error("Lỗi đóng cuộc chat tự động", e);
    }
  };

  const handleUserActiveCancel = async () => {
    await handleCloseChatBySystem();
    setChatMode("BOT");
    setSelectedCinemaId(null);
    setShowConfirmClose(false);
  };

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

  const connectWebSocket = () => {
    if (stompClientRef.current?.active) return;
    setIsConnecting(true);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
    });

    client.onConnect = function () {
      setIsConnecting(false);
      
      client.subscribe(`/topic/room/${roomId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);
        
        if (newMsg.content === "[SYSTEM_OPEN]") {
            setMessages((prev) => prev.filter((m) => m.content !== "[SYSTEM_CLOSE]"));
            return;
        }

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

      apiRequest(`/api/v1/chat/history/${roomId}`)
        .then(res => res.json())
        .then((data: ChatMessage[]) => {
          if (data && data.length > 0) {
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

            const validMessages = data.filter(m => m.content !== "[SYSTEM_CLOSE]" && m.content !== "[SYSTEM_OPEN]");
            setMessages(validMessages);
          }
        }).catch(err => console.error(err));
    };

    client.activate();
    stompClientRef.current = client;
  };

  const handleOpenChatWithMode = (mode: "BOT" | "SELECT_CINEMA") => {
    if (chatMode !== "ADMIN") {
      setChatMode(mode);
    }
    setIsOpen(true);
    setIsOptionsOpen(false); // Đóng khay lựa chọn lại sau khi đã nhấn chọn một chế độ
    connectWebSocket();
  };

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !stompClientRef.current || !stompClientRef.current.connected) return;

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
      newX = Math.max(0, Math.min(newX, window.innerWidth - 395));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 615));
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const renderMessageContent = (text: string, role: string) => {
    if (role === "USER") return text.split('\n').map((item, i) => <span key={i}>{item}<br/></span>);
    
    const parts = text.split(/(\$\$MOVIE\|[^$]+\$\$|\$\$SEEMORE\$\$)/g);
    
    const parseInlineFormat = (rawText: string) => {
      const subParts = rawText.split(/(\*\*[^*]+\*\*)/g);
      return subParts.map((subPart, subIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIdx} className="font-bold text-[#e11d48] mx-0.5">{subPart.slice(2, -2)}</strong>;
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
          <Link href={`/movies/${id}`} key={index} className="block mt-3 mb-1 group">
            <div className="relative flex items-center bg-zinc-50 border border-zinc-200 p-3 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#e11d48]/40 hover:bg-white shadow-sm">
              <img src={poster} alt={title} className="w-11 h-16 object-cover rounded shadow bg-zinc-200 shrink-0" />
              <div className="flex-1 ml-3 min-w-0">
                <h4 className="text-zinc-800 font-bold text-[13px] leading-tight line-clamp-2 mb-1 group-hover:text-[#e11d48] transition-colors">{title}</h4>
                <p className="text-[11px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                  <Film size={12} className="text-[#e11d48]" /> Mua vé ngay
                </p>
              </div>
            </div>
          </Link>
        );
      }
      if (part === '$$SEEMORE$$') {
        return (
          <Link href="/movies" key={index} className="block mt-3 mb-1">
            <div className="w-full py-2.5 bg-white border border-zinc-300 hover:border-[#e11d48] text-center rounded-lg transition-all text-xs font-bold text-[#e11d48] flex items-center justify-center gap-1.5 shadow-sm group">
              <span>Xem toàn bộ lịch chiếu</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      }
      return <React.Fragment key={index}>{parseInlineFormat(part)}</React.Fragment>;
    });
  };

  const getHeaderTitle = () => {
    if (chatMode === "ADMIN") return "KẾT NỐI QUẢN LÝ HNA";
    if (chatMode === "SELECT_CINEMA") return "CHỌN CHI NHÁNH HNA";
    return "HỆ THỐNG AI TỰ ĐỘNG - HNA";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end select-none font-sans antialiased text-zinc-800">
      
      {/* ======================================================== */}
      {/* KHUNG WINDOW CHAT SÁNG SANG TRỌNG (LIGHT MINIMAL LOOK) */}
      {/* ======================================================== */}
      <div 
        className={`fixed bg-white border border-zinc-200 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden transform transition-all duration-300 ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"}`}
        style={{ width: "385px", height: "600px", left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s, left 0.1s ease-out, top 0.1s ease-out' }}
      >
        
        {/* LIGHT HEADER */}
        <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className="p-4 bg-zinc-50 border-b border-zinc-200/80 flex justify-between items-center cursor-move touch-none shrink-0 select-none">
          <div className="flex items-center gap-3 pointer-events-none">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${chatMode === "ADMIN" ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-100 text-[#e11d48]'}`}>
              {chatMode === "ADMIN" ? <Headset size={20} /> : <Bot size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-extrabold text-[13px] tracking-wide uppercase text-zinc-900 font-mono">
                  {getHeaderTitle()}
                </h3>
                <Move size={12} className="text-zinc-400 ml-1" />
              </div>
              <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                {isConnecting ? "Đang kết nối..." : "Tổng đài bảo mật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            {chatMode === "BOT" ? (
               <button onClick={() => setChatMode("SELECT_CINEMA")} className="btn-no-drag w-7 h-7 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 flex items-center justify-center transition-all active:scale-95 border border-zinc-200 shadow-sm" title="Gặp Quản Lý">
                 <Headset size={14} />
               </button>
            ) : chatMode === "ADMIN" ? (
               <button onClick={() => setShowConfirmClose(true)} className="btn-no-drag w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all active:scale-95 border border-rose-200 shadow-sm" title="Kết thúc">
                 <Trash2 size={13} />
               </button>
            ) : null}

            <button onClick={() => setIsOpen(false)} className="btn-no-drag w-7 h-7 flex items-center justify-center rounded-lg bg-white text-zinc-500 hover:bg-zinc-100 transition-all active:scale-95 border border-zinc-200 shadow-sm" title="Đóng">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* CUSTOM CONFIRMATION DIALOG (Thay cho window.confirm) */}
        {showConfirmClose && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm z-[999] flex items-center justify-center p-5 animate-in fade-in duration-200">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 w-full max-w-[300px] text-center shadow-xl animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-[#e11d48] rounded-xl flex items-center justify-center mx-auto mb-3">
                <HelpCircle size={20} />
              </div>
              <h4 className="text-zinc-900 font-extrabold text-[13px] uppercase tracking-wide mb-1">Xác nhận chuyển đổi</h4>
              <p className="text-zinc-500 text-xs leading-relaxed mb-4">Kết thúc phiên hội thoại với Quản lý rạp và quay trở về dùng Hệ thống AI tự động?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmClose(false)} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors border border-zinc-200/50">
                  Hủy bỏ
                </button>
                <button onClick={handleUserActiveCancel} className="flex-1 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors shadow-sm shadow-rose-200">
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BODY LAYOUT CHAT */}
        {chatMode === "SELECT_CINEMA" ? (
          <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-5 flex flex-col items-center custom-scrollbar animate-in fade-in duration-200">
            <button onClick={() => setChatMode("BOT")} className="self-start text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-700 mb-4 flex items-center gap-1 transition-colors">
               <ChevronLeft size={14} /> Trở lại dùng AI
             </button>

            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
               <MapPin size={22} />
            </div>

            {!selectedParentCinema ? (
              <>
                <h4 className="text-zinc-800 font-extrabold text-sm mb-1 uppercase tracking-wide">Xác định Hệ thống rạp</h4>
                <p className="text-zinc-500 text-xs text-center mb-5 max-w-[260px] leading-relaxed">Chọn cụm rạp tổng để kết nối trực tiếp đến phòng kỹ thuật hoặc quản lý khu vực.</p>
                <div className="w-full space-y-2">
                  {cinemas.map(parent => (
                    <button key={parent.id} onClick={() => setSelectedParentCinema(parent)} className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-left text-xs font-bold text-zinc-700 transition-all flex justify-between items-center group shadow-sm">
                      <span className="uppercase tracking-wide">{parent.name}</span>
                      <ArrowRight size={14} className="text-zinc-400 group-hover:text-[#e11d48] transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full animate-in fade-in duration-200">
                <h4 className="text-zinc-800 font-extrabold text-sm mb-1 text-center uppercase tracking-wide">Chọn Chi nhánh chi tiết</h4>
                <p className="text-zinc-400 text-xs text-center mb-4 italic">({selectedParentCinema.name})</p>
                
                <button onClick={() => setSelectedParentCinema(null)} className="w-full mb-3 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-800 py-2 bg-white border border-zinc-200 rounded-lg transition-colors shadow-sm">
                   Thay đổi hệ thống rạp khác
                </button>

                <div className="w-full space-y-2">
                  {cinemaItems.filter(i => i.cinema?.id === selectedParentCinema.id || i.cinemaId === selectedParentCinema.id || (i as any).cinema === selectedParentCinema.id).map(item => (
                    <button key={item.id} onClick={() => { 
                      setSelectedCinemaId(item.id); 
                      setChatMode("ADMIN"); 
                      resetAutoCloseTimeout(); 
                    }} className="w-full bg-white hover:bg-emerald-50/40 border border-zinc-200 hover:border-emerald-300 p-3.5 rounded-xl text-left text-zinc-700 transition-all flex justify-between items-center group shadow-sm">
                      <div className="min-w-0 pr-2">
                        <span className="block font-bold text-xs uppercase tracking-wide truncate">{item.name}</span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5 truncate">{item.city}</span>
                      </div>
                      <ArrowRight size={14} className="text-zinc-300 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-white">
              <div className="text-center mb-3 flex items-center justify-center gap-1.5">
                 <ShieldCheck size={12} className="text-zinc-400" />
                 <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Đường truyền bảo mật HNA</span>
              </div>
              
              {/* Lời chào mặc định */}
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 pl-0.5">
                   <Sparkles size={10} className="text-[#e11d48]"/> Trợ lý thông minh HNA
                </span>
                <div className="max-w-[85%] text-xs px-4 py-3 bg-zinc-100 text-zinc-700 rounded-2xl rounded-tl-none leading-relaxed border border-zinc-200/50">
                  Chào mừng bạn đến với HNA Cinema! Tôi có thể hỗ trợ tra cứu nhanh phim hot, giá vé hoặc tìm cụm rạp gần nhất hoàn toàn tự động.
                </div>
              </div>

              {/* Banner thông báo Admin trực máy */}
              {chatMode === "ADMIN" && selectedCinemaId && (
                <div className="my-4 animate-in zoom-in-95 duration-200">
                   <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center shadow-sm">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-0.5">Quản lý rạp đã vào phòng</p>
                      <p className="text-[11px] text-zinc-600 leading-normal">
                         Hỗ trợ viên tại <span className="text-emerald-700 font-bold">{cinemaItems.find(c => c.id === selectedCinemaId)?.name}</span> đang tiếp nhận yêu cầu của bạn.
                      </p>
                   </div>
                </div>
              )}

              {/* Luồng tin nhắn nhắn tin */}
              {messages.map((msg, idx) => {
                const isUser = msg.senderRole === "USER";
                const isAdmin = msg.senderRole === "ADMIN";
                
                return (
                  <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                    <span className="text-[10px] text-zinc-400 font-semibold mb-1 px-1">
                      {isUser ? "Bạn" : isAdmin ? "Quản lý HNA" : "HNA AI"}
                    </span>
                    <div className={`max-w-[82%] text-xs px-4 py-2.5 leading-relaxed border ${
                      isUser 
                        ? "bg-[#e11d48] border-[#e11d48] text-white font-medium rounded-2xl rounded-tr-none shadow-sm shadow-rose-200" 
                        : isAdmin
                          ? "bg-emerald-50/50 border-emerald-200 text-zinc-800 rounded-2xl rounded-tl-none"
                          : "bg-zinc-100 border-zinc-200 text-zinc-700 rounded-2xl rounded-tl-none"
                    }`}>
                      {renderMessageContent(msg.content, msg.senderRole)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

{/* THANH NHẬP CHAT TRẮNG SÁNG */}
<form onSubmit={sendMessage} className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2 shrink-0 relative z-20 w-full box-border">
  <input 
    type="text" 
    value={inputValue} 
    onChange={(e) => setInputValue(e.target.value)} 
    disabled={isConnecting} 
    placeholder={chatMode === "ADMIN" ? "Nhập câu hỏi gửi quản lý chi nhánh..." : "Hỏi AI phim hot đang chiếu tuần này..."} 
    className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/20 transition-all placeholder:text-zinc-400 disabled:opacity-50 shadow-inner" 
  />
  <button 
    type="submit" 
    disabled={!inputValue.trim() || isConnecting} 
    className={`w-9 h-9 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95 shrink-0 shadow-sm ${
      chatMode === "ADMIN" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-[#e11d48] hover:bg-[#be123c]"
    }`}
  >
    {isConnecting ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={13} className="ml-0.5" />}
  </button>
</form>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* KHU VỰC ĐIỀU KHIỂN ĐÓNG/MỞ OPTIONS BẰNG MỘT ICON DUY NHẤT */}
      {/* ======================================================== */}
      <div className="flex flex-col items-end gap-3 relative">
        
        {/* Khay chứa 2 Options - Bật lên khi state isOptionsOpen === true */}
        <div className={`flex flex-col gap-2.5 items-end transition-all duration-300 transform origin-bottom ${isOptionsOpen && !isOpen ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-90 opacity-0 translate-y-4 pointer-events-none"}`}>
          
          {/* Nút 1: Trợ lý tự động AI */}
          <button 
            onClick={() => handleOpenChatWithMode("BOT")} 
            className="group flex items-center gap-3 bg-white border border-zinc-200 hover:border-[#e11d48]/40 px-5 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-zinc-800 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
          >
            <div className="w-7 h-7 bg-rose-50 text-[#e11d48] rounded-lg flex items-center justify-center border border-rose-100 p-1 group-hover:bg-[#e11d48] group-hover:text-white transition-all shadow-inner">
              <Bot size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold uppercase tracking-wide leading-none text-zinc-900">Trợ lý AI HNA</p>
              <p className="text-[10px] text-zinc-400 font-medium mt-1 group-hover:text-zinc-500 transition-colors">Tra cứu nhanh tự động 24/7</p>
            </div>
          </button>

          {/* Nút 2: Kết nối Quản lý rạp */}
          <button 
            onClick={() => handleOpenChatWithMode("SELECT_CINEMA")} 
            className="group flex items-center gap-3 bg-white border border-zinc-200 hover:border-emerald-500/40 px-5 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-zinc-800 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
          >
            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100 p-1 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <Headset size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold uppercase tracking-wide leading-none text-zinc-900">Gặp Quản Lý rạp</p>
              <p className="text-[10px] text-zinc-400 font-medium mt-1 group-hover:text-zinc-500 transition-colors">Hỗ trợ sự cố vé và rạp chiếu</p>
            </div>
          </button>
        </div>

        {/* NÚT TRIGGER ICON CHÍNH (Đại diện thu gọn duy nhất) */}
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              setIsOptionsOpen(!isOptionsOpen);
            }
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 transform active:scale-90 shadow-[0_8px_25px_rgba(225,29,72,0.3)] ${
            isOpen 
              ? "bg-zinc-900 hover:bg-zinc-800 shadow-[0_8px_25px_rgba(0,0,0,0.2)] rotate-90" 
              : isOptionsOpen 
                ? "bg-zinc-800 shadow-[0_8px_25px_rgba(0,0,0,0.2)]" 
                : "bg-[#e11d48] hover:bg-[#be123c]"
          }`}
        >
          {isOpen || isOptionsOpen ? (
            <X size={20} strokeWidth={2.5} className="animate-in fade-in zoom-in duration-200" />
          ) : (
            <MessageCircle size={22} className="animate-in fade-in zoom-in duration-200" />
          )}
        </button>
      </div>

      {/* STYLE SCROLLBAR HỆ THỐNG */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
      `}</style>
    </div>
  );
}