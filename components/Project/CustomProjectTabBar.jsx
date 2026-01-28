import React, { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Plus } from 'lucide-react-native'
import { ProjectPicker } from './ProjectPicker';
import { OrganizationPicker } from '../Organization/OrgPicker';
import { useTheme } from '../../lib/theme-context';
import { UserMenu } from '../blocks/userMenu';
import TabSwitcher from '../blocks/TabSwitcher';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';

const TABS = [
  { route: 'Overview', label: 'Overview' },
  { route: 'Auth', label: 'Auth' },
  { route: 'Databases', label: 'Databases' },
  { route: 'Functions', label: 'Functions' },
  { route: 'Messaging', label: 'Messaging' },
  { route: 'Sites', label: 'Sites' },
  { route: 'Storage', label: 'Storage' },
];

const CustomProjectTabBar = ({
  state,
  navigation
}) => {
  const { theme } = useTheme();
  const { projects, currentProject, setCurrentProject, fetchProjects } = useProjectStore();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganizationStore();
  
  useEffect(() => {
    if (currentOrganization?.$id) {
      fetchProjects(currentOrganization.$id);
    }
  }, [currentOrganization?.$id]);

  const activeRoute = state ? state.routes[state.index].name : 'Overview';

  return (
    <View className="bg-background pt-4">
      <View style={{ borderBottomWidth: 1 }} className="flex-row justify-between gap-3 px-4 mb-4 border-border pb-4">
        <View className="flex-row items-center gap-1">
            <OrganizationPicker 
                organizations={organizations} 
                selectedOrganization={currentOrganization} 
                setSelectedOrganization={setCurrentOrganization} 
            />
            <Text className="text-muted-foreground">/</Text>
            <ProjectPicker 
                projects={projects} 
                selectedProject={currentProject} 
                setSelectedProject={setCurrentProject} 
            />
        </View>
        <UserMenu />
      </View>
      
      <View style={{ borderBottomWidth: 1 }} className="pb-5 border-border">
        <View className="flex-row items-center gap-1 px-4 mb-2 w-full ">
          <Text className="text-foreground text-3xl font-regular">
            {currentProject?.name || 'Project'}
          </Text>
          <Pressable className="rounded-md border border-border p-1 ml-1">
            <Plus size={18} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
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

export default React.memo(CustomProjectTabBar)
