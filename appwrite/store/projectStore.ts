import { create } from 'zustand';
import { sdk } from '../appwrite';
import { type Models, Query } from '@appwrite.io/console';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Project = Models.Project & {
    region?: string;
    platforms?: any[];
};

interface ProjectState {
    projects: Project[];
    platforms: any[];
    apiKeys: any[];
    devKeys: any[];
    loading: boolean;
    loadingSub: { [key: string]: boolean };
    error: string | null;
    currentProject: Project | null;
    fetchProjects: (orgId: string) => Promise<void>;
    fetchPlatforms: (projectId: string) => Promise<void>;
    fetchApiKeys: (projectId: string) => Promise<void>;
    fetchDevKeys: (projectId: string) => Promise<void>;
    setCurrentProject: (project: Project | null) => void;
    deletePlatform: (projectId: string, platformId: string) => Promise<void>;
    deleteApiKey: (projectId: string, keyId: string) => Promise<void>;
    deleteDevKey: (projectId: string, keyId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    platforms: [],
    apiKeys: [],
    devKeys: [],
    loading: false,
    loadingSub: {},
    error: null,
    currentProject: null,

    fetchProjects: async (orgId: string) => {
        set({ loading: true, error: null });
        try {
            const queries = [
                Query.equal('teamId', orgId),
                Query.or([
                    Query.equal('status', 'active'),
                    Query.isNull('status')
                ]),
                Query.limit(50)
            ];

            const response = await sdk.forConsole.projects.list({
                queries
            });

            const projects = response.projects as Project[];
            // Set 'default' if no region
            for (const project of projects) {
                project.region = project.region || 'default';
            }

            let currentProj = null;
            const savedProjId = await AsyncStorage.getItem('selectedProjectId');
            if (savedProjId) {
                currentProj = projects.find(p => p.$id === savedProjId);
            }

            if (!currentProj && projects.length > 0) {
                currentProj = projects[0];
                await AsyncStorage.setItem('selectedProjectId', currentProj.$id);
            }

            set({
                projects,
                currentProject: currentProj,
                loading: false
            });
        } catch (error: any) {
            console.error('Fetch Projects Error:', error);
            set({
                error: error.message || 'Failed to fetch projects',
                loading: false
            });
        }
    },

    fetchPlatforms: async (projectId: string) => {
        set((state) => ({ loadingSub: { ...state.loadingSub, platforms: true } }));
        try {
            const response: any = await sdk.forConsole.projects.get({ projectId });
            set({ platforms: response.platforms || [] });
        } catch (error) {
            console.error('Fetch Platforms Error:', error);
        } finally {
            set((state) => ({ loadingSub: { ...state.loadingSub, platforms: false } }));
        }
    },

    fetchApiKeys: async (projectId: string) => {
        set((state) => ({ loadingSub: { ...state.loadingSub, apiKeys: true } }));
        try {
            const response: any = await sdk.forConsole.projects.listKeys({ projectId });
            set({ apiKeys: response.keys || [] });
        } catch (error) {
            console.error('Fetch API Keys Error:', error);
        } finally {
            set((state) => ({ loadingSub: { ...state.loadingSub, apiKeys: false } }));
        }
    },

    fetchDevKeys: async (projectId: string) => {
        set((state) => ({ loadingSub: { ...state.loadingSub, devKeys: true } }));
        try {
            const response: any = await sdk.forConsole.projects.listDevKeys({ projectId });
            set({ devKeys: response.devKeys || [] });
        } catch (error) {
            console.error('Fetch Dev Keys Error:', error);
        } finally {
            set((state) => ({ loadingSub: { ...state.loadingSub, devKeys: false } }));
        }
    },

    setCurrentProject: async (project) => {
        if (project) {
            await AsyncStorage.setItem('selectedProjectId', project.$id);
        } else {
            await AsyncStorage.removeItem('selectedProjectId');
        }
        set({ currentProject: project, platforms: [], apiKeys: [], devKeys: [] });
    },

    deletePlatform: async (projectId: string, platformId: string) => {
        try {
            await sdk.forConsole.projects.deletePlatform({ projectId, platformId });
            set((state) => ({ platforms: state.platforms.filter((p) => p.$id !== platformId) }));
        } catch (error) {
            console.error('Delete Platform Error:', error);
            throw error;
        }
    },

    deleteApiKey: async (projectId: string, keyId: string) => {
        try {
            await sdk.forConsole.projects.deleteKey({ projectId, keyId });
            set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.$id !== keyId) }));
        } catch (error) {
            console.error('Delete API Key Error:', error);
            throw error;
        }
    },

    deleteDevKey: async (projectId: string, keyId: string) => {
        try {
            await sdk.forConsole.projects.deleteDevKey({ projectId, keyId });
            set((state) => ({ devKeys: state.devKeys.filter((k) => k.$id !== keyId) }));
        } catch (error) {
            console.error('Delete Dev Key Error:', error);
            throw error;
        }
    },
}));
