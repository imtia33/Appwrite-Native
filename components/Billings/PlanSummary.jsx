import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import {
    formatCurrency,
    toLocaleDate,
    formatNum,
    humanFileSize,
    formatBandwidthUsage,
    createStorageProgressData,
    createProgressData
} from '../../appwrite/billing-helpers';

const PlanSummary = ({
    loading,
    plan,
    aggregation,
    availableCredit,
    refreshing,
    onRefresh,
    currentOrganization
}) => {

    const billingData = useMemo(() => {
        if (!plan || !aggregation) return { addons: [], projects: [] };
        return getBillingData(plan, aggregation);
    }, [plan, aggregation]);

    const baseAmount = aggregation?.amount ?? plan?.price ?? 0;
    const creditsApplied = Math.min(baseAmount, availableCredit ?? 0);
    const totalAmount = Math.max(baseAmount - creditsApplied, 0);

    if (loading) {
        return (
            <Card className="flex-1 m-4">
                <View className="flex-1 items-center justify-center p-8">
                    <ActivityIndicator size="large" color="#FD366E" />
                </View>
            </Card>
        );
    }

    // Define local helper functions since they were in the original file
    function getResource(resources, resourceId) {
        return resources?.find((r) => r.resourceId === resourceId);
    }

    function getBillingData(currentPlan, currentAggregation) {
        // Addons
        const addons = (currentAggregation?.resources || [])
            .filter((r) => r.amount > 0 && currentPlan?.addons?.[r.resourceId]?.price > 0)
            .map((addon) => ({
                id: `addon-${addon.resourceId}`,
                label: addon.resourceId === 'seats'
                    ? 'Additional members'
                    : addon.resourceId === 'projects'
                        ? 'Additional projects'
                        : `${addon.resourceId} overage (${formatNum(addon.value)})`,
                price: formatCurrency(addon.amount),
                badge: addon.resourceId === 'projects' ? formatNum(addon.value) : null,
            }));

        // Projects breakdown - include ALL possible resources for each project
        const projects = (currentAggregation?.breakdown || []).map((projectData) => {
            const resources = projectData.resources || [];

            // Get all resources for this project
            const bandwidth = getResource(resources, 'bandwidth');
            const storage = getResource(resources, 'storage');
            const users = getResource(resources, 'users');
            const executions = getResource(resources, 'executions');
            const databasesReads = getResource(resources, 'databasesReads');
            const databasesWrites = getResource(resources, 'databasesWrites');
            const imageTransformations = getResource(resources, 'imageTransformations');
            const gbHours = getResource(resources, 'GBHours');
            const authPhone = getResource(resources, 'authPhone');

            // Create children for all possible resources
            const children = [
                // Bandwidth
                bandwidth && createRow({
                    id: 'bandwidth',
                    label: 'Bandwidth',
                    resource: bandwidth,
                    planLimit: currentPlan?.bandwidth,
                    usageFormatter: ({ value, planLimit, hasLimit }) =>
                        formatBandwidthUsage(value, hasLimit ? planLimit : undefined),
                    priceFormatter: ({ amount }) => formatCurrency(amount),
                    progressFactory: ({ value, planLimit, hasLimit }) =>
                        hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                    maxFactory: ({ planLimit, hasLimit }) =>
                        hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
                }),

                // Storage
                storage && createRow({
                    id: 'storage',
                    label: 'Storage',
                    resource: storage,
                    planLimit: currentPlan?.storage,
                    usageFormatter: ({ value, planLimit, hasLimit }) =>
                        hasLimit
                            ? `${humanFileSize(value).value} ${humanFileSize(value).unit} / ${planLimit?.toString() || '0'} GB`
                            : `${humanFileSize(value).value} ${humanFileSize(value).unit} / Unlimited`,
                    priceFormatter: ({ amount }) => formatCurrency(amount),
                    progressFactory: ({ value, planLimit, hasLimit }) =>
                        hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                    maxFactory: ({ planLimit, hasLimit }) =>
                        hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
                }),

                // Users
                users && createResourceRow('users', 'Users', users, currentPlan?.users),

                // Executions
                executions && createResourceRow('executions', 'Executions', executions, currentPlan?.executions),

                // Database Reads
                databasesReads && createResourceRow('databases-reads', 'Database reads', databasesReads, currentPlan?.databasesReads),

                // Database Writes
                databasesWrites && createResourceRow('databases-writes', 'Database writes', databasesWrites, currentPlan?.databasesWrites),

                // Image Transformations
                imageTransformations && createResourceRow('image-transformations', 'Image transformations', imageTransformations, currentPlan?.imageTransformations),

                // GB Hours
                gbHours && createResourceRow('gb-hours', 'GB-hours', gbHours, currentPlan?.GBHours),

                // Phone OTP
                authPhone && createRow({
                    id: 'phone-otp',
                    label: 'Phone OTP',
                    resource: authPhone,
                    usageFormatter: ({ value }) => `${formatNum(value)} SMS messages`,
                    priceFormatter: ({ amount }) => formatCurrency(amount),
                    includeProgress: false
                })
            ].filter(Boolean); // Filter out any null/undefined entries

            return {
                id: `project-${projectData.$id}`,
                label: projectData.name || `Project ${projectData.$id}`,
                price: formatCurrency(projectData.amount || 0),
                children
            };
        });

        return { addons, projects };
    }

    function createRow({
        id,
        label,
        resource,
        planLimit,
        usageFormatter,
        priceFormatter,
        progressFactory,
        maxFactory,
        includeProgress = true
    }) {
        const hasLimit = !!planLimit;
        const value = resource?.value || 0;
        const amount = resource?.amount || 0;

        const usage = usageFormatter
            ? usageFormatter({ value, planLimit, hasLimit })
            : hasLimit
                ? `${formatNum(value)} / ${formatNum(planLimit)}`
                : `${formatNum(value)} / Unlimited`;

        const price = priceFormatter ? priceFormatter({ amount, resource }) : formatCurrency(amount);

        const progressData = includeProgress && progressFactory
            ? progressFactory({ value, planLimit, hasLimit })
            : includeProgress && hasLimit
                ? createProgressData(value, planLimit)
                : [];

        const maxValue = includeProgress && maxFactory
            ? maxFactory({ planLimit, hasLimit })
            : includeProgress && hasLimit
                ? planLimit
                : null;

        return {
            id,
            label,
            usage,
            price,
            progressData: includeProgress ? progressData : undefined,
            maxValue: includeProgress ? maxValue : undefined
        };
    }

    function createResourceRow(id, label, resource, planLimit) {
        return createRow({ id, label, resource, planLimit });
    }

    return (
        <Card className="flex-1 m-2 overflow-hidden">
            <ScrollView
                className="flex-1  p-0"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                nestedScrollEnabled={true}
            >
                <View className="p-4 mt-2">
                    <Text className="text-xl text-center font-semibold text-foreground mb-4">{plan?.name}</Text>
                    {totalAmount > 0 && currentOrganization?.billingNextInvoiceDate && (
                        <Text>
                            Next payment of <Text className="font-bold text-primary">{formatCurrency(totalAmount)}</Text> will occur on {toLocaleDate(currentOrganization.billingNextInvoiceDate)}.
                        </Text>
                    )}
                    <View className=" justify-between">
                        <Text className="text-muted-foreground text-lg mb-2 font-semibold">Current billing cycle: </Text>
                        <Text className="text-primary text-sm mb-1">
                            {currentOrganization?.billingCurrentInvoiceDate ? toLocaleDate(currentOrganization.billingCurrentInvoiceDate) : 'N/A'} - {currentOrganization?.billingNextInvoiceDate ? toLocaleDate(currentOrganization.billingNextInvoiceDate) : 'N/A'}
                        </Text>
                    </View>
                    <Text className="text-lg text-muted-foreground ">
                        Estimate, subject to change based on usage.
                    </Text>
                </View>

                <View className="mb-2 p-2">


                    {/* Base Plan */}
                    <Card className=" overflow-hidden p-4 bg-input">
                        <View className="flex-row justify-between items-center py-3 border-b border-border">
                            <Text className="text-foreground">Base plan</Text>
                            <Text className="text-foreground">{formatCurrency(plan?.price ?? 0)}</Text>
                        </View>

                        {/* Addons */}
                        {billingData.addons.map((addon) => (
                            <View key={addon.id} className="flex-row justify-between items-center py-3 border-b border-border">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-foreground">{addon.label}</Text>
                                    {addon.badge && <Badge variant="secondary" className="px-1 py-0"><Text className="text-xs">{addon.badge}</Text></Badge>}
                                </View>
                                <Text className="text-foreground">{addon.price}</Text>
                            </View>
                        ))}

                        {/* Projects */}
                        <Accordion type="multiple" collapsible>
                            {billingData.projects.map((projectItem) => (
                                <AccordionItem key={projectItem.id} value={projectItem.id}>
                                    <AccordionTrigger>
                                        <View className="flex-row justify-between flex-1 mr-2">
                                            <Text className="text-foreground font-regular text-sm">{projectItem.label}</Text>
                                            <Text className="text-muted-foreground">{projectItem.price}</Text>
                                        </View>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <View className="gap-4 pt-2">
                                            {projectItem.children.map((child) => (
                                                <View key={child.id} className="gap-1">
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-sm text-primary font-bold">{child.label}</Text>
                                                        {child.price && <Text className="text-sm text-foreground">{child.price}</Text>}
                                                    </View>

                                                    {child.usage && (
                                                        <View className="flex-row justify-between">
                                                            <Text className="text-xs text-muted-foreground">{child.usage}</Text>
                                                        </View>
                                                    )}

                                                    {child.progressData && child.progressData.length > 0 && child.maxValue && (
                                                        <View className="mt-1">
                                                            <Progress value={(child.progressData[0].size / child.maxValue) * 100} className="h-2" />
                                                            <Text className="text-[10px] text-muted-foreground mt-1 text-right">
                                                                {child.progressData[0].tooltip?.label}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {/* Credits */}
                        {availableCredit > 0 && (
                            <View className="flex-row justify-between items-center py-3 border-t border-border ">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-foreground font-medium">Credits</Text>
                                </View>
                                <Text className="text-green-500 font-medium">-{formatCurrency(creditsApplied)}</Text>
                            </View>
                        )}

                        {/* Total */}
                        <View className="flex-row justify-between items-center py-4 ">
                            <Text className="text-lg font-regular text-foreground">Total</Text>
                            <Text className="text-lg font-regular text-foreground">{formatCurrency(totalAmount)}</Text>
                        </View>
                    </Card>
                </View>
                <Button
                    style={{ width: 80 }}
                    className="p-2 bg-primary self-end mr-5 mb-2"
                    onPress={() => {
                        const orgId = currentOrganization?.$id;
                        if (orgId) {
                            const url = `https://cloud.appwrite.io/console/organization-${orgId}/change-plan`;
                            Linking.openURL(url);
                        }
                    }}
                >
                    <Text className="text-foreground font-semibold ">Upgrade</Text>
                </Button>

            </ScrollView>
        </Card>
    );
};

// --- Local Helpers for Data Transformation ---

function getResource(resources, resourceId) {
    return resources?.find((r) => r.resourceId === resourceId);
}

function getBillingData(currentPlan, currentAggregation) {
    // Addons
    const addons = (currentAggregation?.resources || [])
        .filter((r) => r.amount > 0 && currentPlan?.addons?.[r.resourceId]?.price > 0)
        .map((addon) => ({
            id: `addon-${addon.resourceId}`,
            label: addon.resourceId === 'seats'
                ? 'Additional members'
                : addon.resourceId === 'projects'
                    ? 'Additional projects'
                    : `${addon.resourceId} overage (${formatNum(addon.value)})`,
            price: formatCurrency(addon.amount),
            badge: addon.resourceId === 'projects' ? formatNum(addon.value) : null,
        }));

    // Projects breakdown - include ALL possible resources for each project
    const projects = (currentAggregation?.breakdown || []).map((projectData) => {
        const resources = projectData.resources || [];

        // Get all resources for this project
        const bandwidth = getResource(resources, 'bandwidth');
        const storage = getResource(resources, 'storage');
        const users = getResource(resources, 'users');
        const executions = getResource(resources, 'executions');
        const databasesReads = getResource(resources, 'databasesReads');
        const databasesWrites = getResource(resources, 'databasesWrites');
        const imageTransformations = getResource(resources, 'imageTransformations');
        const gbHours = getResource(resources, 'GBHours');
        const authPhone = getResource(resources, 'authPhone');

        // Create children for all possible resources
        const children = [
            // Bandwidth
            bandwidth && createRow({
                id: 'bandwidth',
                label: 'Bandwidth',
                resource: bandwidth,
                planLimit: currentPlan?.bandwidth,
                usageFormatter: ({ value, planLimit, hasLimit }) =>
                    formatBandwidthUsage(value, hasLimit ? planLimit : undefined),
                priceFormatter: ({ amount }) => formatCurrency(amount),
                progressFactory: ({ value, planLimit, hasLimit }) =>
                    hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                maxFactory: ({ planLimit, hasLimit }) =>
                    hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
            }),

            // Storage
            storage && createRow({
                id: 'storage',
                label: 'Storage',
                resource: storage,
                planLimit: currentPlan?.storage,
                usageFormatter: ({ value, planLimit, hasLimit }) =>
                    hasLimit
                        ? `${humanFileSize(value).value} ${humanFileSize(value).unit} / ${planLimit?.toString() || '0'} GB`
                        : `${humanFileSize(value).value} ${humanFileSize(value).unit} / Unlimited`,
                priceFormatter: ({ amount }) => formatCurrency(amount),
                progressFactory: ({ value, planLimit, hasLimit }) =>
                    hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                maxFactory: ({ planLimit, hasLimit }) =>
                    hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
            }),

            // Users
            users && createResourceRow('users', 'Users', users, currentPlan?.users),

            // Executions
            executions && createResourceRow('executions', 'Executions', executions, currentPlan?.executions),

            // Database Reads
            databasesReads && createResourceRow('databases-reads', 'Database reads', databasesReads, currentPlan?.databasesReads),

            // Database Writes
            databasesWrites && createResourceRow('databases-writes', 'Database writes', databasesWrites, currentPlan?.databasesWrites),

            // Image Transformations
            imageTransformations && createResourceRow('image-transformations', 'Image transformations', imageTransformations, currentPlan?.imageTransformations),

            // GB Hours
            gbHours && createResourceRow('gb-hours', 'GB-hours', gbHours, currentPlan?.GBHours),

            // Phone OTP
            authPhone && createRow({
                id: 'phone-otp',
                label: 'Phone OTP',
                resource: authPhone,
                usageFormatter: ({ value }) => `${formatNum(value)} SMS messages`,
                priceFormatter: ({ amount }) => formatCurrency(amount),
                includeProgress: false
            })
        ].filter(Boolean); // Filter out any null/undefined entries

        return {
            id: `project-${projectData.$id}`,
            label: projectData.name || `Project ${projectData.$id}`,
            price: formatCurrency(projectData.amount || 0),
            children
        };
    });

    return { addons, projects };
}

function createRow({
    id,
    label,
    resource,
    planLimit,
    usageFormatter,
    priceFormatter,
    progressFactory,
    maxFactory,
    includeProgress = true
}) {
    const hasLimit = !!planLimit;
    const value = resource?.value || 0;
    const amount = resource?.amount || 0;

    const usage = usageFormatter
        ? usageFormatter({ value, planLimit, hasLimit })
        : hasLimit
            ? `${formatNum(value)} / ${formatNum(planLimit)}`
            : `${formatNum(value)} / Unlimited`;

    const price = priceFormatter ? priceFormatter({ amount, resource }) : formatCurrency(amount);

    const progressData = includeProgress && progressFactory
        ? progressFactory({ value, planLimit, hasLimit })
        : includeProgress && hasLimit
            ? createProgressData(value, planLimit)
            : [];

    const maxValue = includeProgress && maxFactory
        ? maxFactory({ planLimit, hasLimit })
        : includeProgress && hasLimit
            ? planLimit
            : null;

    return {
        id,
        label,
        usage,
        price,
        progressData: includeProgress ? progressData : undefined,
        maxValue: includeProgress ? maxValue : undefined
    };
}

function createResourceRow(id, label, resource, planLimit) {
    return createRow({ id, label, resource, planLimit });
}

export default PlanSummary;
