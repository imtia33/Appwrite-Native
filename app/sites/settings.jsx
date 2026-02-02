import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useProjectStore } from "@/appwrite/store/projectStore";
import { sdk } from "@/appwrite/appwrite";
import { useTheme } from "@/lib/theme-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Save,
  Trash2,
  Github,
  Terminal,
  Settings2,
  Shield,
  Clock,
  BarChart3,
  ListTree,
  Code,
  Plus,
  Info,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [rootDirectory, setRootDirectory] = useState("");
  const [variables, setVariables] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [loggingEnabled, setLoggingEnabled] = useState(true);

  const fetchSite = async () => {
    try {
      if (!siteId || !currentProject) return;
      const projectSdk = sdk.forProject(
        currentProject.region,
        currentProject.$id,
      );

      const [siteData, varsData, frameworksData] = await Promise.all([
        projectSdk.sites.get({ siteId }),
        projectSdk.sites.listVariables({ siteId }),
        projectSdk.sites.listFrameworks(),
      ]);

      setSite(siteData);
      setName(siteData.name);
      setBuildCommand(siteData.buildCommand || "");
      setOutputDirectory(siteData.outputDirectory || "");
      setRootDirectory(siteData.rootDirectory || "");
      setLoggingEnabled(siteData.logging !== false);

      setVariables(varsData.variables);
      setFrameworks(frameworksData.frameworks);
    } catch (error) {
      console.error("Failed to fetch site data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSite();
  }, [siteId, currentProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSite();
  };

  const handleUpdateName = async () => {
    setUpdating(true);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({ siteId, name });
      Alert.alert("Success", "Site name updated");
      fetchSite();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBuildSettings = async () => {
    setUpdating(true);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({
          siteId,
          buildCommand,
          outputDirectory,
          rootDirectory,
        });
      Alert.alert("Success", "Build settings updated");
      fetchSite();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddVariable = async () => {
    if (!newVarKey || !newVarValue) return;
    setUpdating(true);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.createVariable({
          siteId,
          key: newVarKey,
          value: newVarValue,
        });
      setNewVarKey("");
      setNewVarValue("");
      fetchSite();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVariable = async (varId) => {
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.deleteVariable({ siteId, variableId: varId });
      fetchSite();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleToggleLogging = async (enabled) => {
    setLoggingEnabled(enabled);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({ siteId, logging: enabled });
    } catch (error) {
      setLoggingEnabled(!enabled);
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Site",
      "Are you sure you want to delete this site? All associated data and deployments will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await sdk
                .forProject(currentProject.region, currentProject.$id)
                .sites.delete({ siteId });
              // Navigate back to sites list
              Alert.alert("Success", "Site deleted");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 gap-6 pb-10">
        {/* Name Card */}
        <Card>
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>Update your site name</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Site name"
            />
            <Button
              disabled={updating || name === site?.name}
              onPress={handleUpdateName}
            >
              <Text className="text-white">Update</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Repository Card */}
        <Card>
          <CardHeader>
            <CardTitle>Repository</CardTitle>
            <CardDescription>Connected source control</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center gap-3">
              <Icon as={Github} size={24} color="gray" />
              <View>
                <Text className="font-medium">
                  {site?.providerRepositoryName || "No repository connected"}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {site?.providerBranch || "main"}
                </Text>
              </View>
            </View>
            <Button
              variant="outline"
              className="mt-2"
              disabled={!site?.providerRepositoryName}
            >
              <Text>Disconnect</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Build Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Build Settings</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium">Build Command</Text>
              <Input
                value={buildCommand}
                onChangeText={setBuildCommand}
                placeholder="npm run build"
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium">Output Directory</Text>
              <Input
                value={outputDirectory}
                onChangeText={setOutputDirectory}
                placeholder="dist"
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium">Root Directory</Text>
              <Input
                value={rootDirectory}
                onChangeText={setRootDirectory}
                placeholder="./"
              />
            </View>
            <Button
              variant="secondary"
              onPress={handleUpdateBuildSettings}
              disabled={updating}
            >
              <Text>Save Build Settings</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Runtime Card */}
        <Card>
          <CardHeader>
            <CardTitle>Runtime Settings</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium">Framework</Text>
              <Text className="capitalize">{site?.framework || "Static"}</Text>
            </View>
            <Separator />
            <View className="flex-row justify-between items-center">
              <Text className="font-medium">Runtime</Text>
              <Text>Node.js 20.x</Text>
            </View>
          </CardContent>
        </Card>

        {/* Environment Variables Card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <View>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Configure build-time variables</CardDescription>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {variables.map((v) => (
              <View
                key={v.$id}
                className="flex-row items-center justify-between bg-muted/50 p-2 rounded"
              >
                <View>
                  <Text className="font-mono text-xs">{v.key}</Text>
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    ••••••••
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => handleDeleteVariable(v.$id)}
                >
                  <Icon as={Trash2} size={14} color="red" />
                </Button>
              </View>
            ))}

            <View className="gap-2 mt-2">
              <Text className="text-xs font-bold">Add Variable</Text>
              <Input
                value={newVarKey}
                onChangeText={setNewVarKey}
                placeholder="KEY"
              />
              <Input
                value={newVarValue}
                onChangeText={setNewVarValue}
                placeholder="VALUE"
                secureTextEntry
              />
              <Button
                variant="outline"
                onPress={handleAddVariable}
                disabled={updating || !newVarKey || !newVarValue}
              >
                <Text>Add</Text>
              </Button>
            </View>

            {variables.length === 0 && !updating && (
              <Text className="text-sm text-muted-foreground italic">
                No variables configured
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Limits</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Icon as={BarChart3} size={16} color="gray" />
                <Text>Memory Limit</Text>
              </View>
              <Text className="font-medium">512 MB</Text>
            </View>
            <Separator />
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Icon as={Clock} size={16} color="gray" />
                <Text>Execution Timeout</Text>
              </View>
              <Text className="font-medium">30 seconds</Text>
            </View>
          </CardContent>
        </Card>

        {/* Logging Card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <View>
              <CardTitle>Logging</CardTitle>
              <CardDescription>Enable or disable detailed logs</CardDescription>
            </View>
            <Switch
              onValueChange={handleToggleLogging}
              value={loggingEnabled}
            />
          </CardHeader>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for this site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="flex-row items-center gap-2"
              onPress={handleDelete}
            >
              <Icon as={Trash2} size={18} color="white" />
              <Text className="text-white font-medium">Delete Site</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Settings;
