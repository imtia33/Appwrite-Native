import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { sdk } from '../../../../appwrite/appwrite';
import { ID } from '@appwrite.io/console';
import { useProjectStore } from '../../../../appwrite/store/projectStore';
import { Loader2 } from 'lucide-react-native';
import { Icon } from '../../../ui/icon';

const CreateUserModal = ({ open, onOpenChange, onCreated }) => {
    const { currentProject } = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        userId: ''
    });

    const handleCreate = async () => {
        if (!currentProject) return;
        setLoading(true);
        setError(null);
        
        try {
            const user = await sdk
                .forProject(currentProject.region || 'fra', currentProject.$id)
                .users.create({
                    userId: formData.userId || ID.unique(),
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    password: formData.password || undefined,
                    name: formData.name || undefined
                });
            
            setFormData({ name: '', email: '', phone: '', password: '', userId: '' });
            onCreated(user);
            onOpenChange(false);
        } catch (e) {
            console.error('Create User Error:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] min-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Create user</DialogTitle>
                </DialogHeader>
                
                <ScrollView className="max-h-[70vh]">
                    <View className="gap-4 py-4">
                        <View className="gap-2">
                            <Label nativeID="name">Name</Label>
                            <Input 
                                placeholder="Enter name" 
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            />
                        </View>
                        
                        <View className="gap-2">
                            <Label nativeID="email">Email</Label>
                            <Input 
                                placeholder="Enter email" 
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="phone">Phone</Label>
                            <Input 
                                placeholder="+123456789" 
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="password">Password</Label>
                            <Input 
                                placeholder="Enter password" 
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="userId">User ID</Label>
                            <Input 
                                placeholder="Optional custom ID" 
                                value={formData.userId}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, userId: text }))}
                            />
                        </View>

                        {error && (
                            <Text className="text-destructive text-xs font-medium bg-destructive/10 p-2 rounded">
                                {error}
                            </Text>
                        )}
                    </View>
                </ScrollView>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button 
                        disabled={loading} 
                        onPress={handleCreate}
                        className="flex-row items-center"
                    >
                        {loading && <Icon as={Loader2} size={16} color="white" className="mr-2 animate-spin" />}
                        <Text>Create</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserModal;
