import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../lib/theme-context';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell 
} from '../../ui/table';
import { cn } from '../../../lib/utils';
import { 
    Smartphone, 
    Globe, 
    Code, 
    Key, 
    ShieldCheck, 
    Plus,
    Monitor,
    Watch,
    Tv
} from 'lucide-react-native';
import { Card } from '../../ui/card';
import { Icon } from '../../ui/icon';
import { FontAwesome5, FontAwesome6, Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

import TabSwitcher from '../../blocks/TabSwitcher';
import DataTable from '../../blocks/DataTable';
import { CreatePlatformModal } from '../../Project/CreatePlatformModal';
import { CreateApiKeyModal } from '../../Project/CreateApiKeyModal';
import { CreateDevKeyModal } from '../../Project/CreateDevKeyModal';

const TABS = [
    { route: 'platforms', label: 'Platforms' },
    { route: 'apiKeys', label: 'API Keys' },
    { route: 'devKeys', label: 'Dev Keys' }
];

const OverviewIntegrations = () => {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('platforms');
    const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [isDevKeyModalOpen, setIsDevKeyModalOpen] = useState(false);
    const [selectedPlatformType, setSelectedPlatformType] = useState(null);
    const { 
        currentProject, 
        platforms, 
        apiKeys, 
        devKeys, 
        loadingSub, 
        fetchPlatforms, 
        fetchApiKeys, 
        fetchDevKeys,
        deletePlatform,
        deleteApiKey,
        deleteDevKey
    } = useProjectStore();

    const projectId = currentProject?.$id;

    const handleDeleteSelected = async (ids) => {
        if (!projectId) return;

        try {
            const deletePromises = ids.map(id => {
                if (activeTab === 'platforms') {
                    return deletePlatform(projectId, id);
                } else if (activeTab === 'apiKeys') {
                    return deleteApiKey(projectId, id);
                } else if (activeTab === 'devKeys') {
                    return deleteDevKey(projectId, id);
                }
                return Promise.resolve();
            });

            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Delete Selected Error:', error);
            // Error is handled in store or could be shown here
        }
    };

    useEffect(() => {
        if (!projectId) return;

        if (activeTab === 'platforms') {
            fetchPlatforms(projectId);
        } else if (activeTab === 'apiKeys') {
            fetchApiKeys(projectId);
        } else if (activeTab === 'devKeys') {
            fetchDevKeys(projectId);
        }
    }, [projectId, activeTab]);

    const getPlatformInfo = (type) => {
        const isDarkTheme = isDark;
        const appleColor = isDarkTheme ? '#FFFFFF' : '#000000';
        
        // Default values
        let info = {
            framework: null,
            target: 'Unknown',
            icon: Smartphone,
            iconType: 'lucide',
            color: '#94A3B8',
            targetIcon: null
        };

        if (type === 'web') {
            info = { target: 'Web', icon: Globe, iconType: 'lucide', color: '#007AFF' };
        } else if (type === 'android') {
            info = { target: 'Android', icon: FontAwesome5, name: 'android', iconType: 'expo', color: '#3DDC84' };
        } else if (type.startsWith('apple-')) {
            const sub = type.split('-')[1];
            info = { 
                target: sub.charAt(0).toUpperCase() + sub.slice(1), 
                icon: AntDesign, name: 'apple', iconType: 'expo', color: appleColor 
            };
            if (sub === 'ios') info.targetIcon = Smartphone;
            if (sub === 'macos') info.targetIcon = Monitor;
            if (sub === 'watchos') info.targetIcon = Watch;
            if (sub === 'tvos') info.targetIcon = Tv;
        } else if (type.startsWith('flutter-')) {
            const sub = type.split('-')[1];
            info = { 
                framework: 'Flutter', 
                frameworkIcon: FontAwesome6, frameworkName: 'flutter', frameworkColor: '#02569B',
                target: sub.charAt(0).toUpperCase() + sub.slice(1),
                icon: sub === 'android' ? FontAwesome5 : (sub === 'ios' ? AntDesign : (sub === 'web' ? Globe : Code)),
                name: sub === 'android' ? 'android' : (sub === 'ios' ? 'apple' : null),
                iconType: sub === 'android' || sub === 'ios' ? 'expo' : 'lucide',
                color: sub === 'android' ? '#3DDC84' : (sub === 'ios' ? appleColor : '#007AFF')
            };
        } else if (type.startsWith('react-native-')) {
            const sub = type.split('-')[2];
            info = { 
                framework: 'React Native', 
                frameworkIcon: FontAwesome5, frameworkName: 'react', frameworkColor: '#61DAFB',
                target: sub.charAt(0).toUpperCase() + sub.slice(1),
                icon: sub === 'android' ? FontAwesome5 : (sub === 'ios' ? AntDesign : (sub === 'web' ? Globe : Code)),
                name: sub === 'android' ? 'android' : (sub === 'ios' ? 'apple' : null),
                iconType: sub === 'android' || sub === 'ios' ? 'expo' : 'lucide',
                color: sub === 'android' ? '#3DDC84' : (sub === 'ios' ? appleColor : '#007AFF')
            };
        }

        return info;
    };

    const PLATFORM_OPTIONS = [
        { id: 'web', label: 'Web', icon: Entypo, name: 'code', color: '#007AFF' },
        { id: 'flutter-android', label: 'Flutter', icon: FontAwesome6, name: 'flutter', color: '#02569B' },
        { id: 'android', label: 'Android', icon: FontAwesome5, name: 'android', color: '#3DDC84' },
        { id: 'apple-ios', label: 'Apple (iOS)', icon: AntDesign, name: 'apple', color: isDark ? '#FFFFFF' : '#000000' },
        { id: 'react-native-android', label: 'React Native', icon: FontAwesome5, name: 'react', color: '#61DAFB' },
    ];

    const platformColumns = [
        {
            id: 'select',
            width: 50,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            width: 180,
            cell: ({ row }) => (
                <Text className="text-foreground font-medium">{row.original.name}</Text>
            )
        },
        {
            id: 'type',
            header: 'Platform',
            width: 180,
            cell: ({ row }) => {
                const info = getPlatformInfo(row.original.type);
                const FrameworkIcon = info.frameworkIcon;
                const TargetIcon = info.icon;
                const iconColor = info.color === '#000000' && isDark ? '#FFFFFF' : info.color;

                return (
                    <View className="flex-row items-center">
                        {info.framework && (
                            <View className="mr-1.5 pos-relative z-10">
                                <FrameworkIcon name={info.frameworkName} size={13} color={info.frameworkColor} />
                            </View>
                        )}
                        <View className="flex-row items-center bg-muted/20 px-0 py-1.5 rounded-lg gap-1.5">
                            {info.iconType === 'expo' ? (
                                <TargetIcon name={info.name} size={12} color={iconColor} />
                            ) : (
                                <Icon as={TargetIcon} size={12} color={iconColor} />
                            )}
                            <Text className="text-foreground text-[10px] font-bold uppercase">
                                {info.target}
                            </Text>
                        </View>
                    </View>
                );
            }
        },
        {
            id: 'identifier',
            header: 'Identifier',
            width: 220,
            cell: ({ row }) => {
                const isWeb = row.original.type.includes('web');
                const identifier = isWeb ? (row.original.hostname || '—') : (row.original.key || row.original.hostname || '—');
                return (
                    <Text className="text-foreground text-sm font-mono">{identifier}</Text>
                );
            }
        },
        {
            id: 'updated',
            header: 'Last Updated',
            width: 120,
            cell: ({ row }) => (
                <Text className="text-foreground text-xs">
                    {row.original.$updatedAt ? new Date(row.original.$updatedAt).toLocaleDateString() : 'never'}
                </Text>
            )
        }
    ];

    const apiKeyColumns = [
        {
            id: 'select',
            width: 50,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            width: 180,
            cell: ({ row }) => (
                <Text className="text-foreground font-medium">{row.original.name}</Text>
            )
        },
        {
            id: 'lastAccessed',
            header: 'Last Accessed',
            width: 150,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.accessedAt ? new Date(row.original.accessedAt).toLocaleDateString() : 'Never'}
                </Text>
            )
        },
        {
            id: 'expiration',
            header: 'Expiration',
            width: 120,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.expire ? new Date(row.original.expire).toLocaleDateString() : 'Never'}
                </Text>
            )
        },
        {
            id: 'scopes',
            header: 'Scopes',
            width: 100,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.scopes?.length || 0} scopes
                </Text>
            )
        }
    ];

    const devKeyColumns = [
        {
            id: 'select',
            width: 50,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            width: 180,
            cell: ({ row }) => (
                <Text className="text-foreground font-medium">{row.original.name}</Text>
            )
        },
        {
            id: 'lastAccessed',
            header: 'Last Accessed',
            width: 150,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.accessedAt ? new Date(row.original.accessedAt).toLocaleDateString() : 'Never'}
                </Text>
            )
        },
        {
            id: 'expiration',
            header: 'Expiration',
            width: 120,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.expire ? new Date(row.original.expire).toLocaleDateString() : 'Never'}
                </Text>
            )
        },
        {
            id: 'scopes',
            header: 'Scopes',
            width: 100,
            cell: ({ row }) => (
                <Text className="text-muted-foreground text-xs">
                    {row.original.scopes?.length || 0} scopes
                </Text>
            )
        }
    ];

    const renderContent = () => {
        const loading = loadingSub[activeTab];
        const data = activeTab === 'platforms' ? platforms : (activeTab === 'apiKeys' ? apiKeys : devKeys);
        const columns = activeTab === 'platforms' ? platformColumns : (activeTab === 'apiKeys' ? apiKeyColumns : devKeyColumns);
        const IconComponent = activeTab === 'platforms' ? Smartphone : (activeTab === 'apiKeys' ? Key : ShieldCheck);
        const emptyTitle = activeTab === 'platforms' ? "No platforms added" : (activeTab === 'apiKeys' ? "No API keys created" : "No dev keys found");
        const emptyDesc = activeTab === 'platforms' 
            ? "Add a platform to connect your app and start using Appwrite services." 
            : (activeTab === 'apiKeys' 
                ? "Create an API key to access Appwrite from your server-side environment." 
                : "Dev keys are used for development purposes and have limited permissions.");

        if (loading) {
            return <ActivityIndicator className="mt-8" color="#FD366E" />;
        }

        if (data.length === 0) {
            return (
                <View className="items-center justify-center p-8 bg-secondary/10 rounded-2xl border border-dashed border-border mt-4">
                    <IconComponent size={48} color={isDark ? '#475569' : '#94A3B8'} strokeWidth={1} />
                    <Text className="text-foreground font-semibold mt-4">{emptyTitle}</Text>
                    <Text className="text-muted-foreground text-center mt-2 px-4">{emptyDesc}</Text>
                </View>
            );
        }

        return (
            <View className="mt-4 flex-1">
                <DataTable 
                    data={data} 
                    columns={columns} 
                    pagination={true}
                    itemsPerPage={5}
                    onDeleteSelected={handleDeleteSelected}
                />
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background p-4">
            <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <TabSwitcher 
                        tabs={TABS} 
                        activeRoute={activeTab} 
                        onTabPress={setActiveTab} 
                    />
                </View>
                
            </View>
            {activeTab === 'platforms' ? (
                <Popover>
                    <PopoverTrigger asChild>
                        <TouchableOpacity 
                            style={{ width: 135 }}
                            className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 flex-row self-end items-center justify-center"
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white ml-1 font-medium">Add Platform</Text>
                        </TouchableOpacity>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-2 bg-popover border border-border">
                        <View className="gap-1">
                            {PLATFORM_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    onPress={() => {
                                        setSelectedPlatformType(opt);
                                        setIsPlatformModalOpen(true);
                                    }}
                                    className="flex-row items-center gap-3 p-3 rounded-lg active:bg-accent"
                                >
                                    <View style={{ backgroundColor: opt.color + '15' }} className="p-2.5 rounded-xl border border-border">
                                        {opt.name === 'nuxt' ? (
                                            <MaterialCommunityIcons name="nuxt" size={20} color={opt.color} />
                                        ) : (
                                            <opt.icon name={opt.name} size={18} color={opt.color} />
                                        )}
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-semibold">{opt.label}</Text>
                                        <Text className="text-muted-foreground text-[10px]">Add your {opt.label} app</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </PopoverContent>
                </Popover>
            ) : activeTab === 'apiKeys' ? (
                <TouchableOpacity 
                    onPress={() => setIsApiKeyModalOpen(true)}
                    style={{ width: 125 }}
                    className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 flex-row self-end items-center justify-center"
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white ml-1 font-medium">Add API Key</Text>
                </TouchableOpacity>
            ) : activeTab === 'devKeys' ? (
                <TouchableOpacity 
                    onPress={() => setIsDevKeyModalOpen(true)}
                    style={{ width: 135 }}
                    className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30 flex-row self-end items-center justify-center"
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white ml-1 font-medium">Add Dev Key</Text>
                </TouchableOpacity>
            ) : null}

            {renderContent()}

            <CreatePlatformModal 
                isOpen={isPlatformModalOpen}
                onOpenChange={setIsPlatformModalOpen}
                projectId={projectId}
                selectedType={selectedPlatformType}
                onCreated={() => fetchPlatforms(projectId)}
            />

            <CreateApiKeyModal 
                isOpen={isApiKeyModalOpen}
                onOpenChange={setIsApiKeyModalOpen}
                projectId={projectId}
                onCreated={() => fetchApiKeys(projectId)}
            />

            <CreateDevKeyModal 
                isOpen={isDevKeyModalOpen}
                onOpenChange={setIsDevKeyModalOpen}
                projectId={projectId}
                onCreated={() => fetchDevKeys(projectId)}
            />
        </View>
    );
};

export default OverviewIntegrations;