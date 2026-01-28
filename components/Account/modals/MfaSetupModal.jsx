import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createMFAAuthenticator, updateMFAAuthenticator } from '@/appwrite/auth/auth';
import { AuthenticatorType } from '@appwrite.io/console';
import { sdk } from '@/appwrite/appwrite';

const MfaSetupModal = ({ show, onHide, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setupAuthenticator();
        } else {
            // Reset state
            setStep(1);
            setCode('');
            setError('');
        }
    }, [show]);

    const setupAuthenticator = async () => {
        try {
            setLoading(true);
            const type = await createMFAAuthenticator(AuthenticatorType.Totp);
            setSecret(type.secret);
            const qr = await sdk.forConsole.avatars.getQR({ text: type.uri, size: 192 * 2 });
            setQrCode(qr);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            setLoading(true);
            setError('');
            await updateMFAAuthenticator(AuthenticatorType.Totp, code);
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
                    <DialogTitle>{step === 1 ? 'Scan QR code' : 'Enter verification code'}</DialogTitle>
                </DialogHeader>
                
                <View className="py-4">
                    {error ? (
                        <View className="bg-destructive/10 p-3 rounded-md mb-4">
                            <Text className="text-destructive text-sm">{error}</Text>
                        </View>
                    ) : null}

                    {step === 1 ? (
                        <View>
                            <Text className="text-foreground text-sm mb-4">
                                Install an authenticator app on your mobile device, open it and scan the provided QR code or enter it manually.
                            </Text>
                            
                            {loading ? (
                                <View className="h-[220px] items-center justify-center">
                                    <ActivityIndicator />
                                </View>
                            ) : (
                                <View className="items-center mb-4">
                                    <View className="p-4 bg-white rounded-xl">
                                        <Image 
                                            source={{ uri: qrCode }} 
                                            style={{ width: 192, height: 192 }} 
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            )}

                            <View className="flex-row items-center my-4">
                                <View className="flex-1 h-[1px] bg-border" />
                                <Text className="mx-4 text-xs font-bold text-muted-foreground uppercase">or</Text>
                                <View className="flex-1 h-[1px] bg-border" />
                            </View>

                            <View>
                                <Text className="text-muted-foreground text-xs mb-1">Manual entry code</Text>
                                <View className="flex-row gap-2">
                                    <View className="flex-1 bg-muted p-2 rounded border border-border">
                                        <Text className="text-foreground font-mono text-sm">{secret}</Text>
                                    </View>
                                </View>
                                <Text className="text-muted-foreground text-[10px] mt-1">
                                    Manually enter the following code into the authenticator app
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-foreground text-sm mb-2">
                                Enter the 6-digit one-time code generated by the app
                            </Text>
                            <Input
                                placeholder="000000"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                className="text-center text-2xl tracking-[10px]"
                                autoFocus
                            />
                        </View>
                    )}
                </View>

                <DialogFooter>
                    <Button variant="outline" onPress={onHide}>
                        <Text>Cancel</Text>
                    </Button>
                    {step === 1 ? (
                        <Button onPress={() => setStep(2)} disabled={loading || !qrCode}>
                            <Text>Continue</Text>
                        </Button>
                    ) : (
                        <Button onPress={handleVerify} disabled={loading || code.length < 6}>
                            <Text>{loading ? 'Verifying...' : 'Verify'}</Text>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MfaSetupModal;
