import { create } from 'zustand';
import { sdk } from '../appwrite';
import { useOrganizationStore } from './organizationStore';

export const useUsageStore = create((set, get) => ({
    usageData: {}, // Map of category -> data
    loading: {},
    error: {},
    counts: {}, // Map of category -> count
    currentProjectId: null,

    fetchUsage: async (projectId, category, range = '30d') => {
        const { usageData, loading, currentProjectId } = get();
        const cacheKey = `${category}-${range}`;
        
        // If switching projects, clear cache first
        if (currentProjectId !== projectId) {
            set({ usageData: {}, loading: {}, currentProjectId: projectId });
        } else if (usageData[cacheKey] && !loading[cacheKey]) {
            // Return cached data if exists for same project and range
            return;
        }

        set((state) => ({
            loading: { ...state.loading, [cacheKey]: true },
            error: { ...state.error, [cacheKey]: null }
        }));

        try {
            const region = 'fra'; 
            const projectApi = sdk.forProject(region, projectId);
            let response;
            
            if (category === 'overview' || category === 'project') {
                const end = new Date();
                let start = new Date();
                let period = '1d';
                
                if (range === '24h') {
                    start.setHours(start.getHours() - 24);
                    period = '1h';
                } else if (range === '30d') {
                    start.setDate(start.getDate() - 30);
                    period = '1d';
                } else if (range === '90d' || range === 'billing') {
                    // For billing, we fetch 90 days to be safe and let the component handle filtering if needed,
                    // but the SDK getUsage requires specific dates.
                    start.setDate(start.getDate() - 90);
                    period = '1d';
                }
                
                const responseData = await projectApi.project.getUsage({
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                    period
                });

                if (range === 'billing') {
                    const { currentOrganization } = useOrganizationStore.getState();
                    const billingDate = currentOrganization?.billingCurrentInvoiceDate 
                        ? new Date(currentOrganization.billingCurrentInvoiceDate)
                        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    
                    // Filter the data for billing period
                    const filterByDate = (arr) => arr?.filter(item => new Date(item.date) >= billingDate) || [];
                    
                    response = {
                        ...responseData,
                        network: filterByDate(responseData.network),
                        requests: filterByDate(responseData.requests)
                    };
                } else {
                    response = responseData;
                }
            } else {
                const params = { range };
                if (category === 'auth') {
                    response = await projectApi.users.getUsage(params);
                } else if (category === 'databases') {
                    response = await projectApi.tablesDB.listUsage(params);
                } else if (category === 'functions') {
                    response = await projectApi.functions.listUsage(params);
                } else if (category === 'storage') {
                    response = await projectApi.storage.getUsage(params);
                } else if (category === 'sites') {
                    response = await projectApi.sites.listUsage(params);
                }
            }
            
            set((state) => ({
                usageData: { ...state.usageData, [cacheKey]: response },
                loading: { ...state.loading, [cacheKey]: false }
            }));
        } catch (error) {
            console.error('Error fetching usage for', category, error);
            const cacheKey = `${category}-${range}`;
            set((state) => ({
                error: { ...state.error, [cacheKey]: error.message },
                loading: { ...state.loading, [cacheKey]: false }
            }));
        }
    },

    setCount: (category, count) => {
        set((state) => ({
            counts: { ...state.counts, [category]: count }
        }));
    },

    clearCache: () => {
        set({ usageData: {}, loading: {}, error: {}, counts: {}, currentProjectId: null });
    }
}));
