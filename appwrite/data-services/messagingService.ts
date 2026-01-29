import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';

interface MessagingState {
    messages: any[];
    providers: any[];
    topics: any[];
    loading: boolean;
    error: string | null;
    currentProjectId: string | null;
}

interface MessagingActions {
    fetchMessages: (projectId: string) => Promise<void>;
    fetchProviders: (projectId: string) => Promise<void>;
    fetchTopics: (projectId: string) => Promise<void>;
    clearCache: () => void;
    getMessages: (projectId: string) => any[];
    getProviders: (projectId: string) => any[];
    getTopics: (projectId: string) => any[];
    isLoading: () => boolean;
    getError: () => string | null;
    deleteMessage: (projectId: string, region: string, messageId: string) => Promise<void>;
    deleteProvider: (projectId: string, region: string, providerId: string) => Promise<void>;
    deleteTopic: (projectId: string, region: string, topicId: string) => Promise<void>;
    createTopic: (projectId: string, region: string, name: string, topicId: string) => Promise<any>;
    updateMessageInState: (messageId: string, updates: Partial<any>) => void;
    createEmailMessage: (projectId: string, region: string, data: any) => Promise<any>;
    createSmsMessage: (projectId: string, region: string, data: any) => Promise<any>;
    createPushMessage: (projectId: string, region: string, data: any) => Promise<any>;
    createProvider: (projectId: string, region: string, type: 'email' | 'sms' | 'push', provider: string, data: any) => Promise<any>;
}

type MessagingStore = MessagingState & MessagingActions;

const useMessagingStore = create<MessagingStore>((set, get) => ({
    messages: [],
    providers: [],
    topics: [],
    loading: false,
    error: null,
    currentProjectId: null,

    fetchMessages: async (projectId: string) => {
        const state = get();
        if (state.loading && state.currentProjectId === projectId) return;

        set({ loading: true, error: null });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).messaging.listMessages({});
            
            set({
                messages: response.messages,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            set({ error: error.message, loading: false });
        }
    },

    fetchProviders: async (projectId: string) => {
        const state = get();
        if (state.loading && state.currentProjectId === projectId) return;

        set({ loading: true, error: null });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).messaging.listProviders({});
            
            set({
                providers: response.providers,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching providers:', error);
            set({ error: error.message, loading: false });
        }
    },

    fetchTopics: async (projectId: string) => {
        const state = get();
        if (state.loading && state.currentProjectId === projectId) return;

        set({ loading: true, error: null });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).messaging.listTopics({});
            
            set({
                topics: response.topics,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching topics:', error);
            set({ error: error.message, loading: false });
        }
    },

    clearCache: () => {
        set({
            messages: [],
            providers: [],
            topics: [],
            loading: false,
            error: null,
            currentProjectId: null
        });
    },

    getMessages: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.messages : [];
    },

    getProviders: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.providers : [];
    },

    getTopics: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.topics : [];
    },

    isLoading: () => get().loading,

    getError: () => get().error,

    deleteMessage: async (projectId: string, region: string, messageId: string) => {
        try {
            await sdk.forProject(region, projectId).messaging.delete({ messageId });
            set((state) => ({
                messages: state.messages.filter(m => m.$id !== messageId)
            }));
        } catch (error: any) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    deleteProvider: async (projectId: string, region: string, providerId: string) => {
        try {
            await sdk.forProject(region, projectId).messaging.deleteProvider({ providerId });
            set((state) => ({
                providers: state.providers.filter(p => p.$id !== providerId)
            }));
        } catch (error: any) {
            console.error('Error deleting provider:', error);
            throw error;
        }
    },

    deleteTopic: async (projectId: string, region: string, topicId: string) => {
        try {
            await sdk.forProject(region, projectId).messaging.deleteTopic({ topicId });
            set((state) => ({
                topics: state.topics.filter(t => t.$id !== topicId)
            }));
        } catch (error: any) {
            console.error('Error deleting topic:', error);
            throw error;
        }
    },

    createTopic: async (projectId: string, region: string, name: string, topicId: string = 'unique()') => {
        try {
            const response = await sdk.forProject(region, projectId).messaging.createTopic({
                topicId,
                name
            });
            
            set((state) => ({
                topics: [response, ...state.topics]
            }));
            
            return response;
        } catch (error: any) {
            console.error('Error creating topic:', error);
            throw error;
        }
    },

    updateMessageInState: (messageId: string, updates: Partial<any>) => {
        set((state) => ({
            messages: state.messages.map(m => m.$id === messageId ? { ...m, ...updates } : m)
        }));
    },

    createEmailMessage: async (projectId: string, region: string, data: any) => {
        try {
            const response = await sdk.forProject(region, projectId).messaging.createEmail(data);
            set((state) => ({ messages: [response, ...state.messages] }));
            return response;
        } catch (error: any) {
            console.error('Error creating email message:', error);
            throw error;
        }
    },

    createSmsMessage: async (projectId: string, region: string, data: any) => {
        try {
            const response = await sdk.forProject(region, projectId).messaging.createSMS(data);
            set((state) => ({ messages: [response, ...state.messages] }));
            return response;
        } catch (error: any) {
            console.error('Error creating SMS message:', error);
            throw error;
        }
    },

    createPushMessage: async (projectId: string, region: string, data: any) => {
        try {
            const response = await sdk.forProject(region, projectId).messaging.createPush(data);
            set((state) => ({ messages: [response, ...state.messages] }));
            return response;
        } catch (error: any) {
            console.error('Error creating push message:', error);
            throw error;
        }
    },

    createProvider: async (projectId: string, region: string, type: string, provider: string, data: any) => {
        try {
            const messaging = sdk.forProject(region, projectId).messaging;
            let response;
            
            // Map provider strings to SDK methods
            let formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
            if (provider.toLowerCase() === 'fcm') formattedProvider = 'FCM';
            if (provider.toLowerCase() === 'apns') formattedProvider = 'APNS';

            const methodName = `create${formattedProvider}Provider`;
            if (typeof (messaging as any)[methodName] === 'function') {
                response = await (messaging as any)[methodName](data);
            } else {
                // Fallback for case sensitivity issues
                const lowerMethodName = methodName.toLowerCase();
                const foundMethod = Object.keys(messaging).find(k => k.toLowerCase() === lowerMethodName);
                if (foundMethod) {
                    response = await (messaging as any)[foundMethod](data);
                } else {
                    throw new Error(`Provider creation method ${methodName} not found`);
                }
            }

            set((state) => ({ providers: [response, ...state.providers] }));
            return response;
        } catch (error: any) {
            console.error('Error creating provider:', error);
            throw error;
        }
    }
}));

export default useMessagingStore;
