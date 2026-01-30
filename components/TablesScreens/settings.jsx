import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Trash2, Copy, AlertTriangle, Shield, UserCheck, Eye, Edit2, Columns, Settings as SettingsIcon } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import PermissionsModal from './modal/PermissionsModal';
import DisplayNameModal from './modal/DisplayNameModal';

const Settings = ({ databaseId, collectionId }) => {
    const { currentProject } = useProjectStore();
    const { collections, updateCollection, deleteCollection, fetchAttributes } = useDatabaseStore();
    
    const collection = collections[databaseId]?.find(c => c.$id === collectionId);
    
    const [name, setName] = useState(collection?.name || '');
    const [permissions, setPermissions] = useState(collection?.$permissions || []);
    const [rowSecurity, setRowSecurity] = useState(collection?.documentSecurity || false);
    const [enabled, setEnabled] = useState(collection?.enabled !== false);
    const [displayNames, setDisplayNames] = useState([]); // This would normally come from preferences
    
    const [attributes, setAttributes] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(false);

    useEffect(() => {
        const loadAttributes = async () => {
            if (currentProject) {
                const attrs = await fetchAttributes(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId);
                setAttributes(attrs);
            }
        };
        loadAttributes();
    }, [databaseId, collectionId]);

    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            await updateCollection(
                currentProject.$id,
                currentProject.region || 'fra',
                databaseId,
                collectionId,
                name,
                permissions,
                rowSecurity,
                enabled
            );
            Alert.alert("Success", "Collection settings updated successfully.");
        } catch (err) {
            console.error('Error updating collection:', err);
            Alert.alert("Error", err.message || "Failed to update collection");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Collection",
            `Are you sure you want to delete "${collection?.name}"? This action cannot be undone and will delete ALL documents.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteCollection(currentProject.$id, currentProject.region || 'fra', databaseId, collectionId);
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete collection");
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-background p-4">
            <View className="mb-10">
                <Text className="text-xl font-bold text-foreground mb-4">Collection Settings</Text>
                
                {/* General Info */}
                <Card className="p-4 mb-4 gap-4">
                    <View>
                        <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">Display Name</Text>
                        <Input 
                            value={name}
                            onChangeText={setName}
                            placeholder="Collection Name"
                            className="bg-muted/10"
                        />
                    </View>
                    
                    <View>
                        <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">Collection ID</Text>
                        <View className="flex-row items-center justify-between bg-muted/30 p-2 rounded-lg">
                            <Text className="text-xs font-mono text-foreground flex-1" numberOfLines={1}>{collection?.$id}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(collection?.$id)} className="ml-2">
                                <Icon as={Copy} size={14} className="text-primary" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>

                {/* Permissions */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Icon as={Shield} size={18} className="text-primary" />
                            <Text className="text-lg font-bold text-foreground">Permissions</Text>
                        </View>
                        <Button variant="outline" size="sm" onPress={() => setIsPermissionsModalOpen(true)}>
                            <Text className="text-primary">Manage</Text>
                        </Button>
                    </View>
                    <Text className="text-sm text-muted-foreground mb-4">
                        Choose who can access your collection and documents.
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {permissions.length > 0 ? (
                            permissions.map((p, i) => (
                                <View key={i} className="bg-muted px-2 py-1 rounded border border-border">
                                    <Text className="text-[10px] font-mono text-foreground">{p}</Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-xs text-muted-foreground italic">No permissions defined (Access Restricted)</Text>
                        )}
                    </View>
                </Card>

                {/* Display Name */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Icon as={Eye} size={18} className="text-primary" />
                            <Text className="text-lg font-bold text-foreground">Display Name</Text>
                        </View>
                        <Button variant="outline" size="sm" onPress={() => setIsDisplayNameModalOpen(true)}>
                            <Text className="text-primary">Configure</Text>
                        </Button>
                    </View>
                    <Text className="text-sm text-muted-foreground mb-4">
                        Select up to 5 string columns to display as row names.
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {displayNames.length > 0 ? (
                            displayNames.map((name, i) => (
                                <View key={i} className="bg-primary/10 px-2 py-1 rounded border border-primary/20 flex-row items-center gap-1">
                                    <Icon as={Columns} size={10} className="text-primary" />
                                    <Text className="text-[10px] font-medium text-primary">{name}</Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-xs text-muted-foreground italic">No display names configured (Default: $id)</Text>
                        )}
                    </View>
                </Card>

                {/* Security */}
                <Card className="p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <Icon as={UserCheck} size={18} className="text-primary" />
                            <Text className="text-lg font-bold text-foreground">Row Security</Text>
                        </View>
                        <Switch 
                            checked={rowSecurity}
                            onCheckedChange={setRowSecurity}
                        />
                    </View>
                    <Text className="text-sm text-muted-foreground leading-relaxed">
                        When row security is <Text className="font-bold text-foreground">enabled</Text>, users will be able to access rows for which they have been granted either row or table permissions.
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        If <Text className="font-bold text-foreground">disabled</Text>, users can access rows only if they have table permissions. Row permissions will be ignored.
                    </Text>
                </Card>

                {/* Status */}
                <Card className="p-4 mb-6">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <Icon as={SettingsIcon} size={18} className="text-primary" />
                            <Text className="text-lg font-bold text-foreground">Status</Text>
                        </View>
                        <Switch 
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </View>
                    <Text className="text-sm text-muted-foreground">
                        Toggle whether this collection is enabled and accessible via the API.
                    </Text>
                </Card>

                <Button 
                    className="bg-primary w-full h-12 mb-10" 
                    onPress={handleUpdate}
                    loading={isSaving}
                >
                    <Text className="text-white font-bold">Update Collection</Text>
                </Button>

                {/* Danger Zone */}
                <Card className="p-4 border-destructive/30 mb-10 bg-destructive/5">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Icon as={AlertTriangle} size={20} className="text-destructive" />
                        <Text className="text-lg font-bold text-destructive">Danger Zone</Text>
                    </View>
                    <Text className="text-sm text-muted-foreground mb-4">
                        Deleting this collection will permanently remove all documents and data associated with it. This action is irreversible.
                    </Text>
                    <Button 
                        variant="destructive" 
                        onPress={handleDelete}
                        loading={isDeleting}
                        className="flex-row items-center justify-center gap-2"
                    >
                        <Icon as={Trash2} size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Delete Collection</Text>
                    </Button>
                </Card>
            </View>

            <PermissionsModal 
                isOpen={isPermissionsModalOpen}
                onOpenChange={setIsPermissionsModalOpen}
                permissions={permissions}
                onSave={setPermissions}
            />
            <DisplayNameModal 
                isOpen={isDisplayNameModalOpen}
                onOpenChange={setIsDisplayNameModalOpen}
                attributes={attributes}
                selectedItems={displayNames}
                onSave={setDisplayNames}
            />
        </ScrollView>
    );
};

export default Settings;
