import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';

interface SitesState {
    sites: any[];
    loading: boolean;
    error: string | null;
    currentProjectId: string | null;
}

interface SitesActions {
    fetchSites: (projectId: string) => Promise<void>;
    clearCache: () => void;
    getSites: (projectId: string) => any[];
    isLoading: () => boolean;
    getError: () => string | null;
    deleteSite: (projectId: string, region: string, siteId: string) => Promise<void>;
}

type SitesStore = SitesState & SitesActions;

const useSitesStore = create<SitesStore>((set, get) => ({
    sites: [],
    loading: false,
    error: null,
    currentProjectId: null,

    fetchSites: async (projectId: string) => {
        const state = get();
        if (state.loading && state.currentProjectId === projectId) return;

        set({ loading: true, error: null });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            // Using the sites service from sdk.forProject
            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).sites.list({});
            
            set({
                sites: response.sites,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching sites:', error);
            set({ error: error.message, loading: false });
        }
    },

    clearCache: () => {
        set({
            sites: [],
            loading: false,
            error: null,
            currentProjectId: null
        });
    },

    getSites: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.sites : [];
    },

    isLoading: () => get().loading,

    getError: () => get().error,

    deleteSite: async (projectId: string, region: string, siteId: string) => {
        try {
            await sdk.forProject(region, projectId).sites.delete({ siteId });
            set((state) => ({
                sites: state.sites.filter(s => s.$id !== siteId)
            }));
        } catch (error: any) {
            console.error('Error deleting site:', error);
            throw error;
        }
    },
}));

export default useSitesStore;
