"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { MessageSquareDot, Send, User, Search, MapPin, CheckCircle2, Loader2, Power, Clock, Check, ShieldAlert } from 'lucide-react';
import { apiAdminRequest, BASE_URL } from '@/app/lib/api'; 
import toast from 'react-hot-toast';

interface ChatMessage {
  roomId: string;
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string;
  timestamp?: string;
  cinemaItemId?: number;
}

export default function AdminChatPage() {
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [cinemaName, setCinemaName] = useState<string>("");
  
  const [activeRooms, setActiveRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchRoom, setSearchRoom] = useState("");
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiAdminRequest('/api/v1/users/me')
      .then(res => res.json())
      .then(data => {
        const id = data.managedCinemaItemId || (data.data && data.data.managedCinemaItemId);
        if (id) {
          setCinemaId(id);
          apiAdminRequest(`/api/v1/cinema-items/${id}`)
            .then(r => r.json())
            .then(cData => setCinemaName(cData.name || "Chi nhánh hiện tại"));
        }
      })
      .catch(err => console.error("Lỗi lấy thông tin Admin:", err));
  }, []);

  useEffect(() => {
    if (!cinemaId) return;
    apiAdminRequest(`/api/v1/chat/active-rooms/${cinemaId}`)
      .then(res => res.json())
      .then((rooms: string[]) => { if (Array.isArray(rooms)) setActiveRooms(rooms); })
      .catch(err => console.error("Lỗi đồng bộ danh sách phòng chat cũ:", err));
  }, [cinemaId]);

  useEffect(() => {
    if (!cinemaId || stompClientRef.current?.active) return;
    setIsConnecting(true);
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setIsConnecting(false);
      client.subscribe(`/topic/admin.notifications.cinema.${cinemaId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);
        
        if (newMsg.content === "[SYSTEM_CLOSE]") {
            setActiveRooms(prev => prev.filter(r => r !== newMsg.roomId));
            return;
        }
        
        setActiveRooms(prev => { if (!prev.includes(newMsg.roomId)) return [newMsg.roomId, ...prev]; return prev; });
      });
    };
    client.activate();
    stompClientRef.current = client;
    return () => { if (client.active) client.deactivate(); };
  }, [cinemaId]);

  useEffect(() => {
    if (!selectedRoom) return;

    apiAdminRequest(`/api/v1/chat/history/${selectedRoom}`)
      .then(res => res.json())
      .then(data => {
        const isClosed = data.some((m: any) => m.content === "[SYSTEM_CLOSE]");
        if (isClosed) {
          setActiveRooms(prev => prev.filter(r => r !== selectedRoom));
          setMessages([]);
          return;
        }
        setMessages(data || []);
        scrollToBottom();
      });

    let subscription: any = null;
    const timer = setTimeout(() => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        try {
          subscription = stompClientRef.current.subscribe(`/topic/room/${selectedRoom}`, (msg) => {
            const newMsg = JSON.parse(msg.body);
            
            if (newMsg.content === "[SYSTEM_CLOSE]") {
              setActiveRooms(prev => prev.filter(r => r !== selectedRoom));
              toast.success("Phiên kết nối đã được đóng!");
              return;
            }
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          });
        } catch (error) {
          console.error("Lỗi đăng ký kết nối STOMP:", error);
        }
      }
    }, 300);

    return () => { 
      clearTimeout(timer);
      if (subscription && stompClientRef.current && stompClientRef.current.connected) {
        try { subscription.unsubscribe(); } catch(e){} 
      }
    };
  }, [selectedRoom]);

  const scrollToBottom = () => { 
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); 
    }
  };

  // Cuộn xuống mỗi khi số lượng tin nhắn thay đổi trong phòng đang chọn
  useEffect(() => {
    if (selectedRoom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, selectedRoom]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedRoom || !stompClientRef.current?.connected) return;
    
    const payload: ChatMessage = { roomId: selectedRoom, sender: "Quản Lý CSKH", content: inputValue, senderRole: "ADMIN", receiverRole: "USER", cinemaItemId: cinemaId! };
    stompClientRef.current.publish({ destination: "/app/chat.sendMessage", body: JSON.stringify(payload) });
    setInputValue("");
  };

  const handleCloseRoomActive = async () => {
    if (!selectedRoom) return;
    if (window.confirm(`Xác nhận ĐÓNG và KẾT THÚC phiên hỗ trợ cho mã phòng ${selectedRoom}?`)) {
      try {
        await apiAdminRequest(`/api/v1/chat/close/${selectedRoom}`, { method: 'POST' });
        setActiveRooms(prev => prev.filter(r => r !== selectedRoom));
      } catch (err) { toast.error("Gặp lỗi khi xử lý đóng phòng!"); }
    }
  };

  const filteredRooms = activeRooms.filter(r => r.toLowerCase().includes(searchRoom.toLowerCase()));

  if (!cinemaId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-500 font-sans">
        <Loader2 className="animate-spin mb-3 text-red-500" size={36} />
        <p className="text-xs uppercase tracking-widest font-black">Đang thiết lập kết nối bảo mật...</p>
      </div>
    );
  }

  const isCurrentRoomClosed = selectedRoom !== null && !activeRooms.includes(selectedRoom);

  return (
    <div className="flex flex-col h-full min-h-[550px] bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-sans antialiased">
      
      {/* HEADER TOPBAR */}
      <div className="bg-[#121215] border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-600/20 shadow-inner">
            <MessageSquareDot className="text-red-500" size={20} />
          </div>
          <div>
            <h1 className="text-white font-black uppercase tracking-wider text-[13px] drop-shadow-md">Trung tâm Điều hành CSKH</h1>
            <p className="text-zinc-400 text-[10px] uppercase font-bold mt-0.5 flex items-center gap-1.5">
              <MapPin size={10} className="text-emerald-500"/> Cơ sở điều hành: <span className="text-white normal-case font-semibold">{cinemaName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full relative z-10 shadow-sm">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{isConnecting ? 'Đang kết nối...' : 'Trực tuyến'}</span>
        </div>
      </div>

      {/* CHÍNH: KHU VỰC CHIA ĐÔI SIDEBAR & CHAT WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        
        {/* LỚP SIDEBAR TRÁI */}
        <div className="w-72 bg-[#060608] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 bg-[#0a0a0c]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={13} />
              <input 
                type="text" 
                value={searchRoom} 
                onChange={(e) => setSearchRoom(e.target.value)} 
                placeholder="Tìm mã phòng..." 
                className="w-full bg-[#121215] border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs font-medium text-white outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600 shadow-inner" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 opacity-40 text-center px-4">
                <CheckCircle2 size={26} className="text-zinc-500 mb-2"/>
                <p className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Không có yêu cầu chờ</p>
              </div>
            ) : (
              filteredRooms.map(room => (
                <button 
                  key={room} 
                  onClick={() => setSelectedRoom(room)} 
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${selectedRoom === room ? "bg-red-600/10 border border-red-500/20 shadow-md" : "bg-[#121215] border border-white/5 hover:border-white/10 hover:bg-white/5"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedRoom === room ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-white'}`}>
                    <User size={13} />
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className={`text-xs font-bold truncate tracking-wide ${selectedRoom === room ? 'text-red-400' : 'text-zinc-200 group-hover:text-white'}`}>{room}</p>
                    <p className="text-zinc-500 text-[9px] uppercase font-black mt-0.5 flex items-center gap-1"><Clock size={9}/> Đang chờ</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* WORKSPACE CHAT CHÍNH BÊN PHẢI */}
        <div className="flex-1 flex flex-col bg-[#0a0a0c] overflow-hidden relative h-full">
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                <MessageSquareDot size={26} className="opacity-40 text-zinc-400" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Chọn một phiên hội thoại để phản hồi</p>
              <p className="text-[10px] font-medium text-zinc-600 mt-1">Mọi dữ liệu chat đều được mã hóa đầu cuối bảo mật.</p>
            </div>
          ) : isCurrentRoomClosed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 animate-in zoom-in-95 fade-in duration-300 bg-[#0a0a0c]">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.15)] relative">
                <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping"></div>
                <Check size={24} className="text-red-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 drop-shadow-md">Phiên hỗ trợ đã đóng</h3>
              <p className="text-[11px] font-medium text-zinc-500 mb-5 text-center max-w-xs leading-relaxed">
                Mã phòng <span className="text-red-400 font-bold">{selectedRoom}</span> đã kết thúc cuộc trò chuyện thành công.
              </p>
              <button 
                onClick={() => setSelectedRoom(null)} 
                className="px-5 py-2 bg-[#121215] hover:bg-white/10 text-white rounded-xl uppercase font-bold text-[9px] tracking-widest transition-all border border-white/10 shadow-lg active:scale-95"
              >
                Quay lại danh sách
              </button>
            </div>
          ) : (
            <>
              {/* TOP BAR TIÊU ĐỀ PHÒNG ĐANG CHỌN */}
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-[#121215]/40 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444] shrink-0"></div>
                  <div className="min-w-0">
                    <h4 className="text-zinc-100 font-black uppercase text-xs tracking-wider truncate">Phiên làm việc: {selectedRoom}</h4>
                    <span className="block text-emerald-500/80 text-[9px] font-bold uppercase tracking-wider mt-0.5">Kênh truyền tải trực tiếp 1:1</span>
                  </div>
                </div>
                <button 
                  onClick={handleCloseRoomActive} 
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 border border-red-600/30 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <Power size={12} /> Đóng phiên
                </button>
              </div>

              {/* NƠI HIỂN THỊ CÁC BẢN TIN CHAT */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0a0a0c]">
                {messages.map((msg, idx) => {
                  if (msg.senderRole === "BOT" || msg.receiverRole === "BOT") return null;
                  const isMe = msg.senderRole === "ADMIN";
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-1 duration-150`}>
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1 px-1">{msg.sender}</span>
                      <div className={`max-w-[75%] text-xs px-4 py-2.5 shadow-md leading-relaxed border tracking-wide whitespace-pre-wrap break-words ${isMe ? "bg-red-600 border-red-500/30 text-white rounded-2xl rounded-tr-none shadow-red-950/20" : "bg-[#16161a] border-white/5 text-zinc-200 rounded-2xl rounded-tl-none"}`}>
                        {msg.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* KHU VỰC NHẬP TEXT SUBMIT */}
              <form onSubmit={sendMessage} className="p-3 border-t border-white/5 bg-[#060608] flex items-center gap-2 shrink-0">
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Nhập văn bản nội dung phản hồi khách hàng..." 
                  className="flex-1 bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600 shadow-inner" 
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim()} 
                  className="w-11 h-11 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.2)] transform active:scale-95 shrink-0"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* STYLE SCROLLBAR ĐỒNG BỘ */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1e24; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2d2d38; }
      `}</style>
    </div>
  );
}