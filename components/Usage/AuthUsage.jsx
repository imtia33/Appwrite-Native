import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import SmoothLineChart from '../ui/SmoothLineChart';
import { useUsageStore } from '../../appwrite/store/usageStore';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useTheme } from '../../lib/theme-context';
import UsageRangeSelector, { RANGE_OPTIONS } from './UsageRangeSelector';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';

const AuthUsage = () => {
    const { currentProject } = useProjectStore();
    const { currentOrganization } = useOrganizationStore();
    const { usageData, loading, fetchUsage } = useUsageStore();
    const { isDark } = useTheme();
    const [selectedRange, setSelectedRange] = React.useState(RANGE_OPTIONS.BILLING);

    const rangeToFetch = selectedRange === RANGE_OPTIONS.BILLING ? '30d' : selectedRange;
    const cacheKey = `auth-${rangeToFetch}`;
    const data = usageData[cacheKey];
    const isLoading = loading[cacheKey];

    useEffect(() => {
        if (currentProject?.$id) {
            fetchUsage(currentProject.$id, 'auth', rangeToFetch);
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

    let rawPoints = data.users || [];
    
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
            label: label
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
                    Title="Registration Trend"
                    totalValue={data.usersTotal}
                    unit="Users"
                    height={150}
                    allowNegative={true}
                />
            </View>
        </View>
    );
};

export default AuthUsage;
