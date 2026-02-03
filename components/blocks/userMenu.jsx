import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LogOutIcon, PlusIcon, SettingsIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useGlobalContext } from '@/context/appwriteContext';
import { logout } from '@/appwrite/auth/auth';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme-context';
import ThemeToggle from '../Animated/ThemeToggle';

export function UserMenu() {
    const { user, avatarUrl, setIsLogged, setUser, setAvatarUrl } = useGlobalContext();
    const { theme } = useTheme();
    const popoverTriggerRef = React.useRef(null);

    async function onSignOut() {
        try {
            await logout();
            setIsLogged(false);
            setUser(null);
            setAvatarUrl(null);
            popoverTriggerRef.current?.close();
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    if (!user) return null;

    const initials = user.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : 'U';

    return (
        <Popover>
            <PopoverTrigger asChild ref={popoverTriggerRef}>
                <Button variant="ghost" size="icon" className="size-10 rounded-full">
                    <UserAvatar user={user} avatarUrl={avatarUrl} initials={initials} />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" side="bottom" className="w-80 p-0">
                <View className="border-border gap-3 border-b p-3">
                    <View className="flex-row items-center gap-3">
                        <UserAvatar user={user} avatarUrl={avatarUrl} initials={initials} className="size-10" />
                        <View className="flex-1">
                            <Text className="font-medium leading-5">{user.name}</Text>
                            <Text className="text-muted-foreground text-sm font-normal leading-4">
                                {user.email}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row flex-wrap gap-3 py-0.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onPress={() => {
                                router.push('/profile')
                            }}>
                            <Icon as={SettingsIcon} size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                            <Text>Manage Account</Text>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onPress={onSignOut}>
                            <Icon as={LogOutIcon} size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                            <Text>Sign Out</Text>
                        </Button>
                    </View>
                </View>
                <View style={{ height: 64 }} className='flex-row items-center justify-between px-4 mt-2'>
                    <Text className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Appearance</Text>
                    <ThemeToggle size="md" />
                </View>
            </PopoverContent>
        </Popover>
    );
}

function UserAvatar({ user, avatarUrl, initials, className, ...props }) {
    return (
        <Avatar alt={`${user?.name}'s avatar`} className={cn('size-8', className)} {...props}>
            <AvatarImage source={{ uri: avatarUrl }} />
            <AvatarFallback>
                <Text>{initials}</Text>
            </AvatarFallback>
        </Avatar>
    );
}
