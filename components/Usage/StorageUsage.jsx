import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import SmoothLineChart from '../ui/SmoothLineChart';
import { useUsageStore } from '../../appwrite/store/usageStore';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useTheme } from '../../lib/theme-context';
import { formatHumanSize } from '../../appwrite/billing-helpers';
import UsageRangeSelector, { RANGE_OPTIONS } from './UsageRangeSelector';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';

const StorageUsage = () => {
    const { currentProject } = useProjectStore();
    const { currentOrganization } = useOrganizationStore();
    const { usageData, loading, fetchUsage } = useUsageStore();
    const { isDark } = useTheme();
    const [selectedRange, setSelectedRange] = React.useState(RANGE_OPTIONS.BILLING);

    const rangeToFetch = selectedRange === RANGE_OPTIONS.BILLING ? '30d' : selectedRange;
    const cacheKey = `storage-${rangeToFetch}`;
    const data = usageData[cacheKey];
    const isLoading = loading[cacheKey];

    useEffect(() => {
        if (currentProject?.$id) {
            fetchUsage(currentProject.$id, 'storage', rangeToFetch);
        }
    }, [currentProject?.$id, fetchUsage, rangeToFetch]);

    if (isLoading && !data) {
        return (
            <View className="h-24 justify-center items-center">
                <ActivityIndicator size="small" color="#FD366E" />
            </View>
        );
    }

    if (!data) return null;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let rawPoints = data.storage || [];
    
    // Filter for billing period if needed
    if (selectedRange === RANGE_OPTIONS.BILLING && currentOrganization?.billingCurrentInvoiceDate) {
        const startDate = new Date(currentOrganization.billingCurrentInvoiceDate);
        rawPoints = rawPoints.filter(item => new Date(item.date) >= startDate);
    }

    const chartPoints = rawPoints.map((item, index) => {
        const val = Number(item.value) || 0;
        const date = new Date(item.date);
        const label = `${date.getDate()} ${monthNames[date.getMonth()]}`;
        
        return {
            x: index,
            y: val,
            label: label,
            originalValue: val
        };
    });

    return (
        <View>
            <UsageRangeSelector 
                selectedRange={selectedRange} 
                onRangeChange={setSelectedRange} 
            />
            <View className="px-5 py-2">
                <SmoothLineChart 
                    data={chartPoints}
                    Title="Storage Trend"
                    totalValue={data.filesStorageTotal}
                    formatter={formatHumanSize}
                    height={150}
                />
                
                <View className="mt-4 flex-row justify-between items-center px-1">
                    <Text className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold">
                        Total Files
                    </Text>
                    <Text className="text-foreground text-lg font-bold">
                        {data.filesTotal?.toLocaleString() || '0'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default StorageUsage;
