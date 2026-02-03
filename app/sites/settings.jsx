import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
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
  Clock,
  BarChart3,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { timeAgo } from "@/lib/helpers/time";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const adapterDataList = [
  {
    framework: "nextjs",
    ssr: {
      desc: "Set output: 'standalone' in next.config.js file.",
    },
    static: {
      desc: "Set output: 'export' in next.config.js file.",
    },
  },
  {
    framework: "sveltekit",
    ssr: {
      desc: "Use @sveltejs/adapter-node in svelte.config.js file.",
    },
    static: {
      desc: "Use @sveltejs/adapter-static in svelte.config.js file.",
    },
  },
  {
    framework: "nuxt",
    ssr: {
      desc: "Set build command to npm run build in site settings.",
    },
    static: {
      desc: "Set build command to npm run generate in site settings.",
    },
  },
];

const Settings = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [site, setSite] = useState(null);
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [rootDirectory, setRootDirectory] = useState("");
  const [adapter, setAdapter] = useState("");
  const [framework, setFramework] = useState("");
  const [variables, setVariables] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [silentMode, setSilentMode] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("");
  const [specification, setSpecification] = useState("");
  const [specifications, setSpecifications] = useState([]);

  const fetchSite = async () => {
    try {
      if (!siteId || !currentProject) return;
      const projectSdk = sdk.forProject(
        currentProject.region,
        currentProject.$id,
      );

      const [siteData, varsData, frameworksData, specsData] = await Promise.all(
        [
          projectSdk.sites.get({ siteId }),
          projectSdk.sites.listVariables({ siteId }),
          projectSdk.sites.listFrameworks(),
          projectSdk.sites.listSpecifications(),
        ],
      );

      setSite(siteData);
      setName(siteData.name);
      setInstallCommand(siteData.installCommand || "");
      setBuildCommand(siteData.buildCommand || "");
      setOutputDirectory(siteData.outputDirectory || "");
      setRootDirectory(siteData.rootDirectory || "");
      setAdapter(siteData.adapter || "");
      setFramework(siteData.framework || "");
      setLoggingEnabled(siteData.logging !== false);
      setSilentMode(siteData.providerSilentMode || false);

      setVariables(varsData.variables);
      setFrameworks(frameworksData.frameworks);
      setSpecifications(specsData.specifications || []);
      setSpecification(siteData.specification || "");

      // Fetch repository info if connected
      if (siteData.installationId && siteData.providerRepositoryId) {
        try {
          const repo = await projectSdk.vcs.getRepository({
            installationId: siteData.installationId,
            providerRepositoryId: siteData.providerRepositoryId,
          });
          setRepository(repo);
        } catch (err) {
          console.warn("Failed to fetch repository info", err);
        }
      }
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
          installCommand,
          adapter,
          framework,
          providerSilentMode: silentMode,
        });
      Alert.alert("Success", "Build settings updated");
      fetchSite();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateResourceLimits = async () => {
    setUpdating(true);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({ siteId, specification });
      Alert.alert("Success", "Resource limits updated");
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

  const handleToggleSilentMode = async (enabled) => {
    setSilentMode(enabled);
    setUpdating(true);
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({ siteId, providerSilentMode: enabled });
    } catch (error) {
      setSilentMode(!enabled);
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
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

  const selectedFrameworkObj = frameworks.find((f) => f.key === framework);
  const currentAdapterObj =
    selectedFrameworkObj?.adapters?.find((a) => a.key === adapter) ||
    selectedFrameworkObj?.adapters?.[0];

  const handleFrameworkChange = (fKey) => {
    const newFramework = frameworks.find((f) => f.key === fKey);
    setFramework(fKey);
    if (newFramework && newFramework.adapters.length > 0) {
      const defaultAdapter = newFramework.adapters[0];
      setAdapter(defaultAdapter.key);
      setInstallCommand(defaultAdapter.installCommand);
      setBuildCommand(defaultAdapter.buildCommand);
      setOutputDirectory(defaultAdapter.outputDirectory);
    }
  };

  const handleAdapterChange = (aKey) => {
    setAdapter(aKey);
    const newAdapter = selectedFrameworkObj?.adapters?.find(
      (a) => a.key === aKey,
    );
    if (newAdapter) {
      setInstallCommand(newAdapter.installCommand);
      setBuildCommand(newAdapter.buildCommand);
      setOutputDirectory(newAdapter.outputDirectory);
    }
  };

  const resetCommand = (type) => {
    if (!currentAdapterObj) return;
    if (type === "install") setInstallCommand(currentAdapterObj.installCommand);
    if (type === "build") setBuildCommand(currentAdapterObj.buildCommand);
    if (type === "output")
      setOutputDirectory(currentAdapterObj.outputDirectory);
  };

  const isGitRepoChanged =
    rootDirectory !== (site?.providerRootDirectory || "") ||
    silentMode !== (site?.providerSilentMode || false);

  const isBuildSettingsChanged =
    framework !== (site?.framework || "") ||
    adapter !== (site?.adapter || "") ||
    installCommand !== (site?.installCommand || "") ||
    buildCommand !== (site?.buildCommand || "") ||
    outputDirectory !== (site?.outputDirectory || "");

  const isResourceLimitsChanged = specification !== (site?.specification || "");

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
        <Card className="py-6">
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

        {/* Git Repository Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Git repository</CardTitle>
            <CardDescription>
              Automatically deploy changes for every commit pushed to your Git
              repository.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            {/* Repository Info Box */}
            <View className="flex-row items-center justify-between bg-muted p-4 rounded-xl border border-border">
              <View className="flex-row items-center gap-3">
                <View className="bg-background p-2 rounded-lg border border-border">
                  <Icon as={Github} size={20} color="gray" />
                </View>
                <View>
                  <Text className="font-semibold text-sm">
                    {repository?.name ||
                      site?.providerRepositoryName ||
                      "No repository"}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground capitalize">
                    Last updated:{" "}
                    {site?.latestDeploymentCreatedAt || site?.$updatedAt
                      ? timeAgo(
                          site.latestDeploymentCreatedAt || site.$updatedAt,
                        )
                      : "never"}
                  </Text>
                </View>
              </View>
            </View>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-3 ml-2"
              disabled={!site?.providerRepositoryName}
            >
              <Text className="text-xs font-semibold">Disconnect</Text>
            </Button>

            {/* Branch Section */}
            <View className="gap-2">
              <Text className="text-xs text-muted-foreground font-medium ml-1">
                Branch
              </Text>
              <View className="gap-1.5 p-4 rounded-xl border border-border bg-muted">
                <Text className="text-sm font-semibold">Production branch</Text>
                <View className="flex-row items-center justify-between bg-background p-3 rounded-lg border border-border">
                  <Text className="text-sm">
                    {site?.providerBranch || "main"}
                  </Text>
                  <Icon as={ChevronDown} size={16} color="gray" />
                </View>
              </View>
            </View>

            {/* Root Directory Section */}
            <View className="gap-2">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-semibold">Root directory</Text>
                <Text className="text-xs text-muted-foreground">optional</Text>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    value={rootDirectory}
                    onChangeText={setRootDirectory}
                    placeholder="./"
                    className="h-10"
                  />
                </View>
                <Button variant="secondary" size="sm" className="h-10 px-4">
                  <Text className="text-sm font-semibold">Select</Text>
                </Button>
              </View>
            </View>

            {/* Silent Mode Section */}
            <View className="flex-row items-start gap-3 pt-2">
              <Switch
                value={silentMode}
                onValueChange={handleToggleSilentMode}
                disabled={updating}
              />
              <View className="flex-1 gap-1">
                <Text className="text-sm font-semibold">Silent mode</Text>
                <Text className="text-xs text-muted-foreground leading-4">
                  If selected, comments will not be created when pushing changes
                  to this repository.
                </Text>
              </View>
            </View>
          </CardContent>
          <Separator className="bg-border/50" />
          <View className="p-4 flex-row justify-end bg-muted/5">
            <Button
              className="px-6 h-10"
              onPress={handleUpdateBuildSettings}
              disabled={updating || !isGitRepoChanged}
            >
              <Text
                className={`font-semibold ${updating || !isGitRepoChanged ? "text-muted-foreground" : "text-white"}`}
              >
                Update
              </Text>
            </Button>
          </View>
        </Card>

        {/* Build Settings Card */}
        <Card className="border-border bg-card py-6">
          <CardHeader>
            <CardTitle>Build settings</CardTitle>
            <CardDescription>
              Default build settings are configured based on your framework,
              ensuring optimal performance. Adjust the settings here if needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            {/* Framework Selector */}
            <View className="gap-2">
              <Text className="text-sm font-semibold">Framework</Text>
              <Accordion
                type="single"
                collapsible
                value={activeAccordion}
                onValueChange={setActiveAccordion}
                className="w-full"
              >
                <AccordionItem
                  value="framework-picker"
                  className="border rounded-lg px-3 border-border bg-muted"
                >
                  <AccordionTrigger className="py-2.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-medium">
                        {selectedFrameworkObj?.name || "Select framework"}
                      </Text>
                    </View>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <View className="max-h-60">
                      <ScrollView
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                      >
                        <View className="gap-1 mt-1">
                          {frameworks.map((f) => (
                            <TouchableOpacity
                              key={f.key}
                              onPress={() => {
                                handleFrameworkChange(f.key);
                                setActiveAccordion("");
                              }}
                              className={`flex-row items-center justify-between p-3 rounded-md ${framework === f.key ? "bg-accent/50" : "active:bg-muted"}`}
                            >
                              <Text className="text-sm font-medium">
                                {f.name}
                              </Text>
                              {framework === f.key && (
                                <Icon as={Check} size={16} color="#FD366E" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </View>

            {/* SSR / Static Options (Conditional) */}
            {selectedFrameworkObj?.adapters?.length >= 2 && (
              <View className="flex-row gap-3">
                {selectedFrameworkObj.adapters.map((adp) => {
                  const adpData = adapterDataList.find(
                    (d) => d.framework === framework,
                  )?.[adp.key];
                  const isActive = adapter === adp.key;
                  return (
                    <Button
                      key={adp.key}
                      variant={isActive ? "default" : "secondary"}
                      className={`flex-1 flex-col items-start p-4 h-auto border ${
                        isActive ? "border-primary" : "border-border"
                      }`}
                      onPress={() => handleAdapterChange(adp.key)}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          className={`w-4 h-4 rounded-full border items-center justify-center ${
                            isActive
                              ? "border-white bg-white"
                              : "border-gray-500"
                          }`}
                        >
                          {isActive && (
                            <View className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </View>
                        <Text
                          className={`font-bold text-xs ${
                            isActive ? "text-white" : ""
                          }`}
                        >
                          {adp.key === "ssr"
                            ? "Server side rendering"
                            : "Static site"}
                        </Text>
                      </View>
                      <Text
                        className={`text-[9px] leading-4 ${
                          isActive ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {adpData?.desc ||
                          (adp.key === "ssr"
                            ? "Dynamic apps with server logic."
                            : "High performance static sites.")}
                      </Text>
                    </Button>
                  );
                })}
              </View>
            )}

            {/* Detailed Settings */}
            <View className="gap-4 pb-4">
              <Text className="text-xs text-muted-foreground font-medium">
                Settings
              </Text>

              <View className="gap-2">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-semibold">Install command</Text>
                  <Text className="text-xs text-muted-foreground">
                    optional
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input
                      value={installCommand}
                      onChangeText={setInstallCommand}
                      placeholder="npm install"
                    />
                  </View>
                  <Button
                    variant="secondary"
                    className="h-10 px-4"
                    onPress={() => resetCommand("install")}
                    disabled={
                      installCommand === currentAdapterObj?.installCommand
                    }
                  >
                    <Text className="font-semibold text-sm">Reset</Text>
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-semibold">Build command</Text>
                  <Text className="text-xs text-muted-foreground">
                    optional
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input
                      value={buildCommand}
                      onChangeText={setBuildCommand}
                      placeholder="npm run build"
                    />
                  </View>
                  <Button
                    variant="secondary"
                    className="h-10 px-4"
                    onPress={() => resetCommand("build")}
                    disabled={buildCommand === currentAdapterObj?.buildCommand}
                  >
                    <Text className="font-semibold text-sm">Reset</Text>
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-semibold">
                    Output directory
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    optional
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input
                      value={outputDirectory}
                      onChangeText={setOutputDirectory}
                      placeholder="./"
                    />
                  </View>
                  <Button
                    variant="secondary"
                    className="h-10 px-4"
                    onPress={() => resetCommand("output")}
                    disabled={
                      outputDirectory === currentAdapterObj?.outputDirectory
                    }
                  >
                    <Text className="font-semibold text-sm">Reset</Text>
                  </Button>
                </View>
              </View>
            </View>
          </CardContent>
          <Separator className="bg-border/50" />
          <View className="p-4 flex-row justify-end bg-muted/5">
            <Button
              className="px-6 h-10"
              onPress={handleUpdateBuildSettings}
              disabled={updating || !isBuildSettingsChanged}
            >
              <Text
                className={`font-semibold ${updating || !isBuildSettingsChanged ? "text-muted-foreground" : "text-white"}`}
              >
                Update
              </Text>
            </Button>
          </View>
        </Card>

        {/* Resource Limits Card */}
        <Card className="border-border bg-card py-6">
          <CardHeader>
            <CardTitle>Resource limits</CardTitle>
            <CardDescription>
              Define your sites's compute specifications, including CPU and
              memory, to optimize performance for your workloads.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted-foreground">
                CPU and memory
              </Text>
              <Accordion
                type="single"
                collapsible
                value={activeAccordion}
                onValueChange={setActiveAccordion}
                className="w-full"
              >
                <AccordionItem
                  value="resource-picker"
                  className="border rounded-lg px-3 border-border bg-muted"
                >
                  <AccordionTrigger className="py-2.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-medium">
                        {specification
                          ? `${specifications.find((s) => s.slug === specification)?.cpus} CPU, ${specifications.find((s) => s.slug === specification)?.memory} MB RAM`
                          : "Select specification"}
                      </Text>
                    </View>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <View className="gap-1 mt-1">
                      {specifications.map((spec) => (
                        <TouchableOpacity
                          key={spec.slug}
                          onPress={() => {
                            setSpecification(spec.slug);
                            setActiveAccordion("");
                          }}
                          disabled={!spec.enabled}
                          className={`flex-row items-center justify-between p-3 rounded-md ${specification === spec.slug ? "bg-accent/50" : "active:bg-muted"} ${!spec.enabled ? "opacity-30" : ""}`}
                        >
                          <Text className="text-sm font-medium">
                            {spec.cpus} CPU, {spec.memory} MB RAM
                          </Text>
                          {specification === spec.slug && (
                            <Icon as={Check} size={16} color="#FD366E" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </View>
          </CardContent>
          <Separator className="bg-border/50" />
          <View className="p-4 flex-row justify-end bg-muted/5">
            <Button
              className="px-6 h-10"
              onPress={handleUpdateResourceLimits}
              disabled={updating || !isResourceLimitsChanged}
            >
              <Text
                className={`font-semibold ${updating || !isResourceLimitsChanged ? "text-muted-foreground" : "text-white"}`}
              >
                Update
              </Text>
            </Button>
          </View>
        </Card>

        {/* Environment Variables Card */}
        <Card className="py-6">
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
        <Card className="py-6">
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
        <Card className="py-6">
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
        <Card className="border-destructive/50 py-6">
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
