import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';

interface DatabaseState {
    databases: any[];
    loading: boolean;
    error: string | null;
    currentProjectId: string | null;
}

interface DatabaseActions {
    fetchDatabases: (projectId: string) => Promise<void>;
    clearCache: () => void;
    getDatabases: (projectId: string) => any[];
    isLoading: () => boolean;
    getError: () => string | null;
}

type DatabaseStore = DatabaseState & DatabaseActions;

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
    databases: [],
    loading: false,
    error: null,
    currentProjectId: null,

    fetchDatabases: async (projectId: string) => {
        const state = get();
        
        // Return early if already loading or data exists for same project
        if (state.loading || (state.currentProjectId === projectId && state.databases.length > 0)) {
            return;
        }

        set({
            loading: true,
            error: null
        });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).databases.list();
            
            set({
                databases: response.databases,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching databases:', error);
            set({
                error: error.message,
                loading: false
            });
        }
    },

    clearCache: () => {
        set({
            databases: [],
            loading: false,
            error: null,
            currentProjectId: null
        });
    },

    getDatabases: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.databases : [];
    },

    isLoading: () => {
        return get().loading;
    },

    getError: () => {
        return get().error;
    }
}));

export default useDatabaseStore;