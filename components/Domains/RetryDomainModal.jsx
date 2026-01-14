import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { sdk } from '../../appwrite/appwrite';
import { Alert } from 'react-native';
import { Card, CardContent } from '../ui/card';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const RetryDomainModal = ({ open, onOpenChange, domain, onSuccess }) => {
    const { currentOrganization } = useOrganizationStore();
    const [loading, setLoading] = useState(false);

    // Default nameservers (you may want to make this configurable)
    const nameservers = ['ns1.appwrite.io', 'ns2.appwrite.io'];

    const handleRetry = async () => {
        if (!domain || !currentOrganization) return;

        setLoading(true);
        try {
            const updatedDomain = await sdk.forConsole.domains.updateVerification(
                domain.$id
            );

            if (updatedDomain.nameservers?.toLowerCase() === 'appwrite') {
                Alert.alert('Success', `${domain.domain} has been verified`);
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                Alert.alert(
                    'Verification Failed',
                    'Domain verification failed. Please check your domain settings or try again later'
                );
            }
        } catch (error) {
            console.error('Retry verification error:', error);
            Alert.alert('Error', error.message || 'Failed to verify domain');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'Nameserver copied to clipboard');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Retry verification</DialogTitle>
                </DialogHeader>

                <ScrollView className="max-h-96">
                    <View className="gap-4">
                        <View>
                            <Text className="text-lg font-semibold mb-2">{domain?.domain}</Text>
                            <Text className="text-gray-600">
                                Add the following nameservers on your DNS provider. Note that changes may take up to 48 hours to propagate fully.
                            </Text>
                        </View>

                        {/* Nameservers Table */}
                        <Card>
                            <CardContent className="p-0">
                                {/* Header */}
                                <View className="flex-row border-b border-gray-200 bg-gray-50 p-3">
                                    <Text className="flex-1 font-semibold text-gray-700">Type</Text>
                                    <Text className="flex-[2] font-semibold text-gray-700">Value</Text>
                                    <View className="w-10" />
                                </View>

                                {/* Rows */}
                                {nameservers.map((nameserver, index) => (
                                    <View
                                        key={index}
                                        className={`flex-row p-3 ${index < nameservers.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <Text className="flex-1 text-gray-600">NS</Text>
                                        <Text className="flex-[2] font-mono text-sm">{nameserver}</Text>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => copyToClipboard(nameserver)}
                                            className="w-10 p-0"
                                        >
                                            <Copy size={16} color="#666" />
                                        </Button>
                                    </View>
                                ))}
                            </CardContent>
                        </Card>

                        <Text className="text-sm text-gray-500">
                            A list of all domain providers and their DNS setting is available in the{' '}
                            <Text className="text-blue-600">Appwrite documentation</Text>.
                        </Text>
                    </View>
                </ScrollView>

                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button variant="outline" onPress={() => onOpenChange(false)} disabled={loading}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button onPress={handleRetry} disabled={loading}>
                        <Text>{loading ? 'Verifying...' : 'Retry'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RetryDomainModal;
