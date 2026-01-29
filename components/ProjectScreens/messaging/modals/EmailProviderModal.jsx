import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { X, Mail, ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';

const EmailProviderModal = ({ visible, onClose, onCreate, isLoading }) => {
    const { isDark } = useTheme();
    const [provider, setProvider] = useState('mailgun'); // mailgun, sendgrid, resend, smtp
    const [showProviderSelector, setShowProviderSelector] = useState(false);
    
    const [formData, setFormData] = useState({
        providerId: '',
        name: '',
        enabled: true,
        // Common
        fromEmail: '',
        fromName: '',
        replyToEmail: '',
        replyToName: '',
        // Mailgun
        apiKey: '',
        domain: '',
        isEuRegion: false,
        // SMTP
        host: '',
        port: '587',
        username: '',
        password: '',
        encryption: 'none',
        autoTLS: true,
        mailer: ''
    });

    const providers = [
        { id: 'mailgun', name: 'Mailgun' },
        { id: 'sendgrid', name: 'SendGrid' },
        { id: 'resend', name: 'Resend' },
        { id: 'smtp', name: 'SMTP' }
    ];

    const handleCreate = () => {
        const data = {
            providerId: formData.providerId || 'unique()',
            name: formData.name || providers.find(p => p.id === provider).name,
            enabled: formData.enabled,
            fromEmail: formData.fromEmail,
            fromName: formData.fromName || undefined,
            replyToEmail: formData.replyToEmail || undefined,
            replyToName: formData.replyToName || undefined
        };

        if (provider === 'mailgun') {
            Object.assign(data, {
                apiKey: formData.apiKey,
                domain: formData.domain,
                isEuRegion: formData.isEuRegion
            });
        } else if (provider === 'sendgrid' || provider === 'resend') {
            Object.assign(data, { apiKey: formData.apiKey });
        } else if (provider === 'smtp') {
            Object.assign(data, {
                host: formData.host,
                port: parseInt(formData.port),
                username: formData.username || undefined,
                password: formData.password || undefined,
                encryption: formData.encryption,
                autoTLS: formData.autoTLS,
                mailer: formData.mailer || undefined
            });
        }

        onCreate('email', provider, data);
    };

    const renderProviderFields = () => {
        switch (provider) {
            case 'mailgun':
                return (
                    <>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">API Key</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Enter Mailgun API Key"
                                secureTextEntry
                                value={formData.apiKey}
                                onChangeText={t => setFormData({...formData, apiKey: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Domain</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="mg.example.com"
                                value={formData.domain}
                                onChangeText={t => setFormData({...formData, domain: t})}
                            />
                        </View>
                        <View className="flex-row items-center justify-between bg-muted/30 p-3 rounded-xl mb-4">
                            <Text className="text-sm font-semibold text-foreground">EU Region</Text>
                            <Switch value={formData.isEuRegion} onValueChange={v => setFormData({...formData, isEuRegion: v})} />
                        </View>
                    </>
                );
            case 'sendgrid':
            case 'resend':
                return (
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-foreground mb-1.5">API Key</Text>
                        <TextInput
                            className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                            placeholder={`Enter ${provider === 'resend' ? 'Resend' : 'SendGrid'} API Key`}
                            secureTextEntry
                            value={formData.apiKey}
                            onChangeText={t => setFormData({...formData, apiKey: t})}
                        />
                    </View>
                );
            case 'smtp':
                return (
                    <>
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-[3]">
                                <Text className="text-sm font-medium text-foreground mb-1.5">Host</Text>
                                <TextInput
                                    className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                    placeholder="smtp.example.com"
                                    value={formData.host}
                                    onChangeText={t => setFormData({...formData, host: t})}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-foreground mb-1.5">Port</Text>
                                <TextInput
                                    className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                    placeholder="587"
                                    keyboardType="numeric"
                                    value={formData.port}
                                    onChangeText={t => setFormData({...formData, port: t})}
                                />
                            </View>
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Username</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="User"
                                value={formData.username}
                                onChangeText={t => setFormData({...formData, username: t})}
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-1.5">Password</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                placeholder="Pass"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={t => setFormData({...formData, password: t})}
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
                                <Mail size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">Email Provider</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">
                        <Text className="text-sm font-medium text-foreground mb-1.5">Select Service</Text>
                        <TouchableOpacity 
                            onPress={() => setShowProviderSelector(!showProviderSelector)}
                            className="bg-input px-4 py-3 rounded-xl border border-border flex-row justify-between items-center mb-6"
                        >
                            <Text className="text-foreground font-semibold capitalize">{provider}</Text>
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
                            <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-bold"
                                placeholder="My Provider"
                                value={formData.name}
                                onChangeText={t => setFormData({...formData, name: t})}
                            />
                        </View>

                        {renderProviderFields()}

                        <Text className="text-xs font-bold text-muted-foreground uppercase mb-3 mt-4">Sender Details</Text>
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-[10px] font-medium text-foreground mb-1">From Email</Text>
                                <TextInput
                                    className="bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                    placeholder="noreply@mg.com"
                                    value={formData.fromEmail}
                                    onChangeText={t => setFormData({...formData, fromEmail: t})}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] font-medium text-foreground mb-1">From Name</Text>
                                <TextInput
                                    className="bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                    placeholder="Appwrite"
                                    value={formData.fromName}
                                    onChangeText={t => setFormData({...formData, fromName: t})}
                                />
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between bg-muted/30 p-3 rounded-xl mt-4">
                            <Text className="text-sm font-semibold text-foreground">Enabled</Text>
                            <Switch value={formData.enabled} onValueChange={v => setFormData({...formData, enabled: v})} />
                        </View>

                        <View className="h-20" />
                    </ScrollView>

                    <View className="p-6 bg-muted/20 border-t border-border">
                        <TouchableOpacity 
                            onPress={handleCreate} 
                            disabled={isLoading || !formData.fromEmail || (provider === 'mailgun' && !formData.apiKey)}
                            className={cn("bg-primary py-4 rounded-2xl items-center justify-center", 
                                (isLoading || !formData.fromEmail || (provider === 'mailgun' && !formData.apiKey)) && "opacity-50")}
                        >
                            {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Create Provider</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EmailProviderModal;
