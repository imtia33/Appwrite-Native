import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { Card } from "../../ui/card";
import { Icon } from "../../ui/icon";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { Copy, Settings as SettingsIcon, Eye } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "../../ui/button";
import { sdk } from "../../../appwrite/appwrite";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import useDatabaseStore from "../../../appwrite/data-services/databaseService";

const GeneralInfo = ({ databaseId, tableId }) => {
  const { currentProject } = useProjectStore();
  const { tables, fetchTables } = useDatabaseStore();

  // Get table from store
  const table = tables[databaseId]?.find((t) => t.$id === tableId);

  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (table) {
      setName(table.name || "");
      setEnabled(table.enabled !== false);
      setIsLoading(false);
    }
  }, [table]);

  // Detect changes
  useEffect(() => {
    if (table) {
      const nameChanged = name !== (table.name || "");
      const enabledChanged = enabled !== (table.enabled !== false);
      setHasChanges(nameChanged || enabledChanged);
    }
  }, [name, enabled, table]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  const handleUpdate = async () => {
    if (!currentProject || !table) return;

    setIsSaving(true);
    try {
      const projectSdk = sdk.forProject(
        currentProject.region || "fra",
        currentProject.$id,
      );

      await projectSdk.tablesDB.updateTable({
        databaseId,
        tableId,
        name,
        permissions: table.$permissions || [],
        documentSecurity: table.documentSecurity || false,
        enabled,
      });

      // Refresh tables in store
      await fetchTables(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        true,
      );
      ToastAndroid.show(
        "General settings updated successfully.",
        ToastAndroid.SHORT,
      );
    } catch (err) {
      console.error("Error updating general info:", err);
      ToastAndroid.show(
        err.message || "Failed to update general settings",
        ToastAndroid.SHORT,
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <Text className="text-muted-foreground">Loading...</Text>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4 gap-4">
      <View>
        <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">
          Name
        </Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Table Name"
          className="bg-muted/10"
        />
      </View>
      <View className="flex-row items-center gap-3 ">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <Text className="text-lg font-bold text-foreground">
          {" "}
          {enabled ? "Enabled" : "Disabled"}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">
        Disabling this lets others from using this table
      </Text>

      {isSaving ? (
        <View className="w-full h-12 mb-4 items-center justify-center bg-muted/10 rounded-xl">
          <ActivityIndicator color="#FD366E" />
        </View>
      ) : (
        <Button
          className="bg-primary w-full h-12 mb-4"
          onPress={handleUpdate}
          disabled={!hasChanges}
        >
          <Text className="text-white font-bold">Update</Text>
        </Button>
      )}
    </Card>
  );
};

export default GeneralInfo;
