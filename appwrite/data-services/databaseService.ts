import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useProjectStore } from '../store/projectStore';
import { Query } from '@appwrite.io/console';

interface DatabaseState {
    databases: any[];
    collections: Record<string, any[]>;
    backupPolicies: Record<string, any[]>;
    documentCache: Record<string, {
        items: any[];
        hasMore: boolean;
        loading: boolean;
    }>;
    loading: boolean;
    error: string | null;
    currentProjectId: string | null;
}

interface DatabaseActions {
    fetchDatabases: (projectId: string) => Promise<void>;
    fetchCollections: (projectId: string, region: string, databaseId: string) => Promise<void>;
    clearCache: () => void;
    getDatabases: (projectId: string) => any[];
    isLoading: () => boolean;
    getError: () => string | null;
    createDatabase: (projectId: string, region: string, name: string, databaseId?: string) => Promise<any>;
    updateDatabase: (projectId: string, region: string, databaseId: string, name: string) => Promise<any>;
    deleteDatabase: (projectId: string, region: string, databaseId: string) => Promise<void>;
    fetchBackupPolicies: (projectId: string, region: string, databaseId: string) => Promise<void>;
    fetchDocuments: (projectId: string, region: string, databaseId: string, collectionId: string, options?: { queries?: any[], isNextPage?: boolean, forceRefresh?: boolean, limit?: number }) => Promise<any[]>;
    fetchAttributes: (projectId: string, region: string, databaseId: string, collectionId: string) => Promise<any[]>;
    fetchIndexes: (projectId: string, region: string, databaseId: string, collectionId: string) => Promise<any[]>;
    fetchTableLogs: (projectId: string, region: string, databaseId: string, tableId: string, queries?: any[]) => Promise<any[]>;
    deleteCollection: (projectId: string, region: string, databaseId: string, collectionId: string) => Promise<void>;
    createDocument: (projectId: string, region: string, databaseId: string, collectionId: string, data: any, permissions?: string[], documentId?: string) => Promise<any>;
    updateDocument: (projectId: string, region: string, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: string[]) => Promise<any>;
    updateCollection: (projectId: string, region: string, databaseId: string, collectionId: string, name: string, permissions: string[], documentSecurity: boolean, enabled: boolean) => Promise<any>;
    createAttribute: (projectId: string, region: string, databaseId: string, collectionId: string, type: string, data: any) => Promise<any>;
    deleteAttribute: (projectId: string, region: string, databaseId: string, collectionId: string, key: string) => Promise<void>;
    createIndex: (projectId: string, region: string, databaseId: string, collectionId: string, key: string, type: string, attributes: string[], orders: string[]) => Promise<any>;
    deleteIndex: (projectId: string, region: string, databaseId: string, collectionId: string, key: string) => Promise<void>;
}

type DatabaseStore = DatabaseState & DatabaseActions;

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
    databases: [],
    collections: {},
    backupPolicies: {},
    documentCache: {},
    loading: false,
    error: null,
    currentProjectId: null,

    fetchDatabases: async (projectId: string) => {
        const state = get();
        
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

    fetchCollections: async (projectId: string, region: string, databaseId: string) => {
        const state = get();
        
        // Return early if already have collections for this database
        if (state.collections[databaseId]) {
            return;
        }

        set({ loading: true, error: null });

        try {
            const response = await sdk.forProject(region, projectId).databases.listCollections(databaseId);
            
            set((state) => ({
                collections: {
                    ...state.collections,
                    [databaseId]: response.collections
                },
                loading: false
            }));
        } catch (error: any) {
            console.error('Error fetching collections:', error);
            set({
                error: error.message,
                loading: false
            });
        }
    },

    clearCache: () => {
        set({
            databases: [],
            collections: {},
            backupPolicies: {},
            documentCache: {},
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
            
            set((state) => ({
                backupPolicies: {
                    ...state.backupPolicies,
                    [databaseId]: response.policies
                }
            }));
        } catch (error: any) {
            console.error('Error fetching backup policies:', error);
        }
    },

    fetchDocuments: async (projectId: string, region: string, databaseId: string, collectionId: string, options: { queries?: any[], isNextPage?: boolean, forceRefresh?: boolean, limit?: number } = {}) => {
        const { queries = [], isNextPage = false, forceRefresh = false, limit = 25 } = options;
        const cacheKey = `${databaseId}:${collectionId}`;
        const state = get();
        const currentCache = state.documentCache[cacheKey];

        // If not force refresh and not next page, and we have data, return cached data
        if (!forceRefresh && !isNextPage && currentCache?.items?.length > 0) {
            return currentCache.items;
        }

        // If trying to fetch next page but we know there's no more, return current items
        if (isNextPage && currentCache && !currentCache.hasMore) {
            return currentCache.items;
        }


        set((state) => ({
            documentCache: {
                ...state.documentCache,
                [cacheKey]: {
                    ...(state.documentCache[cacheKey] || { items: [], hasMore: true }),
                    loading: !isNextPage // Only set global loading if not fetching more
                }
            }
        }));

        try {
            const finalQueries = [...queries];
            
            // Default sort: largest sequence first
            const hasOrderQuery = queries.some(q => q.includes('order'));
            if (!hasOrderQuery) {
                finalQueries.push(Query.orderDesc('$sequence'));
            }

            // Pagination limit
            const hasLimitQuery = queries.some(q => q.includes('limit'));
            if (!hasLimitQuery) {
                finalQueries.push(Query.limit(limit));
            }

            // Cursor for next page
            if (isNextPage && currentCache?.items?.length > 0) {
                const lastItem = currentCache.items[currentCache.items.length - 1];
                finalQueries.push(Query.cursorAfter(lastItem.$id));
            }

            const response = await sdk.forProject(region, projectId).databases.listDocuments(databaseId, collectionId, finalQueries);
            const newDocs = response.documents;
            
            // Smart hasMore detection
            const hasMore = newDocs.length === limit;

            set((state) => {
                const existingItems = state.documentCache[cacheKey]?.items || [];
                const updatedItems = (isNextPage && !forceRefresh) 
                    ? [...existingItems, ...newDocs] 
                    : newDocs;

                return {
                    documentCache: {
                        ...state.documentCache,
                        [cacheKey]: {
                            items: updatedItems,
                            hasMore,
                            loading: false
                        }
                    }
                };
            });

            return isNextPage ? (get().documentCache[cacheKey]?.items || []) : newDocs;
        } catch (error: any) {
            console.error('Error fetching documents:', error);
            set((state) => ({
                documentCache: {
                    ...state.documentCache,
                    [cacheKey]: {
                        ...(state.documentCache[cacheKey] || { items: [], hasMore: true }),
                        loading: false
                    }
                }
            }));
            throw error;
        }
    },

    fetchAttributes: async (projectId: string, region: string, databaseId: string, collectionId: string) => {
        try {
            const response = await sdk.forProject(region, projectId).databases.listAttributes(databaseId, collectionId);
            return response.attributes;
        } catch (error: any) {
            console.error('Error fetching attributes:', error);
            throw error;
        }
    },

    fetchIndexes: async (projectId: string, region: string, databaseId: string, collectionId: string) => {
        try {
            const response = await sdk.forProject(region, projectId).databases.listIndexes(databaseId, collectionId);
            return response.indexes;
        } catch (error: any) {
            console.error('Error fetching indexes:', error);
            throw error;
        }
    },

    fetchTableLogs: async (projectId: string, region: string, databaseId: string, tableId: string, queries: any[] = []) => {
        try {
            const response = await sdk.forProject(region, projectId).tablesDB.listTableLogs({
                databaseId,
                tableId,
                queries
            });
            return response.logs;
        } catch (error: any) {
            console.error('Error fetching table logs:', error);
            throw error;
        }
    },

    deleteCollection: async (projectId: string, region: string, databaseId: string, collectionId: string) => {
        try {
            await sdk.forProject(region, projectId).databases.deleteCollection(databaseId, collectionId);
            set((state) => ({
                collections: {
                    ...state.collections,
                    [databaseId]: (state.collections[databaseId] || []).filter(c => c.$id !== collectionId)
                }
            }));
        } catch (error: any) {
            console.error('Error deleting collection:', error);
            throw error;
        }
    },

    createDocument: async (projectId: string, region: string, databaseId: string, collectionId: string, data: any, permissions?: string[], documentId: string = 'unique()') => {
        try {
            const response = await sdk.forProject(region, projectId).databases.createDocument(databaseId, collectionId, documentId, data, permissions);
            return response;
        } catch (error: any) {
            console.error('Error creating document:', error);
            throw error;
        }
    },

    updateDocument: async (projectId: string, region: string, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: string[]) => {
        try {
            const response = await sdk.forProject(region, projectId).databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
            return response;
        } catch (error: any) {
            console.error('Error updating document:', error);
            throw error;
        }
    },

    updateCollection: async (projectId: string, region: string, databaseId: string, collectionId: string, name: string, permissions: string[], documentSecurity: boolean, enabled: boolean) => {
        try {
            const response = await sdk.forProject(region, projectId).databases.updateCollection(databaseId, collectionId, name, permissions, documentSecurity, enabled);
            
            set((state) => ({
                collections: {
                    ...state.collections,
                    [databaseId]: (state.collections[databaseId] || []).map(c => c.$id === collectionId ? response : c)
                }
            }));
            
            return response;
        } catch (error: any) {
            console.error('Error updating collection:', error);
            throw error;
        }
    },

    createAttribute: async (projectId: string, region: string, databaseId: string, collectionId: string, type: string, data: any) => {
        try {
            const tablesDB = sdk.forProject(region, projectId).tablesDB;
            let response;

            const params = {
                databaseId,
                tableId: collectionId,
                ...data
            };

            switch (type) {
                case 'string':
                    response = await (tablesDB as any).createStringColumn(params);
                    break;
                case 'integer':
                    response = await (tablesDB as any).createIntegerColumn(params);
                    break;
                case 'double':
                case 'float':
                    response = await (tablesDB as any).createFloatColumn(params);
                    break;
                case 'boolean':
                    response = await (tablesDB as any).createBooleanColumn(params);
                    break;
                case 'enum':
                    response = await (tablesDB as any).createEnumColumn(params);
                    break;
                case 'datetime':
                    response = await (tablesDB as any).createDatetimeColumn(params);
                    break;
                case 'email':
                    response = await (tablesDB as any).createEmailColumn(params);
                    break;
                case 'url':
                    response = await (tablesDB as any).createUrlColumn(params);
                    break;
                case 'ip':
                    response = await (tablesDB as any).createIpColumn(params);
                    break;
                case 'relationship':
                    response = await (tablesDB as any).createRelationshipColumn(params);
                    break;
                default:
                    throw new Error(`Unsupported attribute type: ${type}`);
            }
            return response;
        } catch (error: any) {
            console.error('Error creating attribute:', error);
            throw error;
        }
    },

    deleteAttribute: async (projectId: string, region: string, databaseId: string, collectionId: string, key: string) => {
        try {
            await (sdk.forProject(region, projectId).tablesDB as any).deleteColumn({
                databaseId,
                tableId: collectionId,
                key
            });
        } catch (error: any) {
            console.error('Error deleting attribute:', error);
            throw error;
        }
    },

    createIndex: async (projectId: string, region: string, databaseId: string, collectionId: string, key: string, type: string, attributes: string[], orders: string[]) => {
        try {
            const response = await (sdk.forProject(region, projectId).tablesDB as any).createIndex({
                databaseId,
                tableId: collectionId,
                key,
                type,
                attributes,
                orders
            });
            return response;
        } catch (error: any) {
            console.error('Error creating index:', error);
            throw error;
        }
    },

    deleteIndex: async (projectId: string, region: string, databaseId: string, collectionId: string, key: string) => {
        try {
            await (sdk.forProject(region, projectId).tablesDB as any).deleteIndex({
                databaseId,
                tableId: collectionId,
                key
            });
        } catch (error: any) {
            console.error('Error deleting index:', error);
            throw error;
        }
    }
}));

export default useDatabaseStore;