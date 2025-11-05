import React, { useState, useEffect, useRef } from 'react';
import { User, OPERATIONAL_ROLE_NAMES, PrintRequest } from '../userStore';
import { PageState } from '../App';
import { PhoneIcon } from './icons/PhoneIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { useToast } from './Toast';
import { DocumentPlusIcon } from './icons/DocumentPlusIcon';
import { getChatKey, loadMessages, addMessage, Message } from '../chatStore';


interface CommunityPageProps {
    currentUser: User | null;
    users: User[];
    navigateTo: (state: PageState) => void;
    initialSelectedUserId?: string;
    requests: PrintRequest[];
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5 p-2">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-blink" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const CallModal: React.FC<{ user: User; type: 'audio' | 'video'; onClose: () => void }> = ({ user, type, onClose }) => {
    const { showToast } = useToast();
    useEffect(() => {
        const timer = setTimeout(() => {
            showToast(`Cuộc gọi với ${user.fullName} đã kết thúc.`, 'info');
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [user, onClose, showToast]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-zinc-800 text-white p-8 rounded-lg text-center">
                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName.replace(/\s/g, '+')}&background=random`} alt={user.fullName} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-zinc-600"/>
                <p className="font-semibold text-xl">Đang gọi {type === 'video' ? 'video' : ''} cho</p>
                <p className="text-2xl font-bold mb-6">{user.fullName}</p>
                <div className="animate-pulse text-sm text-zinc-400 mb-8">...kết nối...</div>
                <button onClick={onClose} className="px-8 py-3 bg-red-600 font-semibold rounded-full hover:bg-red-700">Kết thúc</button>
            </div>
        </div>
    );
};

export const CommunityPage: React.FC<CommunityPageProps> = ({ currentUser, users, navigateTo, initialSelectedUserId, requests }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState<Record<string, Message[]>>(() => loadMessages());
    const [userInput, setUserInput] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [callState, setCallState] = useState<{ user: User, type: 'audio' | 'video' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    if (!currentUser) {
        return <div className="p-8 text-center">Vui lòng đăng nhập để sử dụng tính năng này.</div>;
    }
    
    const isPaymentScreen = currentUser.username === 'manhinhthanhtoan';
    
    // Poll for new messages from other tabs/components
    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(loadMessages());
        }, 1000); // Check for new messages every second
        return () => clearInterval(interval);
    }, []);

    // Set the initial user if provided
    useEffect(() => {
        if (initialSelectedUserId) {
            const userToSelect = users.find(u => u.id === initialSelectedUserId);
            if (userToSelect) {
                setSelectedUser(userToSelect);
            }
        } else if (isPaymentScreen) {
            // Default to selecting the admin for the payment screen
            const adminUser = users.find(u => u.purchasedPlans.includes('admin'));
            if(adminUser) setSelectedUser(adminUser);
        }
    }, [initialSelectedUserId, users, isPaymentScreen]);

    const otherUsers = users.filter(u => u.id !== currentUser.id && (isPaymentScreen ? u.purchasedPlans.includes('admin') : true) );
    const filteredUsers = otherUsers.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSendMessage = (text: string) => {
        if (!selectedUser) return;
        
        addMessage(currentUser.id, selectedUser.id, { text });
        setMessages(loadMessages()); // Update UI immediately
        setUserInput('');
        setIsReplying(true);

        // Simulate a reply
        setTimeout(() => {
            const replyText = `Chào bạn, tôi đã nhận được tin nhắn của bạn. Tôi sẽ phản hồi sớm nhất có thể.`;
            addMessage(selectedUser.id, currentUser.id, { text: replyText });
            setMessages(loadMessages());
            setIsReplying(false);
        }, 2000);
    };

    const handleSendInvoice = () => {
        if (!selectedUser) return;
        const invoiceId = `HD${Math.floor(1000 + Math.random() * 9000)}`;
        const amount = `${Math.floor(50 + Math.random() * 500)}.000đ`;
        const invoiceText = `[Gửi hóa đơn] Mã: ${invoiceId} | Số tiền: ${amount}. Vui lòng kiểm tra và thanh toán.`;
        handleSendMessage(invoiceText);
        showToast('Đã gửi hóa đơn trong tin nhắn.', 'success');
    };

    // Scroll to top when a new user is selected
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
        }
    }, [selectedUser]);

    // Scroll to bottom for new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isReplying]);
    
    return (
        <div className="container mx-auto h-full p-4">
            {callState && <CallModal user={callState.user} type={callState.type} onClose={() => setCallState(null)} />}
            <div className="flex h-full border rounded-lg bg-white dark:bg-zinc-800 shadow-md">
                {/* User List */}
                <aside className="w-full md:w-1/3 border-r dark:border-zinc-700 flex flex-col">
                    <div className="p-4 border-b dark:border-zinc-700">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thành viên..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-slate-100 dark:bg-zinc-700 rounded-lg text-sm text-slate-800 dark:text-zinc-200"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <button key={user.id} onClick={() => setSelectedUser(user)} className={`w-full text-left p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-zinc-700 ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}>
                                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName.replace(/\s/g, '+')}&background=random`} alt={user.fullName} className="w-10 h-10 rounded-full"/>
                                <div>
                                    <p className="font-semibold">{user.fullName}</p>
                                    {user.operationalRole && <p className="text-xs text-slate-500">{OPERATIONAL_ROLE_NAMES[user.operationalRole]}</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Chat Window */}
                <main className="hidden md:flex w-2/3 flex-col">
                    {selectedUser ? (
                        <>
                            <header className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${selectedUser.fullName.replace(/\s/g, '+')}&background=random`} alt={selectedUser.fullName} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-bold">{selectedUser.fullName}</p>
                                        <p className="text-xs text-green-500">Đang hoạt động</p>
                                    </div>
                                </div>
                                {!isPaymentScreen && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCallState({ user: selectedUser, type: 'audio' })} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><PhoneIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setCallState({ user: selectedUser, type: 'video' })} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><VideoCameraIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </header>
                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                {(() => {
                                    const chatKey = getChatKey(currentUser.id, selectedUser.id);
                                    const conversation = messages[chatKey] || [];
                                    const displayConversation = isPaymentScreen ? [...conversation].reverse() : conversation;
                                    
                                    return displayConversation.map((msg, index) => {
                                        let isPaid = false;
                                        if (isPaymentScreen && msg.invoiceId) {
                                            const request = requests.find(r => r.id === msg.invoiceId);
                                            if (request && request.paymentStatus === 'paid') {
                                                isPaid = true;
                                            }
                                        }

                                        return (
                                            <div key={index} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : ''}`}>
                                                <div className={`relative p-3 rounded-lg max-w-[80%] ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-700'} ${isPaid ? 'opacity-20' : ''}`}>
                                                    {msg.text && <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                                                    {msg.imageUrl && (
                                                        <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={msg.imageUrl} alt="Sent" className="max-w-xs max-h-64 rounded-md" />
                                                        </a>
                                                    )}
                                                     {isPaid && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                                                            <span className="text-xl font-black text-green-600 bg-white/80 px-4 py-2 rounded-lg transform -rotate-12 shadow-lg border-2 border-green-500">
                                                                ĐÃ THANH TOÁN
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {isReplying && <div className="flex"><div className="bg-slate-100 dark:bg-zinc-700 p-3 rounded-lg"><TypingIndicator /></div></div>}
                                <div ref={messagesEndRef} />
                            </div>
                            {!isPaymentScreen && (
                                <footer className="p-4 border-t dark:border-zinc-700">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="flex items-center gap-2">
                                        {currentUser.operationalRole && <button type="button" onClick={handleSendInvoice} title="Gửi hóa đơn" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><DocumentPlusIcon className="w-6 h-6"/></button>}
                                        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 w-full p-2 bg-slate-100 dark:bg-zinc-700 rounded-lg text-sm text-slate-800 dark:text-zinc-200"/>
                                        <button type="submit" disabled={!userInput.trim() || isReplying} className="p-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300"><PaperAirplaneIcon className="w-5 h-5"/></button>
                                    </form>
                                </footer>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-slate-500">
                            <p>Chọn một thành viên để bắt đầu trò chuyện.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CommunityPage;