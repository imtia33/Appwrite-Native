import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import useFunctionStore from "../../../appwrite/data-services/functionService";
import DataTable from "../../blocks/DataTable";
import { Badge } from "../../ui/badge";
import { Icon } from "../../ui/icon";
import {
  Copy,
  Plus,
  Clock,
  Code,
  AlertCircle,
  Boxes,
} from "lucide-react-native";
import {
  darkIcons,
  lightIcons,
  getIconFromRuntime,
} from "../../../constants/icons";
import { useTheme } from "../../../lib/theme-context";
import * as Clipboard from "expo-clipboard";
import CreateFunctions from "./modals/createFunctions";

const formatDate = (dateString, type = "full") => {
  const date = new Date(dateString);
  if (type === "time") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Functions = () => {
  const { theme, isDark } = useTheme();
  const icons = isDark ? darkIcons : lightIcons;
  const { currentProject } = useProjectStore();

  const {
    fetchFunctions,
    getFunctions,
    isLoading,
    getError,
    createFunction,
    deleteFunction,
  } = useFunctionStore();

  const functions = currentProject?.$id ? getFunctions(currentProject.$id) : [];
  const loading = isLoading();
  const error = getError();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchFunctions(currentProject.$id);
    }
  }, [currentProject?.$id, fetchFunctions]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
  };

  const handleCreateFunction = async (name, runtime, functionId, template) => {
    setIsProcessing(true);
    try {
      if (template) {
        await createFunctionFromTemplate(
          currentProject.$id,
          currentProject.region || "fra",
          template,
          name,
          runtime,
          functionId,
        );
      } else {
        await createFunction(
          currentProject.$id,
          currentProject.region || "fra",
          name,
          runtime,
          functionId,
        );
      }
      ToastAndroid.show("Function created successfully", ToastAndroid.SHORT);
      setCreateModalOpen(false);
    } catch (err) {
      ToastAndroid.show(
        err.message || "Failed to create function",
        ToastAndroid.LONG,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      for (const id of selectedIds) {
        await deleteFunction(
          currentProject.$id,
          currentProject.region || "fra",
          id,
        );
      }
      ToastAndroid.show(
        `${selectedIds.length} function(s) deleted`,
        ToastAndroid.SHORT,
      );
    } catch (err) {
      console.error("Error deleting functions:", err);
      ToastAndroid.show("Error deleting functions", ToastAndroid.SHORT);
    }
  };

  const columns = [
    {
      id: "select",
      width: 50,
    },
    {
      id: "$id",
      header: "Function ID",
      accessorKey: "$id",
      width: 210,
      cell: ({ row }) => (
        <TouchableOpacity
          onPress={() => copyToClipboard(row.original.$id)}
          className="flex-row items-center bg-input px-2 py-1 rounded-lg"
        >
          <Icon as={Copy} size={12} color="gray" />
          <Text
            className="text-xs font-mono text-muted-foreground ml-2"
            numberOfLines={1}
          >
            {row.original.$id}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      width: 280,
      cell: ({ row }) => {
        const iconName = getIconFromRuntime(row.original.runtime);
        const iconAsset = iconName ? icons[iconName] : null;
        const RuntimeIcon = iconAsset?.default || iconAsset;

        return (
          <View className="flex-row items-center py-1">
            <View className="w-9 h-9 rounded-full bg-muted items-center justify-center mr-3 border border-border overflow-hidden">
              {typeof RuntimeIcon === "function" ? (
                <RuntimeIcon width={18} height={18} />
              ) : (
                <Icon as={Boxes} size={16} color="gray" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground font-medium text-sm"
                numberOfLines={1}
              >
                {row.original.name || "Unnamed Function"}
              </Text>
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {row.original.runtime}
              </Text>
            </View>
          </View>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      width: 120,
      cell: ({ row }) => (
        <Badge
          variant={row.original.enabled ? "success" : "secondary"}
          className="h-6"
        >
          <Text className="text-[10px] uppercase text-white">
            {row.original.enabled ? "Enabled" : "Disabled"}
          </Text>
        </Badge>
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      width: 150,
      cell: ({ row }) => {
        if (!row.original.schedule) {
          return <Text className="text-muted-foreground text-xs">-</Text>;
        }
        return (
          <View className="flex-row items-center gap-1">
            <Icon as={Clock} size={12} color="#3b82f6" />
            <Text className="text-foreground text-xs" numberOfLines={1}>
              Scheduled
            </Text>
          </View>
        );
      },
    },
    {
      id: "$createdAt",
      header: "Created",
      accessorKey: "$createdAt",
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">
            {formatDate(row.original.$createdAt)}
          </Text>
          <Text className="text-muted-foreground text-[10px]">
            {formatDate(row.original.$createdAt, "time")}
          </Text>
        </View>
      ),
    },
    {
      id: "$updatedAt",
      header: "Updated",
      accessorKey: "$updatedAt",
      width: 150,
      cell: ({ row }) => (
        <View>
          <Text className="text-foreground text-xs">
            {formatDate(row.original.$updatedAt)}
          </Text>
          <Text className="text-muted-foreground text-[10px]">
            {formatDate(row.original.$updatedAt, "time")}
          </Text>
        </View>
      ),
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#ef4444" size="large" />
        <Text className="text-foreground mt-4">Loading functions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">Functions</Text>
          <Text className="text-muted-foreground text-sm">
            Deploy and scale serverless functions
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setCreateModalOpen(true)}
          className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
        >
          <Icon as={Plus} size={18} color="white" />
          <Text className="text-white font-semibold ml-2">Create function</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <Text className="text-destructive font-medium">
            Error loading functions
          </Text>
          <Text className="text-destructive/80 text-sm mt-1">{error}</Text>
          <TouchableOpacity
            onPress={() =>
              currentProject?.$id && fetchFunctions(currentProject.$id)
            }
            className="mt-4 bg-destructive px-4 py-2 rounded self-start"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !currentProject ? (
        <View className="flex-1 items-center justify-center p-8">
          <Icon as={AlertCircle} size={48} color="#9ca3af" />
          <Text className="text-muted-foreground text-center mt-4">
            No project selected
          </Text>
        </View>
      ) : functions.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 bg-card rounded-lg border border-border">
          <Icon as={Code} size={64} color="#9ca3af" />
          <Text className="text-foreground text-xl font-bold mt-4">
            No functions yet
          </Text>
          <Text className="text-muted-foreground text-center mt-2 mb-6">
            Create your first serverless function to get started
          </Text>
          <TouchableOpacity
            onPress={() => setCreateModalOpen(true)}
            className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
          >
            <Icon as={Plus} size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Create your first function
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <DataTable
          data={functions}
          columns={columns}
          showSearch={true}
          showColumnSelector={true}
          searchPlaceholder="Search by name or ID..."
          filterKey="name"
          onRowPress={(func) =>
            router.push({ pathname: "/functions", params: { ...func } })
          }
          onDeleteSelected={handleDeleteSelected}
        />
      )}

      <CreateFunctions
        visible={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateFunction}
      />
    </View>
  );
};

export default Functions;
