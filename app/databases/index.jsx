import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Easing,
  InteractionManager,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../lib/theme-context";
import { useProjectStore } from "../../appwrite/store/projectStore";
import useDatabaseStore from "../../appwrite/data-services/databaseService";
import DatabaseSidebar from "../../components/databases/DatabaseSidebar";
import CollectionList from "../../components/databases/CollectionList";
import TablesRoot from "../../components/TablesScreens/root";
import { StatusBar } from "expo-status-bar";
import { OrganizationPicker } from "../../components/Organization/OrgPicker";
import { ProjectPicker } from "../../components/Project/ProjectPicker";
import { UserMenu } from "../../components/blocks/userMenu";
import { useOrganizationStore } from "../../appwrite/store/organizationStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DatabaseLayout = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { databaseId: initialDatabaseId } = useLocalSearchParams();

  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const organizations = useOrganizationStore((state) => state.organizations);
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization,
  );
  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization,
  );

  const databases = useDatabaseStore((state) => state.databases);
  const fetchDatabases = useDatabaseStore((state) => state.fetchDatabases);
  const collections = useDatabaseStore((state) => state.collections);
  const fetchCollections = useDatabaseStore((state) => state.fetchCollections);
  const loading = useDatabaseStore((state) => state.loading);

  const [activeDatabaseId, setActiveDatabaseId] = useState(initialDatabaseId);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Animation values
  const sidebarX = React.useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Combined value for transformation
  const translateX = sidebarX;

  useEffect(() => {
    if (!activeDatabaseId && databases.length > 0) {
      setActiveDatabaseId(databases[0].$id);
    }
  }, [databases, activeDatabaseId]);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchDatabases(currentProject.$id);
    }
  }, [currentProject?.$id]);

  useEffect(() => {
    if (activeDatabaseId && currentProject?.$id) {
      fetchCollections(
        currentProject.$id,
        currentProject.region || "fra",
        activeDatabaseId,
      );
    }
  }, [activeDatabaseId, currentProject?.$id]);

  const openTableScreens = useCallback(
    (collectionId) => {
      setActiveCollectionId(collectionId);
      setIsReady(false);
      Animated.timing(sidebarX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarOpen(true);
        InteractionManager.runAfterInteractions(() => {
          setIsReady(true);
        });
      });
    },
    [sidebarX],
  );

  const closeTableScreens = useCallback(() => {
    Animated.timing(sidebarX, {
      toValue: SCREEN_WIDTH,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarOpen(false);
    });
  }, [sidebarX, SCREEN_WIDTH]);

  const handleDatabaseChange = useCallback(
    (dbId) => {
      setActiveDatabaseId(dbId);
      setActiveCollectionId(null);
      if (isSidebarOpen) {
        closeTableScreens();
      }
    },
    [isSidebarOpen, closeTableScreens],
  );

  const activeDatabase = useMemo(
    () => databases.find((db) => db.$id === activeDatabaseId),
    [databases, activeDatabaseId],
  );
  const activeCollections = useMemo(
    () => (activeDatabaseId ? collections[activeDatabaseId] || [] : []),
    [collections, activeDatabaseId],
  );
  const activeCollection = useMemo(
    () => activeCollections.find((c) => c.$id === activeCollectionId),
    [activeCollections, activeCollectionId],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "#19191D" : "#EDEDF0",
      }}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View className="flex-1 flex-row relative overflow-hidden">
        <View>
          <View className="flex-row justify-between items-center px-4 h-12 bg-background">
            <View className="flex-row items-center gap-1">
              <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <ChevronLeft
                  size={20}
                  color={theme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </TouchableOpacity>
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
          <Animated.View style={{ flex: 1, flexDirection: "row" }}>
            {/* Level 1: Database Sidebar */}
            <DatabaseSidebar
              databases={databases}
              activeDatabaseId={activeDatabaseId}
              onDatabaseChange={handleDatabaseChange}
            />

            {/* Level 2: Collection List */}
            <CollectionList
              collections={activeCollections}
              activeCollectionId={activeCollectionId}
              onCollectionChange={openTableScreens}
              databaseName={activeDatabase?.name}
              databaseId={activeDatabaseId}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: SCREEN_WIDTH,
              backgroundColor: theme === "dark" ? "#19191D" : "#FFFFFF",
              transform: [{ translateX: translateX }],
              zIndex: 100,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }}
          >
            <View className="flex-1">
              <View className="flex-row items-center px-4 h-12 border-b border-t border-border">
                <TouchableOpacity
                  onPress={closeTableScreens}
                  className="mr-4 p-2 rounded-full active:bg-secondary/50"
                >
                  <ChevronLeft
                    size={24}
                    color={theme === "dark" ? "#FFFFFF" : "#000000"}
                  />
                </TouchableOpacity>
                <Text className="text-foreground text-xl font-regular">
                  {activeCollection?.name || "Collection"}
                </Text>
              </View>

              <View className="flex-1">
                {activeCollection && isReady ? (
                  <TablesRoot
                    databaseId={activeDatabaseId}
                    collectionId={activeCollectionId}
                  />
                ) : activeCollection ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-muted-foreground mt-2">
                      Loading...
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default DatabaseLayout;
