import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  ToastAndroid,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { router } from "expo-router";
import { login, getCurrentUser } from "@/appwrite/auth/auth";
import { Alert, ActivityIndicator } from "react-native";
import Loading from "@/components/Animated/Loading";
import { useGlobalContext } from "@/context/appwriteContext";
import { useOrganizationStore } from "@/appwrite/store/organizationStore";
const Login = () => {
  const { isDark, isLight } = useTheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const { fetchOrganizations } = useOrganizationStore();

  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSignIn = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);

      const user = await getCurrentUser();
      setUser(user);
      setIsLogged(true);

      await fetchOrganizations();

      router.replace("/Organization");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4">
      {isSubmitting && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-background/70">
          <Loading size={150} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-regular text-foreground font-poppins-regular h-10">
          Sign In
        </Text>

        <Label className="text-foreground mt-5 mb-2 text-lg">Email</Label>
        <Input
          placeholder="Email"
          className="text-secondary-foreground border  rounded-md"
          style={{ height: 45, fontSize: 18 }}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Label className="text-foreground mt-3 mb-2 text-lg">Password</Label>
        <Input
          placeholder="Password"
          secureTextEntry
          style={{ height: 45, fontSize: 18 }}
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <Button
          className={`mt-4 max-w-40 w-full justify-center items-center self-center ${isSubmitting ? "opacity-50" : ""}`}
          onPress={onSignIn}
          disabled={isSubmitting}
        >
          <Text
            className="text-white font-semibold text-lg flex items-center justify-center"
            style={{ bottom: 2 }}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Text>
        </Button>
        <View className="flex-row items-center mt-2">
          <Separator className="flex-1" />
          <Text className="text-muted-foreground px-4 text-lg">or</Text>
          <Separator className="flex-1" />
        </View>
        <Button
          className="flex-row items-center justify-center rounded-xl border border-border bg-input h-18 active:opacity-80 mt-4"
          onPress={() =>
            ToastAndroid.show(
              "This feature is not available yet",
              ToastAndroid.SHORT,
            )
          }
        >
          <Github size={18} color="#e5e7eb" />
          <Text className="ml-2 text-base text-foreground font-medium">
            Sign in with GitHub
          </Text>
        </Button>
        <View className="flex-row items-center mt-4 space-x-2">
          <Button
            className="bg-transparent"
            onPress={() =>
              ToastAndroid.show(
                "This feature is not available yet",
                ToastAndroid.SHORT,
              )
            }
          >
            <Text className="text-muted-foreground px-2 text-lg">
              Forgot Password?
            </Text>
          </Button>

          <Separator orientation="vertical" className="h-6" />
          <Button
            className="bg-transparent"
            onPress={() => {
              router.push("/sign-up");
            }}
          >
            <Text className="text-foreground px-2 text-lg">Sign up</Text>
          </Button>
        </View>
      </ScrollView>
      <View>
        <Image
          source={
            isDark
              ? require("@/assets/appwrite-dark.png")
              : require("@/assets/appwrite-light.png")
          }
          className="w-40 h-20 self-center "
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

export default Login;
