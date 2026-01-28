import React, { useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import SmoothLineChart from '../ui/SmoothLineChart';
import { sdk } from '../../appwrite/appwrite';
import { useUsageStore } from '../../appwrite/store/usageStore';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useTheme } from '../../lib/theme-context';
import { formatHumanSize } from '../../appwrite/billing-helpers';
import {useOrganizationStore} from '../../appwrite/store/organizationStore';
import UsageRangeSelector, { RANGE_OPTIONS } from './UsageRangeSelector';

const SiteUsage = () => {
    const { currentProject } = useProjectStore();
    const { currentOrganization } = useOrganizationStore();
    const { usageData, loading, fetchUsage, counts, setCount } = useUsageStore();
    const { isDark } = useTheme();
    const [selectedRange, setSelectedRange] = React.useState(RANGE_OPTIONS.BILLING);
    const sitesCount = counts.sites || 0;

    const rangeToFetch = selectedRange === RANGE_OPTIONS.BILLING ? '30d' : selectedRange;
    const cacheKey = `sites-${rangeToFetch}`;
    const data = usageData[cacheKey];
    const isLoading = loading[cacheKey];

    useEffect(() => {
        const fetchSitesCount = async () => {
            if (!currentProject?.$id) return;
            try {
                // Using 'fra' as default region as seen in other usage components
                const projectApi = sdk.forProject('fra', currentProject.$id);
                const response = await projectApi.sites.list();
                setCount('sites', response.total || 0);
            } catch (error) {
                console.error('Error fetching actual sites count:', error);
            }
        };

        if (currentProject?.$id) {
            fetchUsage(currentProject.$id, 'sites', rangeToFetch);
            fetchSitesCount();
        }
    }, [currentProject?.$id, fetchUsage, rangeToFetch]);

    const filteredData = useMemo(() => {
        if (!data) return null;
        if (selectedRange !== RANGE_OPTIONS.BILLING || !currentOrganization?.billingCurrentInvoiceDate) {
            return {
                outbound: data.outbound || [],
                inbound: data.inbound || []
            };
        }

        const startDate = new Date(currentOrganization.billingCurrentInvoiceDate);
        return {
            outbound: (data.outbound || []).filter(item => new Date(item.date) >= startDate),
            inbound: (data.inbound || []).filter(item => new Date(item.date) >= startDate)
        };
    }, [data, selectedRange, currentOrganization?.billingCurrentInvoiceDate]);

    const billingTotals = useMemo(() => {
        if (!filteredData) return { outbound: 0, inbound: 0 };
        
        return {
            outbound: filteredData.outbound.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
            inbound: filteredData.inbound.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
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
                label: 'Outbound',
                points: formatData(filteredData.outbound),
                total: billingTotals.outbound,
                color: '#FD366E'
            },
            {
                label: 'Inbound',
                points: formatData(filteredData.inbound),
                total: billingTotals.inbound,
                color: '#00BAFF'
            }
        ];
    }, [filteredData, billingTotals]);

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
                    Title="Bandwidth Traffic"
                    formatter={formatHumanSize}
                    height={120}
                />

                <View className="mt-4 flex-row justify-between items-center px-1">
                    <Text className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold">
                        Total Sites
                    </Text>
                    <Text className="text-foreground text-lg font-bold">
                        {sitesCount?.toLocaleString() || '0'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default SiteUsage;
