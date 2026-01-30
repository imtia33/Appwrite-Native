import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { Table, ChevronRight, Info, DatabaseIcon } from 'lucide-react-native';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const CollectionItem = React.memo(({ collection, onCollectionChange, isDark }) => {
  return (
    <Pressable
      onPress={() => onCollectionChange(collection.$id)}
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
          <Table size={18} color={isDark ? '#94A3B8' : '#64748B'} strokeWidth={2.2} />
        </View>
        <Text
          className={cn(
            'text-[15px] font-semibold tracking-tight',
            isDark ? 'text-slate-200' : 'text-slate-700'
          )}
        >
          {collection.name}
        </Text>
      </View>
      <ChevronRight size={14} color={isDark ? '#334155' : '#CBD5E1'} strokeWidth={3} />
    </Pressable>
  );
});

const CollectionList = React.memo(({
  collections,
  activeCollectionId,
  onCollectionChange,
  databaseName
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        <View className={cn(
          "w-10 h-10 rounded-xl items-center justify-center",
          isDark ? "bg-slate-800/50" : "bg-slate-100"
        )}>
          <DatabaseIcon size={20} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </View>
        <Text 
          numberOfLines={1}
          className={cn("text-2xl font-bold tracking-tight flex-1", isDark ? "text-white" : "text-slate-900")}
        >
          {databaseName || 'Collections'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-0"
      >
        <View className="px-6 mt-4 mb-2">
            <Text 
            className={cn(
                "text-[13px] font-regular uppercase tracking-wider text-center",
                isDark ? "text-slate-400" : "text-slate-500"
            )}
            >
            Collections
            </Text>
        </View>

        <View className="px-3">
          {collections.map((collection) => (
            <CollectionItem 
              key={collection.$id} 
              collection={collection} 
              onCollectionChange={onCollectionChange} 
              isDark={isDark} 
            />
          ))}
          {collections.length === 0 && (
              <Text className="text-center text-muted-foreground mt-10">No collections found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

export default CollectionList;
