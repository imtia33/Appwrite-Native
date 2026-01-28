import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ToastAndroid, Platform } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Switch } from 'react-native'; // Native switch for now, or ui/switch if available
import { sdk, client } from '../../../../appwrite/appwrite';
import { useProjectStore } from '../../../../appwrite/store/projectStore';
import { Loader2, Copy } from 'lucide-react-native';
import { Icon } from '../../../ui/icon';
import * as Clipboard from 'expo-clipboard';
import { Alert as NativeAlert } from 'react-native';

const ProviderModal = ({ open, onOpenChange, provider, onUpdated }) => {
    const { currentProject } = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [appId, setAppId] = useState('');
    const [secret, setSecret] = useState('');
    
    const showToast = (message, duration = ToastAndroid.LONG) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, duration);
        } else {
            NativeAlert.alert("Info", message);
        }
    };

    const showError = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            NativeAlert.alert("Error", message);
        }
    };
    
    useEffect(() => {
        if (provider) {
            setEnabled(provider.enabled);
            setAppId(provider.appId || '');
            setSecret(provider.secret || '');
        }
    }, [provider]);

    const handleUpdate = async () => {
        if (!currentProject?.$id || !provider || !sdk || !sdk.forConsole) {
            showError('SDK not initialized or project not selected');
            return;
        }
        setLoading(true);
        
        try {
            const updatedProject = await sdk.forConsole.projects.updateOAuth2({
                projectId: currentProject.$id,
                provider: provider.key,
                appId: appId,
                secret: secret,
                enabled: enabled,
            });
            
            onUpdated(updatedProject);
            onOpenChange(false);
            showToast('Provider updated successfully');
        } catch (e) {
            console.error('Update Provider Error:', e);
            showError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        // Construct Redirect URI
        // Default to cloud endpoint if local check fails, but client.config.endpoint should exist
        const endpoint = client?.config?.endpoint || 'https://cloud.appwrite.io/v1';
        const redirectUri = `${endpoint}/account/sessions/oauth2/callback/${provider?.key}/${currentProject?.$id}`;
        await Clipboard.setStringAsync(redirectUri);
        showToast('Redirect URI copied to clipboard');
    };

    const getRedirectUri = () => {
        const endpoint = client?.config?.endpoint || 'https://cloud.appwrite.io/v1';
        return `${endpoint}/account/sessions/oauth2/callback/${provider?.key}/${currentProject?.$id}`;
    };

    if (!provider) return null;
    
    if (!sdk || !sdk.forConsole) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[90%] min-w-[350px]">
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                    </DialogHeader>
                    <View className="py-4">
                        <Text className="text-muted-foreground">SDK not initialized</Text>
                    </View>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] min-w-[350px]">
                <DialogHeader>
                    <DialogTitle>{provider.name} OAuth2 settings</DialogTitle>
                </DialogHeader>
                
                <ScrollView className="max-h-[70vh]">
                    <View className="gap-6 py-4">
                        <View className="flex-row items-center justify-between">
                            <Label>Enabled</Label>
                            <Switch 
                                value={enabled}
                                onValueChange={setEnabled}
                                trackColor={{ false: '#3f3f46', true: '#FD366E' }}
                            />
                        </View>

                        <View className="gap-2">
                            <Label>App ID</Label>
                            <Input 
                                placeholder="Enter App ID" 
                                value={appId}
                                onChangeText={setAppId}
                            />
                        </View>
                        
                        <View className="gap-2">
                            <Label>App Secret</Label>
                            <Input 
                                placeholder="Enter App Secret" 
                                secureTextEntry
                                value={secret}
                                onChangeText={setSecret}
                            />
                        </View>

                        <View className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <Text className="text-blue-500 text-xs mb-2">
                                To complete setup, add this OAuth2 redirect URI to your {provider.name} app configuration.
                            </Text>
                            <View className="flex-row items-center bg-background rounded border border-border">
                                <Text className="flex-1 p-2 text-xs font-mono text-muted-foreground" numberOfLines={1}>
                                    {getRedirectUri()}
                                </Text>
                                <Button variant="ghost" size="sm" onPress={copyToClipboard}>
                                    <Icon as={Copy} size={14} />
                                </Button>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button className='' variant="outline">
                            <Text className='font-medium text-foreground'>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button 
                        disabled={loading} 
                        onPress={handleUpdate}
                        className="flex-row items-center"
                    >
                        {loading && <Icon as={Loader2} size={16} color="white" className="mr-2 animate-spin" />}
                        <Text className='font-medium text-white'>Update</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProviderModal;
