import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Github } from 'lucide-react-native'
import { useTheme } from '@/lib/theme-context'
import { router } from 'expo-router'
import { Checkbox } from '@/components/ui/checkbox';
import { Linking, Alert } from 'react-native'
import { signup, login, getCurrentUser } from '@/appwrite/auth/auth'
import Loading from '@/components/Animated/Loading'
import { useGlobalContext } from '@/context/appwriteContext'
import { useOrganizationStore } from '@/appwrite/store/organizationStore'
const SignUp = () => {
  const { isDark, isLight } = useTheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const { fetchOrganizations } = useOrganizationStore();

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [termsChecked, setTermsChecked] = React.useState(false);

  const onSignUp = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(form.email, form.password, form.name);
      await login(form.email, form.password);

      const user = await getCurrentUser();
      setUser(user);
      setIsLogged(true);

      await fetchOrganizations();

      router.replace('/Organization/projects');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4">
      {isSubmitting && (
        <View className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
          <Loading size={150} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-regular text-foreground font-poppins-regular h-10">
          Sign Up
        </Text>

        <Label className="text-foreground mt-5 mb-2 text-lg">
          Name
        </Label>
        <Input placeholder="Name"
          className="text-secondary-foreground border  rounded-md"
          style={{ height: 45, fontSize: 18 }}
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />
        <Label className="text-foreground mt-3 mb-2 text-lg">
          Email
        </Label>
        <Input placeholder="Email"
          className="text-secondary-foreground border  rounded-md"
          style={{ height: 45, fontSize: 18 }}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Label className="text-foreground mt-3 mb-2 text-lg">
          Password
        </Label>
        <Input
          placeholder="Password"
          secureTextEntry
          style={{ height: 45, fontSize: 18 }}
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <View className="flex flex-row items-center gap-3 self-end mt-2 mb-2">
          <Checkbox
            id="terms"
            checked={termsChecked}
            className='border-border w-6 h-6 self-start mt-2'
            onCheckedChange={() => setTermsChecked(!termsChecked)}
          />
          <View className="flex-1 mt-1">
            <Text className='text-muted-foreground ' style={{ fontSize: 17 }}>
              By registering, you agree that you have read, understand, and acknowledge our{' '}
              <Text className='text-primary' onPress={() => { Linking.openURL('https://appwrite.io/privacy'); }}>
                Privacy Policy
              </Text>{' '}
              and accept our{' '}
              <Text className='text-primary' onPress={() => { Linking.openURL('https://appwrite.io/terms'); }}>
                General Terms of Use
              </Text>.
            </Text>
          </View>
        </View>


        <Button
          className={`mt-4 max-w-40 w-full justify-center items-center self-center ${(!termsChecked || isSubmitting) ? 'opacity-50' : ''}`}
          onPress={onSignUp}
          disabled={!termsChecked || isSubmitting}
        >
          <Text className="text-white font-semibold text-lg flex items-center justify-center" style={{ bottom: 2 }}>
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </Button>
        <View className="flex-row items-center mt-2">
          <Separator className="flex-1" />
          <Text className="text-muted-foreground px-4 text-lg">or</Text>
          <Separator className="flex-1" />
        </View>
        <Button className="flex-row items-center justify-center rounded-xl border border-border bg-input h-18 active:opacity-80 mt-4">
          <Github size={18} color="#e5e7eb" />
          <Text className="ml-2 text-base text-foreground font-medium">
            Sign up with GitHub
          </Text>
        </Button>
        <View className="flex-row items-center mt-4 self-center">
          <Text className="text-muted-foreground text-lg justify-center" style={{ top: 2 }}>Already have an account?</Text>
          <Button className="bg-transparent"
            onPress={() => { router.push('/login') }}
          >
            <Text className="text-foreground text-lg">Sign in</Text>
          </Button>
        </View>

      </ScrollView>
      <View>
        <Image
          source={isDark ? require('@/assets/appwrite-dark.png') : require('@/assets/appwrite-light.png')}
          className="w-40 h-20 self-center "
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  )
}

export default SignUp
