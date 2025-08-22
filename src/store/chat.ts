import { create } from 'zustand';

export interface Contact {
    id: string;
    requester: { id: string; username: string };
    addressee: { id: string; username: string };
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
}

export interface OnlineUser {
    userId: string;
    publicKey: string;
    socketId: string;
}

export interface Message {
    id: string;
    content: string;
    isMine: boolean;
    timestamp: string;
}

interface ChatState {
    contacts: Contact[];
    pendingRequests: Contact[];
    onlineUsers: Record<string, OnlineUser>;
    activeChatUserId: string | null;
    messages: Record<string, Message[]>;
    unreadCount: Record<string, number>;
    setContacts: (contacts: Contact[]) => void;
    setPendingRequests: (requests: Contact[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
    setActiveChat: (userId: string | null) => void;
    addMessage: (userId: string, message: Message) => void;
    incrementUnreadCount: (userId: string) => void;
    clearChatState: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    contacts: [],
    pendingRequests: [],
    onlineUsers: {},
    activeChatUserId: null,
    messages: {},
    unreadCount: {},
    setContacts: (contacts) => set({ contacts }),
    setPendingRequests: (requests) => set({ pendingRequests: requests }),
    addOnlineUser: (user) =>
        set((state) => ({
            onlineUsers: { ...state.onlineUsers, [user.userId]: user },
        })),
    removeOnlineUser: (userId) =>
        set((state) => {
            const newOnlineUsers = { ...state.onlineUsers };
            delete newOnlineUsers[userId];
            return { onlineUsers: newOnlineUsers };
        }),
    setActiveChat: (userId) =>
        set((state) => {
            const newUnreadCount = { ...state.unreadCount };
            if (userId) {
                delete newUnreadCount[userId];
            }
            return { activeChatUserId: userId, unreadCount: newUnreadCount };
        }),
    addMessage: (userId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [userId]: [...(state.messages[userId] || []), message],
            },
        })),
    incrementUnreadCount: (userId) =>
        set((state) => ({
            unreadCount: {
                ...state.unreadCount,
                [userId]: (state.unreadCount[userId] || 0) + 1,
            },
        })),
    clearChatState: () =>
        set({
            contacts: [],
            pendingRequests: [],
            onlineUsers: {},
            activeChatUserId: null,
            messages: {},
            unreadCount: {},
        }),
}));