import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-context";
const ProjectLayout = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bgColor = isDark ? "#19191D" : "#EDEDF0";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Slot />
      <StatusBar
        backgroundColor={bgColor}
        barStyle={isDark ? "light-content" : "dark-content"}
        animated={true}
      />
    </SafeAreaView>
  );
};

export default ProjectLayout;
