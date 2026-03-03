import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import userApi from '../apis/api_user';
import chatApi, { MessageDTO, ConversationDTO } from '../apis/api_chat';
import Swal from 'sweetalert2';

// --- INTERFACES ---

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

interface Conversation {
    id: string; // The ID of the person we are chatting with
    participant: User;
    lastMessage: string;
    lastTimestamp: string;
    unreadCount: number;
}

// --- HELPERS ---

const formatTimeShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

const Messages: React.FC = () => {
    const { id: chatId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messageEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileInfo, setShowProfileInfo] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [currentParticipant, setCurrentParticipant] = useState<User | null>(null);

    // Initial load for conversations
    useEffect(() => {
        if (!user) return;
        const loadConv = async () => {
            const data = await chatApi.getConversations(user.id);
            setConversations(data as any);
        };
        loadConv();

        // Chặn cuộn toàn bộ trang
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [user]);

    // Fetch or find conversation participant
    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setCurrentParticipant(null);
            return;
        }

        const fetchParticipantAndMessages = async () => {
            // Check if already in conversations (to avoid duplicates)
            const existingConv = conversations.find(c => c.id === chatId);

            if (existingConv) {
                setCurrentParticipant(existingConv.participant);
                const msgs = await chatApi.getMessages(chatId);
                setMessages(msgs as any);
                // Mark as read locally
                setConversations(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
            } else {
                setLoadingProfile(true);
                try {
                    const userData = await userApi.getById(chatId);
                    if (userData) {
                        const newUser: User = {
                            ...userData,
                            name: userData.fullName || userData.name || userData.username,
                            avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
                            rating: userData.rating || 0,
                            ratingCount: userData.ratingCount || 0,
                            lastSeen: userData.lastSeen || new Date(Date.now() - Math.random() * 1000 * 60 * 10).toISOString() // Giả lập trong khoảng 10p
                        };
                        setCurrentParticipant(newUser);

                        const msgs = await chatApi.getMessages(chatId, user?.id);
                        setMessages(msgs as any);

                        // Add to conversations list ONLY IF NOT PRESENT to prevent duplicates
                        setConversations(prev => {
                            if (prev.some(c => c.id === chatId)) return prev;
                            const newConv = {
                                id: chatId,
                                participant: newUser,
                                lastMessage: '',
                                lastTimestamp: new Date().toISOString(),
                                unreadCount: 0
                            };
                            return [newConv, ...prev];
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch user for chat:", err);
                    Swal.fire('Lỗi', 'Không tìm thấy thông tin người dùng', 'error');
                } finally {
                    setLoadingProfile(false);
                }
            }
        };

        fetchParticipantAndMessages();
        setShowProfileInfo(false);
    }, [chatId]); // We use conversations inside but only reactive to chatId to avoid infinite loops if fetch changes conversations

    // Scroll to bottom
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !chatId || !user) return;

        const messageData = {
            senderId: user.id === 'me' ? 'me' : user.id, // Adaptation for simulation
            receiverId: chatId,
            content: inputText.trim(),
        };

        try {
            const sent = await chatApi.sendMessage(messageData);
            const newMessage: Message = {
                id: sent.id,
                senderId: 'me', // UI always shows 'me' for sender
                content: sent.content,
                timestamp: sent.timestamp,
                isRead: true
            };

            setMessages(prev => [...prev, newMessage]);
            setInputText('');

            // Update conversation preview and move to top
            setConversations(prev => {
                const idx = prev.findIndex(c => c.id === chatId);
                const updated = [...prev];
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        lastMessage: newMessage.content,
                        lastTimestamp: newMessage.timestamp
                    };
                    const item = updated.splice(idx, 1)[0];
                    updated.unshift(item);
                }

                // Persistence simulation
                if (user) {
                    localStorage.setItem(`conversations_${user.id}`, JSON.stringify(updated));
                    const currentMessages = [...messages, newMessage];
                    localStorage.setItem(`messages_${chatId}`, JSON.stringify(currentMessages));
                }

                return updated;
            });
        } catch (err) {
            console.error("Send message failed:", err);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.participant.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border-t border-gray-200">

            {/* LEFT SIDEBAR: Conversations List */}
            <div className={`w-80 md:w-96 flex-shrink-0 border-r border-gray-200 flex flex-col transition-all ${chatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 bg-white border-b border-gray-100">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm trên WorkConnect..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => navigate(`/messages/${conv.id}`)}
                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${chatId === conv.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'border-r-4 border-transparent'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={conv.participant.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" alt="" />
                                {chatApi.getActiveStatus(conv.participant.lastSeen).status === 'online' && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{conv.participant.name}</h4>
                                    <span className="text-[10px] text-gray-400 ml-2">{formatTimeShort(conv.lastTimestamp)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                        {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="text-center py-20 px-6">
                            <i className="far fa-comments text-4xl text-gray-200 mb-3"></i>
                            <p className="text-sm text-gray-400">Không có hội thoại nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN AREA: Chat Window */}
            <div className={`flex-grow flex flex-col relative transition-all ${chatId ? 'flex' : 'hidden md:flex'}`}>
                {currentParticipant ? (
                    <>
                        {/* Header */}
                        <div className="h-16 flex-shrink-0 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/messages')} className="md:hidden text-gray-500 mr-2">
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <img src={currentParticipant.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{currentParticipant.name}</h3>
                                    <p className={`text-[10px] font-medium ${chatApi.getActiveStatus(currentParticipant.lastSeen).status === 'online' ? 'text-green-500' : 'text-gray-400'}`}>
                                        {chatApi.getActiveStatus(currentParticipant.lastSeen).label}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <button className="hover:text-indigo-600 transition-colors"><i className="fas fa-phone-alt"></i></button>
                                <button className="hover:text-indigo-600 transition-colors"><i className="fas fa-video"></i></button>
                                <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => setShowProfileInfo(!showProfileInfo)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${showProfileInfo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Xem thêm
                                </button>
                            </div>
                        </div>

                        {/* Messages Content */}
                        <div className="flex-grow overflow-y-auto p-6 bg-[#f0f2f5] flex flex-col gap-3 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === 'me';
                                const sameAsPrev = idx > 0 && messages[idx - 1].senderId === msg.senderId;

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                        {!isMe && !sameAsPrev && (
                                            <div className="w-8 mr-2 flex-shrink-0 self-end">
                                                <img src={currentParticipant.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                            </div>
                                        )}
                                        <div className={`max-w-[70%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'} ${!isMe && sameAsPrev ? 'ml-10' : ''}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] text-gray-400 mt-1 px-1">
                                                {formatTimeShort(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-5xl mx-auto">
                                <div className="flex gap-2 text-gray-400">
                                    <button type="button" className="hover:text-indigo-600"><i className="far fa-image text-lg"></i></button>
                                    <button type="button" className="hover:text-indigo-600"><i className="fas fa-paperclip text-lg"></i></button>
                                </div>
                                <div className="flex-grow relative">
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        className="w-full py-2.5 pl-4 pr-10 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                                        <i className="far fa-smile text-lg"></i>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputText.trim() ? 'bg-indigo-600 text-white shadow-md hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-300 pointer-events-none'}`}
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>

                        {/* RIGHT SIDE PANEL: Profile Info */}
                        {showProfileInfo && (
                            <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-2xl z-20 animate-in slide-in-from-right duration-300 flex flex-col">
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-sm text-gray-900">Thông tin chi tiết</h3>
                                    <button onClick={() => setShowProfileInfo(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    <div className="text-center">
                                        <img src={currentParticipant.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-50 object-cover shadow-sm" alt="" />
                                        <h4 className="font-bold text-lg text-gray-900">{currentParticipant.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {currentParticipant.role === UserRole.BUSINESS ? 'Nhà tuyển dụng' : 'Người lao động'}
                                        </p>
                                        {currentParticipant.verified && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold mt-3">
                                                <i className="fas fa-check-circle"></i> Tài khoản xác thực
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 space-y-4">
                                        <div>
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Giới thiệu</h5>
                                            <p className="text-xs text-gray-700 leading-relaxed text-justify">
                                                {currentParticipant.bio || currentParticipant.description || 'Chưa có thông tin giới thiệu.'}
                                            </p>
                                        </div>
                                        {currentParticipant.location && (
                                            <div>
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Địa điểm</h5>
                                                <p className="text-xs text-gray-700 flex items-center gap-2"><i className="fas fa-map-marker-alt text-gray-300"></i> {currentParticipant.location}</p>
                                            </div>
                                        )}
                                        {currentParticipant.email && (
                                            <div>
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Liên hệ</h5>
                                                <p className="text-xs text-blue-600 flex items-center gap-2 truncate"><i className="far fa-envelope text-gray-300"></i> {currentParticipant.email}</p>
                                            </div>
                                        )}
                                        {!user?.isPremium && (
                                            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm top-4">
                                                <div className="bg-gray-50 px-3 py-1 text-right">
                                                    <span className="text-[10px] text-gray-400">Quảng cáo <i className="fas fa-info-circle ml-1"></i></span>
                                                </div>
                                                <div className="p-5 text-center">
                                                    <p className="text-xs text-gray-600 mb-4">Nâng cấp lên <b>Premium</b> để thấy ai đã xem hồ sơ của bạn.</p>
                                                    <div className="flex justify-center gap-2 mb-4">
                                                        <img src={currentParticipant.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                                                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl border-2 border-white shadow-md">
                                                            <i className="fas fa-crown"></i>
                                                        </div>
                                                    </div>
                                                    <Link to="/premium" className="block w-full">
                                                        <button className="w-full py-1.5 rounded-full border border-[#4c42bd] text-[#4c42bd] font-bold text-xs hover:bg-blue-50 transition-all">Dùng thử miễn phí</button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => navigate(`/fast-processing/${currentParticipant.id}`)}
                                            className="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            Xem hồ sơ tuyển dụng
                                        </button>
                                        <button className="w-full py-2.5 text-red-500 text-xs font-bold mt-2 hover:bg-red-50 rounded-xl transition-colors">
                                            Chặn người này
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center bg-[#f0f2f5] p-10">
                        <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                            <i className="far fa-comments text-4xl text-gray-200"></i>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Chọn một hội thoại để nhắn tin</h2>
                        <p className="text-sm text-gray-500 max-w-sm">Chào mừng bạn đến với mục tin nhắn của WorkConnect. Hãy bắt đầu kết nối với đối tác của mình.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
