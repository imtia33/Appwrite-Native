import React, { useEffect, useState, useMemo } from 'react';
import PlanSummary from '../../components/Billings/PlanSummary';
import { ScrollView, View } from 'react-native';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { sdk } from '../../appwrite/appwrite';
import {
    formatCurrency,
    toLocaleDate,
    formatNum,
    humanFileSize,
    formatBandwidthUsage,
    createStorageProgressData,
    createProgressData
} from '../../appwrite/billing-helpers';
import BillingHistory from '../../components/Billings/BillingHistory';

const Billings = () => {
    const { currentOrganization } = useOrganizationStore();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [aggregation, setAggregation] = useState(null);
    const [availableCredit, setAvailableCredit] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Function to fetch complete aggregation data with all breakdowns
    const fetchCompleteAggregationData = async (orgId, aggregationId) => {
        try {
            // Get the full aggregation data with default pagination first
            const fullAggregation = await sdk.forConsole.billing.getAggregation(
                orgId,
                aggregationId
            );

            // If the breakdown is limited, we'll need to get additional details separately
            // For now, return what we have, but note that we might need to make additional calls
            // depending on the API capabilities

            return fullAggregation;
        } catch (error) {
            console.error('Error fetching aggregation data:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!currentOrganization?.$id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const orgId = currentOrganization.$id;

                // Get the organization's plan and available credit
                const [planData, creditData] = await Promise.all([
                    sdk.forConsole.billing.getOrganizationPlan(orgId),
                    sdk.forConsole.billing.getAvailableCredit(orgId)
                ]);

                setPlan(planData);
                setAvailableCredit(creditData.available);

                // Use the organization's billingAggregationId directly
                const aggregationId = currentOrganization.billingAggregationId;

                if (aggregationId) {
                    // Fetch complete aggregation data
                    const completeAggregation = await fetchCompleteAggregationData(orgId, aggregationId);
                    setAggregation(completeAggregation);
                } else {
                    // Fallback: try to get the latest aggregation if billingAggregationId is not available
                    const aggregationList = await sdk.forConsole.billing.listAggregation(orgId);
                    if (aggregationList.aggregations && aggregationList.aggregations.length > 0) {
                        const latestAggregationId = aggregationList.aggregations[0].$id;
                        const completeAggregation = await fetchCompleteAggregationData(orgId, latestAggregationId);
                        setAggregation(completeAggregation);
                    }
                }

            } catch (error) {
                console.error('Error fetching billing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentOrganization?.$id]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (currentOrganization?.$id) {
            try {
                const orgId = currentOrganization.$id;
                const planData = await sdk.forConsole.billing.getOrganizationPlan(orgId);
                const creditData = await sdk.forConsole.billing.getAvailableCredit(orgId);
                setPlan(planData);
                setAvailableCredit(creditData.available);

                const aggregationId = currentOrganization.billingAggregationId;
                if (aggregationId) {
                    const completeAggregation = await fetchCompleteAggregationData(orgId, aggregationId);
                    setAggregation(completeAggregation);
                }
            } catch (error) {
                console.error('Error refreshing billing data:', error);
            }
        }
        setRefreshing(false);
    };

    return (
        <ScrollView className="flex-1 bg-background">
            <View style={{ height: 500 }} >
                <PlanSummary
                    loading={loading}
                    plan={plan}
                    aggregation={aggregation}
                    availableCredit={availableCredit}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    currentOrganization={currentOrganization}
                />
            </View>
            <View className="mb-4 p-2">
                <BillingHistory currentOrganization={currentOrganization} />
            </View>

        </ScrollView>
    );
};

export default Billings;