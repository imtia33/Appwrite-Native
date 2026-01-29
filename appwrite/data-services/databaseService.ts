import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';
import { Query } from '@appwrite.io/console';

interface DatabaseState {
    databases: any[];
    backupPolicies: Record<string, any[]>;
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
    createDatabase: (projectId: string, region: string, name: string, databaseId?: string) => Promise<any>;
    updateDatabase: (projectId: string, region: string, databaseId: string, name: string) => Promise<any>;
    deleteDatabase: (projectId: string, region: string, databaseId: string) => Promise<void>;
    fetchBackupPolicies: (projectId: string, region: string, databaseId: string) => Promise<void>;
}

type DatabaseStore = DatabaseState & DatabaseActions;

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
    databases: [],
    backupPolicies: {},
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
            backupPolicies: {},
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
    },

    createDatabase: async (projectId: string, region: string, name: string, databaseId: string = 'unique()') => {
        try {
            const response = await sdk.forProject(region, projectId).tablesDB.create({
                databaseId,
                name
            });
            
            set((state) => ({
                databases: [response, ...state.databases]
            }));
            
            return response;
        } catch (error: any) {
            console.error('Error creating database:', error);
            throw error;
        }
    },

    updateDatabase: async (projectId: string, region: string, databaseId: string, name: string) => {
        try {
            const response = await sdk.forProject(region, projectId).tablesDB.update({
                databaseId,
                name
            });
            
            set((state) => ({
                databases: state.databases.map(db => db.$id === databaseId ? response : db)
            }));
            
            return response;
        } catch (error: any) {
            console.error('Error updating database:', error);
            throw error;
        }
    },

    deleteDatabase: async (projectId: string, region: string, databaseId: string) => {
        try {
            await sdk.forProject(region, projectId).databases.delete(databaseId);
            
            set((state) => ({
                databases: state.databases.filter(db => db.$id !== databaseId)
            }));
        } catch (error: any) {
            console.error('Error deleting database:', error);
            throw error;
        }
    },

    fetchBackupPolicies: async (projectId: string, region: string, databaseId: string) => {
        try {
            const response = await sdk.forProject(region, projectId).backups.listPolicies([
                Query.equal('resourceId', databaseId)
            ]);
            
            // Note: The specific API to list policies for a specific database might depend on queries
            // In Svelte code: .backups.listPolicies(...) usually takes queries.
            
            set((state) => ({
                backupPolicies: {
                    ...state.backupPolicies,
                    [databaseId]: response.policies
                }
            }));
        } catch (error: any) {
            console.error('Error fetching backup policies:', error);
            // Optionally set error in state
        }
    }
}));

export default useDatabaseStore;