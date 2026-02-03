import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useAuthStore from '../../../appwrite/data-services/authService';
import DataTable from '../../blocks/DataTable';
import { Badge } from '../../ui/badge';
import { Icon } from '../../ui/icon';
import { Copy, UserPlus, Mail, Phone, ShieldCheck, ShieldAlert, MoreHorizontal, User } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';

import CreateUserModal from './modals/CreateUserModal';

const formatDate = (dateString, type = 'full') => {
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const AuthUsers = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { fetchUsers, getUsers, isLoading, getError } = useAuthStore();
  
  const users = currentProject?.$id ? getUsers(currentProject.$id) : [];
  const loading = isLoading('users');
  const error = getError('users');

  useEffect(() => {
    if (currentProject?.$id) {
      fetchUsers(currentProject.$id);
    }
  }, [currentProject?.$id, fetchUsers]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'User ID',
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
        <View className="flex-row items-center py-1">
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
             <Text className="text-foreground font-bold text-xs">
                {row.original.name ? row.original.name.charAt(0).toUpperCase() : <Icon as={User} size={14} className="text-primary"/>}
             </Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
              {row.original.name || 'Anonymous User'}
            </Text>
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {row.original.email || row.original.phone || 'No identifier'}
            </Text>
          </View>
        </View>
      )
    },
    {
      id: 'identifiers',
      header: 'Identifiers',
      width: 220,
      cell: ({ row }) => (
        <View className="flex-row flex-wrap gap-1">
          {row.original.email && (
            <View className="flex-row items-center">
              <Icon as={Mail} size={12} color='gray'  />
              <Text className="text-sm text-muted-foreground ml-1" numberOfLines={1}>{row.original.email}</Text>
            </View>
          )}
          {row.original.phone && (
            <View className="flex-row items-center">
              <Icon as={Phone} size={12} className="text-muted-foreground mr-1" />
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>{row.original.phone}</Text>
            </View>
          )}
        </View>
      )
    },
    {
      id: 'status',
      header: 'Status',
      width: 150,
      cell: ({ row }) => {
        const isVerified = row.original.emailVerification || row.original.phoneVerification;
        const isBlocked = !row.original.status;

        if (isBlocked) {
          return <Badge variant="destructive" className="h-6"><Text className="text-[10px] uppercase">Blocked</Text></Badge>;
        }

        return (
          <Badge variant={isVerified ? "success" : "secondary"} className="h-6">
            <Icon as={isVerified ? ShieldCheck : ShieldAlert} size={10} color="white" className="mr-1" />
            <Text className="text-[10px] uppercase text-white">{isVerified ? 'Verified' : 'Unverified'}</Text>
          </Badge>
        );
      }
    },
    {
        id: 'registration',
        header: 'Joined',
        accessorKey: 'registration',
        width: 150,
        cell: ({ row }) => (
            <View>
                <Text className="text-foreground text-xs">{formatDate(row.original.registration)}</Text>
                <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.registration, 'time')}</Text>
            </View>
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
          <Text className="text-2xl font-bold text-foreground">Users</Text>
          <Text className="text-muted-foreground text-sm">Manage your project users and their security</Text>
        </View>
        
      </View>
      <TouchableOpacity 
          onPress={() => setIsCreateModalOpen(true)}
          className="bg-primary px-4 py-2 rounded-lg flex-row items-center max-w-40 items-center justify-center mb-4"
        >
          <Icon as={UserPlus} size={18} color="white"/>
          <Text className="text-white font-semibold ml-2">Create user</Text>
        </TouchableOpacity>

      {error ? (
        <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <Text className="text-destructive font-medium">Error loading users</Text>
          <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
          <TouchableOpacity 
            onPress={() => currentProject?.$id && fetchUsers(currentProject.$id)}
            className="mt-4 bg-destructive px-4 py-2 rounded self-start"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DataTable 
          data={users}
          columns={columns}
          showSearch={true}
          showColumnSelector={true}
          searchPlaceholder="Search by ID, name or email..."
          filterKey="name"
          onRowPress={(user) => console.log('User pressed:', user.$id)}
          // TODO: Implement user row press logic
        />
      )}

      <CreateUserModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onCreated={(newUser) => {
          // Refresh users data
          if (currentProject?.$id) {
            fetchUsers(currentProject.$id);
          }
        }}
      />
    </View>
  );
};

export default AuthUsers;