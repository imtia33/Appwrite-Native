import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Platform,
} from "react-native";
import React from "react";
import { useGlobalContext } from "@/context/appwriteContext";
import { useTheme } from "@/lib/theme-context";
import { useSettingsStore } from "@/appwrite/store/settingsStore";
import { logout } from "@/appwrite/auth/auth";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  LogOut,
  Database,
  Palette,
  Maximize2,
  Github,
  MessageSquare,
  Globe,
  ChevronRight,
  User,
  Info,
  Trash2,
  Zap,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingRow = ({
  icon: Icon,
  label,
  description,
  rightElement,
  onPress,
  destructive = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const iconColor = destructive ? "#ef4444" : isDark ? "#a1a1aa" : "#71717a";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-center py-3 px-4"
    >
      <View className="mr-4">
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className={`font-medium ${destructive ? "text-destructive" : ""}`}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-muted-foreground text-xs">{description}</Text>
        )}
      </View>
      {rightElement}
      {!rightElement && onPress && (
        <ChevronRight size={18} color={isDark ? "#52525b" : "#d4d4d8"} />
      )}
    </TouchableOpacity>
  );
};

const Section = ({ title, children }) => (
  <View className="mb-6">
    <Text className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </Text>
    <Card className="overflow-hidden border-0 bg-secondary/30 dark:bg-muted/20">
      {children}
    </Card>
  </View>
);

const Settings = () => {
  const { user, setIsLogged, setUser, setAvatarUrl } = useGlobalContext();
  const { theme, toggleTheme, isDark } = useTheme();
  const { hapticsEnabled, setHapticsEnabled, compactView, setCompactView } =
    useSettingsStore();

  const handleLogout = async () => {
    if (hapticsEnabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            setIsLogged(false);
            setUser(null);
            setAvatarUrl(null);
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to log out");
          }
        },
      },
    ]);
  };

  const triggerHaptic = () => {
    if (hapticsEnabled) Haptics.selectionAsync();
  };

  return (
    <SafeAreaView className="flex-1 h-full">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="py-6 items-center">
          <View className="h-20 w-20 rounded-full bg-primary items-center justify-center border border-primary mb-3">
            <User size={40} color={isDark ? "#F4F4F5" : "#18181b"} />
          </View>
          <Text className="text-xl font-bold">{user?.name || "Guest"}</Text>
          <Text className="text-muted-foreground text-sm">
            {user?.email || "No email"}
          </Text>
        </View>

        <Section title="Account">
          <SettingRow
            icon={User}
            label="Profile Overview"
            onPress={() => router.push("/profile/overview")}
          />
          <Separator className="mx-4" />
          <SettingRow
            icon={LogOut}
            label="Sign Out"
            destructive
            onPress={handleLogout}
          />
        </Section>

        <Section title="Interface & Behavior">
          <SettingRow
            icon={Palette}
            label="Dark Mode"
            description="Switch between light and dark themes"
            rightElement={
              <Switch
                checked={isDark}
                onCheckedChange={() => {
                  triggerHaptic();
                  toggleTheme();
                }}
              />
            }
          />
          <Separator className="mx-4" />
          <SettingRow
            icon={Maximize2}
            label="Compact View"
            description="Show more rows in data tables"
            rightElement={
              <Switch
                checked={compactView}
                onCheckedChange={(val) => {
                  triggerHaptic();
                  setCompactView(val);
                }}
              />
            }
          />
          <Separator className="mx-4" />
          <SettingRow
            icon={Info}
            label="Haptic Feedback"
            description="Tactile response on actions"
            rightElement={
              <Switch
                checked={hapticsEnabled}
                onCheckedChange={(val) => {
                  if (val)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHapticsEnabled(val);
                }}
              />
            }
          />
        </Section>

        <Section title="Support & Links">
          <SettingRow
            icon={Github}
            label="GitHub Repository"
            onPress={() =>
              Linking.openURL("https://github.com/imtia33/Appwrite-Native")
            }
          />
          <Separator className="mx-4" />
          <SettingRow
            icon={MessageSquare}
            label="Join Discord"
            onPress={() => Linking.openURL("https://appwrite.io/discord")}
          />
          <Separator className="mx-4" />
          <SettingRow
            icon={Globe}
            label="Official Website"
            onPress={() => Linking.openURL("https://appwrite.io")}
          />
        </Section>

        <View className="py-4 items-center">
          <Text className="text-muted-foreground text-[10px] uppercase tracking-tighter">
            Appwrite Native Console v1.0.0
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://github.com/imtia33")}
          >
            <Text className="text-muted-foreground text-[10px] uppercase tracking-tighter mt-1">
              Developed by Axistro
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
