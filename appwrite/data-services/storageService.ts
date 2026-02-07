import { create } from "zustand";
import { sdk } from "../appwrite";
import { useProjectStore } from "../store/projectStore";
import { Query } from "@appwrite.io/console";

interface BucketState {
  buckets: any[];
  loading: boolean;
  error: string | null;
  currentProjectId: string | null;
}

interface BucketActions {
  fetchBuckets: (projectId: string) => Promise<void>;
  clearCache: () => void;
  getBuckets: (projectId: string) => any[];
  isLoading: () => boolean;
  getError: () => string | null;
  createBucket: (
    projectId: string,
    region: string,
    name: string,
    bucketId?: string,
  ) => Promise<any>;
  updateBucket: (
    projectId: string,
    region: string,
    bucketId: string,
    name: string,
  ) => Promise<any>;
  deleteBucket: (
    projectId: string,
    region: string,
    bucketId: string,
  ) => Promise<void>;
  createFile: (
    projectId: string,
    region: string,
    bucketId: string,
    file: any,
    fileId?: string,
    permissions?: string[],
  ) => Promise<any>;
  createConsoleFile: (
    region: string,
    bucketId: string,
    file: any,
    fileId?: string,
    permissions?: string[],
  ) => Promise<any>;
}

type BucketStore = BucketState & BucketActions;

const useBucketStore = create<BucketStore>((set, get) => ({
  buckets: [],
  loading: false,
  error: null,
  currentProjectId: null,

  fetchBuckets: async (projectId: string) => {
    const state = get();

    // Return early if already loading or data exists for same project
    if (
      state.loading ||
      (state.currentProjectId === projectId && state.buckets.length > 0)
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
        .storage.listBuckets();

      set({
        buckets: response.buckets,
        currentProjectId: projectId,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching buckets:", error);
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  clearCache: () => {
    set({
      buckets: [],
      loading: false,
      error: null,
      currentProjectId: null,
    });
  },

  getBuckets: (projectId: string) => {
    const state = get();
    return state.currentProjectId === projectId ? state.buckets : [];
  },

  isLoading: () => {
    return get().loading;
  },

  getError: () => {
    return get().error;
  },

  createBucket: async (
    projectId: string,
    region: string,
    name: string,
    bucketId: string = "unique()",
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .storage.createBucket(
          bucketId,
          name,
          ["role:all"], // default permissions or handle properly
          false, // fileSecurity
          true, // enabled
          undefined, // maximumFileSize
          undefined, // allowedFileExtensions
          undefined, // compression
          true, // encryption
          true, // antivirus
        );

      set((state) => ({
        buckets: [response, ...state.buckets],
      }));

      return response;
    } catch (error: any) {
      console.error("Error creating bucket:", error);
      throw error;
    }
  },

  updateBucket: async (
    projectId: string,
    region: string,
    bucketId: string,
    name: string,
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .storage.updateBucket(bucketId, name);

      set((state) => ({
        buckets: state.buckets.map((b) => (b.$id === bucketId ? response : b)),
      }));

      return response;
    } catch (error: any) {
      console.error("Error updating bucket:", error);
      throw error;
    }
  },

  deleteBucket: async (projectId: string, region: string, bucketId: string) => {
    try {
      await sdk.forProject(region, projectId).storage.deleteBucket(bucketId);

      set((state) => ({
        buckets: state.buckets.filter((b) => b.$id !== bucketId),
      }));
    } catch (error: any) {
      console.error("Error deleting bucket:", error);
      throw error;
    }
  },

  createFile: async (
    projectId: string,
    region: string,
    bucketId: string,
    file: any,
    fileId: string = "unique()",
    permissions?: string[],
  ) => {
    try {
      // For React Native, Appwrite SDK expects an instance of File (Satisfied by our global polyfill)
      const parts = [{ uri: file.uri, size: file.size }] as any;
      const fileData = new File(parts, file.name, {
        type: file.type || "application/octet-stream",
      });

      const response = await sdk
        .forProject(region, projectId)
        .storage.createFile(bucketId, fileId, fileData as any, permissions);
      return response;
    } catch (error: any) {
      console.error("Error creating file:", error);
      throw error;
    }
  },

  createConsoleFile: async (
    region: string,
    bucketId: string,
    file: any,
    fileId: string = "unique()",
    permissions?: string[],
  ) => {
    try {
      const parts = [{ uri: file.uri, size: file.size }] as any;
      const fileData = new File(parts, file.name, {
        type: file.type || "application/octet-stream",
      });

      const response = await sdk
        .forConsoleIn(region)
        .storage.createFile(bucketId, fileId, fileData as any, permissions);
      return response;
    } catch (error: any) {
      console.error("Error creating console file:", error);
      throw error;
    }
  },
}));

export default useBucketStore;
