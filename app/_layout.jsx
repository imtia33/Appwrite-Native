import React from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PortalHost } from '@rn-primitives/portal';

import "../global.css"
import { ThemeProvider } from '../lib/theme-context';
import GlobalProvider from '../context/appwriteContext';

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
    <ThemeProvider>
      <GlobalProvider>
        <Stack>
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
        </Stack>
        <PortalHost />
      </GlobalProvider>
    </ThemeProvider>
  );
}