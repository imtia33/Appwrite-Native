import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
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
import TableList from "../../components/databases/TableList";
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

  const organizations = useOrganizationStore((state) => state.organizations);
  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization,
  );
  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization,
  );

  const databases = useDatabaseStore((state) => state.databases);
  const fetchDatabases = useDatabaseStore((state) => state.fetchDatabases);
  const tables = useDatabaseStore((state) => state.tables);
  const fetchTables = useDatabaseStore((state) => state.fetchTables);
  const loading = useDatabaseStore((state) => state.loading);
  const databaseProjectId = useDatabaseStore((state) => state.currentProjectId);

  const [activeDatabaseId, setActiveDatabaseId] = useState(initialDatabaseId);
  const [activeTableId, setActiveTableId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Animation values
  const sidebarX = React.useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Combined value for transformation
  const translateX = sidebarX;

  useEffect(() => {
    setActiveDatabaseId(null);
    setActiveTableId(null);
  }, [currentProject?.$id]);

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
    if (
      activeDatabaseId &&
      currentProject?.$id &&
      databaseProjectId === currentProject.$id &&
      databases.some((db) => db.$id === activeDatabaseId)
    ) {
      fetchTables(
        currentProject.$id,
        currentProject.region || "fra",
        activeDatabaseId,
      );
    }
  }, [activeDatabaseId, currentProject?.$id, databaseProjectId, databases]);

  const handleDeleteSuccess = useCallback(() => {
    setActiveTableId(null);
    closeTableScreens();
  }, [closeTableScreens]);

  const openTableScreens = useCallback(
    (tableId) => {
      setActiveTableId(tableId);
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
      setActiveTableId(null);
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
  const activeTables = useMemo(
    () => (activeDatabaseId ? tables[activeDatabaseId] || [] : []),
    [tables, activeDatabaseId],
  );
  const activeTable = useMemo(
    () => activeTables.find((t) => t.$id === activeTableId),
    [activeTables, activeTableId],
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

            {/* Level 2: Table List */}
            <TableList
              tables={activeTables}
              activeTableId={activeTableId}
              onTableChange={openTableScreens}
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
                  {activeTable?.name || "Table"}
                </Text>
              </View>

              <View className="flex-1">
                {activeTable && isReady ? (
                  <TablesRoot
                    databaseId={activeDatabaseId}
                    tableId={activeTableId}
                    onDelete={handleDeleteSuccess}
                  />
                ) : activeTable ? (
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
