import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';

interface FunctionState {
    functions: any[];
    loading: boolean;
    error: string | null;
    currentProjectId: string | null;
}

interface FunctionActions {
    fetchFunctions: (projectId: string) => Promise<void>;
    clearCache: () => void;
    getFunctions: (projectId: string) => any[];
    isLoading: () => boolean;
    getError: () => string | null;
}

type FunctionStore = FunctionState & FunctionActions;

const useFunctionStore = create<FunctionStore>((set, get) => ({
    functions: [],
    loading: false,
    error: null,
    currentProjectId: null,

    fetchFunctions: async (projectId: string) => {
        const state = get();
        
        // Return early if already loading or data exists for same project
        if (state.loading || (state.currentProjectId === projectId && state.functions.length > 0)) {
            return;
        }

        set({
            loading: true,
            error: null
        });

        try {
            const { currentProject } = useProjectStore.getState();
            if (!currentProject) return;

            const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).functions.list();
            
            set({
                functions: response.functions,
                currentProjectId: projectId,
                loading: false
            });
        } catch (error: any) {
            console.error('Error fetching functions:', error);
            set({
                error: error.message,
                loading: false
            });
        }
    },

    clearCache: () => {
        set({
            functions: [],
            loading: false,
            error: null,
            currentProjectId: null
        });
    },

    getFunctions: (projectId: string) => {
        const state = get();
        return state.currentProjectId === projectId ? state.functions : [];
    },

    isLoading: () => {
        return get().loading;
    },

    getError: () => {
        return get().error;
    }
}));

export default useFunctionStore;