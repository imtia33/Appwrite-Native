import { create } from 'zustand';
import { sdk } from '../appwrite';
import { type Models, Query, Platform } from '@appwrite.io/console';
import { BillingPlan } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Tier = 'tier-0' | 'tier-1' | 'tier-2' | 'auto-1' | 'cont-1' | 'ent-1';

export type TierData = {
    name: string;
    description: string;
};

export const tierFree: TierData = {
    name: 'Free',
    description: 'A great fit for passion projects and small applications.'
};

export const tierGitHubEducation: TierData = {
    name: 'GitHub Education',
    description: 'For members of GitHub student developers program.'
};

export const tierPro: TierData = {
    name: 'Pro',
    description: 'For production applications that need powerful functionality and resources to scale.'
};

export const tierScale: TierData = {
    name: 'Scale',
    description: 'For teams that handle more complex and large projects and need more control and support.'
};

export const tierCustom: TierData = {
    name: 'Custom',
    description: 'Team on a custom contract'
};

export const tierEnterprise: TierData = {
    name: 'Enterprise',
    description: 'For enterprises that need more power and premium support.'
};

export const roles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Developer', value: 'developer' },
    { label: 'Editor', value: 'editor' },
    { label: 'Analyst', value: 'analyst' },
    { label: 'Billing', value: 'billing' }
];

export function tierToPlan(tier: string | BillingPlan): TierData {
    switch (tier) {
        case BillingPlan.FREE:
            return tierFree;
        case BillingPlan.PRO:
            return tierPro;
        case BillingPlan.SCALE:
            return tierScale;
        case BillingPlan.GITHUB_EDUCATION:
            return tierGitHubEducation;
        case BillingPlan.CUSTOM:
            return tierCustom;
        case BillingPlan.ENTERPRISE:
            return tierEnterprise;
        default:
            return tierCustom;
    }
}

export function getRoleLabel(role: string) {
    return roles.find((r) => r.value === role)?.label ?? role;
}

export type Organization = Models.Team<any> & {
    billingPlan: string;
    billingStartDate: string;
    billingCurrentInvoiceDate: string;
    billingNextInvoiceDate: string;
    billingLimits: {
        bandwidth: number;
        documents: number;
        executions: number;
        storage: number;
        users: number;
        projects: number;
        budgetLimit: number;
    };
    paymentMethodId: string;
    backupPaymentMethodId: string;
    markedForDeletion: boolean;
    status?: string;
    remarks?: string;
    total?: number;
};

export type OrganizationList = {
    teams: Organization[];
    total: number;
};

export type OrganizationError = {
    message: string;
    code: number;
    type: string;
};

interface OrganizationState {
    organizations: Organization[];
    total: number;
    loading: boolean;
    error: string | null;
    currentOrganization: Organization | null;
    memberships: Models.Membership[];
    membershipsTotal: number;
    fetchOrganizations: () => Promise<void>;
    setCurrentOrganization: (org: Organization | null) => void;
    fetchMemberships: (offset?: number, limit?: number) => Promise<void>;
    createMembership: (email: string, roles: string[], name?: string) => Promise<void>;
    updateMembership: (membershipId: string, roles: string[]) => Promise<void>;
    deleteMembership: (membershipId: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
    organizations: [],
    total: 0,
    loading: false,
    error: null,
    currentOrganization: null,

    fetchOrganizations: async () => {
        set({ loading: true, error: null });
        try {
            const response = await sdk.forConsole.billing.listOrganization([
                Query.equal('platform', Platform.Appwrite)
            ]);

            const organizations = response.teams as Organization[];
            let currentOrg = null;

            // Load saved organization ID
            const savedOrgId = await AsyncStorage.getItem('selectedOrganizationId');
            if (savedOrgId) {
                currentOrg = organizations.find(o => o.$id === savedOrgId);
            }

            // Fallback to first organization if no saved org or saved org not in list
            if (!currentOrg && organizations.length > 0) {
                currentOrg = organizations[0];
                await AsyncStorage.setItem('selectedOrganizationId', currentOrg.$id);
            }

            set({
                organizations,
                total: response.total,
                currentOrganization: currentOrg,
                loading: false
            });
        } catch (error: any) {
            console.error('Fetch Organizations Error:', error);
            set({
                error: error.message || 'Failed to fetch organizations',
                loading: false
            });
        }
    },

    setCurrentOrganization: async (org) => {
        if (org) {
            await AsyncStorage.setItem('selectedOrganizationId', org.$id);
        } else {
            await AsyncStorage.removeItem('selectedOrganizationId');
        }
        set({ currentOrganization: org });
    },

    memberships: [],
    membershipsTotal: 0,

    fetchMemberships: async (offset = 0, limit = 12) => {
        const { currentOrganization } = useOrganizationStore.getState();
        if (!currentOrganization) return;

        set({ loading: true, error: null });
        try {
            const response = await sdk.forConsole.teams.listMemberships(
                currentOrganization.$id,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('')
                ]
            );
            set({
                memberships: response.memberships,
                membershipsTotal: response.total,
                loading: false
            });
        } catch (error: any) {
            console.error('Fetch Memberships Error:', error);
            set({
                error: error.message || 'Failed to fetch memberships',
                loading: false
            });
        }
    },

    createMembership: async (email, roles, name) => {
        const { currentOrganization } = useOrganizationStore.getState();
        if (!currentOrganization) return;

        set({ loading: true, error: null });
        try {
            await sdk.forConsole.teams.createMembership(
                currentOrganization.$id,
                roles,
                email,
                undefined, // userId
                undefined, // secret
                `${globalThis?.location?.origin}/invite`, // url
                name
            );
            await useOrganizationStore.getState().fetchMemberships();
            set({ loading: false });
        } catch (error: any) {
            console.error('Create Membership Error:', error);
            set({
                error: error.message || 'Failed to create membership',
                loading: false
            });
            throw error;
        }
    },

    updateMembership: async (membershipId, roles) => {
        const { currentOrganization } = useOrganizationStore.getState();
        if (!currentOrganization) return;

        set({ loading: true, error: null });
        try {
            await sdk.forConsole.teams.updateMembership(
                currentOrganization.$id,
                membershipId,
                roles
            );
            await useOrganizationStore.getState().fetchMemberships();
            set({ loading: false });
        } catch (error: any) {
            console.error('Update Membership Error:', error);
            set({
                error: error.message || 'Failed to update membership',
                loading: false
            });
            throw error;
        }
    },

    deleteMembership: async (membershipId) => {
        const { currentOrganization } = useOrganizationStore.getState();
        if (!currentOrganization) return;

        set({ loading: true, error: null });
        try {
            await sdk.forConsole.teams.deleteMembership(
                currentOrganization.$id,
                membershipId
            );
            await useOrganizationStore.getState().fetchMemberships();
            set({ loading: false });
        } catch (error: any) {
            console.error('Delete Membership Error:', error);
            set({
                error: error.message || 'Failed to delete membership',
                loading: false
            });
            throw error;
        }
    },
}));
