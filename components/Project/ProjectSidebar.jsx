import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { 
    Zap, 
    MessageSquare, 
    Globe,
} from 'lucide-react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export const CATEGORIES = [
    { id: 'overview', label: 'Overview', icon: Entypo, iconName: 'bar-graph' },
    { id: 'auth', label: 'Auth', icon: MaterialIcons, iconName: 'groups' },
    { id: 'databases', label: 'Databases', icon: FontAwesome, iconName: 'database' },
    { id: 'functions', label: 'Functions', icon: Zap },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'storage', label: 'Storage', icon: AntDesign, iconName: 'folder' },
];

const ProjectSidebar = ({ activeCategory, onCategoryChange }) => {
    const { theme } = useTheme();

    return (
        <View className="w-[72px] bg-background  h-full py-4 items-center">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 12 }}>
                {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category.id;
                    const IconComponent = category.icon;
                    const iconName = category.iconName;

                    return (
                        <View key={category.id} className="relative items-center">
                             {/* Indicator line */}
                            {isActive && (
                                <View 
                                    className="absolute left-[-16px] top-[12px] w-[4px] h-[24px] bg-primary rounded-r-full" 
                                />
                            )}
                            
                            <Pressable
                                onPress={() => onCategoryChange(category.id)}
                                className={cn(
                                    "w-[48px] h-[48px] rounded-[24px] items-center justify-center transition-all duration-200",
                                    isActive 
                                        ? "bg-primary rounded-[16px]" 
                                        : "bg-background hover:bg-primary/20 hover:rounded-[16px]"
                                )}
                            >
                                {iconName ? (
                                    <IconComponent 
                                        name={iconName}
                                        size={24} 
                                        color={isActive ? "#FFFFFF" : (theme === 'dark' ? '#9CA3AF' : '#6B7280')} 
                                    />
                                ) : (
                                    <IconComponent 
                                        size={24} 
                                        color={isActive ? "#FFFFFF" : (theme === 'dark' ? '#9CA3AF' : '#6B7280')} 
                                    />
                                )}
                            </Pressable>
                        </View>
                    );
                })}
            </ScrollView>
            
            <View className="mt-auto items-center pb-4">
            </View>
        </View>
    );
};

export default ProjectSidebar;
