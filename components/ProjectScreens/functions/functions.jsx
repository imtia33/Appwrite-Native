import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useFunctionStore from '../../../appwrite/data-services/functionService';
import DataTable from '../../blocks/DataTable';
import { Badge } from '../../ui/badge';
import { Icon } from '../../ui/icon';
import { Copy, Plus, Clock, Code, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';

const formatDate = (dateString, type = 'full') => {
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// Runtime icon mapping
const getRuntimeIcon = (runtime) => {
  if (!runtime) return 'code';
  const base = runtime.split('-')[0].toLowerCase();
  
  const iconMap = {
    'node': 'node',
    'python': 'python',
    'php': 'php',
    'ruby': 'ruby',
    'dart': 'dart',
    'deno': 'deno',
    'dotnet': 'dotnet',
    'java': 'java',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'bun': 'bun',
  };
  return iconMap[base] || 'code';
};

const Functions = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { fetchFunctions, getFunctions, isLoading, getError } = useFunctionStore();
  
  const functions = currentProject?.$id ? getFunctions(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  useEffect(() => {
    if (currentProject?.$id) {
      fetchFunctions(currentProject.$id);
    }
  }, [currentProject?.$id, fetchFunctions]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      // Delete functions one by one
      for (const id of selectedIds) {
        await sdk.forProject(currentProject.region || 'fra', currentProject.$id).functions.delete(id);
      }
      ToastAndroid.show(`${selectedIds.length} function(s) deleted`, ToastAndroid.SHORT);
      // Refresh the list
      if (currentProject?.$id) {
        fetchFunctions(currentProject.$id);
      }
    } catch (err) {
      console.error('Error deleting functions:', err);
      ToastAndroid.show('Error deleting functions', ToastAndroid.SHORT);
    }
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'Function ID',
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
      width: 280,
      cell: ({ row }) => {
        const runtimeIcon = getRuntimeIcon(row.original.runtime);
        return (
          <View className="flex-row items-center py-1">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
              <Icon as={Code} size={14} color="white"/>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
                {row.original.name || 'Unnamed Function'}
              </Text>
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {row.original.runtime}
              </Text>
            </View>
          </View>
        );
      }
    },
    {
      id: 'status',
      header: 'Status',
      width: 120,
      cell: ({ row }) => (
        <Badge variant={row.original.enabled ? "success" : "secondary"} className="h-6">
          <Text className="text-[10px] uppercase text-white">
            {row.original.enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </Badge>
      )
    },
    {
      id: 'schedule',
      header: 'Schedule',
      width: 150,
      cell: ({ row }) => {
        if (!row.original.schedule) {
          return (
            <Text className="text-muted-foreground text-xs">-</Text>
          );
        }
        return (
          <View className="flex-row items-center gap-1">
            <Icon as={Clock} size={12} color="#3b82f6" />
            <Text className="text-foreground text-xs" numberOfLines={1}>
              Scheduled
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
    }
  ];

  if (loading) {
    console.log('Rendering: LOADING STATE');
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ef4444" size="large" />
        <Text className="text-foreground mt-4">Loading functions...</Text>
      </View>
    );
  }

  console.log('Rendering: MAIN CONTENT');
  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">Functions</Text>
          <Text className="text-muted-foreground text-sm">Deploy and scale serverless functions</Text>
        </View>
      </View>

      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity 
          onPress={() => console.log('Create function')}
          className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
        >
          <Icon as={Plus} size={18} color="white"/>
          <Text className="text-white font-semibold ml-2">Create function</Text>
        </TouchableOpacity>

      </View>

      {error ? (
        (() => {
          console.log('Rendering: ERROR STATE');
          return (
            <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <Text className="text-destructive font-medium">Error loading functions</Text>
              <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
              <TouchableOpacity 
                onPress={() => currentProject?.$id && fetchFunctions(currentProject.$id)}
                className="mt-4 bg-destructive px-4 py-2 rounded self-start"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          );
        })()
      ) : !currentProject ? (
        (() => {
          console.log('Rendering: NO PROJECT STATE');
          return (
            <View className="flex-1 items-center justify-center p-8">
              <Icon as={AlertCircle} size={48} color="#9ca3af" />
              <Text className="text-muted-foreground text-center mt-4">No project selected</Text>
            </View>
          );
        })()
      ) : functions.length === 0 ? (
        (() => {
          console.log('Rendering: EMPTY STATE');
          return (
            <View className="flex-1 items-center justify-center p-8 bg-card rounded-lg border border-border">
              <Icon as={Code} size={64} color="#9ca3af" />
              <Text className="text-foreground text-xl font-bold mt-4">No functions yet</Text>
              <Text className="text-muted-foreground text-center mt-2 mb-6">
                Create your first serverless function to get started
              </Text>
              <TouchableOpacity 
                onPress={() => console.log('Create function')}
                className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
              >
                <Icon as={Plus} size={20} color="white"/>
                <Text className="text-white font-semibold ml-2">Create your first function</Text>
              </TouchableOpacity>
            </View>
          );
        })()
      ) : (
        (() => {
          console.log('Rendering: DATA TABLE with', functions.length, 'functions');
          return (
            <DataTable 
              data={functions}
              columns={columns}
              showSearch={true}
              showColumnSelector={true}
              searchPlaceholder="Search by name or ID..."
              filterKey="name"
              onRowPress={(func) => console.log('Function pressed:', func.$id)}
              onDeleteSelected={handleDeleteSelected}
            />
          );
        })()
      )}
    </View>
  );
};

export default Functions;