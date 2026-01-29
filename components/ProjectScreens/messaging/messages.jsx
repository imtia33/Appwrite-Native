import { View, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useMessagingStore from '../../../appwrite/data-services/messagingService';
import DataTable from '../../blocks/DataTable';
import { Badge } from '../../ui/badge';
import { Icon } from '../../ui/icon';
import { Copy, Plus, Mail, MessageSquare, Bell, AlertCircle, Info, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import * as Clipboard from 'expo-clipboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { sdk } from '../../../appwrite/appwrite';

import EmailMessageModal from './modals/EmailMessageModal';
import SmsMessageModal from './modals/SmsMessageModal';
import PushMessageModal from './modals/PushMessageModal';
import FailedModal from './modals/FailedModal';

const formatDate = (dateString, type = 'full') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const Messages = () => {
  const { theme, isDark } = useTheme();
  const { currentProject } = useProjectStore();
  
  const { 
    fetchMessages, getMessages, isLoading, getError, deleteMessage, updateMessageInState,
    createEmailMessage, createSmsMessage, createPushMessage
  } = useMessagingStore();
  
  const messages = currentProject?.$id ? getMessages(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [failedModalOpen, setFailedModalOpen] = useState(false);
  const [selectedErrors, setSelectedErrors] = useState([]);
  
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const pollingIntervals = useRef(new Map());

  useEffect(() => {
    if (currentProject?.$id) {
      fetchMessages(currentProject.$id);
    }
  }, [currentProject?.$id, fetchMessages]);

  useEffect(() => {
    const processingMessages = messages.filter(m => m.status === 'processing');
    processingMessages.forEach(msg => {
        if (!pollingIntervals.current.has(msg.$id)) {
            const interval = setInterval(async () => {
                try {
                    const updatedMsg = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).messaging.getMessage({ messageId: msg.$id });
                    if (updatedMsg.status !== 'processing') {
                        updateMessageInState(msg.$id, { status: updatedMsg.status, deliveryErrors: updatedMsg.deliveryErrors });
                        clearInterval(interval);
                        pollingIntervals.current.delete(msg.$id);
                    }
                } catch (e) {
                    clearInterval(interval);
                    pollingIntervals.current.delete(msg.$id);
                }
            }, 5000);
            pollingIntervals.current.set(msg.$id, interval);
        }
    });

    return () => {
        pollingIntervals.current.forEach(interval => clearInterval(interval));
        pollingIntervals.current.clear();
    };
  }, [messages, currentProject]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      for (const id of selectedIds) {
        await deleteMessage(currentProject.$id, currentProject.region || 'fra', id);
      }
      ToastAndroid.show(`${selectedIds.length} message(s) deleted`, ToastAndroid.SHORT);
    } catch (err) {
      console.error('Error deleting messages:', err);
      ToastAndroid.show('Error deleting messages', ToastAndroid.SHORT);
    }
  };

  const handleCreateEmail = async (data) => {
    setIsActionLoading(true);
    try {
        await createEmailMessage(currentProject.$id, currentProject.region || 'fra', data);
        setEmailModalOpen(false);
        ToastAndroid.show('Email created', ToastAndroid.SHORT);
    } catch (e) {
        ToastAndroid.show(`Error: ${e.message}`, ToastAndroid.LONG);
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleCreateSms = async (data) => {
    setIsActionLoading(true);
    try {
        await createSmsMessage(currentProject.$id, currentProject.region || 'fra', data);
        setSmsModalOpen(false);
        ToastAndroid.show('SMS created', ToastAndroid.SHORT);
    } catch (e) {
        ToastAndroid.show(`Error: ${e.message}`, ToastAndroid.LONG);
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleCreatePush = async (data) => {
    setIsActionLoading(true);
    try {
        await createPushMessage(currentProject.$id, currentProject.region || 'fra', data);
        setPushModalOpen(false);
        ToastAndroid.show('Push created', ToastAndroid.SHORT);
    } catch (e) {
        ToastAndroid.show(`Error: ${e.message}`, ToastAndroid.LONG);
    } finally {
        setIsActionLoading(false);
    }
  };

  const showErrors = (errors) => {
    setSelectedErrors(errors || []);
    setFailedModalOpen(true);
  };

  const getProviderIcon = (type) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      default: return Info;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'destructive';
      case 'processing': return 'warning';
      case 'scheduled': return 'info';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: '$id',
      header: 'Message ID',
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
      id: 'message',
      header: 'Message',
      width: 250,
      cell: ({ row }) => {
        let content = '';
        if (row.original.providerType === 'push') content = row.original.data?.title || 'No Title';
        else if (row.original.providerType === 'sms') content = row.original.data?.content || 'No Content';
        else if (row.original.providerType === 'email') content = row.original.data?.subject || 'No Subject';
        
        return (
          <Text className="text-foreground text-sm" numberOfLines={2}>
            {content || 'N/A'}
          </Text>
        );
      }
    },
    {
        id: 'providerType',
        header: 'Type',
        width: 100,
        cell: ({ row }) => {
          const ProviderIcon = getProviderIcon(row.original.providerType);
          return (
            <View className="flex-row items-center gap-2">
              <Icon as={ProviderIcon} size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="text-foreground text-xs capitalize">{row.original.providerType}</Text>
            </View>
          );
        }
    },
    {
      id: 'status',
      header: 'Status',
      width: 180,
      cell: ({ row }) => (
        <View className="flex-row items-center gap-2">
            <Badge variant={getStatusVariant(row.original.status)} className="h-6">
                <Text className="text-[10px] uppercase text-white font-bold">
                    {row.original.status}
                </Text>
            </Badge>
            {row.original.status === 'failed' && (
                <TouchableOpacity onPress={() => showErrors(row.original.deliveryErrors)}>
                    <Text className="text-primary text-[10px] font-bold underline">Details</Text>
                </TouchableOpacity>
            )}
            {row.original.status === 'processing' && (
                <ActivityIndicator size="small" color={theme.primary} />
            )}
        </View>
      )
    },
    {
      id: 'scheduledAt',
      header: 'Scheduled',
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">{formatDate(row.original.scheduledAt)}</Text>
          <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.scheduledAt, 'time')}</Text>
        </View>
      )
    },
    {
      id: 'deliveredAt',
      header: 'Delivered',
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">{formatDate(row.original.deliveredAt)}</Text>
          <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.deliveredAt, 'time')}</Text>
        </View>
      )
    }
  ];

  return (
    <View className="flex-1 bg-background">
      {loading && messages.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <ActivityIndicator color={theme.primary} size="large" />
          <Text className="text-foreground mt-4">Loading messages...</Text>
        </View>
      ) : (
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-2xl font-bold text-foreground">Messages</Text>
              <Text className="text-muted-foreground text-sm">Send and manage your messages</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <TouchableOpacity 
                        className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Icon as={Plus} size={18} color="white"/>
                        <Text className="text-white font-semibold ml-2">Create message</Text>
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
              <Text className="text-destructive font-medium">Error loading messages</Text>
              <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
              <TouchableOpacity 
                onPress={() => currentProject?.$id && fetchMessages(currentProject.$id)}
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
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8 bg-card rounded-lg border border-border">
              <Icon as={MessageSquare} size={64} color="#9ca3af" />
              <Text className="text-foreground text-xl font-bold mt-4">No messages yet</Text>
              <Text className="text-muted-foreground text-center mt-2 mb-6">
                Send your first message to get started
              </Text>
              
            </View>
          ) : (
            <DataTable 
              data={messages}
              columns={columns}
              showSearch={true}
              showColumnSelector={true}
              searchPlaceholder="Search by ID or content..."
              filterKey="$id"
              onRowPress={(msg) => console.log('Message pressed:', msg.$id)}
              onDeleteSelected={handleDeleteSelected}
            />
          )}
        </View>
      )}

      {/* Modals are outside the conditional block to prevent unmounting when loading state changes */}

      {/* Modals */}
      <EmailMessageModal 
        visible={emailModalOpen} 
        onClose={() => setEmailModalOpen(false)} 
        onCreate={handleCreateEmail}
        isLoading={isActionLoading}
      />
      <SmsMessageModal 
        visible={smsModalOpen} 
        onClose={() => setSmsModalOpen(false)} 
        onCreate={handleCreateSms}
        isLoading={isActionLoading}
      />
      <PushMessageModal 
        visible={pushModalOpen} 
        onClose={() => setPushModalOpen(false)} 
        onCreate={handleCreatePush}
        isLoading={isActionLoading}
      />
      <FailedModal 
        visible={failedModalOpen}
        onClose={() => setFailedModalOpen(false)}
        errors={selectedErrors}
      />
    </View>
  );
};

export default Messages;