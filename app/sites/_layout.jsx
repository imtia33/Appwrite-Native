import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/lib/theme-context";
import { View, Text, TouchableOpacity } from "react-native";
import TabSwitcher from "@/components/blocks/TabSwitcher";
import { useLocalSearchParams, router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ChevronLeft } from "lucide-react-native";

// Import your screen components
import Overview from "./overview";
import Deployments from "./deployments";
import Logs from "./logs";
import Domains from "./domains";
import Settings from "./settings";

const Tab = createMaterialTopTabNavigator();

export default function SitesLayout() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#19191D" : "#EDEDF0",
      }}
    >
      <Tab.Navigator
        tabBar={({ state, descriptors, navigation }) => {
          const tabs = state.routes.map((route) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;
            return { label, route: route.name };
          });

          const activeRoute = state.routes[state.index].name;

          const onTabPress = (routeName) => {
            const route = state.routes.find((r) => r.name === routeName);
            const isFocused = state.routes[state.index].name === routeName;

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(routeName, route.params);
            }
          };

          return (
            <View className="my-4">
              <View className="px-4 py-2 flex-row items-center gap-2">
                <TouchableOpacity onPress={() => router.back()}>
                  <Icon as={ChevronLeft} size={28} color="gray" />
                </TouchableOpacity>
                <Text className="text-2xl font-regular text-muted-foreground">
                  {params.name}
                </Text>
              </View>
              <TabSwitcher
                tabs={tabs}
                activeRoute={activeRoute}
                onTabPress={onTabPress}
              />
            </View>
          );
        }}
        screenOptions={{
          tabBarScrollEnabled: true,
          swipeEnabled: true,
          sceneContainerStyle: {
            backgroundColor: theme === "dark" ? "#19191D" : "#EDEDF0",
          },
        }}
      >
        <Tab.Screen
          name="Overview"
          component={Overview}
          initialParams={params}
        />
        <Tab.Screen
          name="Deployments"
          component={Deployments}
          initialParams={params}
        />
        <Tab.Screen name="Logs" component={Logs} initialParams={params} />
        <Tab.Screen name="Domains" component={Domains} initialParams={params} />
        <Tab.Screen
          name="Settings"
          component={Settings}
          initialParams={params}
        />
      </Tab.Navigator>
      <StatusBar
        backgroundColor={theme === "dark" ? "#19191D" : "#EDEDF0"}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        animated={true}
      />
    </SafeAreaView>
  );
}
