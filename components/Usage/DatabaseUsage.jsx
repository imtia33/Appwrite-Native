import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { sdk } from '../../appwrite/appwrite';
import { useUsageStore } from '../../appwrite/store/usageStore';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { useTheme } from '../../lib/theme-context';
import SmoothLineChart from '../ui/SmoothLineChart';

import UsageRangeSelector, { RANGE_OPTIONS } from './UsageRangeSelector';

const DatabaseUsage = () => {
    const { currentProject } = useProjectStore();
    const { currentOrganization } = useOrganizationStore();
    const { usageData, loading, fetchUsage, counts, setCount } = useUsageStore();
    const { isDark } = useTheme();
    const dbCount = counts.databases || 0;
    const [selectedRange, setSelectedRange] = useState(RANGE_OPTIONS.BILLING);

    const rangeToFetch = selectedRange === RANGE_OPTIONS.BILLING ? '30d' : selectedRange;
    const cacheKey = `databases-${rangeToFetch}`;
    const data = usageData[cacheKey];
    const isLoading = loading[cacheKey];

    useEffect(() => {
        const fetchDbCount = async () => {
            if (!currentProject?.$id) return;
            try {
                const projectApi = sdk.forProject('fra', currentProject.$id);
                const databases = await projectApi.databases.list();
                setCount('databases', databases.total);
            } catch (error) {
                console.error('Error fetching actual db count:', error);
            }
        };

        if (currentProject?.$id) {
            fetchUsage(currentProject.$id, 'databases', rangeToFetch);
            fetchDbCount();
        }
    }, [currentProject?.$id, fetchUsage, rangeToFetch]);

    const filteredData = useMemo(() => {
        if (!data) return null;
        if (selectedRange !== RANGE_OPTIONS.BILLING || !currentOrganization?.billingCurrentInvoiceDate) {
            return {
                reads: data.databasesReads || [],
                writes: data.databasesWrites || []
            };
        }

        const startDate = new Date(currentOrganization.billingCurrentInvoiceDate);
        return {
            reads: (data.databasesReads || []).filter(item => new Date(item.date) >= startDate),
            writes: (data.databasesWrites || []).filter(item => new Date(item.date) >= startDate)
        };
    }, [data, selectedRange, currentOrganization?.billingCurrentInvoiceDate]);

    const billingCycleTotals = useMemo(() => {
        if (!filteredData) return null;
        
        return {
            reads: filteredData.reads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
            writes: filteredData.writes.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
        };
    }, [filteredData]);

    const chartPoints = useMemo(() => {
        if (!filteredData) return [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formatData = (metrics) => metrics.map((item, index) => {
            const date = new Date(item.date);
            return {
                x: index,
                y: Number(item.value) || 0,
                label: `${date.getDate()} ${monthNames[date.getMonth()]}`
            };
        });

        return [
            {
                label: 'Reads',
                points: formatData(filteredData.reads),
                total: billingCycleTotals?.reads,
                color: '#FD366E' // Pink
            },
            {
                label: 'Writes',
                points: formatData(filteredData.writes),
                total: billingCycleTotals?.writes,
                color: '#00BAFF' // blue
            }
        ];
    }, [filteredData, billingCycleTotals]);

    if (isLoading && !data) {
        return (
            <View className="h-24 justify-center items-center">
                <ActivityIndicator size="small" color="#FD366E" />
            </View>
        );
    }

    if (!data) return null;

    return (
        <View>
            <UsageRangeSelector 
                selectedRange={selectedRange} 
                onRangeChange={setSelectedRange} 
            />
            <View className="px-5 py-2">
                <SmoothLineChart 
                    data={chartPoints}
                    Title="Database Traffic"
                    unit="Calls"
                    height={150}
                />

                <View className="mt-4 flex-row justify-between items-center px-1">
                    <Text className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold">
                        Total Databases
                    </Text>
                    <Text className="text-foreground text-lg font-bold">
                        {dbCount?.toLocaleString() || '0'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default DatabaseUsage;
