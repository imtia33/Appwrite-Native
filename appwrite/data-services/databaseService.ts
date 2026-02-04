import { create } from "zustand";
import { sdk } from "../appwrite";
import { useProjectStore } from "../store/projectStore";
import { Query } from "@appwrite.io/console";

interface DatabaseState {
  databases: any[];
  tables: Record<string, any[]>;
  backupPolicies: Record<string, any[]>;
  documentCache: Record<
    string,
    {
      items: any[];
      hasMore: boolean;
      loading: boolean;
    }
  >;
  loading: boolean;
  error: string | null;
  currentProjectId: string | null;
}

interface DatabaseActions {
  fetchDatabases: (projectId: string) => Promise<void>;
  fetchTables: (
    projectId: string,
    region: string,
    databaseId: string,
    force?: boolean,
  ) => Promise<void>;
  clearCache: () => void;
  getDatabases: (projectId: string) => any[];
  isLoading: () => boolean;
  getError: () => string | null;
  createDatabase: (
    projectId: string,
    region: string,
    name: string,
    databaseId?: string,
    enableBackups?: boolean,
  ) => Promise<any>;
  updateDatabase: (
    projectId: string,
    region: string,
    databaseId: string,
    name: string,
  ) => Promise<any>;
  deleteDatabase: (
    projectId: string,
    region: string,
    databaseId: string,
  ) => Promise<void>;
  fetchBackupPolicies: (
    projectId: string,
    region: string,
    databaseId: string,
  ) => Promise<void>;
  fetchRows: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    options?: {
      queries?: any[];
      isNextPage?: boolean;
      forceRefresh?: boolean;
      limit?: number;
    },
  ) => Promise<any[]>;
  fetchColumns: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => Promise<any[]>;
  fetchIndexes: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => Promise<any[]>;
  fetchTableLogs: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    queries?: any[],
  ) => Promise<any[]>;
  deleteTable: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => Promise<void>;
  createTable: (
    projectId: string,
    region: string,
    databaseId: string,
    name: string,
    tableId?: string,
  ) => Promise<any>;
  createRow: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    data: any,
    permissions?: string[],
    rowId?: string,
  ) => Promise<any>;
  updateRow: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    rowId: string,
    data: any,
    permissions?: string[],
  ) => Promise<any>;
  updateTable: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    name: string,
    permissions: string[],
    documentSecurity: boolean,
    enabled: boolean,
  ) => Promise<any>;
  createAttribute: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    type: string,
    data: any,
  ) => Promise<any>;
  deleteAttribute: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
  ) => Promise<void>;
  createIndex: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
    type: string,
    attributes: string[],
    orders: string[],
    lengths?: number[],
  ) => Promise<any>;
  deleteIndex: (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
  ) => Promise<void>;
}

type DatabaseStore = DatabaseState & DatabaseActions;

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
  databases: [],
  tables: {},
  backupPolicies: {},
  documentCache: {},
  loading: false,
  error: null,
  currentProjectId: null,

  fetchDatabases: async (projectId: string) => {
    const state = get();

    if (state.loading) {
      return;
    }

    if (state.currentProjectId && state.currentProjectId !== projectId) {
      set({
        databases: [],
        tables: {},
        currentProjectId: projectId,
      });
    } else if (
      state.currentProjectId === projectId &&
      state.databases.length > 0
    ) {
      return;
    }

    set({
      loading: true,
      error: null,
    });

    try {
      const { currentProject } = useProjectStore.getState();
      if (!currentProject) return;

      const response = await sdk
        .forProject(currentProject.region || "fra", currentProject.$id)
        .databases.list();

      set({
        databases: response.databases,
        currentProjectId: projectId,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching databases:", error);
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  clearCache: () => {
    set({
      databases: [],
      tables: {},
      backupPolicies: {},
      documentCache: {},
      loading: false,
      error: null,
      currentProjectId: null,
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

  createDatabase: async (
    projectId: string,
    region: string,
    name: string,
    databaseId: string = "unique()",
    enableBackups: boolean = false,
  ) => {
    try {
      const response = await sdk.forProject(region, projectId).tablesDB.create({
        databaseId,
        name,
      });

      if (enableBackups) {
        try {
          await sdk
            .forProject(region, projectId)
            .backups.createPolicy(
              "unique()",
              ["databases"],
              7,
              "0 0 * * *",
              `${name} Backup`,
              response.$id,
              true,
            );
        } catch (backupErr) {
          console.error("Error creating backup policy:", backupErr);
          // Don't fail the whole database creation if backup creation fails
        }
      }

      set((state) => ({
        databases: [response, ...state.databases],
      }));

      return response;
    } catch (error: any) {
      console.error("Error creating database:", error);
      throw error;
    }
  },

  updateDatabase: async (
    projectId: string,
    region: string,
    databaseId: string,
    name: string,
  ) => {
    try {
      const response = await sdk.forProject(region, projectId).tablesDB.update({
        databaseId,
        name,
      });

      set((state) => ({
        databases: state.databases.map((db) =>
          db.$id === databaseId ? response : db,
        ),
      }));

      return response;
    } catch (error: any) {
      console.error("Error updating database:", error);
      throw error;
    }
  },

  deleteDatabase: async (
    projectId: string,
    region: string,
    databaseId: string,
  ) => {
    try {
      await (sdk.forProject(region, projectId).tablesDB as any).delete(
        databaseId,
      );

      set((state) => ({
        databases: state.databases.filter((db) => db.$id !== databaseId),
      }));
    } catch (error: any) {
      console.error("Error deleting database:", error);
      throw error;
    }
  },

  fetchBackupPolicies: async (
    projectId: string,
    region: string,
    databaseId: string,
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .backups.listPolicies([Query.equal("resourceId", databaseId)]);

      set((state) => ({
        backupPolicies: {
          ...state.backupPolicies,
          [databaseId]: response.policies,
        },
      }));
    } catch (error: any) {
      console.error("Error fetching backup policies:", error);
    }
  },

  fetchRows: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    options: {
      queries?: any[];
      isNextPage?: boolean;
      forceRefresh?: boolean;
      limit?: number;
    } = {},
  ) => {
    const {
      queries = [],
      isNextPage = false,
      forceRefresh = false,
      limit = 25,
    } = options;
    const cacheKey = `${databaseId}:${tableId}`;
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
          loading: !isNextPage, // Only set global loading if not fetching more
        },
      },
    }));

    try {
      const finalQueries = [...queries];

      // Default sort: largest sequence first
      const hasOrderQuery = queries.some((q) => q.includes("order"));
      if (!hasOrderQuery) {
        finalQueries.push(Query.orderDesc("$sequence"));
      }

      // Pagination limit
      const hasLimitQuery = queries.some((q) => q.includes("limit"));
      if (!hasLimitQuery) {
        finalQueries.push(Query.limit(limit));
      }

      // Cursor for next page
      if (isNextPage && currentCache?.items?.length > 0) {
        const lastItem = currentCache.items[currentCache.items.length - 1];
        finalQueries.push(Query.cursorAfter(lastItem.$id));
      }

      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).listRows({
        databaseId,
        tableId,
        queries: finalQueries,
      });
      const newDocs = response.rows;

      // Smart hasMore detection
      const hasMore = newDocs.length === limit;

      set((state) => {
        const existingItems = state.documentCache[cacheKey]?.items || [];
        const updatedItems =
          isNextPage && !forceRefresh
            ? [...existingItems, ...newDocs]
            : newDocs;

        return {
          documentCache: {
            ...state.documentCache,
            [cacheKey]: {
              items: updatedItems,
              hasMore,
              loading: false,
            },
          },
        };
      });

      return isNextPage ? get().documentCache[cacheKey]?.items || [] : newDocs;
    } catch (error: any) {
      console.error("Error fetching rows:", error);
      set((state) => ({
        documentCache: {
          ...state.documentCache,
          [cacheKey]: {
            ...(state.documentCache[cacheKey] || { items: [], hasMore: true }),
            loading: false,
          },
        },
      }));
      throw error;
    }
  },

  fetchColumns: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).listColumns({ databaseId, tableId });
      return response.columns;
    } catch (error: any) {
      console.error("Error fetching columns:", error);
      throw error;
    }
  },

  fetchIndexes: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).listIndexes({ databaseId, tableId });
      return response.indexes;
    } catch (error: any) {
      console.error("Error fetching indexes:", error);
      throw error;
    }
  },

  fetchTableLogs: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    queries: any[] = [],
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .tablesDB.listTableLogs({
          databaseId,
          tableId,
          queries,
        });
      return response.logs;
    } catch (error: any) {
      console.error("Error fetching table logs:", error);
      throw error;
    }
  },

  deleteTable: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
  ) => {
    try {
      await (sdk.forProject(region, projectId).tablesDB as any).deleteTable({
        databaseId,
        tableId,
      });
      set((state) => ({
        tables: {
          ...state.tables,
          [databaseId]: (state.tables[databaseId] || []).filter(
            (c) => c.$id !== tableId,
          ),
        },
      }));
    } catch (error: any) {
      console.error("Error deleting table:", error);
      throw error;
    }
  },
  createTable: async (
    projectId: string,
    region: string,
    databaseId: string,
    name: string,
    tableId: string = "unique()",
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).createTable({
        databaseId,
        tableId,
        name,
      });

      set((state) => ({
        tables: {
          ...state.tables,
          [databaseId]: [response, ...(state.tables[databaseId] || [])],
        },
      }));

      return response;
    } catch (error: any) {
      console.error("Error creating table:", error);
      throw error;
    }
  },
  fetchTables: async (
    projectId: string,
    region: string,
    databaseId: string,
    force: boolean = false,
  ) => {
    const state = get();

    // Return early if already have tables for this database and not forcing
    if (!force && state.tables[databaseId]) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).listTables({ databaseId });

      set((state) => ({
        tables: {
          ...state.tables,
          [databaseId]: (response as any).tables,
        },
        loading: false,
      }));
    } catch (error: any) {
      console.error("Error fetching tables:", error);
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  createRow: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    data: any,
    permissions?: string[],
    rowId: string = "unique()",
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).createRow({
        databaseId,
        tableId,
        rowId,
        data,
        permissions,
      });
      return response;
    } catch (error: any) {
      console.error("Error creating row:", error);
      throw error;
    }
  },

  updateRow: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    rowId: string,
    data: any,
    permissions?: string[],
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).updateRow({
        databaseId,
        tableId,
        rowId,
        data,
        permissions,
      });
      return response;
    } catch (error: any) {
      console.error("Error updating row:", error);
      throw error;
    }
  },

  updateTable: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    name: string,
    permissions: string[],
    documentSecurity: boolean,
    enabled: boolean,
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).updateTable({
        databaseId,
        tableId,
        name,
        permissions,
        documentSecurity,
        enabled,
      });

      set((state) => ({
        tables: {
          ...state.tables,
          [databaseId]: (state.tables[databaseId] || []).map((c) =>
            c.$id === tableId ? response : c,
          ),
        },
      }));

      return response;
    } catch (error: any) {
      console.error("Error updating table:", error);
      throw error;
    }
  },

  createAttribute: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    type: string,
    data: any,
  ) => {
    try {
      const tablesDB = sdk.forProject(region, projectId).tablesDB;
      let response;

      const params = {
        databaseId,
        tableId,
        ...data,
      };

      switch (type) {
        case "string":
          response = await (tablesDB as any).createStringColumn(params);
          break;
        case "integer":
          response = await (tablesDB as any).createIntegerColumn(params);
          break;
        case "double":
        case "float":
          response = await (tablesDB as any).createFloatColumn(params);
          break;
        case "boolean":
          response = await (tablesDB as any).createBooleanColumn(params);
          break;
        case "enum":
          response = await (tablesDB as any).createEnumColumn(params);
          break;
        case "datetime":
          response = await (tablesDB as any).createDatetimeColumn(params);
          break;
        case "email":
          response = await (tablesDB as any).createEmailColumn(params);
          break;
        case "url":
          response = await (tablesDB as any).createUrlColumn(params);
          break;
        case "ip":
          response = await (tablesDB as any).createIpColumn(params);
          break;
        case "relationship":
          response = await (tablesDB as any).createRelationshipColumn(params);
          break;
        default:
          throw new Error(`Unsupported attribute type: ${type}`);
      }
      return response;
    } catch (error: any) {
      console.error("Error creating attribute:", error);
      throw error;
    }
  },

  deleteAttribute: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
  ) => {
    try {
      await (sdk.forProject(region, projectId).tablesDB as any).deleteColumn({
        databaseId,
        tableId,
        key,
      });
    } catch (error: any) {
      console.error("Error deleting attribute:", error);
      throw error;
    }
  },

  createIndex: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
    type: string,
    attributes: string[],
    orders: string[],
    lengths?: number[],
  ) => {
    try {
      const response = await (
        sdk.forProject(region, projectId).tablesDB as any
      ).createIndex({
        databaseId,
        tableId,
        key,
        type,
        attributes,
        orders,
        lengths,
      });
      return response;
    } catch (error: any) {
      console.error("Error creating index:", error);
      throw error;
    }
  },
  deleteIndex: async (
    projectId: string,
    region: string,
    databaseId: string,
    tableId: string,
    key: string,
  ) => {
    try {
      await (sdk.forProject(region, projectId).tablesDB as any).deleteIndex({
        databaseId,
        tableId,
        key,
      });
    } catch (error: any) {
      console.error("Error deleting index:", error);
      throw error;
    }
  },
}));

export default useDatabaseStore;
