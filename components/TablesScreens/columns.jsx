import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import { useProjectStore } from '../../appwrite/store/projectStore';
import DataTable from '../blocks/DataTable';
import { Icon } from '../ui/icon';
import { FileText, Plus, Database, AlertCircle, Trash2 } from 'lucide-react-native';
import { Button } from '../ui/button';
import CreateAttributeModal from './modal/CreateAttributeModal';
import { Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const Columns = ({ databaseId, collectionId }) => {
    const { currentProject } = useProjectStore();
    const { fetchAttributes, deleteAttribute, createAttribute, fetchCollections, collections } = useDatabaseStore();
    
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadAttributes = useCallback(async () => {
        if (!currentProject || !databaseId || !collectionId) return;
        
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAttributes(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId);
            setAttributes(data);
        } catch (err) {
            console.error('Error fetching attributes:', err);
            setError('Failed to load attributes');
        } finally {
            setLoading(false);
        }
    }, [currentProject?.$id, databaseId, collectionId]);

    useEffect(() => {
        loadAttributes();
        fetchCollections(currentProject?.$id, currentProject?.region || 'fra', databaseId);
    }, [loadAttributes, fetchCollections, currentProject?.$id, currentProject?.region, databaseId]);

    const handleCreateAttribute = async ({ type, data }) => {
        setIsProcessing(true);
        try {
            await createAttribute(
                currentProject.$id,
                currentProject.region || 'fra',
                databaseId,
                collectionId,
                type,
                data
            );
            loadAttributes();
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to create attribute");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteAttribute = async (attribute) => {
        Alert.alert(
            "Delete Attribute",
            `Are you sure you want to delete "${attribute.key}"? This action is irreversible.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            await deleteAttribute(
                                currentProject.$id,
                                currentProject.region || 'fra',
                                databaseId,
                                collectionId,
                                attribute.key
                            );
                            loadAttributes();
                        } catch (err) {
                            Alert.alert("Error", err.message || "Failed to delete attribute");
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };
function getIconByType(type, format) {
  if (type === "string") {
    switch (format) {
      case "email":
        return <MaterialCommunityIcons name="email-outline" size={18} color="gray" />
      case "ip":
        return <Entypo name="location-pin" size={18} color="gray" />
      case "url":
        return <MaterialCommunityIcons name="link-variant" size={18} color="gray" />
      case "enum":
        return <MaterialCommunityIcons name="format-list-bulleted" size={18} color="gray" />
      default:
        return <MaterialCommunityIcons name="format-text" size={18} color="gray" />
    }
  }

  switch (type) {
    case "integer":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />
    case "double":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />
    case "boolean":
      return <FontAwesome name="toggle-on" size={18} color="gray" />
    case "datetime":
      return <Ionicons name="calendar-clear-sharp" size={18} color="gray" />
    case "point":
      return <MaterialCommunityIcons name="dots-triangle" size={18} color="gray" />
    case "linestring":
      return <Entypo name="flow-line" size={18} color="gray" />
    case "polygon":
      return <FontAwesome5 name="draw-polygon" size={18} color="gray" />
    case "relationship":
      return <FontAwesome5 name="arrow-right" size={18} color="gray" />
    default:
      return
  }
}



    const columns = [
        {
            id: 'key',
            header: 'Attribute Key',
            accessorKey: 'key',
            width: 250,
            cell: ({ row }) => (
                <View className="flex-row items-center">
                    {getIconByType(row.original.type, row.original.format)}
                    <Text className="text-muted-foreground font-medium text-[15px] ml-1 ">{row.original.key}</Text>
                    {row.original?.array && <MaterialIcons name="data-array" size={18} color="gray" />}
                    {row.original?.encrypt && <FontAwesome name="lock" size={18} color="gray" style={{marginLeft:5}} />}
                    {row.original.required && <Text className="text-muted-foreground ml-1 px-2 py-1 bg-input rounded-sm">required</Text>}
                </View>
            )
        },
        {
            id: 'type',
            header: 'Type',
            accessorKey: 'type',
            width: 120,
            cell: ({ row }) => (
                <View className="">
                    <Text className="text-xs text-muted-foreground uppercase text-center">{row.original.type}</Text>
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
            id: 'default',
            header: 'Default',
            width: 150,
            cell: ({ row }) => (
                <Text className="text-sm text-muted-foreground">
                    {[
                        row.original.default != null && `Default: ${row.original.default}`,
                    ]
                        .filter(Boolean)
                        .join(' • ')}
                </Text>

            )
        },
        {
            id: 'meta',
            header: 'Meta',
            width: 350,
            cell: ({ row }) => (
                <Text className="text-sm text-muted-foreground">
                    {[
                        row.original.size != null && `Size: ${row.original.size}`,
                        row.original.min != null && `Min: ${row.original.min}`,
                        row.original.max != null && `Max: ${row.original.max}`,
                    ]
                        .filter(Boolean)
                        .join(' • ')}
                </Text>

            )
        },
        {
            id: 'actions',
            header: '',
            width: 60,
            cell: ({ row }) => (
                <TouchableOpacity onPress={() => handleDeleteAttribute(row.original)} disabled={isProcessing}>
                    <Icon as={Trash2} size={16} className={isProcessing ? "text-muted-foreground/50" : "text-muted-foreground"} />
                </TouchableOpacity>
            )
        }
    ];

    if (loading && attributes.length === 0) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <View className="px-4 py-2 border-b border-border flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Total: {attributes.length} attributes</Text>
                <Button 
                    size="sm" 
                    className="h-9 px-3 bg-primary"
                    onPress={() => setIsCreateModalOpen(true)}
                >
                    <Icon as={Plus} size={16} color="white" />
                    <Text className="text-white font-bold ml-1">Attribute</Text>
                </Button>
            </View>

            {attributes.length === 0 && !loading ? (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                        <Icon as={Database} size={32} className="text-muted-foreground" />
                    </View>
                    <Text className="text-lg font-semibold text-foreground">No attributes found</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Create attributes to define the structure of your documents.
                    </Text>
                </View>
            ) : (
                <DataTable
                    data={attributes}
                    columns={columns}
                    showSearch={false}
                    searchPlaceholder="Search by key..."
                    filterKey="key"
                    showColumnSelector={false}
                    pagination={false}
                />
            )}

            <CreateAttributeModal 
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreate={handleCreateAttribute}
                collections={collections[databaseId] || []}
            />
        </View>
    );
};

export default Columns;