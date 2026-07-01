"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { MessageSquareDot, Send, User, Search, MapPin, CheckCircle2, Loader2, Power, Clock, Check } from 'lucide-react';
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

  // Load tin nhắn phòng khi đổi phòng
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

  const scrollToBottom = () => { setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100); };

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
        // Tự động xóa khỏi danh sách bên trái ngay lập tức cho mượt
        setActiveRooms(prev => prev.filter(r => r !== selectedRoom));
      } catch (err) { toast.error("Gặp lỗi khi xử lý đóng phòng!"); }
    }
  };

  const filteredRooms = activeRooms.filter(r => r.toLowerCase().includes(searchRoom.toLowerCase()));

  if (!cinemaId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-zinc-500">
        <Loader2 className="animate-spin mb-4 text-red-500" size={40} />
        <p className="text-sm uppercase tracking-widest font-black">Đang thiết lập kết nối mã hóa...</p>
      </div>
    );
  }

  const isCurrentRoomClosed = selectedRoom !== null && !activeRooms.includes(selectedRoom);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="bg-[#121215] border-b border-white/5 p-5 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20 shadow-inner">
            <MessageSquareDot className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-white font-[1000] uppercase tracking-widest text-[15px] drop-shadow-md">Trung tâm Điều hành CSKH</h1>
            <p className="text-zinc-400 text-[11px] uppercase font-bold mt-1 flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-500"/> Phân quyền: <span className="text-white">{cinemaName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full relative z-10 shadow-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{isConnecting ? 'Đang kết nối...' : 'Đã kết nối trực tuyến'}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-[#060608] border-r border-white/5 flex flex-col relative">
          <div className="p-5 border-b border-white/5 shrink-0 bg-[#0a0a0c]">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={16} />
              <input type="text" value={searchRoom} onChange={(e) => setSearchRoom(e.target.value)} placeholder="Tra cứu mã phiên (ROOM_XXX)..." className="w-full bg-[#121215] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium text-white outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600 shadow-inner" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 opacity-40">
                <CheckCircle2 size={40} className="text-zinc-500 mb-3"/>
                <p className="text-[11px] uppercase tracking-widest font-black text-zinc-400">Không có yêu cầu chờ xử lý</p>
              </div>
            ) : (
              filteredRooms.map(room => (
                <button key={room} onClick={() => setSelectedRoom(room)} className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-300 group ${selectedRoom === room ? "bg-red-600/10 border border-red-500/30 shadow-md" : "bg-[#121215] border border-white/5 hover:border-white/20 hover:bg-white/5"}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${selectedRoom === room ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
                    <User size={18} className={selectedRoom === room ? 'text-white' : 'text-zinc-500 group-hover:text-white'}/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-[13px] font-bold truncate tracking-wide ${selectedRoom === room ? 'text-red-400' : 'text-zinc-200 group-hover:text-white'}`}>{room}</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-black mt-1 flex items-center gap-1"><Clock size={10}/> Đang chờ xử lý</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#0a0a0c] relative">
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner"><MessageSquareDot size={40} className="opacity-50" /></div>
              <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Chọn một phiên chat ở cột trái để bắt đầu</p>
              <p className="text-xs font-medium text-zinc-600 mt-2">Mọi cuộc gọi đều được mã hóa 256-bit.</p>
            </div>
          ) : isCurrentRoomClosed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 animate-in zoom-in-95 fade-in duration-500 bg-[#0a0a0c]">
              <div className="w-32 h-32 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border border-red-600/30 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative">
                <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping"></div>
                <Check size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3 drop-shadow-md">Phiên hỗ trợ đã đóng</h3>
              <p className="text-[13px] font-medium text-zinc-500 mt-1 mb-8 text-center max-w-sm leading-relaxed">
                Mã phòng <span className="text-red-400 font-bold">{selectedRoom}</span> đã được kết thúc bởi khách hàng hoặc do hệ thống tự động đóng.
              </p>
              <button 
                onClick={() => setSelectedRoom(null)} 
                className="px-8 py-3.5 bg-[#121215] hover:bg-white/10 text-white rounded-xl uppercase font-bold text-xs tracking-widest transition-all border border-white/10 hover:border-white/30 shadow-lg transform active:scale-95"
              >
                Quay lại danh sách
              </button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#121215]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                  <div>
                    <h4 className="text-zinc-100 font-black uppercase text-[13px] tracking-widest">Mã phiên: {selectedRoom}</h4>
                    <span className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-wider">Đường truyền bảo mật</span>
                  </div>
                </div>
                <button onClick={handleCloseRoomActive} className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xl text-[11px] font-black text-red-500 uppercase tracking-widest transition-all shadow-sm" title="Kết thúc hỗ trợ">
                  <Power size={14} /> Đóng phiên
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => {
                  if (msg.senderRole === "BOT" || msg.receiverRole === "BOT") return null;
                  const isMe = msg.senderRole === "ADMIN";
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2`}>
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 px-1">{msg.sender}</span>
                      <div className={`max-w-[75%] text-[14px] px-6 py-4 shadow-xl leading-relaxed border ${isMe ? "bg-red-600 border-red-500/50 text-white rounded-2xl rounded-tr-sm" : "bg-[#16161a] border-white/5 text-zinc-200 rounded-2xl rounded-tl-sm"}`}>
                        {msg.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-5 border-t border-white/5 bg-[#060608] flex items-center gap-3">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Nhập câu trả lời cho khách hàng (Hỗ trợ định dạng gửi Text)..." className="flex-1 bg-[#121215] border border-white/10 rounded-xl px-5 py-4 text-[14px] font-medium text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600 shadow-inner" />
                <button type="submit" disabled={!inputValue.trim()} className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.4)] transform active:scale-95"><Send size={20} className="ml-1" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}