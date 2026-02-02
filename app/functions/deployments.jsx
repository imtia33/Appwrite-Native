import { View, ScrollView, Linking, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
  sdk,
  Query,
  RuleType,
  DeploymentResourceType,
  realtime,
  getSubdomain,
} from "@/appwrite/appwrite";
import { humanFileSize } from "@/lib/helpers/size";
import { formatTimeDetailed, timeAgo } from "@/lib/helpers/time";
import {
  Copy,
  Terminal,
  RefreshCw,
  Play,
  Info,
  GitCommit,
  Globe,
  Boxes,
  Github,
  Code,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
} from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/blocks/DataTable";

import { useProjectStore } from "@/appwrite/store/projectStore";
import { darkIcons, lightIcons, getIconFromRuntime } from "@/constants/icons";
import { useTheme } from "@/lib/theme-context";

const Deployments = ({ route }) => {
  const { isDark } = useTheme();
  const icons = isDark ? darkIcons : lightIcons;
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [func, setFunc] = useState(null);
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    functionId: paramFunctionId,
    deploymentId,
    $id: routeFunctionId,
  } = route.params;
  const functionId = paramFunctionId || routeFunctionId;
  const { currentProject } = useProjectStore();

  const fetchDeployment = async () => {
    try {
      if (!functionId || !currentProject) return;

      const [functionData, deploymentsData] = await Promise.all([
        sdk
          .forProject(currentProject.region, currentProject.$id)
          .functions.get(functionId),
        sdk
          .forProject(currentProject.region, currentProject.$id)
          .functions.listDeployments(functionId, [
            Query.limit(10),
            Query.orderDesc("$createdAt"),
          ]),
      ]);

      setFunc(functionData);
      setDeployments(deploymentsData.deployments);

      let activeDeploymentId = deploymentId || functionData.deployment;

      if (activeDeploymentId) {
        const deployment = await sdk
          .forProject(currentProject.region, currentProject.$id)
          .functions.getDeployment(functionId, activeDeploymentId);
        setActiveDeployment(deployment);

        // Fetch domain
        const rules = await sdk
          .forProject(currentProject.region, currentProject.$id)
          .proxy.listRules({
            queries: [
              Query.equal("type", RuleType.DEPLOYMENT),
              Query.equal(
                "deploymentResourceType",
                DeploymentResourceType.FUNCTION,
              ),
              Query.equal("deploymentResourceId", functionId),
              Query.equal("deploymentId", activeDeploymentId),
              Query.limit(1),
            ],
          });

        if (rules.rules.length > 0) {
          setDomain(rules.rules[0].domain);
        } else {
          setDomain(null);
        }
      } else {
        setActiveDeployment(null);
        setDomain(null);
      }
    } catch (error) {
      console.error("Failed to fetch deployments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, [functionId, deploymentId, currentProject]);

  const handleRefresh = () => {
    setLoading(true);
    fetchDeployment();
  };

  const handleRedeploy = async (deploymentToRedeploy) => {
    try {
      if (!deploymentToRedeploy || !currentProject) return;
      // In a real app, this might open a modal or call a redeploy API
      // For now, let's assume we create a new deployment based on the source
      // But Appwrite SDK for functions doesn't have a direct "redeploy" method that takes a deployment ID
      // It usually involves creating a new deployment from VCS or CLI.
      // However, we can simulate or show an alert for now if the specific logic is complex.
      console.log("Redeploying deployment:", deploymentToRedeploy.$id);
    } catch (error) {
      console.error("Failed to redeploy", error);
    }
  };

  const handleActivate = async (id) => {
    try {
      if (!functionId || !currentProject) return;
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .functions.update(
          functionId,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          id,
        );
      fetchDeployment();
    } catch (error) {
      console.error("Failed to activate deployment", error);
    }
  };

  const handleDownload = async (deployment, type) => {
    try {
      const subdomain = getSubdomain(currentProject.region);
      const url = `https://${subdomain}cloud.appwrite.io/v1/functions/${functionId}/deployments/${deployment.$id}/download?type=${type}&project=${currentProject.$id}&mode=admin`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open download link", error);
    }
  };

  const handleDelete = async (deploymentId) => {
    Alert.alert(
      "Delete Deployment",
      "Are you sure you want to delete this deployment? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await sdk
                .forProject(currentProject.region, currentProject.$id)
                .functions.deleteDeployment(functionId, deploymentId);
              fetchDeployment();
            } catch (error) {
              console.error("Failed to delete deployment", error);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    if (!functionId || !currentProject) return;

    const unsubscribe = realtime.forConsole(
      currentProject.region,
      [`functions.${functionId}.deployments`],
      (response) => {
        // Refresh deployments on any change
        fetchDeployment();
      },
    );

    return () => {
      unsubscribe();
    };
  }, [functionId, currentProject]);

  const getStatusDetails = (status) => {
    switch (status) {
      case "ready":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500",
          label: "Ready",
        };
      case "failed":
        return { icon: XCircle, color: "text-red-500", label: "Failed" };
      case "building":
      case "processing":
      case "waiting":
        return {
          icon: Loader2,
          color: "text-blue-500",
          label: "Building",
          spin: true,
        };
      default:
        return { icon: Info, color: "text-muted-foreground", label: status };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!activeDeployment) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text>No active deployment found.</Text>
      </View>
    );
  }

  const {
    $id,
    $createdAt,
    status,
    buildDuration,
    totalSize,
    createdBy,
    providerCommitAuthor,
    userName,
    type: deploymentType,
  } = activeDeployment;

  const runtime = func?.runtime;
  const creatorName =
    providerCommitAuthor || userName || createdBy?.$id || "User";

  const fileSize = humanFileSize(totalSize);
  const buildTime = formatTimeDetailed(buildDuration);
  const timeCreated = timeAgo($createdAt);

  const iconName = getIconFromRuntime(runtime);
  const iconAsset = iconName ? icons[iconName] : null;
  const RuntimeIcon = iconAsset?.default || iconAsset;

  const getSourceDetails = (type) => {
    switch (type) {
      case "vcs":
        return { icon: Github, label: "GitHub" };
      case "cli":
        return { icon: Terminal, label: "CLI" };
      case "manual":
        return { icon: Code, label: "Manual" };
      default:
        return { icon: GitCommit, label: type || "N/A" };
    }
  };

  const sourceDetails = getSourceDetails(deploymentType);

  return (
    <ScrollView className="flex-1 bg-background h-full border-t border-border p-4">
      <Card>
        <CardContent className="p-6 gap-6">
          <View className="flex-row items-center gap-4 flex-wrap">
            <Text className="text-lg font-semibold">Active deployment</Text>
            <View className="flex-row items-center bg-input gap-2 px-2 py-1 rounded-md border border-border">
              <Icon as={Terminal} size={14} color="gray" />
              <Text className="text-sm font-mono text-muted-foreground">
                {$id}
              </Text>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <Icon as={Copy} size={12} color="gray" />
              </Button>
            </View>
          </View>

          {/* Domains */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">Domains</Text>
              <Icon as={Globe} size={14} color="gray" />
            </View>
            <Text className="text-sm underline text-primary">
              {domain || "No domain assigned"}
            </Text>
          </View>

          {/* Deployed Info */}
          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Deployed</Text>
            <View className="flex-row gap-1 flex-wrap">
              <Text className="text-sm">{timeCreated}</Text>
              <Text className="text-sm text-muted-foreground">by</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm underline decoration-dotted">
                  {creatorName}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-8 flex-wrap">
            <View className="gap-1">
              <Text className="text-sm text-muted-foreground">
                Build duration
              </Text>
              <Text className="text-sm font-medium">{buildTime}</Text>
            </View>
            <View className="gap-1">
              <Text className="text-sm text-muted-foreground">Total size</Text>
              <Text className="text-sm font-medium">
                {fileSize.value} {fileSize.unit}
              </Text>
            </View>
          </View>

          {/* Runtime */}
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">Runtime</Text>
            <View className="flex-row items-center gap-2 w-25">
              <View className="w-8 h-8  items-center justify-center  overflow-hidden">
                {typeof RuntimeIcon === "function" ? (
                  <RuntimeIcon width={26} height={26} />
                ) : (
                  <Icon
                    as={Boxes}
                    size={14}
                    className="text-muted-foreground"
                  />
                )}
              </View>
              <Text className="text-foreground capitalize w-20">{runtime}</Text>
            </View>
          </View>

          {/* Protection Info */}
          <View className="flex-row gap-8 flex-wrap">
            <View className="gap-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Global CDN
                </Text>
                <Icon as={Info} size={12} color="gray" />
              </View>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 border-emerald-500/20"
              >
                <Text className="text-emerald-500 text-xs">Connected</Text>
              </Badge>
            </View>
            <View className="gap-1">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  DDoS protection
                </Text>
                <Icon as={Info} size={12} color="gray" />
              </View>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 border-emerald-500/20"
              >
                <Text className="text-emerald-500 text-xs">Connected</Text>
              </Badge>
            </View>
          </View>

          {/* Source */}
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">Source</Text>
            <View className="flex-row items-center gap-2">
              <Icon as={sourceDetails.icon} size={16} color="gray" />
              <Text className="text-sm font-medium">{sourceDetails.label}</Text>
            </View>
          </View>

          <Separator />

          {/* Footer Actions */}
          <View className="flex-row justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleRedeploy(activeDeployment)}
            >
              <Icon as={RefreshCw} size={16} className="mr-2" />
              <Text>Redeploy</Text>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => console.log("Execute function")}
            >
              <Icon as={Play} size={16} className="mr-2" />
              <Text>Execute</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* Deployments List */}
      <View className="mt-6 mb-8 flex-1 min-h-[400px]">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold">Deployments</Text>
          <Button variant="outline" size="sm" onPress={handleRefresh}>
            <Icon as={RefreshCw} size={14} className="mr-2" />
            <Text>Refresh</Text>
          </Button>
        </View>

        <DataTable
          data={deployments}
          columns={[
            {
              id: "id",
              header: "ID",
              accessorKey: "$id",
              width: 200,
              cell: ({ row }) => {
                const deployment = row.original;
                const isActive = deployment.$id === activeDeployment?.$id;
                return (
                  <View className="flex-row items-center gap-2">
                    <Text className="font-medium text-sm">
                      {deployment.$id}
                    </Text>
                    
                  </View>
                );
              },
            },
            {
              id: "status",
              header: "Status",
              accessorKey: "status",
              width: 120,
              cell: ({ row }) => {
                const statusDetails = getStatusDetails(row.original.status);
                return (
                  <View className="flex-row items-center gap-1.5">
                    <Icon
                      as={statusDetails.icon}
                      size={14}
                      className={statusDetails.color}
                    />
                    <Text
                      className={`text-xs font-medium ${statusDetails.color}`}
                    >
                      {statusDetails.label}
                    </Text>
                  </View>
                );
              },
            },
            {
              id: "type",
              header: "Source",
              accessorKey: "type",
              width: 100,
              cell: ({ row }) => {
                const details = getSourceDetails(row.original.type);
                return (
                  <View className="flex-row items-center gap-2">
                    <Icon as={details.icon} size={14} color="gray" />
                    <Text className="text-xs text-muted-foreground">
                      {details.label}
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
                <Text className="text-xs text-muted-foreground">
                  {timeAgo(row.original.$createdAt)}
                </Text>
              ),
            },
            {
              id: "totalSize",
              header: "Size",
              accessorKey: "totalSize",
              width: 100,
              cell: ({ row }) => {
                const size = humanFileSize(row.original.totalSize);
                return (
                  <Text className="text-xs text-muted-foreground">
                    {size.value} {size.unit}
                  </Text>
                );
              },
            },
            {
              id: "actions",
              header: "",
              width: 60,
              cell: ({ row }) => {
                const deployment = row.original;
                const isActive = deployment.$id === activeDeployment?.$id;

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon as={MoreVertical} size={16} color="gray" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {!isActive && deployment.status === "ready" && (
                        <DropdownMenuItem
                          onPress={() => handleActivate(deployment.$id)}
                        >
                          <Icon
                            as={Play}
                            size={14}
                            className="mr-2"
                            color="gray"
                          />
                          <Text>Activate</Text>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onPress={() => handleRedeploy(deployment)}
                      >
                        <Icon
                          as={RefreshCw}
                          size={14}
                          className="mr-2"
                          color="gray"
                        />
                        <Text>Redeploy</Text>
                      </DropdownMenuItem>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <View className="flex-row items-center flex-1">
                            <Icon
                              as={Download}
                              size={14}
                              className="mr-2"
                              color="gray"
                            />
                            <Text>Download</Text>
                          </View>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          <DropdownMenuItem
                            onPress={() => handleDownload(deployment, "source")}
                          >
                            <Text>Source code</Text>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onPress={() => handleDownload(deployment, "output")}
                          >
                            <Text>Output</Text>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onPress={() => handleDelete(deployment.$id)}
                      >
                        <Icon
                          as={Trash2}
                          size={14}
                          className="mr-2 text-destructive"
                        />
                        <Text className="text-destructive">Delete</Text>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            },
          ]}
          pagination={false}
          showSearch={false}
          showGridLines={true}
        />
      </View>
    </ScrollView>
  );
};

export default Deployments;
