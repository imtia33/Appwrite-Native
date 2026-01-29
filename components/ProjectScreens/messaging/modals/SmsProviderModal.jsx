import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { X, MessageSquare, ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';

const SmsProviderModal = ({ visible, onClose, onCreate, isLoading }) => {
    const { isDark } = useTheme();
    const [provider, setProvider] = useState('twilio'); 
    const [showProviderSelector, setShowProviderSelector] = useState(false);
    
    const [formData, setFormData] = useState({
        providerId: '',
        name: '',
        enabled: true,
        // Common fields like 'from'
        from: '',
        // Twilio
        accountSid: '',
        authToken: '',
        // Msg91
        templateId: '',
        senderId: '',
        authKey: '',
        // Telesign
        customerId: '',
        apiKey: '',
        // Textmagic
        username: '',
        // Vonage
        apiSecret: '',
    });

    const providers = [
        { id: 'twilio', name: 'Twilio' },
        { id: 'msg91', name: 'MSG91' },
        { id: 'telesign', name: 'Telesign' },
        { id: 'textmagic', name: 'Textmagic' },
        { id: 'vonage', name: 'Vonage' }
    ];

    const handleCreate = () => {
        const data = {
            providerId: formData.providerId || 'unique()',
            name: formData.name || providers.find(p => p.id === provider).name,
            enabled: formData.enabled,
        };

        switch (provider) {
            case 'twilio':
                Object.assign(data, {
                    accountSid: formData.accountSid,
                    authToken: formData.authToken,
                    from: formData.from
                });
                break;
            case 'msg91':
                Object.assign(data, {
                    templateId: formData.templateId,
                    senderId: formData.senderId,
                    authKey: formData.authKey
                });
                break;
            case 'telesign':
                Object.assign(data, {
                    customerId: formData.customerId,
                    apiKey: formData.apiKey,
                    from: formData.from
                });
                break;
            case 'textmagic':
                Object.assign(data, {
                    username: formData.username,
                    apiKey: formData.apiKey,
                    from: formData.from
                });
                break;
            case 'vonage':
                Object.assign(data, {
                    apiKey: formData.apiKey,
                    apiSecret: formData.apiSecret,
                    from: formData.from
                });
                break;
        }

        onCreate('sms', provider, data);
    };

    const renderProviderFields = () => {
        switch (provider) {
            case 'twilio':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Account SID</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="AC..."
                                value={formData.accountSid}
                                onChangeText={t => setFormData({...formData, accountSid: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Auth Token</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Token"
                                secureTextEntry
                                value={formData.authToken}
                                onChangeText={t => setFormData({...formData, authToken: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Sender Number (From)</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="+123456789"
                                value={formData.from}
                                onChangeText={t => setFormData({...formData, from: t})}
                            />
                        </View>
                    </>
                );
            case 'msg91':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Auth Key</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Auth Key"
                                secureTextEntry
                                value={formData.authKey}
                                onChangeText={t => setFormData({...formData, authKey: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Sender ID</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Sender ID"
                                value={formData.senderId}
                                onChangeText={t => setFormData({...formData, senderId: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Template ID</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Template ID"
                                value={formData.templateId}
                                onChangeText={t => setFormData({...formData, templateId: t})}
                            />
                        </View>
                    </>
                );
            case 'telesign':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Customer ID</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Customer ID"
                                value={formData.customerId}
                                onChangeText={t => setFormData({...formData, customerId: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">API Key</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="API Key"
                                secureTextEntry
                                value={formData.apiKey}
                                onChangeText={t => setFormData({...formData, apiKey: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Sender Number (From)</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="+123456789"
                                value={formData.from}
                                onChangeText={t => setFormData({...formData, from: t})}
                            />
                        </View>
                    </>
                );
            case 'textmagic':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Username</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Username"
                                value={formData.username}
                                onChangeText={t => setFormData({...formData, username: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">API Key</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="API Key"
                                secureTextEntry
                                value={formData.apiKey}
                                onChangeText={t => setFormData({...formData, apiKey: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Sender Number (From)</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="+123456789"
                                value={formData.from}
                                onChangeText={t => setFormData({...formData, from: t})}
                            />
                        </View>
                    </>
                );
            case 'vonage':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">API Key</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="API Key"
                                value={formData.apiKey}
                                onChangeText={t => setFormData({...formData, apiKey: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">API Secret</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="API Secret"
                                secureTextEntry
                                value={formData.apiSecret}
                                onChangeText={t => setFormData({...formData, apiSecret: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Sender Name/Number (From)</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Appwrite"
                                value={formData.from}
                                onChangeText={t => setFormData({...formData, from: t})}
                            />
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
                                <MessageSquare size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">SMS Provider</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">
                        <Text className="text-sm font-medium text-foreground mb-1.5">Select SMS Service</Text>
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
                                placeholder="My SMS Provider"
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

export default SmsProviderModal;
