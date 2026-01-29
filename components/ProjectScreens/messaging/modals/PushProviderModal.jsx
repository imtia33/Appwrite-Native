import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { X, Bell, ChevronDown, Check, FileJson } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';

const PushProviderModal = ({ visible, onClose, onCreate, isLoading }) => {
    const { isDark } = useTheme();
    const [provider, setProvider] = useState('fcm'); 
    const [showProviderSelector, setShowProviderSelector] = useState(false);
    
    const [formData, setFormData] = useState({
        providerId: '',
        name: '',
        enabled: true,
        // FCM
        serviceAccountJSON: '',
        // APNS
        authKey: '',
        authKeyId: '',
        teamId: '',
        bundleId: '',
        sandbox: false
    });

    const providers = [
        { id: 'fcm', name: 'FCM (Firebase Cloud Messaging)' },
        { id: 'apns', name: 'APNS (Apple Push Notification Service)' }
    ];

    const handleCreate = () => {
        const data = {
            providerId: formData.providerId || 'unique()',
            name: formData.name || providers.find(p => p.id === provider).name,
            enabled: formData.enabled,
        };

        if (provider === 'fcm') {
            try {
                Object.assign(data, {
                    serviceAccountJSON: JSON.parse(formData.serviceAccountJSON)
                });
            } catch (e) {
                alert("Invalid JSON for service account");
                return;
            }
        } else if (provider === 'apns') {
            Object.assign(data, {
                authKey: formData.authKey,
                authKeyId: formData.authKeyId,
                teamId: formData.teamId,
                bundleId: formData.bundleId,
                sandbox: formData.sandbox
            });
        }

        onCreate('push', provider, data);
    };

    const renderProviderFields = () => {
        if (provider === 'fcm') {
            return (
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground mb-1.5">Service Account JSON</Text>
                    <View className="relative">
                        <TextInput
                            className="bg-input text-foreground px-4 py-3 rounded-xl border border-border h-48 font-mono text-xs"
                            placeholder='{ "type": "service_account", ... }'
                            multiline
                            textAlignVertical="top"
                            value={formData.serviceAccountJSON}
                            onChangeText={t => setFormData({...formData, serviceAccountJSON: t})}
                        />
                        <View className="absolute right-4 bottom-4">
                             <FileJson size={20} color="gray" opacity={0.3} />
                        </View>
                    </View>
                    <Text className="text-[10px] text-muted-foreground mt-2 px-1">
                        Paste the contents of your Firebase service account JSON file.
                    </Text>
                </View>
            );
        } else {
            return (
                <>
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-foreground mb-1.5">Auth Key (.p8 contents)</Text>
                        <TextInput
                            className="bg-input text-foreground px-4 py-3 rounded-xl border border-border h-32 font-mono text-xs"
                            placeholder="-----BEGIN PRIVATE KEY-----..."
                            multiline
                            textAlignVertical="top"
                            value={formData.authKey}
                            onChangeText={t => setFormData({...formData, authKey: t})}
                        />
                    </View>
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-[10px] font-medium text-foreground mb-1">Key ID</Text>
                            <TextInput
                                className="bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                placeholder="Key ID"
                                value={formData.authKeyId}
                                onChangeText={t => setFormData({...formData, authKeyId: t})}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-medium text-foreground mb-1">Team ID</Text>
                            <TextInput
                                className="bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                placeholder="Team ID"
                                value={formData.teamId}
                                onChangeText={t => setFormData({...formData, teamId: t})}
                            />
                        </View>
                    </View>
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-foreground mb-1.5">Bundle ID</Text>
                        <TextInput
                            className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                            placeholder="com.example.app"
                            value={formData.bundleId}
                            onChangeText={t => setFormData({...formData, bundleId: t})}
                        />
                    </View>
                    <View className="flex-row items-center justify-between bg-muted/30 p-3 rounded-xl mb-4">
                        <View>
                            <Text className="text-sm font-semibold text-foreground">Sandbox Mode</Text>
                            <Text className="text-[10px] text-muted-foreground">For development provisioning</Text>
                        </View>
                        <Switch value={formData.sandbox} onValueChange={v => setFormData({...formData, sandbox: v})} />
                    </View>
                </>
            );
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-card rounded-t-[32px] border-t border-border max-h-[90%]">
                    <View className="p-6 border-b border-border flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-primary/10 p-2 rounded-xl">
                                <Bell size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">Push Provider</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">
                        <Text className="text-sm font-medium text-foreground mb-1.5">Select Push Service</Text>
                        <TouchableOpacity 
                            onPress={() => setShowProviderSelector(!showProviderSelector)}
                            className="bg-input px-4 py-3 rounded-xl border border-border flex-row justify-between items-center mb-6"
                        >
                            <Text className="text-foreground font-semibold uppercase">{provider}</Text>
                            <ChevronDown size={20} color="gray" />
                        </TouchableOpacity>

                        {showProviderSelector && (
                            <View className="bg-muted/50 rounded-xl overflow-hidden mb-6">
                                {providers.map(p => (
                                    <TouchableOpacity 
                                        key={p.id} 
                                        onPress={() => { setProvider(p.id); setShowProviderSelector(false); }}
                                        className="p-4 border-b border-border/50 flex-row justify-between items-center"
                                    >
                                        <Text className={cn("text-foreground", provider === p.id && "text-primary font-bold")}>{p.name}</Text>
                                        {provider === p.id && <Check size={16} color="#ef4444" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Provider Name</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-bold"
                                placeholder="My Push Provider"
                                value={formData.name}
                                onChangeText={t => setFormData({...formData, name: t})}
                            />
                        </View>

                        {renderProviderFields()}

                        <View className="flex-row items-center justify-between bg-muted/30 p-3 rounded-xl mt-4">
                            <Text className="text-sm font-semibold text-foreground">Enabled</Text>
                            <Switch value={formData.enabled} onValueChange={v => setFormData({...formData, enabled: v})} />
                        </View>

                        <View className="h-20" />
                    </ScrollView>

                    <View className="p-6 bg-muted/20 border-t border-border">
                        <TouchableOpacity 
                            onPress={handleCreate} 
                            disabled={isLoading}
                            className={cn("bg-primary py-4 rounded-2xl items-center justify-center", 
                                isLoading && "opacity-50")}
                        >
                            {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Create Provider</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PushProviderModal;
