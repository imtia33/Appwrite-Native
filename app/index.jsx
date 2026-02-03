import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { useGlobalContext } from "../context/appwriteContext";
import { useTheme } from "@/lib/theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const index = () => {
  const { isLogged, loading } = useGlobalContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleNavigation = async () => {
      if (!loading) {
        if (isLogged) {
          const lastView = await AsyncStorage.getItem("last_view");
          const selectedProjectId =
            await AsyncStorage.getItem("selectedProjectId");

          if (lastView === "project" && selectedProjectId) {
            router.replace("/Project");
          } else {
            router.replace("/Organization");
          }
        } else {
          router.replace("/login");
        }
      }
    };

    handleNavigation();
  }, [isLogged, loading]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="items-center px-10">
        <Image
          source={
            isDark
              ? require("../assets/appwrite-dark.png")
              : require("../assets/appwrite-light.png")
          }
          className="w-64 h-16"
          resizeMode="contain"
        />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "#FD366E", // Appwrite primary pink
          opacity: isDark ? 0.08 : 0.04,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: "absolute",
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "#FD366E",
          opacity: isDark ? 0.06 : 0.03,
        }}
        pointerEvents="none"
      />
    </View>
  );
};

export default index;
