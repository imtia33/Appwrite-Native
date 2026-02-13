import { create } from "zustand";
import { Runtime, TemplateReferenceType } from "@appwrite.io/console";
import { sdk } from "../appwrite";
import { useProjectStore } from "../store/projectStore";

interface FunctionState {
  functions: any[];
  templates: any[];
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
  createFunction: (
    projectId: string,
    region: string,
    name: string,
    runtime: string,
    functionId?: string,
  ) => Promise<any>;
  updateFunction: (
    projectId: string,
    region: string,
    functionId: string,
    name: string,
    runtime?: string,
  ) => Promise<any>;
  deleteFunction: (
    projectId: string,
    region: string,
    functionId: string,
  ) => Promise<void>;
  fetchTemplates: (projectId: string, region: string) => Promise<any>;
  createFunctionFromTemplate: (
    projectId: string,
    region: string,
    template: any,
    name: string,
    runtime: string,
    functionId?: string,
  ) => Promise<any>;
}

type FunctionStore = FunctionState & FunctionActions;

const useFunctionStore = create<FunctionStore>((set, get) => ({
  functions: [],
  templates: [],
  loading: false,
  error: null,
  currentProjectId: null,

  fetchFunctions: async (projectId: string) => {
    const state = get();

    // Return early if already loading or data exists for same project
    if (
      state.loading ||
      (state.currentProjectId === projectId && state.functions.length > 0)
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
        .functions.list();

      set({
        functions: response.functions,
        currentProjectId: projectId,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching functions:", error);
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  clearCache: () => {
    set({
      functions: [],
      templates: [],
      loading: false,
      error: null,
      currentProjectId: null,
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
  },

  createFunction: async (
    projectId: string,
    region: string,
    name: string,
    runtime: any,
    functionId: string = "unique()",
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .functions.create(functionId, name, runtime);

      set((state) => ({
        functions: [response, ...state.functions],
      }));

      return response;
    } catch (error: any) {
      console.error("Error creating function:", error);
      throw error;
    }
  },

  updateFunction: async (
    projectId: string,
    region: string,
    functionId: string,
    name: string,
    runtime?: any,
  ) => {
    try {
      const response = await sdk
        .forProject(region, projectId)
        .functions.update(functionId, name, runtime);

      set((state) => ({
        functions: state.functions.map((f) =>
          f.$id === functionId ? response : f,
        ),
      }));

      return response;
    } catch (error: any) {
      console.error("Error updating function:", error);
      throw error;
    }
  },

  deleteFunction: async (
    projectId: string,
    region: string,
    functionId: string,
  ) => {
    try {
      await sdk.forProject(region, projectId).functions.delete(functionId);

      set((state) => ({
        functions: state.functions.filter((f) => f.$id !== functionId),
      }));
    } catch (error: any) {
      console.error("Error deleting function:", error);
      throw error;
    }
  },

  fetchTemplates: async (projectId: string, region: string) => {
    try {
      const runtimesList = [
        "node-18.0",
        "python-3.12",
        "dart-3.10",
        "go-1.23",
        "php-8.3",
        "deno-2.0",
      ] as any[];
      const response = await sdk
        .forProject(region, projectId)
        .functions.listTemplates(runtimesList, undefined, 100);

      set({ templates: response.templates });
      return response;
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },

  createFunctionFromTemplate: async (
    projectId: string,
    region: string,
    template: any,
    name: string,
    runtime: string,
    functionId: string = "unique()",
  ) => {
    try {
      const projectSdk = sdk.forProject(region, projectId);

      // 1. Create the function
      const response = await projectSdk.functions.create(
        functionId,
        name,
        runtime as Runtime,
      );

      // 2. Create template deployment
      // Note: In a real scenario, we might need to handle variables too,
      // but for a "Quick Start" starter, we'll try the basic deployment.
      try {
        const rt =
          template.runtimes.find((r: any) => r.name === runtime) ||
          template.runtimes[0];

        await projectSdk.functions.createTemplateDeployment(
          response.$id,
          template.providerRepositoryId,
          template.providerOwner,
          rt.providerRootDirectory,
          TemplateReferenceType.Tag,
          template.providerVersion,
          true, // activate
        );
      } catch (deployError) {
        console.error("Error creating template deployment:", deployError);
        // We still have the function, so we might want to continue or show a warning
      }

      set((state) => ({
        functions: [response, ...state.functions],
      }));

      return response;
    } catch (error: any) {
      console.error("Error creating function from template:", error);
      throw error;
    }
  },
}));

export default useFunctionStore;
