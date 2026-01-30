import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useBucketStore from '../../../appwrite/data-services/storageService';
import DataTable from '../../blocks/DataTable';
import { Icon } from '../../ui/icon';
import { Copy, Plus, MoreHorizontal, Trash2, Archive, Shield, ShieldOff, Pencil } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';

const formatDate = (dateString, type = 'full') => {
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const Buckets = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { fetchBuckets, getBuckets, isLoading, getError, deleteBucket } = useBucketStore();
  
  const buckets = currentProject?.$id ? getBuckets(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchBuckets(currentProject.$id);
    }
  }, [currentProject?.$id, fetchBuckets]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleDeleteBucket = async (bucketId) => {
    if (!currentProject) return;
    setIsActionLoading(true);
    try {
      await deleteBucket(currentProject.$id, currentProject.region || 'fra', bucketId);
      setDeleteModalOpen(false);
      setSelectedBucket(null);
      ToastAndroid.show('Bucket deleted successfully', ToastAndroid.SHORT);
    } catch (err) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'Bucket ID',
      accessorKey: '$id',
      width: 210,
      cell: ({ row }) => (
        <TouchableOpacity 
          onPress={() => copyToClipboard(row.original.$id)}
          className="flex-row items-center bg-input px-2 py-1 rounded-lg"
        >
          <Icon as={Copy} size={12} color='gray' />
          <Text className="text-xs font-mono text-muted-foreground ml-2" numberOfLines={1}>{row.original.$id}</Text>
        </TouchableOpacity>
      )
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      width: 250,
      cell: ({ row }) => (
        <View className="flex-row items-center py-1">
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
            <Icon as={Archive} size={14} color="white"/>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
              {row.original.name || 'Unnamed Bucket'}
            </Text>
            <View className="flex-row items-center gap-2">
                <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {row.original.$id}
                </Text>
                {!row.original.enabled && (
                    <View className="bg-muted px-1.5 rounded">
                        <Text className="text-[8px] text-muted-foreground font-bold">DISABLED</Text>
                    </View>
                )}
            </View>
          </View>
        </View>
      )
    },
    {
      id: 'security',
      header: 'Security',
      width: 150,
      cell: ({ row }) => (
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1">
            <Icon 
              as={row.original.encryption ? Shield : ShieldOff} 
              size={12} 
              color={row.original.encryption ? "#10b981" : "#f59e0b"} 
            />
            <Text className="text-muted-foreground text-xs">
              {row.original.encryption ? 'Encrypted' : 'Plain'}
            </Text>
          </View>
        </View>
      )
    },
    {
        id: 'settings',
        header: 'File Security',
        width: 120,
        cell: ({ row }) => (
          <Text className="text-muted-foreground text-xs">
            {row.original.fileSecurity ? 'Enabled' : 'Disabled'}
          </Text>
        )
    },
    {
      id: '$createdAt',
      header: 'Created',
      accessorKey: '$createdAt',
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">{formatDate(row.original.$createdAt)}</Text>
          <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.$createdAt, 'time')}</Text>
        </View>
      )
    },
    {
      id: '$updatedAt',
      header: 'Updated',
      accessorKey: '$updatedAt',
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">{formatDate(row.original.$updatedAt)}</Text>
          <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.$updatedAt, 'time')}</Text>
        </View>
      )
    },
    {
      id: 'actions',
      header: '',
      width: 50,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TouchableOpacity className="p-2">
              <Icon as={MoreHorizontal} size={18} color="gray" />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-border">
            <DropdownMenuItem 
              onPress={() => {
                setSelectedBucket(row.original);
                setEditModalOpen(true);
              }}
              className="flex-row items-center gap-2"
            >
              <Icon as={Pencil} size={16} color="gray" />
              <Text className="text-foreground font-medium">Update</Text>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onPress={() => {
                setSelectedBucket(row.original);
                setDeleteModalOpen(true);
              }}
              className="flex-row items-center gap-2"
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-destructive font-medium">Delete</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ef4444" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">Storage</Text>
          <Text className="text-muted-foreground text-sm">Manage your project buckets and files</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => setCreateModalOpen(true)}
        className="bg-primary px-4 py-2 rounded-lg flex-row items-center max-w-48 items-center justify-center"
      >
        <Icon as={Plus} size={18} color="white"/>
        <Text className="text-white font-semibold ml-2">Create bucket</Text>
      </TouchableOpacity>

      {error ? (
        <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 mt-4">
          <Text className="text-destructive font-medium">Error loading buckets</Text>
          <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
          <TouchableOpacity 
            onPress={() => currentProject?.$id && fetchBuckets(currentProject.$id)}
            className="mt-4 bg-destructive px-4 py-2 rounded self-start"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DataTable 
          data={buckets}
          columns={columns}
          showSearch={true}
          showColumnSelector={true}
          searchPlaceholder="Search by name or ID..."
          filterKey="name"
          onRowPress={(bucket) => console.log('Bucket pressed:', bucket.$id)}
        />
      )}

      {/* Modals will be implemented next if needed */}
    </View>
  );
};

export default Buckets;
