import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { LogOutIcon, SettingsIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { useGlobalContext } from "@/context/appwriteContext";
import { logout } from "@/appwrite/auth/auth";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "../Animated/ThemeToggle";

export function UserMenu() {
  const { user, avatarUrl, setIsLogged, setUser, setAvatarUrl } =
    useGlobalContext();
  const { theme } = useTheme();
  const popoverTriggerRef = React.useRef(null);

  async function onSignOut() {
    try {
      await logout();
      setIsLogged(false);
      setUser(null);
      setAvatarUrl(null);
      popoverTriggerRef.current?.close();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-10 rounded-full">
          <UserAvatar user={user} avatarUrl={avatarUrl} initials={initials} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="center" side="bottom" style={{ width: 280 }}>
        {/* ROOT COLUMN */}
        <View className="flex flex-col">
          {/* USER INFO */}
          <View className="flex flex-col gap-3 border-b border-border p-4">
            <View className="flex-row items-center gap-3">
              <UserAvatar
                user={user}
                avatarUrl={avatarUrl}
                initials={initials}
                className="size-10"
              />
              <View className="flex flex-col flex-1">
                <Text className="font-medium leading-5">{user.name}</Text>
                <Text className="text-sm text-muted-foreground leading-4">
                  {user.email}
                </Text>
              </View>
            </View>

            {/* ACTIONS */}
            <View className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onPress={() => router.push("/profile")}
              >
                <Icon
                  as={SettingsIcon}
                  size={18}
                  color={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                />
                <Text>Manage Account</Text>
              </Button>

              <Button variant="outline" size="sm" onPress={onSignOut}>
                <Icon
                  as={LogOutIcon}
                  size={18}
                  color={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                />
                <Text>Sign Out</Text>
              </Button>
            </View>
          </View>

          {/* APP SETTINGS */}
          <View className="flex flex-col gap-2 px-4 py-3 border-b border-border">
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push("/settings")}
            >
              <Icon
                as={SettingsIcon}
                size={16}
                color={theme === "dark" ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="text-xs">App Settings</Text>
            </Button>
          </View>

          <View className="flex flex-row items-center justify-between gap-2 px-4 py-3">
            <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Appearance
            </Text>
            <ThemeToggle size="md" />
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}

function UserAvatar({ user, avatarUrl, initials, className, ...props }) {
  return (
    <Avatar
      alt={`${user?.name}'s avatar`}
      className={cn("size-8", className)}
      {...props}
    >
      <AvatarImage source={{ uri: avatarUrl }} />
      <AvatarFallback>
        <Text>{initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
