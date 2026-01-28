import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Alert, Image } from 'react-native';
import { sdk } from '../../appwrite/appwrite';
import DataTable from '../../components/blocks/DataTable';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Text } from '../../components/ui/text';
import { Card, CardContent } from '../../components/ui/card';
import { Copy, Globe } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useGlobalContext } from '../../context/appwriteContext';
import { router } from 'expo-router';

const Sessions = () => {
    const { user } = useGlobalContext();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await sdk.forConsole.account.listSessions();
            setSessions(response.sessions);
        } catch (error) {
            console.error('Fetch sessions error:', error);
            Alert.alert('Error', 'Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleLogout = async (session) => {
        try {
            await sdk.forConsole.account.deleteSession({ sessionId: session.$id });
            if (session.current) {
                router.replace('/login');
            } else {
                Alert.alert('Success', 'Session signed out successfully');
                fetchSessions();
            }
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to sign out session');
        }
    };

    const handleLogoutAll = async () => {
        Alert.alert(
            'Sign out all sessions',
            'Are you sure you want to sign out of all active sessions?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out all',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await sdk.forConsole.account.deleteSessions();
                            router.replace('/login');
                        } catch (error) {
                            console.error('Logout all error:', error);
                            Alert.alert('Error', 'Failed to sign out all sessions');
                        }
                    },
                },
            ]
        );
    };

    const copyToClipboard = (text) => {
        Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'IP address copied to clipboard');
    };

    const getBrowserIcon = (code) => {
        if (!code) return null;
        try {
            return sdk.forConsole.avatars.getBrowser({ code: code.toLowerCase(), width: 40, height: 40 }).toString();
        } catch (e) {
            return null;
        }
    };

    const columns = useMemo(() => [
        {
            header: "Client",
            accessorKey: "clientName",
            width: 300,
            cell: ({ row }) => {
                const session = row.original;
                const browserIcon = getBrowserIcon(session.clientCode);
                return (
                    <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 items-center justify-center rounded-full bg-muted">
                            {browserIcon ? (
                                <Image
                                    source={{ uri: browserIcon }}
                                    className="w-5 h-5"
                                    resizeMode="contain"
                                />
                            ) : (
                                <Globe size={16} color="#666" />
                            )}
                        </View>
                        <View className="flex-1 overflow-hidden">
                            <View className="flex-row items-center gap-2">
                                <Text className="font-medium text-sm" numberOfLines={1}>
                                    {session.clientName || 'Unknown'} {session.clientVersion}
                                </Text>
                                {session.current && (
                                    <Badge variant="success" className="px-1 py-0">
                                        <Text className="text-[8px] text-white">current</Text>
                                    </Badge>
                                )}
                            </View>
                            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                {session.osName} {session.osVersion}
                            </Text>
                        </View>
                    </View>
                );
            }
        },
        {
            header: "Location",
            accessorKey: "countryName",
            width: 150,
            cell: ({ row }) => {
                const session = row.original;
                return (
                    <Text className="text-sm" numberOfLines={1}>
                        {session.countryCode === '--' ? 'Unknown' : session.countryName}
                    </Text>
                );
            }
        },
        {
            header: "IP",
            accessorKey: "ip",
            width: 180,
            cell: ({ row }) => {
                const session = row.original;
                return (
                    <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-mono flex-1" numberOfLines={1}>{session.ip}</Text>
                        <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => copyToClipboard(session.ip)}
                            className="h-8 w-8"
                        >
                            <Copy size={12} color="#666" />
                        </Button>
                    </View>
                );
            }
        },
        {
            id: "actions",
            width: 100,
            className: "items-center",
            cell: ({ row }) => {
                const session = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleLogout(session)}
                    >
                        <Text className="text-xs text-destructive font-medium">Sign out</Text>
                    </Button>
                );
            }
        }
    ], [sessions]);

    if (loading && sessions.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text>Loading sessions...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-background">
            <View className="p-4 gap-6">
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-bold">Sessions</Text>
                    <Button variant="outline" size="sm" onPress={handleLogoutAll}>
                        <Text>Sign out all sessions</Text>
                    </Button>
                </View>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <DataTable
                            data={sessions}
                            columns={columns}
                            pagination={false}
                            showSearch={false}
                            showColumnSelector={false}
                        />
                    </CardContent>
                </Card>
            </View>
        </ScrollView>
    );
};

export default Sessions;

