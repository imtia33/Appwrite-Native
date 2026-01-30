import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { X, Plus, Shield } from 'lucide-react-native';
import useDatabaseStore from '@/appwrite/data-services/databaseService';
import PermissionsModal from './PermissionsModal';

const CreateDocumentModal = ({ isOpen, onOpenChange, databaseId, collectionId, attributes, onCreated, projectId, region }) => {
    const { createDocument } = useDatabaseStore();
    const [data, setData] = useState({});
    const [documentId, setDocumentId] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await createDocument(
                projectId,
                region,
                databaseId,
                collectionId,
                data,
                permissions,
                documentId || undefined
            );
            onCreated(result);
            onOpenChange(false);
            setData({});
            setDocumentId('');
            setPermissions([]);
        } catch (err) {
            setError(err.message || 'Failed to create document');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const renderInput = (attr) => {
        const { key, type, format, array, required } = attr;
        
        return (
            <View key={key} className="gap-2 mb-4">
                <Label nativeID={key}>
                    {key} {required && <Text className="text-destructive">*</Text>}
                </Label>
                {type === 'boolean' ? (
                    <View className="flex-row items-center gap-2">
                        <Switch 
                            checked={data[key] || false} 
                            onCheckedChange={(val) => handleInputChange(key, val)}
                        />
                        <Text className="text-sm">{data[key] ? 'True' : 'False'}</Text>
                    </View>
                ) : (
                    <Input
                        placeholder={`Enter ${key}`}
                        value={data[key] !== undefined ? String(data[key]) : ''}
                        onChangeText={(val) => {
                            let typedVal = val;
                            if (type === 'integer' || type === 'double') {
                                typedVal = Number(val);
                            }
                            handleInputChange(key, typedVal);
                        }}
                        keyboardType={type === 'integer' || type === 'double' ? 'numeric' : 'default'}
                    />
                )}
                <Text className="text-[10px] text-muted-foreground uppercase">{type} {format ? `(${format})` : ''} {array ? '[]' : ''}</Text>
            </View>
        );
    };

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Create Document</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]">
                    <View className="gap-4">
                        <View className="gap-2 mb-4">
                            <Label nativeID="doc-id">Document ID</Label>
                            <Input
                                placeholder="Auto-generated if empty"
                                value={documentId}
                                onChangeText={setDocumentId}
                            />
                        </View>
                        
                        <Separator className="my-2" />
                        
                        {attributes.filter(a => a.status === 'available').map(renderInput)}

                        <Separator className="my-2" />
                        
                        <View className="gap-2 mb-6">
                            <Label>Permissions</Label>
                            <Button 
                                variant="outline" 
                                className="flex-row items-center justify-center gap-2 h-12"
                                onPress={() => setIsPermissionsModalOpen(true)}
                            >
                                <Icon as={Shield} size={18} className="text-primary" />
                                <Text className="text-primary font-medium">Set Initial Permissions ({permissions.length})</Text>
                            </Button>
                            <Text className="text-[10px] text-muted-foreground">
                                If empty, the collection-level permissions will apply.
                            </Text>
                        </View>

                        {error && (
                            <View className="bg-destructive/10 p-3 rounded-lg border border-destructive">
                                <Text className="text-destructive text-xs text-center">{error}</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1">
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button 
                        onPress={handleCreate} 
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Create</Text>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <PermissionsModal 
            isOpen={isPermissionsModalOpen}
            onOpenChange={setIsPermissionsModalOpen}
            permissions={permissions}
            onSave={(newPerms) => setPermissions(newPerms)}
            title="Initial Row Permissions"
        />
        </>
    );
};

const Separator = ({ className }) => <View className={`h-[1px] bg-border ${className}`} />;

export default CreateDocumentModal;
