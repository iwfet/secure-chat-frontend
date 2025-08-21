import { create } from 'zustand';



export interface Message {
    id: string;
    content: string;
    isMine: boolean;
    timestamp: string;
}


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

export interface ChatState {
    contacts: Contact[];
    pendingRequests: Contact[];
    onlineUsers: Record<string, OnlineUser>; // Um objeto para acesso rápido: { userId: { publicKey: '...' } }
    setContacts: (contacts: Contact[]) => void;
    setPendingRequests: (requests: Contact[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
    clearChatState: () => void;
    activeChatUserId: string | null;
    messages: Record<string, Message[]>; // Ex: { 'userId123': [msg1, msg2], 'userId456': [msg3] }
    setActiveChat: (userId: string | null) => void;
    addMessage: (userId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    contacts: [],
    pendingRequests: [],
    onlineUsers: {},
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
    activeChatUserId: null,
    messages: {},
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