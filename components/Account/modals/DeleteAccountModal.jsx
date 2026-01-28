import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteAccount } from '@/appwrite/auth/auth';
import { useGlobalContext } from '@/context/appwriteContext';
import { router } from 'expo-router';

const DeleteAccountModal = ({ show, onHide }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setIsLogged, setUser } = useGlobalContext();

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError('');
            await deleteAccount();
            
            // Clear global state
            setIsLogged(false);
            setUser(null);
            
            onHide();
            // Redirect to login
            router.replace('/sign-in');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Delete account</DialogTitle>
                </DialogHeader>
                
                <View className="py-2">
                    {error ? (
                        <View className="bg-destructive/10 p-2 rounded-md mb-3">
                            <Text className="text-destructive text-xs">{error}</Text>
                        </View>
                    ) : null}
                    
                    <Text className="text-foreground text-sm mb-1 font-semibold">
                        Are you sure you want to delete your account?
                    </Text>
                    <Text className="text-muted-foreground text-xs leading-5">
                        Your account will be permanently deleted and access will be lost to any of your teams and data. This action is irreversible.
                    </Text>
                </View>

                <DialogFooter className="flex-row gap-2 justify-end mt-2">
                    <Button variant="outline" onPress={onHide} disabled={loading} className="h-9 px-4">
                        <Text className="text-foreground text-sm font-medium">Cancel</Text>
                    </Button>
                    <Button variant="primary" onPress={handleDelete} disabled={loading} className="h-9 px-4">
                        <Text className="text-white text-sm font-medium">{loading ? 'Deleting...' : 'Delete'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteAccountModal;
