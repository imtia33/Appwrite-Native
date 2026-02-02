import React from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable the strict mode warning about reading shared values during render
});

import "../global.css";
import { ThemeProvider, useTheme } from "../lib/theme-context";
import GlobalProvider from "../context/appwriteContext";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#19191D",
    card: "#19191D",
  },
};
const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#EDEDF0",
    card: "#EDEDF0",
  },
};

function RootStack() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#19191D" : "#EDEDF0";

  return (
    <NavigationThemeProvider value={isDark ? MyDarkTheme : MyLightTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Organization"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Project"
          options={{
            headerShown: false,
            animation: "slide_from_left",
          }}
        />
        <Stack.Screen
          name="databases"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="functions"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/Fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/Fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/Fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/Fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/Fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/Fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/Fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/Fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/Fonts/Poppins-Thin.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#19191D" }}>
      <ThemeProvider>
        <GlobalProvider>
          <RootStack />
          <PortalHost />
        </GlobalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
