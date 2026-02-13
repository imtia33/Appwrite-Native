import {
  View,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useProjectStore } from "@/appwrite/store/projectStore";
import {
  sdk,
  Query,
  RuleType,
  DeploymentResourceType,
  RuleTrigger,
} from "@/appwrite/appwrite";
import { useTheme } from "@/lib/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  ChevronRight,
  TrendingUp,
  Layout,
} from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/blocks/DataTable";
import { timeAgo, formatTimeDetailed } from "@/lib/helpers/time";
import { humanFileSize } from "@/lib/helpers/size";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, QrCode } from "lucide-react-native";

const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const SiteScreenshot = ({ site }) => {
  const { isDark } = useTheme();
  const { currentProject } = useProjectStore();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fileId = isDark
      ? site?.deploymentScreenshotDark
      : site?.deploymentScreenshotLight;

    if (!fileId) {
      setImageUri(null);
      return;
    }

    let isMounted = true;

    const fetchScreenshot = async () => {
      setLoading(true);
      try {
        const region =
          currentProject?.region === "default"
            ? "fra"
            : currentProject?.region || "fra";
        const consoleSdk = sdk.forConsoleIn(region);

        const url = consoleSdk.storage.getFileView({
          bucketId: "screenshots",
          fileId,
        });

        const response = await consoleSdk.client.call(
          "GET",
          new URL(url),
          {},
          {},
          "arrayBuffer",
        );

        if (isMounted && response) {
          const base64 = arrayBufferToBase64(response);
          setImageUri(`data:image/png;base64,${base64}`);
        }
      } catch (err) {
        console.error("Error fetching site screenshot:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchScreenshot();

    return () => {
      isMounted = false;
    };
  }, [site, isDark, currentProject]);

  if (loading) {
    return (
      <View className="h-[175px] items-center justify-center bg-muted/20 rounded-xl">
        <ActivityIndicator />
      </View>
    );
  }

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ height: 175, borderRadius: 10 }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View className="h-[175px] items-center justify-center bg-muted/20 rounded-xl">
      <Icon as={Globe} size={48} className="text-muted-foreground/30" />
    </View>
  );
};

const Overview = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [site, setSite] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      if (!siteId || !currentProject) return;

      const [siteData, deploymentsData, domainsData, logsData] =
        await Promise.all([
          sdk
            .forProject(currentProject.region, currentProject.$id)
            .sites.get({ siteId }),
          sdk
            .forProject(currentProject.region, currentProject.$id)
            .sites.listDeployments({
              siteId,
              queries: [Query.limit(5), Query.orderDesc("$createdAt")],
            }),
          sdk
            .forProject(currentProject.region, currentProject.$id)
            .proxy.listRules({
              queries: [
                Query.equal("type", RuleType.DEPLOYMENT),
                Query.equal(
                  "deploymentResourceType",
                  DeploymentResourceType.SITE,
                ),
                Query.equal("deploymentResourceId", siteId),
                Query.equal("trigger", RuleTrigger.MANUAL),
              ],
            }),
          sdk
            .forProject(currentProject.region, currentProject.$id)
            .sites.listLogs({
              siteId,
              queries: [Query.limit(100), Query.orderDesc("$createdAt")],
            }),
        ]);

      setSite(siteData);
      setDeployments(deploymentsData.deployments);
      setDomains(domainsData.rules);

      // Process logs for popular pages
      const pathCounts = {};
      logsData.executions.forEach((log) => {
        const path = log.requestPath;
        // Filter out static assets and internal Next.js paths
        if (
          !path.startsWith("/_next/static") &&
          !path.startsWith("/_next/image") &&
          !path.startsWith("/static") &&
          !path.startsWith("/assets") &&
          !path.match(/\.(js|css|map|ico|png|jpg|svg|json)$/)
        ) {
          pathCounts[path] = (pathCounts[path] || 0) + 1;
        }
      });

      const sortedPages = Object.entries(pathCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([path, views]) => ({ path, views }));

      setPopularPages(sortedPages);
    } catch (error) {
      console.error("Failed to fetch site overview data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteId, currentProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "ready":
        return {
          icon: CheckCircle2,
          color: "green",
          label: "Ready",
        };
      case "failed":
        return { icon: XCircle, color: "red", label: "Failed" };
      case "building":
      case "processing":
      case "waiting":
        return {
          icon: Loader2,
          color: "blue",
          label: "Building",
          spin: true,
        };
      default:
        return { icon: Info, color: "gray", label: status };
    }
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
        {/* Site Screenshot & Details Card */}
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-0">
            <View className="p-2 gap-6">
              <View className=" items-center gap-6">
                <View className="w-full">
                  <SiteScreenshot site={site} />
                </View>

                <View className="flex-1 gap-5">
                  {/* Domains */}
                  <View className="gap-1">
                    <Text className="text-xs text-muted-foreground uppercase font-medium">
                      Domains
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-sm font-medium text-muted-foreground underline"
                        numberOfLines={1}
                      >
                        {domains[0]?.domain || "No domain"}
                      </Text>
                      {domains.length > 1 && (
                        <Badge variant="outline" className="px-1 py-0">
                          <Text className="text-[10px] text-muted-foreground">
                            +{domains.length - 1}
                          </Text>
                        </Badge>
                      )}
                      <Icon as={QrCode} size={24} color="gray" />
                    </View>
                  </View>

                  {/* Deployed Info */}
                  <View className="gap-1">
                    <Text className="text-xs text-muted-foreground uppercase font-medium">
                      Deployed
                    </Text>
                    <Text className="text-sm">
                      {site?.latestDeploymentCreatedAt
                        ? timeAgo(site.latestDeploymentCreatedAt)
                        : "Never"}
                    </Text>
                  </View>

                  {/* Build Specs */}
                  <View className="flex-row gap-6">
                    <View className="gap-1">
                      <Text className="text-xs text-muted-foreground uppercase font-medium">
                        Build duration
                      </Text>
                      <Text className="text-sm">
                        {deployments[0]?.buildDuration
                          ? formatTimeDetailed(deployments[0].buildDuration)
                          : "--"}
                      </Text>
                    </View>
                    <View className="gap-1">
                      <Text className="text-xs text-muted-foreground uppercase font-medium">
                        Total size
                      </Text>
                      <Text className="text-sm">
                        {deployments[0]?.totalSize
                          ? `${humanFileSize(deployments[0].totalSize).value}${humanFileSize(deployments[0].totalSize).unit}`
                          : "--"}
                      </Text>
                    </View>
                  </View>

                  {/* Cloud Features */}
                  <View className="flex-row gap-6">
                    <View className="gap-1">
                      <Text className="text-xs text-muted-foreground uppercase font-medium">
                        Global CDN <Info size={10} color="gray" />
                      </Text>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 border-emerald-500/20 self-start"
                      >
                        <Text className="text-emerald-500 text-[10px]">
                          Connected
                        </Text>
                      </Badge>
                    </View>
                    <View className="gap-1">
                      <Text className="text-xs text-muted-foreground uppercase font-medium">
                        DDoS protection <Info size={10} color="gray" />
                      </Text>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 border-emerald-500/20 self-start"
                      >
                        <Text className="text-emerald-500 text-[10px]">
                          Connected
                        </Text>
                      </Badge>
                    </View>
                  </View>

                  {/* Source */}
                  <View className="gap-1">
                    <Text className="text-xs text-muted-foreground uppercase font-medium">
                      Source
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Icon as={Github} size={14} color="gray" />
                      <Text className="text-sm text-blue-500 underline">
                        {site?.providerBranch || "GitHub"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Separator className="bg-border" />

            <View className="p-4 flex-row justify-end gap-3 bg-muted/5">
              <Button variant="secondary" size="sm" className="h-9 px-4">
                <Text className="text-sm font-medium">Instant rollback</Text>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-9 px-6 bg-[#fd366e]"
              >
                <Text className="text-white text-sm font-medium">Visit</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Popular Pages Card */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold">Popular Pages</Text>
            <Icon as={TrendingUp} size={18} color="gray" />
          </View>
          <Card>
            <CardContent className="p-0">
              {popularPages.length > 0 ? (
                popularPages.map((page, index) => (
                  <View key={page.path}>
                    <View className="flex-row items-center justify-between p-4">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                          <Text className="text-xs font-bold text-primary">
                            {index + 1}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-sm font-medium text-foreground"
                            numberOfLines={1}
                          >
                            {page.path}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {page.views} {page.views === 1 ? "visit" : "visits"}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Badge variant="secondary" className="px-2">
                          <Text className="text-xs">
                            {Math.round(
                              (page.views /
                                popularPages.reduce(
                                  (acc, curr) => acc + curr.views,
                                  0,
                                )) *
                                100,
                            )}
                            %
                          </Text>
                        </Badge>
                      </View>
                    </View>
                    {index < popularPages.length - 1 && (
                      <Separator className="bg-border" />
                    )}
                  </View>
                ))
              ) : (
                <View className="p-8 items-center justify-center gap-2">
                  <Icon
                    as={Layout}
                    size={32}
                    className="text-muted-foreground/30"
                  />
                  <Text className="text-muted-foreground text-center">
                    No traffic data available yet
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Domains Card */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold">Domains</Text>
            <Icon as={Globe} size={18} color="gray" />
          </View>

          <Card>
            <CardContent>
              {domains.length > 0 ? (
                domains.map((domain, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-2 "
                  >
                    <View className="flex-row items-center gap-2">
                      <Globe size={14} color="gray" />
                      <Text className="text-sm">{domain.domain}</Text>
                    </View>
                    <ChevronRight size={16} color="gray" />
                  </View>
                ))
              ) : (
                <Text className="text-sm text-muted-foreground italic">
                  No domains configured
                </Text>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Recent Deployments */}
        <View className="gap-3">
          <Text className="text-lg font-bold">Recent Deployments</Text>
          <View className="border border-border rounded-lg overflow-hidden">
            <DataTable
              data={deployments}
              columns={[
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
                          size={12}
                          color={details.color}
                        />
                        <Text className={`text-xs ${details.color}`}>
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
                  width: 100,
                  cell: ({ row }) => (
                    <Text className="text-xs text-muted-foreground">
                      {timeAgo(row.original.$createdAt)}
                    </Text>
                  ),
                },
              ]}
              pagination={false}
              showSearch={false}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Overview;
