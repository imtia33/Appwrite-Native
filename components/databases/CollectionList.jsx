import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../lib/theme-context";
import { cn } from "../../lib/utils";
import { Table, ChevronRight, DatabaseIcon, Plus } from "lucide-react-native";
import CreateCollectionModal from "./CreateCollectionModal";
import { useProjectStore } from "../../appwrite/store/projectStore";
import useDatabaseStore from "../../appwrite/data-services/databaseService";
import { Button } from "../ui/button";

const CollectionItem = React.memo(
  ({ collection, onCollectionChange, isDark, activeCollectionId }) => {

    return (
      <Pressable
        onPress={() => onCollectionChange(collection.$id)}
        className="flex-row items-center justify-between px-4 py-2.5 rounded-xl transition-all"
          
      >
        <View className="flex-row items-center gap-3.5">
          <View
            className=
              "p-2 rounded-lg"
          >
            <Table
              size={18}
              color='gray'
              strokeWidth={2.2}
            />
          </View>
          <Text
            className="text-[15px] font-semibold tracking-tight text-muted-foreground"
             
          >
            {collection.name}
          </Text>
        </View>
        <ChevronRight
          size={14}
          color={isDark ? "#334155" : "#CBD5E1"}
          strokeWidth={3}
        />
      </Pressable>
    );
  },
);

const CollectionList = React.memo(
  ({
    collections,
    activeCollectionId,
    onCollectionChange,
    databaseName,
    databaseId,
  }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentProject = useProjectStore((state) => state.currentProject);
    const createCollection = useDatabaseStore(
      (state) => state.createCollection,
    );

    const handleCreateCollection = async (name, id) => {
      if (!currentProject || !databaseId) return;
      await createCollection(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        name,
        id,
      );
    };

    return (
      <View
        style={{ width: 290, borderTopLeftRadius: 14, overflow: "hidden" }}
        className={cn(
          "h-full border-l border-t",
          isDark
            ? "bg-background border-border"
            : "bg-background border-border",
        )}
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-4 flex-row items-center gap-3">
          <View
            className={cn(
              "w-10 h-10 rounded-xl items-center justify-center",
              isDark ? "bg-slate-800/50" : "bg-slate-100",
            )}
          >
            <DatabaseIcon size={20} color={isDark ? "#F1F5F9" : "#1E293B"} />
          </View>
          <Text
            numberOfLines={1}
            className={cn(
              "text-2xl font-bold tracking-tight flex-1",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {databaseName || "Collections"}
          </Text>
          
        </View>
         

        <CreateCollectionModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onCreate={handleCreateCollection}
          databaseId={databaseId}
        />

        <ScrollView showsVerticalScrollIndicator={false} className="px-0">
          <View className="px-6 mt-4 mb-2">
            <Text
              className={cn(
                "text-[13px] font-regular uppercase tracking-wider text-center",
                isDark ? "text-slate-400" : "text-slate-500",
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
                activeCollectionId={activeCollectionId}
              />
            ))}
            {collections.length === 0 && (
              <Text className="text-center text-muted-foreground mt-10">
                No collections found
              </Text>
            )}
            <Button
         variant="secondary"
            onPress={() => setIsModalOpen(true)}
            className="rounded-sm items-center justify-center self-start ml-3 mt-3 flex-row gap-2 w-60"
          >
            <Plus size={18} color={isDark ? "#F1F5F9" : "#1E293B"} />
            <Text className="text-muted-foreground">Create Table</Text>
           
          </Button>
          <View className="mb-7 h-20"/>
          </View>
        </ScrollView>
      </View>
    );
  },
);

export default CollectionList;
