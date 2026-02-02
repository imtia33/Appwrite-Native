import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import { useProjectStore } from '../../appwrite/store/projectStore';
import DataTable from '../blocks/DataTable';
import { Icon } from '../ui/icon';
import { FileText, Plus, Upload, Filter, Search as SearchIcon, Copy, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Query } from '@appwrite.io/console';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome } from '@expo/vector-icons';

const Rows = ({ databaseId, collectionId }) => {
    const { currentProject } = useProjectStore();
    const { fetchDocuments, fetchAttributes, documentCache } = useDatabaseStore();
    const cacheKey = `${databaseId}:${collectionId}`;
    const cache = documentCache[cacheKey] || { items: [], hasMore: true, loading: false };
    
    const [attributes, setAttributes] = useState([]);
    const [error, setError] = useState(null);
    
    // Pagination state (internal to component for manual triggers)
    const [limit, setLimit] = useState(25);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);

    const loadAttributes = useCallback(async () => {
        if (!currentProject || !databaseId || !collectionId) return;
        setIsLoadingAttributes(true);
        try {
            const attrs = await fetchAttributes(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId);
            setAttributes(attrs);
        } catch (err) {
            console.error('Error loading attributes:', err);
        } finally {
            setIsLoadingAttributes(false);
        }
    }, [currentProject?.$id, databaseId, collectionId, fetchAttributes]);

    const loadDocuments = useCallback(async (query = '', isNextPage = false, currentLimit = 25, forceRefresh = false) => {
        if (!currentProject || !databaseId || !collectionId) return;
        
        if (isNextPage) {
            setIsLoadingMore(true);
        }
        setError(null);
        try {
            const queries = [];
            if (query) {
                queries.push(Query.contains('$id', query));
            }
            
            await fetchDocuments(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId, {
                queries,
                isNextPage,
                forceRefresh,
                limit: currentLimit
            });
            
        } catch (err) {
            console.error('Error loading documents:', err);
            setError('Failed to load documents');
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentProject?.$id, databaseId, collectionId, fetchDocuments]);

    const formattedDocuments = useMemo(() => {
        return cache.items.map(doc => {
            const formatted = {
                ...doc,
                $formattedCreatedAt: new Date(doc.$createdAt).toLocaleString(),
                $formattedUpdatedAt: new Date(doc.$updatedAt).toLocaleString(),
            };
            
            attributes.forEach(attr => {
                const value = doc[attr.key];
                if (value !== null && typeof value === 'object') {
                    formatted[`$stringified_${attr.key}`] = JSON.stringify(value);
                }
            });
            
            return formatted;
        });
    }, [cache.items, attributes]);

    useEffect(() => {
        loadAttributes();
    }, [loadAttributes]);

    useEffect(() => {
        loadDocuments(searchQuery, false, limit, false);
    }, [loadDocuments, limit, searchQuery]); 

 

    

    const copyToClipboard = useCallback(async (text) => {
        await Clipboard.setStringAsync(text);
        ToastAndroid?.show?.('Copied to clipboard', ToastAndroid.SHORT);
    }, []);

    const handleEndReached = () => {
        if (cache.hasMore && !isLoadingMore && cache.items.length > 0) {
            loadDocuments(searchQuery, true, limit, false);
        }
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
    };

    const handleImportCSV = () => {
        Alert.alert("Import CSV", "CSV import is not yet implemented in this version.");
    };

    const columns = useMemo(() => {
        const baseColumns = [
            { id: 'select', width: 50 },
            {
                id: '$id',
                accessorKey: '$id',
                header: 'ID',
                width: 200,
                cell: ({ row }) => (
                    <TouchableOpacity 
                              onPress={() => copyToClipboard(row.original.$id)}
                              className="flex-row items-center bg-input px-2 py-1 rounded-sm"
                            >
                              <Icon as={Copy} size={12} color='gray' />
                              <Text className="text-xs font-mono text-muted-foreground ml-2" numberOfLines={1}>{row.original.$id}</Text>
                    </TouchableOpacity>
                )
            }
        ];

        const attrColumns = attributes
            .filter(attr => attr.status === 'available')
            .map(attr => ({
                id: attr.key,
                accessorKey: attr.key,
                header: attr.key,
                width: 150,
                cell: ({ row }) => {
                    const value = row.original[attr.key];
                    if (value === null || value === undefined) {
                        return <Text className="text-muted-foreground italic text-xs">null</Text>;
                    }
                    if (typeof value === 'object') {
                        return <Text className="text-foreground text-sm" numberOfLines={1}>
                            {row.original[`$stringified_${attr.key}`] || JSON.stringify(value)}
                        </Text>;
                    }
                    return <Text className="text-foreground text-sm" numberOfLines={1}>{String(value)}</Text>;
                }
            }));

        const metaColumns = [
            {
                id: '$createdAt',
                accessorKey: '$createdAt',
                header: 'Created At',
                width: 200,
                cell: ({ row }) => <Text className="text-muted-foreground text-xs">{row.original.$formattedCreatedAt}</Text>
            },
            {
                id: '$updatedAt',
                accessorKey: '$updatedAt',
                header: 'Updated At',
                width: 200,
                cell: ({ row }) => <Text className="text-muted-foreground text-xs">{row.original.$formattedUpdatedAt}</Text>
            }
        ];

        return [...baseColumns, ...attrColumns, ...metaColumns];
    }, [attributes]);

    if ((cache.loading && cache.items.length === 0) || isLoadingAttributes) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#FD366E" />
                <Text className="text-muted-foreground mt-4">Loading documents...</Text>
            </View>
        );
    }

    const documents = formattedDocuments;

    return (
        <View className="flex-1 bg-background">
            <View className="px-4 py-2 border-b border-border flex-row items-center justify-between gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    style={{borderWidth: 1, borderColor: 'gray', transform: [{ rotate: '90deg' }]}}
                    className="h-10 "
                    
                >
                    <FontAwesome name="bars" size={16} color="gray" />
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    style={{borderWidth: 1, borderColor: 'gray'}}
                    className="h-10 bg-input"
                    onPress={handleImportCSV}
                >
                    <FontAwesome name="filter" size={18} color="gray" />
                    <Text className="text-muted-foreground text-[15px] font-medium">Filter</Text>
                </Button>
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-3 bg-input"
                    style={{borderWidth: 1, borderColor: 'gray'}}
                    onPress={handleImportCSV}
                >
                    <Icon as={Upload} size={16} color="gray"  />
                    <Text className="text-muted-foreground text-[15px] font-medium">Import CSV</Text>
                </Button>
                <Button 
                    size="sm" 
                    className="h-10 px-3 bg-primary"
                    //onPress={() => setIsCreateModalOpen(true)}
                >
                    <Icon as={Plus} size={18} color="white" />
                </Button>
                
            </View>

            {cache.items.length === 0 && !cache.loading ? (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                        <Icon as={FileText} size={32} className="text-muted-foreground" />
                    </View>
                    <Text className="text-lg font-semibold text-foreground">No documents found</Text>
                    <Text className="text-muted-foreground text-center mt-2 max-w-xs">
                        {searchQuery ? `No results for "${searchQuery}"` : "This collection doesn't have any documents yet."}
                    </Text>
                    {!searchQuery && (
                        <Button className="mt-6 bg-primary" 
                        //onPress={() => setIsCreateModalOpen(true)}
                        >
                            <Text className="text-white font-bold">Create First Document</Text>
                        </Button>
                    )}
                </View>
            ) : (
                <View className="flex-1">
                    <DataTable
                        data={documents}
                        columns={columns}
                        showSearch={false}
                        showColumnSelector={false}
                        pagination={false}
                        showGridLines={true}
                        onEndReached={handleEndReached}
                        isLoadingMore={isLoadingMore}
                        selectColumnKey="$sequence"
                        onRowPress={(item) => {
                            // setSelectedDocument(item);
                            // setIsEditModalOpen(true);
                        }}
                    />
                    
                </View>
            )}

            
        </View>
    );
};

export default memo(Rows);
