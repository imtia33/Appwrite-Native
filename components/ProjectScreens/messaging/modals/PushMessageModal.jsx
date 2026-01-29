import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { X, Bell, Plus, Image as ImageIcon, Clock, Hash } from 'lucide-react-native';
import { useTheme } from '../../../../lib/theme-context';
import { cn } from '../../../../lib/utils';
import { Icon } from '../../../ui/icon';
import TargetSelector from './shared/TargetSelector';
import Scheduler from './shared/Scheduler';

const PushMessageModal = ({ visible, onClose, onCreate, isLoading }) => {
    const { isDark } = useTheme();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        messageId: '',
        title: '',
        body: '',
        data: [], // Stores as [key, value] pairs
        image: '',
        topics: [],
        users: [],
        targets: [],
        draft: false,
        scheduledAt: null
    });

    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');

    const handleCreate = () => {
        const customData = {};
        formData.data.forEach(([k, v]) => {
            if (k) customData[k] = v;
        });

        const cleanedData = {
            ...formData,
            messageId: formData.messageId || 'unique()',
            data: customData
        };
        onCreate(cleanedData);
    };

    const addData = () => {
        if (keyInput) {
            setFormData({ ...formData, data: [...formData.data, [keyInput, valueInput]] });
            setKeyInput('');
            setValueInput('');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Title</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border font-bold"
                                placeholder="Push notification title"
                                placeholderTextColor="gray"
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Body</Text>
                            <TextInput
                                className="bg-input text-foreground px-4 py-3 rounded-xl border border-border h-24"
                                placeholder="Notification message body..."
                                placeholderTextColor="gray"
                                multiline
                                textAlignVertical="top"
                                value={formData.body}
                                onChangeText={(text) => setFormData({ ...formData, body: text })}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-1.5">Image URL (Optional)</Text>
                            <View className="flex-row gap-2">
                                <TextInput
                                    className="flex-1 bg-input text-foreground px-4 py-3 rounded-xl border border-border"
                                    placeholder="https://..."
                                    placeholderTextColor="gray"
                                    value={formData.image}
                                    onChangeText={(text) => setFormData({ ...formData, image: text })}
                                />
                                <View className="bg-secondary p-3 rounded-xl items-center justify-center">
                                    <Icon as={ImageIcon} size={20} color="gray" />
                                </View>
                            </View>
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-foreground mb-3">Custom Data (Key-Value)</Text>
                            <View className="flex-row gap-2 mb-2">
                                <TextInput
                                    className="flex-1 bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                    placeholder="Key"
                                    placeholderTextColor="gray"
                                    value={keyInput}
                                    onChangeText={setKeyInput}
                                />
                                <TextInput
                                    className="flex-1 bg-input text-foreground px-3 py-2 rounded-lg border border-border text-xs"
                                    placeholder="Value"
                                    placeholderTextColor="gray"
                                    value={valueInput}
                                    onChangeText={setValueInput}
                                />
                                <TouchableOpacity onPress={addData} className="bg-secondary p-2 rounded-lg items-center justify-center">
                                    <Icon as={Plus} size={16} color="gray" />
                                </TouchableOpacity>
                            </View>
                            {formData.data.map(([k, v], idx) => (
                                <View key={idx} className="flex-row items-center justify-between bg-muted/30 p-2 rounded-lg mb-1">
                                    <Text className="text-xs text-foreground font-mono">{k}: {v}</Text>
                                    <TouchableOpacity onPress={() => setFormData({...formData, data: formData.data.filter((_, i) => i !== idx)})}>
                                        <Icon as={X} size={12} color="gray" />
                                    </TouchableOpacity>
                                </View>
                            ))}
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
                                <Bell size={20} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-foreground">Create Push</Text>
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
                                disabled={step === 1 && (!formData.title || !formData.body)}
                                className={cn("flex-1 bg-primary py-4 rounded-2xl items-center", (step === 1 && (!formData.title || !formData.body)) && "opacity-50")}
                            >
                                <Text className="text-white font-bold">Next</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                onPress={handleCreate} 
                                disabled={isLoading || (formData.topics.length === 0 && formData.users.length === 0)}
                                className={cn("flex-1 bg-primary py-4 rounded-2xl items-center justify-center", (formData.topics.length === 0 && formData.users.length === 0) && "opacity-50")}
                            >
                                {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Create Push</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Local Plus override since it's used here and might not be imported
const PlusLocal = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size, height: 2, backgroundColor: color, position: 'absolute' }} />
        <View style={{ width: 2, height: size, backgroundColor: color, position: 'absolute' }} />
    </View>
);

export default PushMessageModal;
