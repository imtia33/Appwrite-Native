import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import AuthUsage from '../Usage/AuthUsage';
import DatabaseUsage from '../Usage/DatabaseUsage';
import FunctionUsage from '../Usage/FunctionUsage';
import SiteUsage from '../Usage/SiteUsage';
import StorageUsage from '../Usage/StorageUsage';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CATEGORIES } from './ProjectSidebar';
import { 
  Info, 
  BarChart3, 
  Puzzle, 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Settings, 
  Database, 
  Zap, 
  Layout, 
  Send, 
  Server, 
  Hash, 
  Globe, 
  Archive,
  ChevronRight
} from 'lucide-react-native';

const USAGE_COMPONENTS = {
  auth: AuthUsage,
  databases: DatabaseUsage,
  functions: FunctionUsage,
  sites: SiteUsage,
  storage: StorageUsage,
};

export const SCREEN_MAP = {
  overview: {
    hasUsage: false,
    screens: [
      { id: 'usage', label: 'Usage', icon: BarChart3 },
      { id: 'integrations', label: 'Integrations', icon: Puzzle },
    ],
  },
  auth: {
    hasUsage: true,
    screens: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'teams', label: 'Teams', icon: UserPlus },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'templates', label: 'Templates', icon: Mail },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  databases: {
    hasUsage: true,
    screens: [
      { id: 'databases', label: 'Databases', icon: Database },
    ],
  },
  functions: {
    hasUsage: true,
    screens: [
      { id: 'functions', label: 'Functions', icon: Zap },
      { id: 'function-templates', label: 'Templates', icon: Layout },
    ],
  },
  messaging: {
    hasUsage: false,
    screens: [
      { id: 'messages', label: 'Messages', icon: Send },
      { id: 'providers', label: 'Providers', icon: Server },
      { id: 'topic', label: 'Topics', icon: Hash },
    ],
  },
  sites: {
    hasUsage: true,
    screens: [
      { id: 'sites', label: 'Sites', icon: Globe },
    ],
  },
  storage: {
    hasUsage: true,
    screens: [
      { id: 'buckets', label: 'Buckets', icon: Archive },
    ],
  },
};

const ScreenItem = React.memo(({ screen, onScreenChange, isDark, iconColor }) => {
  const ScreenIcon = screen.icon;
  return (
    <Pressable
      onPress={() => onScreenChange(screen.id)}
      className={cn(
        'flex-row items-center justify-between px-4 py-2.5 rounded-xl transition-all',
        isDark
          ? 'active:bg-slate-800/60'
          : 'active:bg-slate-100'
      )}
    >
      <View className="flex-row items-center gap-3.5">
        <View 
          className={cn(
            "p-2 rounded-lg",
            isDark ? "bg-slate-800/30" : "bg-white border border-slate-100 shadow-sm"
          )}
        >
          <ScreenIcon size={18} color={iconColor} strokeWidth={2.2} />
        </View>
        <Text
          className={cn(
            'text-[15px] font-semibold tracking-tight',
            isDark ? 'text-slate-200' : 'text-slate-700'
          )}
        >
          {screen.label}
        </Text>
      </View>
      <ChevronRight size={14} color={isDark ? '#334155' : '#CBD5E1'} strokeWidth={3} />
    </Pressable>
  );
});

const ProjectScreenList = ({
  activeCategory,
  onScreenChange,
}) => {
  const categoryData = React.useMemo(() => SCREEN_MAP[activeCategory] || { screens: [] }, [activeCategory]);
  const screens = categoryData.screens;
  
  const categoryLabel = React.useMemo(() => 
    activeCategory === 'auth' ? 'Authentication' : 
    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
  , [activeCategory]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const categoryInfo = React.useMemo(() => CATEGORIES.find(c => c.id === activeCategory), [activeCategory]);
  const CategoryIcon = categoryInfo?.icon;
  const categoryIconName = categoryInfo?.iconName;

  const iconColor = isDark ? '#94A3B8' : '#64748B';

  const UsageComponent = USAGE_COMPONENTS[activeCategory];
  const hasUsage = categoryData.hasUsage;

  return (
    <View
      style={{ width: 290, borderTopLeftRadius: 24, overflow: 'hidden' }}
      className={cn(
        'h-full border-l border-t',
        isDark ? 'bg-background border-border' : 'bg-background border-border'
      )}
    >
      {/* Header */}
      <View className="px-6 pt-8 pb-4 flex-row items-center gap-3">
        {CategoryIcon && (
          <View className={cn(
            "w-10 h-10 rounded-xl items-center justify-center",
            isDark ? "bg-slate-800/50" : "bg-slate-100"
          )}>
            {categoryIconName ? (
              <CategoryIcon name={categoryIconName} size={20} color={isDark ? '#F1F5F9' : '#1E293B'} />
            ) : (
              <CategoryIcon size={20} color={isDark ? '#F1F5F9' : '#1E293B'} />
            )}
          </View>
        )}
        <Text 
          numberOfLines={1}
          className={cn("text-2xl font-bold tracking-tight flex-1", isDark ? "text-white" : "text-slate-900")}
        >
          {categoryLabel}
        </Text>
      </View>

      {/* Usage Section */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-0"
      >
        {hasUsage && UsageComponent && (
          <View className="mt-2 mb-3">
              <View className="px-6 flex-row items-center justify-between mb-2">
                <Text 
                  className={cn(
                    "text-[13px] font-semibold uppercase tracking-wider",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  Usage
                </Text>
                <Popover>
                  <PopoverTrigger asChild>
                    <Pressable 
                      hitSlop={15}
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        isDark ? "active:bg-slate-800" : "active:bg-slate-200"
                      )}
                    >
                      <Info size={14} color={isDark ? '#475569' : '#94A3B8'} />
                    </Pressable>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <Text className={cn("text-[12px] leading-5", isDark ? "text-slate-300" : "text-slate-600")}>
                      Metrics are not realtime. It may take a few hours to agregrate usage data.
                    </Text>
                  </PopoverContent>
                </Popover>
              </View>
              
              <View className=" rounded-xl border border-transparent overflow-hidden">
                <UsageComponent />
              </View>

              <View className={cn("mx-6 h-[1px] mt-6", isDark ? "bg-slate-800/50" : "bg-slate-200")} />
          </View>
        )}

      {/* Navigation List */}
      <View className="px-6 mt-2 mb-1">
        <Text 
          className={cn(
            "text-[13px] font-regular uppercase tracking-wider text-center",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          Screens
        </Text>
      </View>

        <View className="px-3">
          {screens.map((screen) => (
            <ScreenItem 
              key={screen.id} 
              screen={screen} 
              onScreenChange={onScreenChange} 
              isDark={isDark} 
              iconColor={iconColor} 
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProjectScreenList;