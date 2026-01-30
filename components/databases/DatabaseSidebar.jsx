import React from 'react';
import { View, Pressable, ScrollView, Text } from 'react-native';
import { Database } from 'lucide-react-native';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

const DatabaseSidebar = React.memo(({ databases, activeDatabaseId, onDatabaseChange }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View className="w-[72px] bg-background h-full py-4 items-center">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 12 }}>
                {databases.map((db) => {
                    const isActive = activeDatabaseId === db.$id;
                    const initials = db.name ? db.name.substring(0, 2).toUpperCase() : 'DB';

                    return (
                        <View key={db.$id} className="relative items-center">
                             {/* Indicator line */}
                            {isActive && (
                                <View 
                                    className="absolute left-[-16px] top-[12px] w-[4px] h-[24px] bg-primary rounded-r-full" 
                                />
                            )}
                            
                            <Pressable
                                onPress={() => onDatabaseChange(db.$id)}
                                className={cn(
                                    "w-[48px] h-[48px] rounded-[24px] items-center justify-center transition-all duration-200",
                                    isActive 
                                        ? "bg-primary rounded-[16px]" 
                                        : "bg-background hover:bg-primary/20 hover:rounded-[16px]"
                                )}
                            >
                                <Text className={cn(
                                    "font-bold text-sm",
                                    isActive ? "text-white" : (isDark ? "text-slate-400" : "text-slate-600")
                                )}>
                                    {initials}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
});

export default DatabaseSidebar;
