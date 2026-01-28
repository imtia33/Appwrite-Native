import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../../lib/theme-context';
import TabSwitcher from '../blocks/TabSwitcher';
import { Button } from '@/components/ui/button';

const TABS = [
   { route: 'overview', label: 'Overview' },
   { route: 'sessions', label: 'Sessions' },
   { route: 'activity', label: 'Activity' },
   { route: 'organizations', label: 'Organizations' },
   { route: 'payments', label: 'Payments' },
    
];

const CustomAccTabBar = ({
  state,
  navigation,
  user
}) => {
  const { theme } = useTheme();
  
  const activeRoute = useMemo(() => {
    if (!state) return 'overview';
    
    try {
      // Access properties individually to avoid triggering Reanimated during render
      const routes = state.routes;
      const index = state.index;
      
      if (routes && typeof index !== 'undefined' && routes[index] && routes[index].name) {
        return routes[index].name;
      }
    } catch (error) {
      console.warn('Error getting active route:', error);
    }
    return 'overview';
  }, [state]);

  return (
    <View className="bg-background">
      
      <View style={{ borderBottomWidth: 1 }} className="pb-5 border-border">
        <View className='flex-row justify-between items-center px-4 mb-5 mt-2'>
          <Text style={{ fontSize: 25 }} className="text-foreground  font-regular">
            {user?.name || 'User'}
          </Text>
          <Button
          style={{ borderColor: theme === 'dark' ? '#4b4b4bff' : '#6B7280' }}
            variant="outline"
            size="lg"
            className='px-4 py-2  rounded-md'
          >
            <Text className="text-muted-foreground text-lg">Logout</Text>
          </Button>
        </View>
        
        <TabSwitcher
          tabs={TABS}
          activeRoute={activeRoute}
          onTabPress={(route) => navigation.navigate(route)}
        />
      </View>
    </View>
  )
}

export default React.memo(CustomAccTabBar)
