import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useGlobalContext } from '../../context/appwriteContext';
import { sdk } from '../../appwrite/appwrite';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react-native';

const DeleteOrganizationModal = ({ open, onOpenChange }) => {
    const { currentOrganization, setCurrentOrganization, organizations } = useGlobalContext();
    const [confirmName, setConfirmName] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        if (open && currentOrganization) {
            fetchData();
        } else {
            setConfirmName('');
        }
    }, [open, currentOrganization]);

    const fetchData = async () => {
        setFetchingData(true);
        try {
            // Fetch projects
            const projectsRes = await sdk.forConsole.projects.list();
            const filteredProjects = projectsRes.projects.filter(p => p.teamId === currentOrganization.$id);
            setProjects(filteredProjects);

            // Fetch members
            const membersRes = await sdk.forConsole.teams.listMemberships(currentOrganization.$id);
            setMembers(membersRes.memberships);
        } catch (error) {
            console.error('Error fetching data for delete modal:', error);
        } finally {
            setFetchingData(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await sdk.forConsole.billing.deleteOrganization(currentOrganization.$id);

            // Update local state
            const updatedOrgs = organizations.filter(o => o.$id !== currentOrganization.$id);
            if (updatedOrgs.length > 0) {
                setCurrentOrganization(updatedOrgs[0]);
            } else {
                setCurrentOrganization(null);
            }

            onOpenChange(false);
        } catch (error) {
            console.error('Error deleting organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const isConfirmed = confirmName === currentOrganization?.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Delete organization</DialogTitle>
                    <DialogDescription>
                        The following projects and all data associated with <Text className="font-bold">{currentOrganization?.name}</Text> will be permanently deleted. <Text className="font-bold text-destructive">This action is irreversible</Text>.
                    </DialogDescription>
                </DialogHeader>

                <View className="gap-4">
                    <Tabs defaultValue="projects" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="projects">
                                <Text>Projects ({projects.length})</Text>
                            </TabsTrigger>
                            <TabsTrigger value="members">
                                <Text>Members ({members.length})</Text>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="projects" className="max-h-[200px]">
                            <ScrollView>
                                {projects.map(project => (
                                    <View key={project.$id} className="p-2 border-b border-border">
                                        <Text className="font-medium">{project.name}</Text>
                                    </View>
                                ))}
                                {projects.length === 0 && <Text className="text-muted-foreground p-2">No projects found.</Text>}
                            </ScrollView>
                        </TabsContent>
                        <TabsContent value="members" className="max-h-[200px]">
                            <ScrollView>
                                {members.map(member => (
                                    <View key={member.$id} className="p-2 border-b border-border">
                                        <Text className="font-medium">{member.userName || member.userEmail}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </TabsContent>
                    </Tabs>

                    <View className="gap-2">
                        <Label nativeID='confirmName'>Confirm the organization name to continue</Label>
                        <Input
                            placeholder={`Enter ${currentOrganization?.name} to continue`}
                            value={confirmName}
                            onChangeText={setConfirmName}
                            aria-labelledby='confirmName'
                        />
                    </View>
                </View>

                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button variant="ghost" onPress={() => onOpenChange(false)}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button
                        variant="destructive"
                        onPress={handleDelete}
                        disabled={!isConfirmed || loading}
                    >
                        <Text>Delete</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteOrganizationModal;
