import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import { sdk } from '../../../appwrite/appwrite';
import DataTable from '../../blocks/DataTable';
import { Icon } from '../../ui/icon';
import { Users, UsersRound, Plus, Copy, Calendar } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme-context';
import CreateTeamModal from './modals/CreateTeamModal';
import { Card } from '../../ui/card';
import * as Clipboard from 'expo-clipboard';

const formatDate = (dateString, type = 'full') => {
  const date = new Date(dateString);
  if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const AuthTeams = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTeams = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const response = await sdk.forProject(currentProject.region || 'fra', currentProject.$id).teams.list();
      setTeams(response.teams);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [currentProject?.$id]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  const columns = [
    {
      id: 'select', 
      width: 50,
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      width: 250,
      cell: ({ row }) => (
        <View className="flex-row items-center py-1">
          <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
             <Text className="text-primary font-bold text-xs">
                {row.original.name ? row.original.name.charAt(0).toUpperCase() : '?'}
             </Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
              {row.original.name}
            </Text>
            <TouchableOpacity 
              onPress={() => copyToClipboard(row.original.$id)}
              className="flex-row items-center mt-0.5"
            >
              <Text className="text-muted-foreground text-[10px] font-mono" numberOfLines={1}>{row.original.$id}</Text>
              <Icon as={Copy} size={10} color='gray' className="ml-1" />
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    {
      id: 'members',
      header: 'Members',
      width: 150,
      cell: ({ row }) => (
        <View className="flex-row items-center">
          <Icon as={Users} size={16} className="text-muted-foreground mr-2" />
          <Text className="text-sm text-foreground">{row.original.total} members</Text>
        </View>
      )
    },
    {
        id: '$createdAt',
        header: 'Created',
        accessorKey: '$createdAt',
        width: 180,
        cell: ({ row }) => (
            <View className="flex-row items-center">
                <Icon as={Calendar} size={14} className="text-muted-foreground mr-2" />
                <View>
                    <Text className="text-foreground text-xs">{formatDate(row.original.$createdAt)}</Text>
                    <Text className="text-muted-foreground text-[10px]">{formatDate(row.original.$createdAt, 'time')}</Text>
                </View>
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
          <Text className="text-2xl font-bold text-foreground">Teams</Text>
          <Text className="text-muted-foreground text-sm">Manage user groups and access permissions</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => setIsCreateModalOpen(true)}
        className="bg-primary px-4 py-2 rounded-lg flex-row items-center max-w-40 items-center justify-center mb-4"
      >
        <Icon as={Plus} size={18} color="white"/>
        <Text className="text-white font-semibold ml-2">Create team</Text>
      </TouchableOpacity>

      {error ? (
        <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <Text className="text-destructive font-medium">Error loading teams</Text>
          <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
          <TouchableOpacity 
            onPress={fetchTeams}
            className="mt-4 bg-destructive px-4 py-2 rounded self-start"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DataTable 
          data={teams}
          columns={columns}
          showSearch={true}
          showColumnSelector={true}
          searchPlaceholder="Search by name..."
          filterKey="name"
          onRowPress={(team) => console.log('Team pressed:', team.$id)}
        />
      )}

      <CreateTeamModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onCreated={(newTeam) => {
          setTeams(prev => [newTeam, ...prev]);
        }}
      />
    </View>
  );
};

export default AuthTeams;