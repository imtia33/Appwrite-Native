import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteMFAAuthenticator } from '@/appwrite/auth/auth';
import { AuthenticatorType } from '@appwrite.io/console';

const MfaDeleteModal = ({ show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError('');
            await deleteMFAAuthenticator(AuthenticatorType.Totp);
            onSuccess?.();
            onHide();
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
                    <DialogTitle>Delete authentication method</DialogTitle>
                </DialogHeader>
                
                <View className="py-4">
                    {error ? (
                        <View className="bg-destructive/10 p-3 rounded-md mb-4">
                            <Text className="text-destructive text-sm">{error}</Text>
                        </View>
                    ) : null}
                    
                    <Text className="text-foreground text-sm mb-2">
                        Are you sure you want to delete this authentication method?
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                        You will no longer be able to use this method to authenticate your account.
                    </Text>
                </View>

                <DialogFooter>
                    <Button variant="outline" onPress={onHide} disabled={loading}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button variant="destructive" onPress={handleDelete} disabled={loading}>
                        <Text>{loading ? 'Deleting...' : 'Delete'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MfaDeleteModal;
