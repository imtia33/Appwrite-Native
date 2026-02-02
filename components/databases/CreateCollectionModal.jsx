import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '../ui/text';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react-native';

const CreateCollectionModal = ({ isOpen, onOpenChange, onCreate, databaseId }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [touchedId, setTouchedId] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toIdFormat = (str) => {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\-_. ]+/g, '')
            .replace(/ /g, '_')
            .replace(/^-+/, '')
            .replace(/\.+$/, '')
            .replace(/_{2,}/g, '_')
            .slice(0, 36);
    };

    useEffect(() => {
        if (!touchedId && name) {
            setId(toIdFormat(name));
        }
    }, [name, touchedId]);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setId('');
            setTouchedId(false);
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleCreate = async () => {
        if (!name) {
            setError('Name is required');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            await onCreate(name, id || undefined);
            onOpenChange(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => onOpenChange(false)}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center items-center bg-black/60"
            >
                <View 
                    style={{ width: '90%', maxWidth: 400 }}
                    className={cn(
                        "rounded-3xl overflow-hidden shadow-2xl",
                        isDark ? "bg-background border border-border" : "bg-background"
                    )}
                >
                    {/* Header */}
                    <View className="px-6 py-5 flex-row items-center justify-between border-b border-border/50">
                        <Text className="text-xl font-bold tracking-tight">Create Collection</Text>
                        <TouchableOpacity 
                            onPress={() => onOpenChange(false)}
                            className="p-2 rounded-full"
                        >
                            <X size={20} color='gray' />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-6 py-6">
                        <View className="gap-6">
                            <View className="gap-2.5">
                                <Label nativeID="collection-name">Name</Label>
                                <Input
                                    placeholder="Enter collection name"
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                />
                            </View>

                            <View className="gap-2.5">
                                <View className="flex-row items-center justify-between">
                                    <Label nativeID="collection-id">Collection ID</Label>
                                    
                                </View>
                                <Input
                                    placeholder="Enter collection ID (optional)"
                                    value={id}
                                    className='text-muted-foreground'
                                    onChangeText={(val) => {
                                        setId(val);
                                        setTouchedId(true);
                                    }}
                                />
                                <Text className="text-[12px] text-muted-foreground ml-1">
                                    Allowed: a-z, 0-9, dots, hyphens, and underscores.
                                </Text>
                            </View>

                            {error && (
                                <View className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <Text className="text-red-500 text-sm">{error}</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="px-6 py-6 border-t border-border flex-row gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-1 rounded-2xl h-12" 
                            onPress={() => onOpenChange(false)}
                        >
                            <Text>Cancel</Text>
                        </Button>
                        <Button 
                            variant={'default'}
                            className="flex-1 rounded-2xl h-12" 
                            onPress={handleCreate}
                            disabled={loading || !name}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold">Create</Text>
                            )}
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateCollectionModal;
