import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { sdk } from '../../appwrite/appwrite';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { useUsageStore } from '../../appwrite/store/usageStore';
import { useTheme } from '../../lib/theme-context';
import SmoothLineChart from '../ui/SmoothLineChart';

import UsageRangeSelector, { RANGE_OPTIONS } from './UsageRangeSelector';

const FunctionUsage = () => {
    const { currentProject } = useProjectStore();
    const { currentOrganization } = useOrganizationStore();
    const { usageData, loading: usageLoading, fetchUsage, counts, setCount } = useUsageStore();
    const { isDark } = useTheme();
    
    const functionsCount = counts.functions || 0;
    const gbHours = counts.gbHours || 0;
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState(RANGE_OPTIONS.BILLING);

    const rangeToFetch = selectedRange === RANGE_OPTIONS.BILLING ? '30d' : selectedRange;
    const cacheKey = `functions-${rangeToFetch}`;
    const data = usageData[cacheKey];
    const isLoading = usageLoading[cacheKey];

    useEffect(() => {
        const fetchData = async () => {
            if (!currentProject?.$id || !currentOrganization?.$id) return;
            
            setLoading(true);
            try {
                // 1. Fetch live functions count
                const projectApi = sdk.forProject('fra', currentProject.$id);
                const functionsResponse = await projectApi.functions.list();
                setCount('functions', functionsResponse.total);

                // 2. Fetch billing aggregation for GB Hours (remain from billing SDK)
                const orgId = currentOrganization.$id;
                const aggregationId = currentOrganization.billingAggregationId;
                
                if (aggregationId) {
                    const aggregation = await sdk.forConsole.billing.getAggregation(orgId, aggregationId);
                    const projectBreakdown = aggregation.breakdown?.find(b => b.$id === currentProject.$id);
                    if (projectBreakdown) {
                        const gbHoursResource = projectBreakdown.resources?.find(r => r.resourceId === 'GBHours');
                        setCount('gbHours', gbHoursResource?.value || 0);
                    }
                }

                // 3. Fetch trend data
                fetchUsage(currentProject.$id, 'functions', rangeToFetch);
            } catch (error) {
                console.error('Error fetching function usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentProject?.$id, currentOrganization?.$id, fetchUsage, rangeToFetch]);

    const filteredData = useMemo(() => {
        if (!data) return null;
        if (selectedRange !== RANGE_OPTIONS.BILLING || !currentOrganization?.billingCurrentInvoiceDate) {
            return {
                executions: data.executions || [],
                computations: data.computations || []
            };
        }

        const startDate = new Date(currentOrganization.billingCurrentInvoiceDate);
        return {
            executions: (data.executions || []).filter(item => new Date(item.date) >= startDate),
            computations: (data.computations || []).filter(item => new Date(item.date) >= startDate)
        };
    }, [data, selectedRange, currentOrganization?.billingCurrentInvoiceDate]);

    const billingTotals = useMemo(() => {
        if (!filteredData) return { executions: 0, computations: 0 };
        return {
            executions: filteredData.executions.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
            computations: filteredData.computations.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
        };
    }, [filteredData]);

    const chartPoints = useMemo(() => {
        if (!filteredData) return [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formatPoints = (points) => points.map((item, index) => {
            const date = new Date(item.date);
            return {
                x: index,
                y: Number(item.value) || 0,
                label: `${date.getDate()} ${monthNames[date.getMonth()]}`
            };
        });

        const series = [
            {
                label: 'Executions',
                points: formatPoints(filteredData.executions),
                total: billingTotals.executions,
                color: '#FD366E'
            }
        ];

        if (filteredData.computations.length > 0) {
            series.push({
                label: 'Compute',
                points: formatPoints(filteredData.computations),
                total: billingTotals.computations,
                color: '#00BAFF'
            });
        }

        return series;
    }, [filteredData, billingTotals]);

    if (loading || (isLoading && !data)) {
        return (
            <View className="h-24 justify-center items-center">
                <ActivityIndicator size="small" color="#FD366E" />
            </View>
        );
    }

    return (
        <View>
            <UsageRangeSelector 
                selectedRange={selectedRange} 
                onRangeChange={setSelectedRange} 
            />
            <View className="px-5 py-2">
                <SmoothLineChart 
                    data={chartPoints}
                    Title="Execution Trend"
                    unit="Runs"
                    height={120}
                />

                <View className="mt-4 flex-row justify-between items-center px-1">
                    <Text className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold">
                        Total Functions
                    </Text>
                    <Text className="text-foreground text-lg font-bold">
                        {functionsCount?.toLocaleString() || '0'}
                    </Text>
                </View>

                <View 
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                    className="mt-4 p-5 rounded-2xl border border-border/40"
                >
                    <View className="flex-row items-center mb-3">
                        <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        <Text className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                            Billing Cycle Compute
                        </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-foreground text-xl font-bold">
                                {gbHours?.toFixed(2) || '0.00'}
                            </Text>
                            <Text className="text-muted-foreground text-[10px] font-medium">GB-Hours</Text>
                        </View>
                        <View className="h-8 w-[1px] bg-border/50 mx-2" />
                        <View className="items-end">
                            <Text className="text-foreground text-xl font-bold">
                                {billingTotals.executions?.toLocaleString() || '0'}
                            </Text>
                            <Text className="text-muted-foreground text-[10px] font-medium">Executions</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default FunctionUsage;
