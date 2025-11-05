// chatStore.ts

export interface Message {
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: number;
    invoiceId?: string;
}

type ChatHistory = Record<string, Message[]>;

const CHAT_STORAGE_KEY = 'app_chat_history_v1';

// Helper to create a consistent key for a conversation between two users
export const getChatKey = (userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('--');
};

// Load all chat histories from localStorage
export const loadMessages = (): ChatHistory => {
    try {
        const historyJson = localStorage.getItem(CHAT_STORAGE_KEY);
        return historyJson ? JSON.parse(historyJson) : {};
    } catch (e) {
        console.error("Failed to load chat history:", e);
        return {};
    }
};

// Save all chat histories to localStorage
const saveMessages = (allMessages: ChatHistory): void => {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allMessages));
    } catch (e) {
        console.error("Failed to save chat history:", e);
    }
};

// Add a new message to a specific conversation and save it
export const addMessage = (senderId: string, receiverId: string, content: { text?: string; imageUrl?: string; invoiceId?: string }): void => {
    if (!content.text && !content.imageUrl) {
        console.error("Attempted to send an empty message.");
        return;
    }
    
    const allMessages = loadMessages();
    const chatKey = getChatKey(senderId, receiverId);
    
    const newMessage: Message = {
        senderId,
        ...content,
        timestamp: Date.now(),
    };

    const currentConversation = allMessages[chatKey] || [];
    currentConversation.push(newMessage);

    allMessages[chatKey] = currentConversation;
    saveMessages(allMessages);
};