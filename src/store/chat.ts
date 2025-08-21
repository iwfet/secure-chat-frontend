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
    setContacts: (contacts: Contact[]) => void;
    setPendingRequests: (requests: Contact[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
    setActiveChat: (userId: string | null) => void;
    addMessage: (userId: string, message: Message) => void;
    clearChatState: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    contacts: [],
    pendingRequests: [],
    onlineUsers: {},
    activeChatUserId: null,
    messages: {},
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
    setActiveChat: (userId) => set({ activeChatUserId: userId }),
    addMessage: (userId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [userId]: [...(state.messages[userId] || []), message],
            },
        })),
    clearChatState: () => set({
        contacts: [],
        pendingRequests: [],
        onlineUsers: {},
        activeChatUserId: null,
        messages: {}
    }),
}));