import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useMessagingStore from '../../../appwrite/data-services/messagingService';
import DataTable from '../../blocks/DataTable';
import { Icon } from '../../ui/icon';
import { Copy, Plus, Hash, Users, Mail, MessageSquare, Bell, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';
import CreateTopicModal from './modals/CreateTopicModal';

const formatDate = (dateString, type = 'full') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const Topics = () => {
  const { theme, isDark } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { fetchTopics, getTopics, isLoading, getError, deleteTopic, createTopic } = useMessagingStore();
  
  const topics = currentProject?.$id ? getTopics(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchTopics(currentProject.$id);
    }
  }, [currentProject?.$id, fetchTopics]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleCreateTopic = async (name, topicId) => {
    if (!currentProject) return;
    setIsActionLoading(true);
    try {
      await createTopic(currentProject.$id, currentProject.region || 'fra', name, topicId);
      setCreateModalOpen(false);
      ToastAndroid.show('Topic created successfully', ToastAndroid.SHORT);
    } catch (err) {
      ToastAndroid.show(`Error: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      for (const id of selectedIds) {
        await deleteTopic(currentProject.$id, currentProject.region || 'fra', id);
      }
      ToastAndroid.show(`${selectedIds.length} topic(s) deleted`, ToastAndroid.SHORT);
    } catch (err) {
      console.error('Error deleting topics:', err);
      ToastAndroid.show('Error deleting topics', ToastAndroid.SHORT);
    }
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'Topic ID',
      accessorKey: '$id',
      width: 200,
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
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
             <Icon as={Hash} size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          </View>
          <Text className="text-foreground font-medium" numberOfLines={1}>{row.original.name}</Text>
        </View>
      )
    },
    {
        id: 'subscribers',
        header: 'Subscribers',
        width: 150,
        cell: ({ row }) => {
            const total = (row.original.emailTotal || 0) + (row.original.smsTotal || 0) + (row.original.pushTotal || 0);
            return (
                <View className="flex-row items-center gap-2">
                    <Icon as={Users} size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="text-foreground text-xs">{total} Total</Text>
                </View>
            );
        }
    },
    {
        id: 'breakdown',
        header: 'Breakdown',
        width: 180,
        cell: ({ row }) => (
            <View className="flex-row gap-2">
                <View className="flex-row items-center gap-1">
                    <Icon as={Mail} size={10} color='gray' />
                    <Text className="text-[10px] text-muted-foreground">{row.original.emailTotal || 0}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Icon as={MessageSquare} size={10} color='gray' />
                    <Text className="text-[10px] text-muted-foreground">{row.original.smsTotal || 0}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Icon as={Bell} size={10} color='gray' />
                    <Text className="text-[10px] text-muted-foreground">{row.original.pushTotal || 0}</Text>
                </View>
            </View>
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
    }
  ];

  return (
    <View className="flex-1 bg-background">
      {loading && topics.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <ActivityIndicator color={theme.primary} size="large" />
          <Text className="text-foreground mt-4">Loading topics...</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-2xl font-bold text-foreground">Topics</Text>
              <Text className="text-muted-foreground text-sm">Manage your messaging topics and subscribers</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity 
              onPress={() => setCreateModalOpen(true)}
              className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
            >
              <Icon as={Plus} size={18} color="white"/>
              <Text className="text-white font-semibold ml-2">Create topic</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <Text className="text-destructive font-medium">Error loading topics</Text>
              <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
              <TouchableOpacity 
                onPress={() => currentProject?.$id && fetchTopics(currentProject.$id)}
                className="mt-4 bg-destructive px-4 py-2 rounded self-start"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !currentProject ? (
            <View className="flex-1 items-center justify-center p-8">
              <Icon as={AlertCircle} size={48} color="#9ca3af" />
              <Text className="text-muted-foreground text-center mt-4">No project selected</Text>
            </View>
          ) : topics.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8 bg-card rounded-lg border border-border">
              <Icon as={Hash} size={64} color="#9ca3af" />
              <Text className="text-foreground text-xl font-bold mt-4">No topics yet</Text>
              <Text className="text-muted-foreground text-center mt-2 mb-6">
                Create a topic to group your subscribers
              </Text>
              <TouchableOpacity 
                onPress={() => setCreateModalOpen(true)}
                className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
              >
                <Icon as={Plus} size={20} color="white"/>
                <Text className="text-white font-semibold ml-2">Create your first topic</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DataTable 
              data={topics}
              columns={columns}
              showSearch={true}
              showColumnSelector={true}
              searchPlaceholder="Search by name or ID..."
              filterKey="name"
              onRowPress={(t) => console.log('Topic pressed:', t.$id)}
              onDeleteSelected={handleDeleteSelected}
            />
          )}
        </View>
      )}

      {/* Modals outside conditional block */}

      <CreateTopicModal 
        visible={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTopic}
        isLoading={isActionLoading}
      />
    </View>
  );
};

export default Topics;