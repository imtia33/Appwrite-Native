import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import CustomAccTabBar from '@/components/Account/CustomAccTabBar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from '@/lib/theme-context'
import { useGlobalContext } from '@/context/appwriteContext'

// Import your screen components
import Activity from './activity'
import Organizations from './organizations'
import OverView from './overview'
import Payments from './payments'
import Sessions from './sessions'
import { View,Text } from 'react-native'

const Tab = createMaterialTopTabNavigator()

export default function ProfileLayout() {
  const { user } = useGlobalContext()
  const { theme } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#19191D' : '#EDEDF0' }}>
        <View style={{ borderBottomWidth: 1 }} className="flex-row justify-between gap-3 px-4 mb-4 border-border py-2 ">
                
                <Text className="text-muted-foreground text-lg font-medium">
                  Account
                </Text>
        </View>
      <Tab.Navigator
        tabBar={props => (
          <CustomAccTabBar
            user={user}
            {...props}
          />
        )}
        screenOptions={{
          tabBarScrollEnabled: true,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="overview" component={OverView} />
        <Tab.Screen name="sessions" component={Sessions} />
        <Tab.Screen name="activity" component={Activity} />
        <Tab.Screen name="organizations" component={Organizations} />
        <Tab.Screen name="payments" component={Payments} />
      </Tab.Navigator>
      <StatusBar backgroundColor={theme === 'dark' ? '#19191D' : '#EDEDF0'} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} animated={true} />
    </SafeAreaView>
  )
}
