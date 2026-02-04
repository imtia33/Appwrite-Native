import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { useGlobalContext } from "../context/appwriteContext";
import { useTheme } from "@/lib/theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

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
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
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
       <StatusBar backgroundColor={theme.theme !== 'dark' ? '#EDEDF0' : '#19191D'} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} animated={true} />
      
    </SafeAreaView>
  );
};

export default index;
