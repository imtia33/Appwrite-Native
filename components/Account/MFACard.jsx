import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Smartphone, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { useGlobalContext } from '@/context/appwriteContext';
import { listFactors, updateMFA, createMFARecoveryCodes, updateMFARecoveryCodes, createVerification } from '@/appwrite/auth/auth';
import MfaSetupModal from './modals/MfaSetupModal';
import MfaDeleteModal from './modals/MfaDeleteModal';
import MfaRecoveryCodesModal from './modals/MfaRecoveryCodesModal';
import MfaRegenerateCodesModal from './modals/MfaRegenerateCodesModal';

const MFACard = () => {
    const { user, setUser } = useGlobalContext();
    const [factors, setFactors] = useState({ totp: false, email: false, phone: false, recoveryCode: false });
    const [loading, setLoading] = useState(true);
    const [updatingMfa, setUpdatingMfa] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState(null);

    // Modal states
    const [showSetup, setShowSetup] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [showRegenerate, setShowRegenerate] = useState(false);

    useEffect(() => {
        loadFactors();
    }, []);

    const loadFactors = async () => {
        try {
            setLoading(true);
            const res = await listFactors();
            setFactors(res.factors || {});
        } catch (err) {
            console.error('Failed to load MFA factors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMfa = async (newValue) => {
        try {
            setUpdatingMfa(true);
            await updateMFA(newValue);
            setUser({ ...user, mfa: newValue });
        } catch (err) {
            console.error('Failed to update MFA:', err);
        } finally {
            setUpdatingMfa(false);
        }
    };

    const handleCreateRecoveryCodes = async () => {
        try {
            const codes = await createMFARecoveryCodes();
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
            loadFactors();
        } catch (err) {
            console.error('Failed to create recovery codes:', err);
        }
    };

    const handleRegenerateCodes = async (challengeCode) => {
        try {
            // In a real app, we might need to verify the challengeCode first
            const codes = await updateMFARecoveryCodes();
            setRecoveryCodes(codes);
            setShowRecoveryCodes(true);
            loadFactors();
        } catch (err) {
            throw err; // Propagate to modal
        }
    };

    const handleVerifyEmail = async () => {
        try {
            await createVerification(window.location.origin + '/profile');
            // Show notification
        } catch (err) {
            console.error('Failed to send verification email:', err);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 mt-3">
                <ActivityIndicator />
            </Card>
        );
    }

    return (
        <Card className="p-6 mt-3 gap-0">
            <CardTitle className="text-2xl font-regular text-foreground">Multi-factor authentication</CardTitle>
            <CardDescription className="text-lg font-regular text-muted-foreground mt-2">
                Enhance your account's security by requiring a second sign-in method.
            </CardDescription>

            <View className="mt-8 flex-row items-center justify-between bg-muted/30 p-4 rounded-xl">
                <View className="flex-1 mr-4">
                    <Text className="text-foreground font-medium text-lg">Global MFA Status</Text>
                    <Text className="text-muted-foreground text-sm">Require MFA for all sign-ins</Text>
                </View>
                <Switch
                    value={user?.mfa}
                    onValueChange={handleToggleMfa}
                    disabled={updatingMfa}
                />
            </View>

            {user?.mfa && (
                <View className="mt-8">
                    <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Methods</Text>
                    
                    {/* Authenticator App */}
                    <View className="flex-row items-center py-4 border-b border-border/50">
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                            <Smartphone size={20} className="text-primary" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-foreground font-medium">Authenticator app</Text>
                                {factors.totp && <Badge variant="secondary" className="px-1 py-0"><Text className="text-[10px] text-foreground">connected</Text></Badge>}
                            </View>
                            <Text className="text-muted-foreground text-xs mt-1">Use an app to generate codes.</Text>
                        </View>
                        {factors.totp ? (
                            <Button variant="ghost" size="sm" onPress={() => setShowDelete(true)}>
                                <Text className="text-destructive text-sm font-medium">Delete</Text>
                            </Button>
                        ) : (
                            <Button variant="secondary" size="sm" onPress={() => setShowSetup(true)}>
                                <Text className="text-sm font-medium">Add</Text>
                            </Button>
                        )}
                    </View>

                    {/* Email Factor */}
                    <View className="flex-row items-center py-4 border-b border-border/50">
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                            <Mail size={20} className="text-primary" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-foreground font-medium">Email</Text>
                                <Badge variant="secondary" className="px-1 py-0">
                                    <Text className="text-[10px] text-foreground">{user?.emailVerification ? 'verified' : 'unverified'}</Text>
                                </Badge>
                            </View>
                            <Text className="text-muted-foreground text-xs mt-1">Codes will be sent to: {user?.email}</Text>
                        </View>
                        {!user?.emailVerification && (
                            <Button variant="secondary" size="sm" onPress={handleVerifyEmail}>
                                <Text className="text-sm font-medium">Verify</Text>
                            </Button>
                        )}
                    </View>

                    {/* Recovery Factors */}
                    <View className="mt-8">
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Recovery</Text>
                        <View className="flex-row items-center py-4">
                            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                                <ShieldCheck size={20} className="text-primary" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-medium">Recovery codes</Text>
                                <Text className="text-muted-foreground text-xs mt-1">Use if you lose access to your device.</Text>
                            </View>
                            {factors.recoveryCode ? (
                                <Button variant="secondary" size="sm" onPress={() => setShowRegenerate(true)}>
                                    <Text className="text-sm font-medium">Regenerate</Text>
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" onPress={handleCreateRecoveryCodes}>
                                    <Text className="text-sm font-medium">View</Text>
                                </Button>
                            )}
                        </View>
                    </View>
                </View>
            )}

            {/* Modals */}
            <MfaSetupModal 
                show={showSetup} 
                onHide={() => setShowSetup(false)} 
                onSuccess={loadFactors} 
            />
            <MfaDeleteModal 
                show={showDelete} 
                onHide={() => setShowDelete(false)} 
                onSuccess={loadFactors} 
            />
            <MfaRecoveryCodesModal 
                show={showRecoveryCodes} 
                onHide={() => setShowRecoveryCodes(false)} 
                codes={recoveryCodes} 
            />
            <MfaRegenerateCodesModal 
                show={showRegenerate} 
                onHide={() => setShowRegenerate(false)} 
                onConfirm={handleRegenerateCodes}
                factors={factors}
            />
        </Card>
    );
};

export default MFACard;
