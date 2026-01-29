import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { X, Hash } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';

const CreateTopicModal = ({ visible, onClose, onCreate, isLoading }) => {
    const [name, setName] = useState('');
    const [topicId, setTopicId] = useState('');
    const { isDark } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 p-4 min-w-[320px]">
                <View className="bg-card min-w-[320px] rounded-[32px] border border-border max-h-[90%]">
                    <View className="p-6 border-b border-border flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-primary/10 p-2 rounded-xl">
                                <Hash size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">Create Topic</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={20} color="gray" />
                        </TouchableOpacity>
                    </View>
                    
                    <View className="p-6 gap-4">
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-medium"
                                placeholder="Enter topic name"
                                placeholderTextColor="gray"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Topic ID (Optional)</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-mono text-xs"
                                placeholder="unique()"
                                placeholderTextColor="gray"
                                value={topicId}
                                onChangeText={setTopicId}
                            />
                        </View>
                    </View>

                    <View className="p-6 bg-muted/30 flex-row gap-3">
                        <TouchableOpacity 
                            onPress={onClose}
                            className="flex-1 bg-secondary px-4 py-3 rounded-xl items-center"
                        >
                            <Text className="text-foreground font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => onCreate(name, topicId || 'unique()')}
                            disabled={!name || isLoading}
                            className={cn("flex-1 bg-primary px-4 py-3 rounded-xl items-center justify-center", (!name || isLoading) && "opacity-50")}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-semibold">Create</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CreateTopicModal;
