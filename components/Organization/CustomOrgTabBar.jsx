import React, { useMemo } from 'react'
import { View, Text, Pressable, ScrollView, Image } from 'react-native'
import { Plus, Github } from 'lucide-react-native'
import { OrganizationPicker } from './OrgPicker';
import ToggleSwitch from '../Animated/ThemeToggle';
import { useTheme } from '../../lib/theme-context';
import { BillingPlan } from '../../appwrite/constants';
import { UserMenu } from '../blocks/userMenu';
import TabSwitcher from '../blocks/TabSwitcher';

const TABS = [
  { route: 'projects', label: 'Projects' },
  { route: 'domains', label: 'Domains' },
  { route: 'members', label: 'Members' },
  { route: 'billings', label: 'Billing' },
  { route: 'settings', label: 'Settings' },
];

const CustomOrgTabBar = ({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
  avatarUrl,
  state,
  navigation
}) => {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  
  // Get the active route from Material Top Tabs state
  const activeRoute = useMemo(() => {
    if (!state) return 'projects';
    
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
    return 'projects';
  }, [state]);
  const getPlanInfo = (plan) => {
    switch (plan) {
      case BillingPlan.FREE:
        return { label: 'Free', showIcon: false };
      case BillingPlan.GITHUB_EDUCATION:
        return { label: 'Education', showIcon: true };
      case BillingPlan.PRO:
        return { label: 'Pro', showIcon: false };
      case BillingPlan.SCALE:
        return { label: 'Scale', showIcon: false };
      default:
        return { label: 'Business', showIcon: false };
    }
  };

  const planInfo = getPlanInfo(selectedOrganization?.billingPlan);

  return (
    <View className="bg-background pt-4">
      <View style={{ borderBottomWidth: 1 }} className="flex-row justify-between gap-3 px-4 mb-4  border-border pb-4">

        <OrganizationPicker organizations={organizations} selectedOrganization={selectedOrganization} setSelectedOrganization={setSelectedOrganization} />
        <UserMenu />
      </View>
      <View style={{ borderBottomWidth: 1 }} className="pb-5  border-border">
        <View className="flex-row items-center gap-1 px-4 mb-2 w-full ">
          <Text className="text-muted-foreground text-3xl font-regular">
            {(selectedOrganization?.name || 'Organization').length > 7
              ? `${(selectedOrganization?.name || 'Organization').substring(0, 7)}...`
              : (selectedOrganization?.name || 'Organization')}
          </Text>

          <View style={{ top: 2 }} className="rounded-lg bg-card border border-0 px-1 py-1 flex-row items-center gap-1">
            {planInfo.showIcon && <Github size={12} color={iconColor} />}
            <Text style={{ fontSize: 13 }} className=" text-muted-foreground font-poppins-medium">
              {planInfo.label}
            </Text>
          </View>

          <Pressable className="rounded-md border border-border p-1 ml-1">
            <Plus size={18} color={iconColor} />
          </Pressable>
          <Pressable style={{ width: 80 }} className="rounded-md border border-border px-1 py-2 flex-row items-center justify-center gap-1 ml-1 mb-2 ">
            <Plus size={18} color={iconColor} />
            <Text className="text-muted-foreground text-sm font-poppins-medium w-full max-w-10">
              Invite
            </Text>
          </Pressable>





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

export default React.memo(CustomOrgTabBar)
