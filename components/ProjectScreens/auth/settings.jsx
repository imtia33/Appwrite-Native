import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import { sdk } from '../../../appwrite/appwrite';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../ui/icon';
import { Switch } from '../../ui/switch';
import { Settings, Shield, Key } from 'lucide-react-native'; // Generic icons
import { useTheme } from '../../../lib/theme-context';
import ProviderModal from './modals/ProviderModal';
import { darkIcons, lightIcons } from '../../../constants/icons';

// Auth Methods Map
const AUTH_METHODS = [
    { key: 'authEmailPassword', label: 'Email/Password', method: 'email-password' },
    { key: 'authPhone', label: 'Phone', method: 'phone' },
    { key: 'authAnonymous', label: 'Anonymous', method: 'anonymous' },
    { key: 'authInvites', label: 'Invitations', method: 'invites' },
    { key: 'authJWT', label: 'JWT', method: 'jwt' },
    { key: 'authEmailOTP', label: 'Email OTP', method: 'email-otp' },
    { key: 'authMagicURL', label: 'Magic URL', method: 'magic-url' },
];

const AuthSettings = () => {
    const { currentProject, setCurrentProject } = useProjectStore();
    const { isDark } = useTheme();
    const [updating, setUpdating] = useState({});
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

    // Filter out Mock provider and sort
    const providers = currentProject?.oAuthProviders
        ?.filter(p => p.name !== 'Mock')
        .sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1)) || [];

    const toggleAuthMethod = async (key, currentValue) => {
        const authMethod = AUTH_METHODS.find(m => m.key === key);
        if (!authMethod) {
            console.error(`Unknown auth method: ${key}`);
            Alert.alert("Error", "Unknown authentication method");
            return;
        }
        
        setUpdating(prev => ({ ...prev, [key]: true }));
        try {
            const updatedProject = await sdk.forConsole.projects.updateAuthStatus({
                projectId: currentProject.$id,
                method: authMethod.method,
                status: !currentValue
            });
            // Update local state (Optimistic or replace)
            // Ideally we update the store, but for now we can rely on parent to refresh or just mutate.
            // Since we can't easily deep update the store without a fetch, we might trigger a refresh
            // But 'updatedProject' is the full object.
            setCurrentProject(updatedProject); 
        } catch (error) {
            console.error(`Update ${key} Error:`, error);
            Alert.alert("Error", error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleProviderClick = (provider) => {
        setSelectedProvider(provider);
        setIsProviderModalOpen(true);
    };

    const handleProviderUpdated = (updatedProject) => {
        setCurrentProject(updatedProject);
    };

    const getProviderIcon = (providerKey) => {
        const icons = isDark ? darkIcons : lightIcons;
        const normalizedKey = providerKey.toLowerCase();
        
        // Handle common variations if needed
        let ProviderIcon = icons[normalizedKey] || icons[normalizedKey.replace('-', '')] || icons['key'];
        
        if (ProviderIcon) {
            // Handle Metro 'require' returning a module object with default export
            if (ProviderIcon.default) {
                ProviderIcon = ProviderIcon.default;
            }

            // If it's a valid React component (function)
            if (typeof ProviderIcon === 'function') {
                return <ProviderIcon width={24} height={24} />;
            }
             
             // Fallback for image asset (number or source object)
             return <Image source={ProviderIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />;
        }
        return <Icon as={Key} size={24} />;
    };

    if (!currentProject) return null;

    return (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <View className="mb-6">
                <Text className="text-2xl font-bold text-foreground">Settings</Text>
                <Text className="text-muted-foreground text-sm">Configure authentication methods and providers</Text>
            </View>
            

            <View className="gap-6">
                {/* Auth Methods */}
                <Card className="border-border py-4">
                    <CardHeader>
                        <CardTitle>Auth methods</CardTitle>
                        <Text className="text-muted-foreground text-xs">Enable the authentication methods you wish to use.</Text>
                    </CardHeader>
                    <CardContent className="gap-6 pt-0">
                        <View className="flex-row flex-wrap justify-between">
                            {AUTH_METHODS.map(method => (
                                <View key={method.key} className="w-[38%] flex-row items-center gap-2 mb-4">
                                    <View className="h-8 justify-center">
                                        {updating[method.key] ? (
                                            <ActivityIndicator size="small" color="#FD366E" />
                                        ) : (
                                            <Switch 
                                                checked={currentProject[method.key]}
                                                onCheckedChange={() => toggleAuthMethod(method.key, currentProject[method.key])}
                                            />
                                        )}
                                    </View>
                                    <Text className="text-foreground font-medium text-sm text-center align-middle ">{method.label}</Text>
                                    
                                </View>
                            ))}
                        </View>
                    </CardContent>
                </Card>

                {/* OAuth2 Providers */}
                <View className=' mx-auto'>
                    <Text className="text-xl font-semibold text-foreground mb-4">OAuth2 Providers</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {providers.map(provider => (
                            <TouchableOpacity 
                                key={provider.key}
                                onPress={() => handleProviderClick(provider)}
                                style={{ width: 100 }}
                                className=" bg-card border border-border rounded-lg p-4  items-center justify-between"
                            >
                                <View className="flex-row items-center flex-1 mr-2 gap-3 self-center">
                                    <View className="items-center justify-center">
                                         {getProviderIcon(provider.key || provider.name)}
                                    </View>
                                    
                                </View>
                                <Text className="text-foreground font-medium text-sm" numberOfLines={1}>{provider.name}</Text>
                                <View className={`px-2 py-0.5 rounded-full mt-2 ${provider.enabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                                    <Text className={`text-[10px] ${provider.enabled ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        {provider.enabled ? 'Enabled' : 'Disabled'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <ProviderModal 
                open={isProviderModalOpen}
                onOpenChange={setIsProviderModalOpen}
                provider={selectedProvider}
                onUpdated={handleProviderUpdated}
            />
        </ScrollView>
    );
};

export default AuthSettings;