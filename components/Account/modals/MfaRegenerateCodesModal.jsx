import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MfaRegenerateCodesModal = ({ show, onHide, onConfirm, factors }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [code, setCode] = useState('');

    const handleRegenerate = async () => {
        try {
            setLoading(true);
            setError('');
            await onConfirm(code);
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
                    <DialogTitle>Regenerate recovery codes</DialogTitle>
                </DialogHeader>
                
                <View className="py-4">
                    {error ? (
                        <View className="bg-destructive/10 p-3 rounded-md mb-4">
                            <Text className="text-destructive text-sm">{error}</Text>
                        </View>
                    ) : null}
                    
                    <Text className="text-foreground text-sm mb-4">
                        Are you sure you want to regenerate all recovery codes? All <Text className="font-bold text-destructive">previously generated recovery codes will become invalid.</Text>
                    </Text>

                    <Text className="text-foreground text-sm mb-2">
                        Enter your authenticator code to proceed:
                    </Text>
                    <Input
                        placeholder="000000"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <DialogFooter>
                    <Button variant="outline" onPress={onHide} disabled={loading}>
                        <Text>Cancel</Text>
                    </Button>
                    <Button onPress={handleRegenerate} disabled={loading || code.length < 6}>
                        <Text>{loading ? 'Regenerating...' : 'Regenerate'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MfaRegenerateCodesModal;
