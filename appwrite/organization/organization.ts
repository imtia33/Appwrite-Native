import { useOrganizationStore } from "../store/organizationStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sdk } from "../appwrite";
import { Query } from "@appwrite.io/console";

export const getProjects = async (orgId: string) => {
    try {
        const queries = [
            Query.equal('teamId', orgId),
            Query.or([
                Query.equal('status', 'active'),
                Query.isNull('status')
            ]),
            Query.limit(20)
        ];

        const response = await sdk.forConsole.projects.list({
            queries
        });

        // Set 'default' if no region
        for (const project of response.projects) {
            project.region = project.region || 'default';
        }

        return response.projects;
    } catch (error: any) {
        console.error('Get Projects Error:', error);
        throw new Error(error.message || error);
    }
}

export const getOrganizations = async () => {

    try {
        const store = useOrganizationStore.getState();
        await store.fetchOrganizations();
        return {
            teams: store.organizations,
            total: store.total
        };
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const saveCurrentOrg = async (orgId: string) => {
    try {
        await AsyncStorage.setItem('selectedOrganizationId', orgId);
    } catch (error) {
        console.error('Save Current Org Error:', error);
    }
}

export const getSavedOrgId = async () => {
    try {
        return await AsyncStorage.getItem('selectedOrganizationId');
    } catch (error) {
        console.error('Get Saved Org ID Error:', error);
        return null;
    }
}