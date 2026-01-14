import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';

const BoxAvatar = ({ name, description, avatars = [], total }) => {
    return (
        <View className="flex-row items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
            <View className="flex-row items-center">
                {avatars.slice(0, 3).map((avatar, index) => (
                    <Avatar
                        key={index}
                        className={cn(
                            "w-10 h-10 border-2 border-background",
                            index > 0 && "-ml-3"
                        )}
                    >
                        <AvatarFallback>
                            <Text className="text-sm font-medium">
                                {avatar?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </AvatarFallback>
                    </Avatar>
                ))}
                {total > 3 && (
                    <View className="w-10 h-10 rounded-full bg-muted border-2 border-background -ml-3 items-center justify-center">
                        <Text className="text-[10px] font-medium">+{total - 3}</Text>
                    </View>
                )}
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-muted-foreground" numberOfLines={1}>{name}</Text>
                <Text className="text-muted-foreground text-sm">{description}</Text>
            </View>
        </View>
    );
};

export default BoxAvatar;
