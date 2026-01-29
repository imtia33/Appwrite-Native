import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useDatabaseStore from '../../../appwrite/data-services/databaseService';
import DataTable from '../../blocks/DataTable';
import { Icon } from '../../ui/icon';
import { Copy, Database, Plus, AlertTriangle, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import CreateDatabaseModal from './CreateDatabaseModal';
import DeleteDatabaseModal from './DeleteDatabaseModal';
import EditDatabaseModal from './EditDatabaseModal';
import { Pencil } from 'lucide-react-native';

const formatDate = (dateString, type = 'full') => {
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const Databases = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { fetchDatabases, getDatabases, isLoading, getError, createDatabase, updateDatabase, deleteDatabase, backupPolicies } = useDatabaseStore();
  
  const databases = currentProject?.$id ? getDatabases(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchDatabases(currentProject.$id);
    }
  }, [currentProject?.$id, fetchDatabases]);

  useEffect(() => {
    if (databases.length > 0 && currentProject?.$id) {
      databases.forEach(db => {
        if (!backupPolicies[db.$id]) {
          useDatabaseStore.getState().fetchBackupPolicies(currentProject.$id, currentProject.region || 'fra', db.$id);
        }
      });
    }
  }, [databases, currentProject?.$id, backupPolicies]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleCreateDatabase = async (name, databaseId) => {
    if (!currentProject) return;
    setIsActionLoading(true);
    try {
      await createDatabase(currentProject.$id, currentProject.region || 'fra', name, databaseId);
      setCreateModalOpen(false);
      ToastAndroid.show('Database created successfully', ToastAndroid.SHORT);
    } catch (err) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateDatabase = async (databaseId, name) => {
    if (!currentProject) return;
    setIsActionLoading(true);
    try {
      await updateDatabase(currentProject.$id, currentProject.region || 'fra', databaseId, name);
      setEditModalOpen(false);
      setSelectedDatabase(null);
      ToastAndroid.show('Database updated successfully', ToastAndroid.SHORT);
    } catch (err) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDatabase = async (databaseId) => {
    if (!currentProject) return;
    setIsActionLoading(true);
    try {
      await deleteDatabase(currentProject.$id, currentProject.region || 'fra', databaseId);
      setDeleteModalOpen(false);
      setSelectedDatabase(null);
      ToastAndroid.show('Database deleted successfully', ToastAndroid.SHORT);
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
      header: 'Database ID',
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
            <Icon as={Database} size={14} color="white"/>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
              {row.original.name || 'Unnamed Database'}
            </Text>
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {row.original.$id}
            </Text>
          </View>
        </View>
      )
    },
    {
      id: 'backup',
      header: 'Backups',
      width: 200,
      cell: ({ row }) => {
        const policies = backupPolicies[row.original.$id] || [];
        const hasPolicies = policies.length > 0;
        return (
          <View className="flex-row items-center gap-1">
            <Icon 
              as={AlertTriangle} 
              size={12} 
              color={hasPolicies ? "#10b981" : "#f59e0b"} 
            />
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {hasPolicies ? `${policies.length} policy(ies)` : 'No backup policies'}
            </Text>
          </View>
        );
      }
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
                setSelectedDatabase(row.original);
                setEditModalOpen(true);
              }}
              className="flex-row items-center gap-2"
            >
              <Icon as={Pencil} size={16} color="gray" />
              <Text className="text-foreground font-medium">Update</Text>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onPress={() => {
                setSelectedDatabase(row.original);
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
          <Text className="text-2xl font-bold text-foreground">Databases</Text>
          <Text className="text-muted-foreground text-sm">Manage your project databases and collections</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => setCreateModalOpen(true)}
        className="bg-primary px-4 py-2 rounded-lg flex-row items-center max-w-48 items-center justify-center"
      >
        <Icon as={Plus} size={18} color="white"/>
        <Text className="text-white font-semibold ml-2">Create database</Text>
      </TouchableOpacity>

      {error ? (
        <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <Text className="text-destructive font-medium">Error loading databases</Text>
          <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
          <TouchableOpacity 
            onPress={() => currentProject?.$id && fetchDatabases(currentProject.$id)}
            className="mt-4 bg-destructive px-4 py-2 rounded self-start"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DataTable 
          data={databases}
          columns={columns}
          showSearch={true}
          showColumnSelector={true}
          searchPlaceholder="Search by name or ID..."
          filterKey="name"
          onRowPress={(database) => console.log('Database pressed:', database.$id)}
        />
      )}

      <CreateDatabaseModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateDatabase}
        isLoading={isActionLoading}
      />

      <EditDatabaseModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        onUpdate={handleUpdateDatabase}
        database={selectedDatabase}
        isLoading={isActionLoading}
      />

      <DeleteDatabaseModal 
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteDatabase}
        database={selectedDatabase}
        isLoading={isActionLoading}
      />
    </View>
  );
};

export default Databases;