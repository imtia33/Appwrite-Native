import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { sdk } from '../../appwrite/appwrite';
import DataTable from '../../components/blocks/DataTable';
import { Text } from '../../components/ui/text';
import { Card, CardContent } from '../../components/ui/card';
import { Globe, Monitor, Smartphone, Tablet } from 'lucide-react-native';

const Activity = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await sdk.forConsole.account.listLogs();
            setLogs(response.logs);
        } catch (error) {
            console.error('Fetch logs error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns = useMemo(() => [
        {
            header: "Event",
            accessorKey: "event",
            width: 180,
            cell: ({ row }) => (
                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {row.original.event}
                </Text>
            )
        },
        {
            header: "Client",
            accessorKey: "clientName",
            width: 250,
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <View className="flex-row items-center gap-2">
                        {log.deviceName === 'smartphone' ? (
                            <Smartphone size={14} color="#666" />
                        ) : log.deviceName === 'tablet' ? (
                            <Tablet size={14} color="#666" />
                        ) : (
                            <Monitor size={14} color="#666" />
                        )}
                        <View className="flex-1 overflow-hidden">
                            <Text className="text-sm text-foreground" numberOfLines={1}>
                                {log.clientName || 'Unknown'} {log.clientVersion}
                            </Text>
                            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                {log.osName} {log.osVersion}
                            </Text>
                        </View>
                    </View>
                );
            }
        },
        {
            header: "IP",
            accessorKey: "ip",
            width: 150,
            cell: ({ row }) => (
                <Text className="text-sm font-mono text-foreground" numberOfLines={1}>
                    {row.original.ip}
                </Text>
            )
        },
        {
            header: "Location",
            accessorKey: "countryName",
            width: 150,
            cell: ({ row }) => (
                <View className="flex-row items-center gap-2">
                    <Globe size={14} color="#666" />
                    <Text className="text-sm text-foreground" numberOfLines={1}>
                        {row.original.countryName || 'Unknown'}
                    </Text>
                </View>
            )
        },
        {
            header: "Time",
            accessorKey: "time",
            width: 200,
            cell: ({ row }) => {
                const date = new Date(row.original.time);
                return (
                    <View>
                        <Text className="text-sm text-foreground" numberOfLines={1}>
                            {date.toLocaleDateString()}
                        </Text>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            {date.toLocaleTimeString()}
                        </Text>
                    </View>
                );
            }
        }
    ], []);

    if (loading && logs.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text>Loading activity logs...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-background">
            <View className="p-4 gap-6">
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-bold">Activity Logs</Text>
                </View>
                
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <DataTable
                            data={logs}
                            columns={columns}
                            pagination={true}
                            itemsPerPage={10}
                            showSearch={false}
                            showColumnSelector={false}
                        />
                    </CardContent>
                </Card>
            </View>
        </ScrollView>
    );
};

export default Activity;