import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import CustomOrgTabBar from '@/components/Organization/CustomOrgTabBar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from '@/lib/theme-context'
import { useGlobalContext } from '@/context/appwriteContext'

// Import your screen components
import Projects from './projects'
import Domains from './domains'
import Members from './members'
import Billings from './billings'
import Settings from './settings'

const Tab = createMaterialTopTabNavigator()

export default function OrgLayout() {
  const { theme } = useTheme()
  const { organizations, currentOrganization, setCurrentOrganization, avatarUrl } = useGlobalContext();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#19191D' : '#EDEDF0' }}>
      <Tab.Navigator
        tabBar={props => (
          <CustomOrgTabBar
            organizations={organizations}
            selectedOrganization={currentOrganization}
            setSelectedOrganization={setCurrentOrganization}
            avatarUrl={avatarUrl}
            {...props}
          />
        )}
        screenOptions={{
          tabBarScrollEnabled: true,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="projects" component={Projects} />
        <Tab.Screen name="domains" component={Domains} />
        <Tab.Screen name="members" component={Members} />
        <Tab.Screen name="billings" component={Billings} />
        <Tab.Screen name="settings" component={Settings} />
      </Tab.Navigator>
      <StatusBar backgroundColor={theme === 'dark' ? '#19191D' : '#EDEDF0'} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} animated={true} />
    </SafeAreaView>
  )
}
