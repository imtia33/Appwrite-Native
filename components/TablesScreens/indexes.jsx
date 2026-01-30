import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import { useProjectStore } from '../../appwrite/store/projectStore';
import DataTable from '../blocks/DataTable';
import { Icon } from '../ui/icon';
import { FileText, Plus, Search, Trash2, Layers } from 'lucide-react-native';
import { Button } from '../ui/button';
import CreateIndexModal from './modal/CreateIndexModal';

const Indexes = ({ databaseId, collectionId }) => {
    const { currentProject } = useProjectStore();
    const { fetchIndexes, fetchAttributes, deleteIndex, createIndex } = useDatabaseStore();
    
    const [indexes, setIndexes] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (!currentProject || !databaseId || !collectionId) return;
        
        setLoading(true);
        setError(null);
        try {
            const [indexData, attrData] = await Promise.all([
                fetchIndexes(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId),
                fetchAttributes(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId)
            ]);
            setIndexes(indexData);
            setAttributes(attrData);
        } catch (err) {
            console.error('Error fetching indexes data:', err);
            setError('Failed to load indexes');
        } finally {
            setLoading(false);
        }
    }, [currentProject?.$id, databaseId, collectionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateIndex = async ({ key, type, attributes: attrKeys, orders: attrOrders }) => {
        setIsProcessing(true);
        try {
            await createIndex(
                currentProject.$id,
                currentProject.region || 'fra',
                databaseId,
                collectionId,
                key,
                type,
                attrKeys,
                attrOrders
            );
            loadData();
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to create index");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteIndex = (index) => {
        Alert.alert(
            "Delete Index",
            `Are you sure you want to delete "${index.key}"? This action is irreversible.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            await deleteIndex(
                                currentProject.$id,
                                currentProject.region || 'fra',
                                databaseId,
                                collectionId,
                                index.key
                            );
                            loadData();
                        } catch (err) {
                            Alert.alert("Error", err.message || "Failed to delete index");
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const columns = [
        {
            id: 'key',
            header: 'Index Key',
            accessorKey: 'key',
            width: 200,
            cell: ({ row }) => (
                <Text className="text-foreground font-medium text-sm">{row.original.key}</Text>
            )
        },
        {
            id: 'type',
            header: 'Type',
            accessorKey: 'type',
            width: 120,
            cell: ({ row }) => (
                <View className="bg-muted/50 px-2 py-0.5 rounded border border-border">
                    <Text className="text-xs text-muted-foreground uppercase">{row.original.type}</Text>
                </View>
            )
        },
        {
            id: 'attributes',
            header: 'Attributes',
            width: 250,
            cell: ({ row }) => (
                <View className="flex-row flex-wrap gap-1">
                    {row.original.attributes.map((attr, i) => (
                        <View key={i} className="bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            <Text className="text-[10px] text-primary">{attr} ({row.original.orders[i]})</Text>
                        </View>
                    ))}
                </View>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            width: 120,
            cell: ({ row }) => {
                const isAvailable = row.original.status === 'available';
                return (
                    <View className="flex-row items-center gap-1">
                        <View className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <Text className="text-xs text-muted-foreground capitalize">{row.original.status}</Text>
                    </View>
                );
            }
        },
        {
            id: 'actions',
            header: '',
            width: 60,
            cell: ({ row }) => (
                <TouchableOpacity onPress={() => handleDeleteIndex(row.original)} disabled={isProcessing}>
                    <Icon as={Trash2} size={16} className={isProcessing ? "text-muted-foreground/50" : "text-muted-foreground"} />
                </TouchableOpacity>
            )
        }
    ];

    if (loading && indexes.length === 0) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <View className="px-4 py-2 border-b border-border flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Total: {indexes.length} indexes</Text>
                <Button 
                    size="sm" 
                    className="h-9 px-3 bg-primary"
                    onPress={() => setIsCreateModalOpen(true)}
                >
                    <Icon as={Plus} size={16} color="white" />
                    <Text className="text-white font-bold ml-1">Index</Text>
                </Button>
            </View>

            {indexes.length === 0 && !loading ? (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                        <Icon as={Layers} size={32} className="text-muted-foreground" />
                    </View>
                    <Text className="text-lg font-semibold text-foreground">No indexes found</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Indexes improve query performance and enforce data constraints.
                    </Text>
                </View>
            ) : (
                <DataTable
                    data={indexes}
                    columns={columns}
                    showSearch={true}
                    searchPlaceholder="Search by key..."
                    filterKey="key"
                    showColumnSelector={true}
                />
            )}

            <CreateIndexModal 
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                attributes={attributes}
                onCreate={handleCreateIndex}
            />
        </View>
    );
};

export default Indexes;