import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useProjectStore } from "@/appwrite/store/projectStore";
import { sdk, Query } from "@/appwrite/appwrite";
import { useTheme } from "@/lib/theme-context";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  MoreVertical,
  Play,
  Download,
  Trash2,
  GitCommit,
  Terminal,
  Code,
  Github,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/blocks/DataTable";
import { humanFileSize } from "@/lib/helpers/size";
import { formatTimeDetailed, timeAgo } from "@/lib/helpers/time";
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

const Deployments = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [deployments, setDeployments] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeployments = async () => {
    try {
      if (!siteId || !currentProject) return;

      const [deploymentsData, usage] = await Promise.all([
        sdk
          .forProject(currentProject.region, currentProject.$id)
          .sites.listDeployments({
            siteId,
            queries: [Query.limit(20), Query.orderDesc("$createdAt")],
          }),
        sdk
          .forProject(currentProject.region, currentProject.$id)
          .sites.getUsage({
            siteId,
            range: "30d",
          }),
      ]);

      setDeployments(deploymentsData.deployments);

      // Process metrics
      const processedMetrics = [
        { label: "Total builds", value: usage.buildsTotal || "0" },
        {
          label: "Total build size",
          value:
            usage.buildsStorageTotal > 0
              ? `${humanFileSize(usage.buildsStorageTotal).value}${humanFileSize(usage.buildsStorageTotal).unit}`
              : "0B",
        },
        {
          label: "Total build time",
          value:
            usage.buildsTimeTotal > 0
              ? formatTimeDetailed(usage.buildsTimeTotal / 1000)
              : "0s",
        },
        {
          label: "Avg. build time",
          value:
            usage.buildsTimeAverage > 0
              ? formatTimeDetailed(usage.buildsTimeAverage / 1000)
              : "0s",
        },
        {
          label: "Successful",
          value: usage.buildsSuccessTotal || "0",
          color: "text-emerald-500",
        },
        {
          label: "Failed",
          value: usage.buildsFailedTotal || "0",
          color: "text-red-500",
        },
      ];
      setMetrics(processedMetrics);
    } catch (error) {
      console.error("Failed to fetch deployments data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [siteId, currentProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeployments();
  };

  const handleActivate = async (id) => {
    try {
      if (!siteId || !currentProject) return;
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.update({ siteId, deploymentId: id });
      Alert.alert("Success", "Deployment activated");
      fetchDeployments();
    } catch (error) {
      console.error("Failed to activate deployment", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleRedeploy = async (deployment) => {
    try {
      if (!siteId || !currentProject) return;
      // createDeployment for sites takes siteId and deploymentId (to redeploy from)
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.createDeployment({ siteId, deploymentId: deployment.$id });
      Alert.alert("Success", "Redeployment started");
      fetchDeployments();
    } catch (error) {
      console.error("Failed to redeploy", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleCreateDeployment = async () => {
    // This would typically open a modal to select source (Manual/Github)
    // For simplicity, let's trigger a manual deployment if that's supported or show alert
    Alert.alert(
      "Create Deployment",
      "This would typically open the deployment creation flow.",
    );
  };

  const handleDownload = async (deployment) => {
    try {
      const region =
        currentProject.region === "default" ? "fra" : currentProject.region;
      const url = `https://${region}.cloud.appwrite.io/v1/sites/${siteId}/deployments/${deployment.$id}/download?project=${currentProject.$id}`;
      Linking.openURL(url);
    } catch (error) {
      console.error("Failed to download deployment", error);
      Alert.alert("Error", "Could not open download link");
    }
  };

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

  const handleDelete = async (id) => {
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
                .sites.deleteDeployment({ siteId, deploymentId: id });
              fetchDeployments();
            } catch (error) {
              console.error("Failed to delete deployment", error);
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
      <View className="p-4 gap-6">
        {/* Metrics Grid */}
        <View className="flex-row flex-wrap gap-3">
          {metrics.map((metric, index) => (
            <Card key={index} className="flex-1 min-w-[45%]">
              <CardContent className="p-3 items-center">
                <Text className="text-xs text-muted-foreground mb-1">
                  {metric.label}
                </Text>
                <Text className={`text-lg font-bold ${metric.color || ""}`}>
                  {metric.value}
                </Text>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Create Deployment Button */}
        <Button
          className="flex-row items-center justify-center gap-2"
          onPress={handleCreateDeployment}
        >
          <Icon as={Plus} size={18} color="white" />
          <Text className="text-white font-medium">Create Deployment</Text>
        </Button>

        {/* Deployments History */}
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Deployments History</Text>
            <Button variant="ghost" size="icon" onPress={onRefresh}>
              <Icon as={RefreshCw} size={16} color="gray" />
            </Button>
          </View>
          <View className="border border-border rounded-lg overflow-hidden">
          <DataTable
            data={deployments}
            columns={[
              {
                id: "status",
                header: "Status",
                accessorKey: "status",
                width: 100,
                cell: ({ row }) => {
                  const details = getStatusDetails(row.original.status);
                  return (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        as={details.icon}
                        size={14}
                        className={details.color}
                      />
                      <Text className={`text-xs ${details.color}`}>
                        {details.label}
                      </Text>
                    </View>
                  );
                },
              },
              {
                id: "id",
                header: "ID",
                accessorKey: "$id",
                width: 150,
                cell: ({ row }) => (
                  <Text className="text-xs font-mono" numberOfLines={1}>
                    {row.original.$id}
                  </Text>
                ),
              },
              {
                id: "source",
                header: "Source",
                accessorKey: "type",
                width: 100,
                cell: ({ row }) => {
                  const details = getSourceDetails(row.original.type);
                  return (
                    <View className="flex-row items-center gap-1">
                      <Icon as={details.icon} size={14} color="gray" />
                      <Text className="text-xs text-muted-foreground">
                        {details.label}
                      </Text>
                    </View>
                  );
                },
              },
              {
                id: "created",
                header: "Created",
                accessorKey: "$createdAt",
                width: 120,
                cell: ({ row }) => (
                  <Text className="text-xs text-muted-foreground">
                    {timeAgo(row.original.$createdAt)}
                  </Text>
                ),
              },
              {
                id: "actions",
                header: "",
                width: 50,
                cell: ({ row }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon as={MoreVertical} size={16} color="gray" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onPress={() => handleActivate(row.original.$id)}
                      >
                        <Icon
                          as={Play}
                          size={14}
                          className="mr-2"
                          color="gray"
                        />
                        <Text>Activate</Text>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onPress={() => handleRedeploy(row.original)}
                      >
                        <Icon
                          as={RefreshCw}
                          size={14}
                          className="mr-2"
                          color="gray"
                        />
                        <Text>Redeploy</Text>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onPress={() => handleDownload(row.original)}
                      >
                        <Icon
                          as={Download}
                          size={14}
                          className="mr-2"
                          color="gray"
                        />
                        <Text>Download</Text>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onPress={() => handleDelete(row.original.$id)}
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
                ),
              },
            ]}
          />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Deployments;
