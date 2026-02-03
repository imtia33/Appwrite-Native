import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOrganizationStore, getRoleLabel, roles } from '../../appwrite/store/organizationStore';
import { useGlobalContext } from '../../context/appwriteContext';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { MoreHorizontal, UserPlus, Pencil, Trash2, RefreshCcw } from 'lucide-react-native';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../../components/ui/dropdown-menu';
import MemberInviteModal from '../../components/Modals/MemberInviteModal';
import MemberDeleteModal from '../../components/Modals/MemberDeleteModal';
import DataTable from '../../components/blocks/DataTable';
import { SafeAreaView } from 'react-native-safe-area-context';

const Members = () => {
  const {
    currentOrganization,
    memberships,
    membershipsTotal,
    fetchMemberships,
    updateMembership,
    loading
  } = useOrganizationStore();
  const { user } = useGlobalContext();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchMemberships(0, 100);
    }
  }, [currentOrganization]);

  const isOwner = memberships.find(m => m.userId === user?.$id)?.roles.includes('owner');

  const columns = useMemo(() => [
    {
      id: 'select',
      header: 'Select',
      width: 50,
    },
    {
      accessorKey: 'userName',
      header: 'Name',
      sortable: true,
      className: 'flex-[1]',
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.userName ? item.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        return (
          <View className="flex-row items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>
                <Text className="text-[10px]">{initials}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-foreground font-medium" numberOfLines={1}>
                {item.userName || 'n/a'}
              </Text>
              {item.invited && !item.joined && (
                <Badge variant="secondary" className="mt-0.5 self-start bg-yellow-100 dark:bg-yellow-900/30">
                  <Text className="text-[10px] text-yellow-700 dark:text-yellow-400">Pending</Text>
                </Badge>
              )}
            </View>
          </View>
        );
      }
    },
    {
      accessorKey: 'userEmail',
      header: 'Email',
      sortable: true,
      className: 'flex-[2]',
      cell: ({ row }) => (
        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
          {row.original.userEmail}
        </Text>
      )
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      className: 'flex-1',
      cell: ({ row }) => (
        <Text className="text-muted-foreground text-xs">
          {row.original.roles.map(r => getRoleLabel(r)).join(', ')}
        </Text>
      )
    },
    {
      id: 'actions',
      width: 50,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity className="p-2 self-center">
                <Icon as={MoreHorizontal} size={18} className="text-muted-foreground" />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Text className='text-muted-foreground ml-2 mr-4'>Change role</Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {roles.map((role) => (
                      <DropdownMenuItem
                        key={role.value}
                        onPress={async () => {
                          try {
                            await updateMembership(item.$id, [role.value]);
                          } catch (error) {
                            console.error('Failed to update role:', error);
                          }
                        }}
                      >
                        <Text className='text-muted-foreground'>{role.label}</Text>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {item.invited && !item.joined && (
                <DropdownMenuItem onPress={() => {/* Resend logic */ }}>
                  <Icon as={RefreshCcw} size={14} className="mr-2" />
                  <Text>Resend</Text>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onPress={() => { setSelectedMember(item); setDeleteModalOpen(true); }}>
                <Text className="text-muted-foreground font-bold ml-2">{item.userId === user?.$id ? 'Leave' : 'Remove'}</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ], [isOwner, user?.$id]);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-2xl font-bold text-foreground font-heading">Members</Text>
            <Text className="text-muted-foreground text-sm">Manage your organization's team</Text>
          </View>
          <Button
            size="sm"
            onPress={() => setInviteModalOpen(true)}
            className="flex-row items-center gap-2"
          >
            <Icon as={UserPlus} size={16} color="white" />
            <Text className="text-white font-medium">Invite</Text>
          </Button>
        </View>

        {loading && memberships.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <DataTable
            data={memberships}
            columns={columns}
            filterKey="userName"
            searchPlaceholder="Filter members..."
          />
        )}
      </View>

      <MemberInviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
      <MemberDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        member={selectedMember}
      />
    </View>
  );
};

export default Members;
