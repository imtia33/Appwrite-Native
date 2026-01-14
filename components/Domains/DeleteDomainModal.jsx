import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { sdk } from '../../appwrite/appwrite';
import { Alert } from 'react-native';

const DeleteDomainModal = ({ open, onOpenChange, domain, onSuccess }) => {
    const { currentOrganization } = useOrganizationStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!domain || !currentOrganization) return;

        setLoading(true);
        try {
            await sdk.forConsole.domains.delete(
                domain.$id
            );
            Alert.alert('Success', `${domain.domain} has been deleted`);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Delete domain error:', error);
            Alert.alert('Error', error.message || 'Failed to delete domain');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete domain</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <Text className="font-semibold">{domain?.domain}</Text>?
                        {'\n\n'}
                        Your site will no longer be available at this domain. This action is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button variant="outline" onPress={() => onOpenChange(false)} disabled={loading}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button variant="destructive" onPress={handleSubmit} disabled={loading}>
                        <Text>{loading ? 'Deleting...' : 'Delete'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDomainModal;
