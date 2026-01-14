import React from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { useGlobalContext } from '../../context/appwriteContext';

const MemberDeleteModal = ({ open, onOpenChange, member }) => {
    const { deleteMembership, loading } = useOrganizationStore();
    const { user } = useGlobalContext();

    const isSelf = member?.userId === user?.$id;

    const handleSubmit = async () => {
        if (!member) return;
        try {
            await deleteMembership(member.$id);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isSelf ? 'Leave Organization' : 'Remove Member'}</DialogTitle>
                    <DialogDescription>
                        {isSelf
                            ? `Are you sure you want to leave '${member?.teamName}'?`
                            : `Are you sure you want to remove ${member?.userName || member?.userEmail} from '${member?.teamName}'?`
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button variant="outline" onPress={() => onOpenChange(false)}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button variant="destructive" onPress={handleSubmit} disabled={loading}>
                        <Text>{loading ? (isSelf ? 'Leaving...' : 'Removing...') : (isSelf ? 'Leave' : 'Remove')}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MemberDeleteModal;
