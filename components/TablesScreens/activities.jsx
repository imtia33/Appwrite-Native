import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import { useProjectStore } from '../../appwrite/store/projectStore';
import DataTable from '../blocks/DataTable';

const Activities = ({ databaseId, collectionId }) => {
    const { currentProject } = useProjectStore();
    const { fetchTableLogs } = useDatabaseStore();
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!currentProject || !databaseId || !collectionId) return;
            
            setLoading(true);
            setError(null);
            try {
                const results = await fetchTableLogs(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId);
                setLogs(results);
            } catch (err) {
                console.error('Error loading logs:', err);
                setError('Failed to load activity logs');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentProject?.$id, databaseId, collectionId]);

    const columns = useMemo(() => [
        {
            id: 'event',
            accessorKey: 'event',
            header: 'Event',
            width: 250,
        },
        {
            id: 'userName',
            accessorKey: 'userName',
            header: 'User',
            width: 150,
        },
        {
            id: 'time',
            accessorKey: 'time',
            header: 'Date',
            width: 200,
            cell: ({ row }) => <Text className="text-muted-foreground text-xs">{new Date(row.original.time).toLocaleString()}</Text>
        },
        {
            id: 'ip',
            accessorKey: 'ip',
            header: 'IP',
            width: 120,
        }
    ], []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#FD366E" />
                <Text className="text-muted-foreground mt-4">Loading activities...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <Text className="text-destructive text-center mb-4">{error}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <DataTable
                data={logs}
                columns={columns}
                filterKey="event"
                searchPlaceholder="Search by event..."
            />
        </View>
    );
};

export default Activities;