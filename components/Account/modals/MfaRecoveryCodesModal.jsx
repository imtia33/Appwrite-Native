import React from 'react';
import { View, Text, ScrollView, Platform, Share } from 'react-native';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Icon } from '@/components/ui/icon';
import { Download, Copy, AlertTriangle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const MfaRecoveryCodesModal = ({ show, onHide, codes }) => {
    if (!codes) return null;

    const formattedCodes = codes.recoveryCodes.join('\n');

    const handleCopyAll = async () => {
        await Clipboard.setStringAsync(formattedCodes);
    };

    const handleDownload = async () => {
        // Simple share/save functionality for React Native
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            await Share.share({
                message: formattedCodes,
                title: 'Appwrite Recovery Codes'
            });
        }
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Recovery codes</DialogTitle>
                </DialogHeader>
                
                <View className="py-4">
                    <View className="bg-warning/10 p-4 rounded-md mb-4 flex-row gap-3">
                        <Icon as={AlertTriangle} size={20} className="text-warning" />
                        <View className="flex-1">
                            <Text className="text-warning font-bold text-sm mb-1 line-clamp-2">
                                Securely store your recovery codes as they won't be visible again
                            </Text>
                            <Text className="text-warning/80 text-xs">
                                Use security codes for emergency sign-ins in case you've lost access to your mobile device. Each recovery code can only be used once.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-end gap-2 mb-4">
                        <Button variant="outline" size="sm" className="flex-row gap-2" onPress={handleDownload}>
                            <Icon as={Download} size={14} className="text-foreground" />
                            <Text className="text-xs">Download</Text>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-row gap-2" onPress={handleCopyAll}>
                            <Icon as={Copy} size={14} className="text-foreground" />
                            <Text className="text-xs">Copy all</Text>
                        </Button>
                    </View>

                    <View className="border border-border rounded-md max-h-[300px]">
                        <ScrollView>
                            <Table>
                                <TableBody>
                                    {codes.recoveryCodes.map((code, index) => (
                                        <TableRow key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                            <TableCell className="flex-1">
                                                <Text className="font-mono text-foreground">{code}</Text>
                                            </TableCell>
                                            <TableCell className="w-10">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onPress={() => Clipboard.setStringAsync(code)}
                                                >
                                                    <Icon as={Copy} size={14} className="text-muted-foreground" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollView>
                    </View>
                </View>

                <DialogFooter>
                    <Button onPress={onHide}>
                        <Text>Close</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MfaRecoveryCodesModal;
