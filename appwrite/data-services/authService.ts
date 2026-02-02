import { create } from "zustand";
import { sdk } from "../appwrite";
import { useProjectStore } from "../store/projectStore";

interface AuthState {
  users: any[];
  teams: any[];
  loading: {
    users: boolean;
    teams: boolean;
  };
  error: {
    users: string | null;
    teams: string | null;
  };
  currentProjectId: string | null;
}

interface AuthActions {
  fetchUsers: (projectId: string) => Promise<void>;
  fetchTeams: (projectId: string) => Promise<void>;
  clearCache: () => void;
  getUsers: (projectId: string) => any[];
  getTeams: (projectId: string) => any[];
  isLoading: (type: "users" | "teams") => boolean;
  getError: (type: "users" | "teams") => string | null;
  listUsers: (projectId: string, region: string) => Promise<any>;
  listTeams: (projectId: string, region: string) => Promise<any>;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  users: [],
  teams: [],
  loading: {
    users: false,
    teams: false,
  },
  error: {
    users: null,
    teams: null,
  },
  currentProjectId: null,

  fetchUsers: async (projectId: string) => {
    const state = get();

    // Return early if already loading or data exists for same project
    if (
      state.loading.users ||
      (state.currentProjectId === projectId && state.users.length > 0)
    ) {
      return;
    }

    set({
      loading: { ...state.loading, users: true },
      error: { ...state.error, users: null },
    });

    try {
      const { currentProject } = useProjectStore.getState();
      if (!currentProject) return;

      const response = await sdk
        .forProject(currentProject.region || "fra", currentProject.$id)
        .users.list();

      set({
        users: response.users,
        currentProjectId: projectId,
        loading: { ...get().loading, users: false },
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      set({
        error: { ...get().error, users: error.message },
        loading: { ...get().loading, users: false },
      });
    }
  },

  fetchTeams: async (projectId: string) => {
    const state = get();

    // Return early if already loading or data exists for same project
    if (
      state.loading.teams ||
      (state.currentProjectId === projectId && state.teams.length > 0)
    ) {
      return;
    }

    set({
      loading: { ...state.loading, teams: true },
      error: { ...state.error, teams: null },
    });

    try {
      const { currentProject } = useProjectStore.getState();
      if (!currentProject) return;

      const response = await sdk
        .forProject(currentProject.region || "fra", currentProject.$id)
        .teams.list();

      set({
        teams: response.teams,
        currentProjectId: projectId,
        loading: { ...get().loading, teams: false },
      });
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      set({
        error: { ...get().error, teams: error.message },
        loading: { ...get().loading, teams: false },
      });
    }
  },

  listUsers: async (projectId: string, region: string) => {
    return await sdk.forProject(region, projectId).users.list();
  },

  listTeams: async (projectId: string, region: string) => {
    return await sdk.forProject(region, projectId).teams.list();
  },

  clearCache: () => {
    set({
      users: [],
      teams: [],
      loading: { users: false, teams: false },
      error: { users: null, teams: null },
      currentProjectId: null,
    });
  },

  getUsers: (projectId: string) => {
    const state = get();
    return state.currentProjectId === projectId ? state.users : [];
  },

  getTeams: (projectId: string) => {
    const state = get();
    return state.currentProjectId === projectId ? state.teams : [];
  },

  isLoading: (type: "users" | "teams") => {
    return get().loading[type];
  },

  getError: (type: "users" | "teams") => {
    return get().error[type];
  },
}));

export default useAuthStore;
