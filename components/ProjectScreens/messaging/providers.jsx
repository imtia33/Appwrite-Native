import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useMessagingStore from '../../../appwrite/data-services/messagingService';
import DataTable from '../../blocks/DataTable';
import { Badge } from '../../ui/badge';
import { Icon } from '../../ui/icon';
import { Copy, Plus, Mail, MessageSquare, Bell, AlertCircle, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';
import { cn } from '../../../lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';

import EmailProviderModal from './modals/EmailProviderModal';
import SmsProviderModal from './modals/SmsProviderModal';
import PushProviderModal from './modals/PushProviderModal';

const Providers = () => {
  const { theme, isDark } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { fetchProviders, getProviders, isLoading, getError, deleteProvider, createProvider } = useMessagingStore();
  
  const providers = currentProject?.$id ? getProviders(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchProviders(currentProject.$id);
    }
  }, [currentProject?.$id, fetchProviders]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      for (const id of selectedIds) {
        await deleteProvider(currentProject.$id, currentProject.region || 'fra', id);
      }
      ToastAndroid.show(`${selectedIds.length} provider(s) deleted`, ToastAndroid.SHORT);
    } catch (err) {
      console.error('Error deleting providers:', err);
      ToastAndroid.show('Error deleting providers', ToastAndroid.SHORT);
    }
  };

  const handleCreateProvider = async (type, providerName, data) => {
    setIsActionLoading(true);
    try {
        await createProvider(currentProject.$id, currentProject.region || 'fra', type, providerName, data);
        setEmailModalOpen(false);
        setSmsModalOpen(false);
        setPushModalOpen(false);
        ToastAndroid.show('Provider created successfully', ToastAndroid.SHORT);
    } catch (e) {
        ToastAndroid.show(`Error: ${e.message}`, ToastAndroid.LONG);
    } finally {
        setIsActionLoading(false);
    }
  };

  const getProviderIcon = (type) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      default: return AlertCircle;
    }
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'Provider ID',
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
      width: 200,
      cell: ({ row }) => (
        <Text className="text-foreground font-medium" numberOfLines={1}>{row.original.name}</Text>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      width: 150,
      cell: ({ row }) => {
        const ProviderIcon = getProviderIcon(row.original.type);
        return (
          <View className="flex-row items-center gap-2">
            <Icon as={ProviderIcon} size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className="text-foreground text-xs capitalize">{row.original.type}</Text>
          </View>
        );
      }
    },
    {
        id: 'provider',
        header: 'Provider',
        accessorKey: 'provider',
        width: 120,
        cell: ({ row }) => (
            <Text className="text-foreground text-xs capitalize">{row.original.provider}</Text>
        )
    },
    {
      id: 'enabled',
      header: 'Status',
      accessorKey: 'enabled',
      width: 120,
      cell: ({ row }) => (
        <Badge variant={row.original.enabled ? 'success' : 'secondary'} className="flex-row items-center gap-1">
          <Icon as={row.original.enabled ? ShieldCheck : ShieldAlert} size={10} color="white" />
          <Text className="text-[10px] uppercase text-white font-bold ml-1">
            {row.original.enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </Badge>
      )
    }
  ];

  return (
    <View className="flex-1 bg-background">
      {loading && providers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <ActivityIndicator color={theme.primary} size="large" />
          <Text className="text-foreground mt-4">Loading providers...</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-2xl font-bold text-foreground">Providers</Text>
              <Text className="text-muted-foreground text-sm">Configure your messaging services</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <TouchableOpacity 
                        className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Icon as={Plus} size={18} color="white"/>
                        <Text className="text-white font-semibold ml-2">Create provider</Text>
                    </TouchableOpacity>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 border-border">
                    <DropdownMenuItem onPress={() => setEmailModalOpen(true)} className="flex-row items-center gap-2">
                        <Icon as={Mail} size={16} color="gray" />
                        <Text className="text-foreground">Email</Text>
                        <ChevronRight size={14} color="gray" className="ml-auto" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => setSmsModalOpen(true)} className="flex-row items-center gap-2">
                        <Icon as={MessageSquare} size={16} color="gray" />
                        <Text className="text-foreground">SMS</Text>
                        <ChevronRight size={14} color="gray" className="ml-auto" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => setPushModalOpen(true)} className="flex-row items-center gap-2">
                        <Icon as={Bell} size={16} color="gray" />
                        <Text className="text-foreground">Push</Text>
                        <ChevronRight size={14} color="gray" className="ml-auto" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </View>

          {error ? (
            <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <Text className="text-destructive font-medium">Error loading providers</Text>
              <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
              <TouchableOpacity 
                onPress={() => currentProject?.$id && fetchProviders(currentProject.$id)}
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
          ) : providers.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8 bg-card rounded-lg border border-border">
              <Icon as={MessageSquare} size={64} color="#9ca3af" />
              <Text className="text-foreground text-xl font-bold mt-4">No providers yet</Text>
              <Text className="text-muted-foreground text-center mt-2 mb-6">
                Configure a provider to start sending messages
              </Text>
              <TouchableOpacity 
                onPress={() => setEmailModalOpen(true)}
                className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
              >
                <Icon as={Plus} size={20} color="white"/>
                <Text className="text-white font-semibold ml-2">Create your first provider</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DataTable 
              data={providers}
              columns={columns}
              showSearch={true}
              showColumnSelector={true}
              searchPlaceholder="Search by name or ID..."
              filterKey="name"
              onRowPress={(p) => console.log('Provider pressed:', p.$id)}
              onDeleteSelected={handleDeleteSelected}
            />
          )}
        </View>
      )}

      {/* Modals outside conditional block */}

      {/* Modals */}
      <EmailProviderModal 
        visible={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onCreate={handleCreateProvider}
        isLoading={isActionLoading}
      />
      <SmsProviderModal 
        visible={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        onCreate={handleCreateProvider}
        isLoading={isActionLoading}
      />
      <PushProviderModal 
        visible={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        onCreate={handleCreateProvider}
        isLoading={isActionLoading}
      />
    </View>
  );
};

export default Providers;