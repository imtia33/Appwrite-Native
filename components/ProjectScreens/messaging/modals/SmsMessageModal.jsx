import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { X, MessageSquare, Bell, Clock, Hash } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';
import TargetSelector from './shared/TargetSelector';
import Scheduler from './shared/Scheduler';

const SmsMessageModal = ({ visible, onClose, onCreate, isLoading }) => {
    const { isDark } = useTheme();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        messageId: '',
        content: '',
        topics: [],
        users: [],
        targets: [],
        draft: false,
        scheduledAt: null
    });

    const handleCreate = () => {
        const cleanedData = {
            ...formData,
            messageId: formData.messageId || 'unique()',
        };
        onCreate(cleanedData);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Content</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border h-40"
                                placeholder="SMS content..."
                                placeholderTextColor="gray"
                                multiline
                                textAlignVertical="top"
                                value={formData.content}
                                onChangeText={(text) => setFormData({ ...formData, content: text })}
                            />
                            <Text className="text-[10px] text-muted-foreground mt-1 text-right">
                                {formData.content.length} characters (approximately {Math.ceil(formData.content.length / 160)} segment(s))
                            </Text>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <TargetSelector 
                        selectedTopics={formData.topics}
                        selectedUsers={formData.users}
                        onAddTopic={(id) => setFormData({...formData, topics: [...formData.topics, id]})}
                        onRemoveTopic={(id) => setFormData({...formData, topics: formData.topics.filter(x => x !== id)})}
                        onAddUser={(id) => setFormData({...formData, users: [...formData.users, id]})}
                        onRemoveUser={(id) => setFormData({...formData, users: formData.users.filter(x => x !== id)})}
                    />
                );
            case 3:
                return (
                    <View className="gap-6">
                        <Scheduler 
                            scheduledAt={formData.scheduledAt}
                            onScheduleChange={(iso) => setFormData({...formData, scheduledAt: iso})}
                        />
                        
                        <View className="mt-4 border-t border-border pt-4">
                            <Text className="text-sm font-bold text-foreground mb-4">Message Configuration</Text>
                            <View>
                                <Text className="text-sm font-medium text-foreground mb-1.5">Custom Message ID (Optional)</Text>
                                <TextInput
                                    className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-mono text-xs"
                                    placeholder="unique()"
                                    placeholderTextColor="gray"
                                    value={formData.messageId}
                                    onChangeText={(text) => setFormData({ ...formData, messageId: text })}
                                />
                            </View>
                            <View className="flex-row items-center justify-between bg-muted/30 p-3 rounded-xl mt-4">
                                <View>
                                    <Text className="text-sm font-semibold text-foreground">Save as Draft</Text>
                                    <Text className="text-xs text-muted-foreground">Do not send immediately</Text>
                                </View>
                                <Switch 
                                    value={formData.draft} 
                                    onValueChange={(val) => setFormData({ ...formData, draft: val })}
                                    trackColor={{ false: '#767577', true: '#ef4444' }}
                                />
                            </View>
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-end">
                <View className="bg-card rounded-t-[32px] border-t border-border max-h-[90%]">
                    <View className="p-6 border-b border-border flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-primary/10 p-2 rounded-xl">
                                <MessageSquare size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">Create SMS</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon as={X} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">
                        {/* Stepper */}
                        <View className="flex-row justify-between mb-8 px-4">
                            {[1, 2, 3].map(s => (
                                <View key={s} className="items-center">
                                    <View className={cn("w-8 h-8 rounded-full items-center justify-center border-2", 
                                        step === s ? "bg-primary border-primary" : 
                                        step > s ? "bg-primary/20 border-primary" : "bg-muted border-border")}>
                                        <Text className={cn("font-bold text-xs", step === s ? "text-white" : "text-muted-foreground text-foreground")}>{s}</Text>
                                    </View>
                                    <Text className="text-[10px] mt-1 text-muted-foreground">{s === 1 ? 'Message' : s === 2 ? 'Targets' : 'Schedule'}</Text>
                                </View>
                            ))}
                        </View>

                        {renderStep()}

                        <View className="h-20" />
                    </ScrollView>

                    <View className="p-6 bg-muted/20 border-t border-border flex-row gap-3">
                        {step > 1 && (
                            <TouchableOpacity onPress={() => setStep(step - 1)} className="flex-1 bg-secondary py-4 rounded-2xl items-center">
                                <Text className="text-foreground font-bold">Back</Text>
                            </TouchableOpacity>
                        )}
                        {step < 3 ? (
                            <TouchableOpacity 
                                onPress={() => setStep(step + 1)} 
                                disabled={step === 1 && !formData.content}
                                className={cn("flex-1 bg-primary py-4 rounded-2xl items-center", (step === 1 && !formData.content) && "opacity-50")}
                            >
                                <Text className="text-white font-bold">Next</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                onPress={handleCreate} 
                                disabled={isLoading || (formData.topics.length === 0 && formData.users.length === 0)}
                                className={cn("flex-1 bg-primary py-4 rounded-2xl items-center justify-center", (formData.topics.length === 0 && formData.users.length === 0) && "opacity-50")}
                            >
                                {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Create SMS</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SmsMessageModal;
