import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { sdk } from '../../appwrite/appwrite';
import { Alert } from 'react-native';
import { Card, CardContent } from '../ui/card';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const AddDomainModal = ({ open, onOpenChange, onSuccess }) => {
    const { currentOrganization } = useOrganizationStore();
    const [domainName, setDomainName] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdDomain, setCreatedDomain] = useState(null);

    // Default nameservers (you may want to make this configurable)
    const nameservers = ['ns1.appwrite.io', 'ns2.appwrite.io'];

    const handleAdd = async () => {
        if (!domainName.trim() || !currentOrganization) {
            Alert.alert('Error', 'Please enter a domain name');
            return;
        }

        setLoading(true);
        try {
            const domain = await sdk.forConsole.domains.create(
                currentOrganization.$id,
                domainName.toLowerCase().trim()
            );
            setCreatedDomain(domain);
            Alert.alert('Success', 'Domain added successfully');
        } catch (error) {
            console.error('Add domain error:', error);
            Alert.alert('Error', error.message || 'Failed to add domain');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDomainName('');
        setCreatedDomain(null);
        onOpenChange(false);
        if (onSuccess) onSuccess();
    };

    const copyToClipboard = (text) => {
        Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'Nameserver copied to clipboard');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add domain</DialogTitle>
                </DialogHeader>

                <ScrollView className="max-h-96">
                    {!createdDomain ? (
                        <View className="gap-4">
                            <View>
                                <Text className="text-sm font-semibold mb-2">Domain</Text>
                                <TextInput
                                    placeholder="example.com"
                                    value={domainName}
                                    onChangeText={setDomainName}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                                />
                            </View>
                        </View>
                    ) : (
                        <View className="gap-4">
                            <View>
                                <Text className="text-lg font-semibold mb-2">{createdDomain.domain}</Text>
                                <Text className="text-gray-600 mb-4">
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
                    )}
                </ScrollView>

                <DialogFooter className="flex-row gap-2 justify-end">
                    {!createdDomain ? (
                        <>
                            <Button variant="outline" onPress={() => onOpenChange(false)} disabled={loading}>
                                <Text>Cancel</Text>
                            </Button>
                            <Button onPress={handleAdd} disabled={loading || !domainName.trim()}>
                                <Text>{loading ? 'Adding...' : 'Add'}</Text>
                            </Button>
                        </>
                    ) : (
                        <Button onPress={handleClose}>
                            <Text>Done</Text>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddDomainModal;
