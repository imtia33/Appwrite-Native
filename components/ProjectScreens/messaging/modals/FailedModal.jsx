import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';

const FailedModal = ({ visible, onClose, errors }) => {
    const { isDark } = useTheme();
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className={cn("w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden", isDark ? "bg-slate-900" : "bg-white")}>
                    <View className="p-6 border-b border-border flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-foreground">Message Errors</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={20} color="gray" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="p-6 max-h-96">
                        <View className="flex-row items-center gap-2 mb-4">
                            <Icon as={AlertCircle} size={20} color="#ef4444" />
                            <Text className="text-destructive font-medium">Message failed</Text>
                        </View>
                        <Text className="text-muted-foreground mb-4">
                            The message has been processed with errors. Please refer to the logs below for more information.
                        </Text>
                        <View className="bg-muted p-4 rounded-xl border border-border">
                            <Text className="text-foreground font-mono text-xs">
                                {errors && errors.length > 0 ? errors.join('\n') : 'No error logs available.'}
                            </Text>
                        </View>
                    </ScrollView>
                    <View className="p-6 bg-muted/30">
                        <TouchableOpacity onPress={onClose} className="bg-secondary px-4 py-3 rounded-xl items-center">
                            <Text className="text-foreground font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FailedModal;
