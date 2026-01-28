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

const CreateTeamModal = ({ open, onOpenChange, onCreated }) => {
    const { currentProject } = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        teamId: ''
    });

    const handleCreate = async () => {
        if (!currentProject) return;
        if (!formData.name) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const team = await sdk
                .forProject(currentProject.region || 'fra', currentProject.$id)
                .teams.create({
                    teamId: formData.teamId || ID.unique(),
                    name: formData.name
                });
            
            setFormData({ name: '', teamId: '' });
            onCreated(team);
            onOpenChange(false);
        } catch (e) {
            console.error('Create Team Error:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] min-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Create team</DialogTitle>
                </DialogHeader>
                
                <View className="gap-4 py-4">
                    <View className="gap-2">
                        <Label nativeID="name">Name</Label>
                        <Input 
                            placeholder="Enter team name" 
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        />
                    </View>
                    
                    <View className="gap-2">
                        <Label nativeID="teamId">Team ID</Label>
                        <Input 
                            placeholder="Optional custom ID" 
                            value={formData.teamId}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, teamId: text }))}
                        />
                    </View>

                    {error && (
                        <Text className="text-destructive text-xs font-medium bg-destructive/10 p-2 rounded">
                            {error}
                        </Text>
                    )}
                </View>

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

export default CreateTeamModal;
