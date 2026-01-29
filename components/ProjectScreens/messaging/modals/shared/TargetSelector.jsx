import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Plus, Users, Hash, X, Search, Check, ChevronRight, User } from 'lucide-react-native';
import { useTheme } from '../../../../../lib/theme-context';
import useAuthStore from '../../../../../appwrite/data-services/authService';
import useMessagingStore from '../../../../../appwrite/data-services/messagingService';
import { useProjectStore } from '../../../../../appwrite/store/projectStore';
import { cn } from '../../../../../lib/utils';
import { Icon } from '../../../../ui/icon';

const TargetSelector = ({ selectedTopics, selectedUsers, onAddTopic, onRemoveTopic, onAddUser, onRemoveUser }) => {
    const { isDark } = useTheme();
    const { currentProject } = useProjectStore();
    const { fetchTopics, getTopics, isLoading: loadingMessaging } = useMessagingStore();
    const { fetchUsers, getUsers, isLoading: loadingAuth } = useAuthStore();

    const [pickerType, setPickerType] = useState(null); // 'topic' | 'user'
    const [searchQuery, setSearchQuery] = useState('');
    const [showChoiceMenu, setShowChoiceMenu] = useState(false);

    useEffect(() => {
        if (currentProject?.$id) {
            fetchTopics(currentProject.$id);
            fetchUsers(currentProject.$id);
        }
    }, [currentProject?.$id]);

    const topics = currentProject ? getTopics(currentProject.$id) : [];
    const users = currentProject ? getUsers(currentProject.$id) : [];

    const filteredTopics = topics.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.$id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.$id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPicker = () => {
        if (!pickerType) return null;

        const isTopic = pickerType === 'topic';
        const items = isTopic ? filteredTopics : filteredUsers;
        const loading = isTopic ? loadingMessaging() : loadingAuth('users');

        return (
            <View className="mt-4 border-t border-border pt-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm font-bold text-foreground">
                        Select {isTopic ? 'Topics' : 'Users'}
                    </Text>
                    <TouchableOpacity onPress={() => { setPickerType(null); setSearchQuery(''); }}>
                        <Text className="text-xs text-primary font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-muted/50 rounded-xl px-3 py-2 flex-row items-center mb-4 border border-border">
                    <Search size={16} color="gray" />
                    <TextInput
                        className="flex-1 ml-2 text-foreground text-sm py-1"
                        placeholder={`Search ${isTopic ? 'topics' : 'users'}...`}
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#ef4444" className="py-4" />
                ) : items.length === 0 ? (
                    <Text className="text-center text-muted-foreground py-4 text-xs">No {isTopic ? 'topics' : 'users'} found</Text>
                ) : (
                    <ScrollView className="max-h-60" nestedScrollEnabled={true}>
                        {items.map(item => {
                            const isSelected = isTopic 
                                ? selectedTopics.includes(item.$id)
                                : selectedUsers.includes(item.$id);
                            
                            return (
                                <TouchableOpacity 
                                    key={item.$id}
                                    onPress={() => {
                                        if (isTopic) {
                                            if (isSelected) onRemoveTopic(item.$id);
                                            else onAddTopic(item.$id);
                                        } else {
                                            if (isSelected) onRemoveUser(item.$id);
                                            else onAddUser(item.$id);
                                        }
                                    }}
                                    className={cn(
                                        "flex-row items-center p-3 rounded-xl mb-2",
                                        isSelected ? "bg-primary/10 border border-primary/20" : "bg-card border border-border"
                                    )}
                                >
                                    <View className={cn("w-8 h-8 rounded-full items-center justify-center", isTopic ? "bg-blue-100" : "bg-purple-100")}>
                                        <Icon as={isTopic ? Hash : User} size={14} color={isTopic ? "#3b82f6" : "#a855f7"} />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{item.name || (isTopic ? item.$id : 'No Name')}</Text>
                                        <Text className="text-[10px] text-muted-foreground">{isTopic ? `${(item.emailTotal || 0) + (item.smsTotal || 0) + (item.pushTotal || 0)} subscribers` : item.email}</Text>
                                    </View>
                                    {isSelected && <Check size={16} color="#ef4444" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <View className="gap-6">
            <View>
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-bold text-foreground">Select Targets</Text>
                    <View className="relative">
                        <TouchableOpacity 
                            onPress={() => setShowChoiceMenu(!showChoiceMenu)}
                            className="bg-primary/10 px-3 py-1.5 rounded-lg flex-row items-center"
                        >
                            <Plus size={14} color="#ef4444" />
                            <Text className="text-primary text-xs font-bold ml-1.5">Add</Text>
                        </TouchableOpacity>

                        {showChoiceMenu && (
                            <View 
                                className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1"
                                style={{
                                    elevation: 5,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                }}
                            >
                                <TouchableOpacity 
                                    onPress={() => { setPickerType('topic'); setShowChoiceMenu(false); }}
                                    className="flex-row items-center p-3 rounded-lg hover:bg-muted"
                                >
                                    <Hash size={16} color="gray" />
                                    <View className="ml-3">
                                        <Text className="text-sm text-foreground font-semibold">Existing Topics</Text>
                                        <Text className="text-[10px] text-muted-foreground">Select from groups</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { setPickerType('user'); setShowChoiceMenu(false); }}
                                    className="flex-row items-center p-3 rounded-lg hover:bg-muted"
                                >
                                    <Users size={16} color="gray" />
                                    <View className="ml-3">
                                        <Text className="text-sm text-foreground font-semibold">Existing Users</Text>
                                        <Text className="text-[10px] text-muted-foreground">Select individuals</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Selection List */}
                <View className="gap-2">
                    {selectedTopics.map(id => {
                        const topic = topics.find(t => t.$id === id);
                        return (
                            <View key={`t-${id}`} className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-2xl flex-row items-center">
                                <Hash size={14} color="#3b82f6" />
                                <Text className="text-sm font-medium text-foreground ml-3 flex-1" numberOfLines={1}>{topic?.name || id}</Text>
                                <TouchableOpacity onPress={() => onRemoveTopic(id)}>
                                    <X size={16} color="gray" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                    {selectedUsers.map(id => {
                        const user = users.find(u => u.$id === id);
                        return (
                            <View key={`u-${id}`} className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 rounded-2xl flex-row items-center">
                                <User size={14} color="#a855f7" />
                                <Text className="text-sm font-medium text-foreground ml-3 flex-1" numberOfLines={1}>{user?.name || user?.email || id}</Text>
                                <TouchableOpacity onPress={() => onRemoveUser(id)}>
                                    <X size={16} color="gray" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                    {selectedTopics.length === 0 && selectedUsers.length === 0 && !pickerType && (
                        <View className="bg-muted/30 border border-dashed border-border py-8 rounded-2xl items-center">
                            <Users size={32} color="gray" opacity={0.5} />
                            <Text className="text-muted-foreground text-xs mt-2 text-center px-6">
                                No targets selected. Select topics or users to send this message to.
                            </Text>
                        </View>
                    )}
                </View>

                {renderPicker()}
            </View>
        </View>
    );
};

export default TargetSelector;
