import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useOrganizationStore, tierToPlan } from '../../appwrite/store/organizationStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Text } from '../../components/ui/text';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { sdk } from '../../appwrite/appwrite';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

const Organizations = () => {
    const { organizations, loading, fetchOrganizations, setCurrentOrganization } = useOrganizationStore();
    const [membershipsMap, setMembershipsMap] = useState({});

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        const fetchAllMemberships = async () => {
            const newMap = {};
            for (const org of organizations) {
                try {
                    const response = await sdk.forConsole.teams.listMemberships(org.$id);
                    newMap[org.$id] = response.memberships;
                } catch (error) {
                    console.error(`Error fetching memberships for ${org.$id}:`, error);
                }
            }
            setMembershipsMap(newMap);
        };

        if (organizations.length > 0) {
            fetchAllMemberships();
        }
    }, [organizations]);

    const handleOrgPress = async (org) => {
        await setCurrentOrganization(org);
        router.push(`/(tabs)/Overview`);
    };

    const OrganizationCard = ({ org }) => {
        const plan = tierToPlan(org.billingPlan);
        const memberships = membershipsMap[org.$id] || [];
        const memberCount = org.total || 0;

        return (
            <TouchableOpacity onPress={() => handleOrgPress(org)} activeOpacity={0.8}>
                <Card className="mb-6 p-6 rounded-[24px] bg-muted/30 h-[220px] justify-between">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                            <Text className="text-sm text-muted-foreground font-medium mb-1">
                                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </Text>
                            <Text className="text-3xl font-bold text-foreground" numberOfLines={1}>
                                {org.name}
                            </Text>
                        </View>
                        <View className="bg-muted/60 px-4 py-2 rounded-2xl border border-border/50">
                            <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {plan.name}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        {memberships.slice(0, 5).map((member, i) => (
                            <View key={member.$id} className={i !== 0 ? "-ml-4" : ""}>
                                <Avatar className="w-14 h-14 rounded-full border-4 border-background">
                                    <AvatarFallback>
                                        <Text className="text-lg font-bold">
                                            {member.userName?.substring(0, 2).toUpperCase() || member.userEmail?.substring(0, 2).toUpperCase()}
                                        </Text>
                                    </AvatarFallback>
                                </Avatar>
                            </View>
                        ))}
                        {memberships.length > 5 && (
                            <View className="-ml-4 w-14 h-14 rounded-full bg-muted border-4 border-background items-center justify-center">
                                <Text className="text-sm font-bold text-muted-foreground">+{memberships.length - 5}</Text>
                            </View>
                        )}
                        {loading && memberships.length === 0 && (
                            <View className="w-14 h-14 rounded-full bg-muted/50 animate-pulse border-4 border-background" />
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
            <View className="flex-row items-center justify-between mb-8">
                <Text className="text-3xl font-bold">Organizations</Text>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-row items-center gap-2 rounded-full px-4"
                    onPress={() => router.push('/(tabs)/Overview/create-organization')}
                >
                    <Plus size={18} color="black" />
                    <Text className="font-semibold">Create</Text>
                </Button>
            </View>

            {loading && organizations.length === 0 ? (
                <View className="items-center justify-center py-20">
                    <Text className="text-muted-foreground">Loading organizations...</Text>
                </View>
            ) : organizations.length === 0 ? (
                <View className="items-center justify-center py-24 border-2 border-dashed border-muted rounded-3xl">
                    <Text className="text-xl font-bold mb-3">No organizations found</Text>
                    <Text className="text-sm text-muted-foreground text-center px-10 mb-8 leading-5">
                        Create a new organization to start building your projects and collaborating with your team.
                    </Text>
                    <Button 
                        className="rounded-full px-8" 
                        onPress={() => router.push('/(tabs)/Overview/create-organization')}
                    >
                        <Text className="font-bold">Create organization</Text>
                    </Button>
                </View>
            ) : (
                organizations.map((org) => (
                    <OrganizationCard key={org.$id} org={org} />
                ))
            )}
        </ScrollView>
    );
};

export default Organizations;
