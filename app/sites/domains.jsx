import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
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
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  RefreshCw,
  Globe,
  ExternalLink,
  MoreVertical,
  RefreshCcw,
  Terminal,
  Trash2,
  ArrowRight,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Domains = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDomains = async () => {
    try {
      if (!siteId || !currentProject) return;

      const domainsData = await sdk
        .forProject(currentProject.region, currentProject.$id)
        .proxy.listRules({
          queries: [
            Query.equal("type", RuleType.DEPLOYMENT),
            Query.equal("deploymentResourceType", DeploymentResourceType.SITE),
            Query.equal("deploymentResourceId", siteId),
            Query.equal("trigger", RuleTrigger.MANUAL),
          ],
        });

      setDomains(domainsData.rules || []);
    } catch (error) {
      setDomains([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [siteId, currentProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDomains();
  };

  const getTargetLabel = (rule) => {
    if (rule.redirectUrl) return `Redirect to ${rule.redirectUrl}`;
    if (rule.deploymentVcsProviderBranch)
      return `Branch: ${rule.deploymentVcsProviderBranch}`;
    return "Active deployment";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 border-emerald-500/20"
          >
            <Text className="text-emerald-500 text-xs">Verified</Text>
          </Badge>
        );
      case "verifying":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 border-blue-500/20"
          >
            <Text className="text-blue-500 text-xs">Verifying</Text>
          </Badge>
        );
      case "unverified":
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-500/10 border-red-500/20">
            <Text className="text-red-500 text-xs">Failed</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Text className="text-xs">{status}</Text>
          </Badge>
        );
    }
  };

  const handleRetry = async (id) => {
    try {
      await sdk
        .forProject(currentProject.region, currentProject.$id)
        .proxy.updateRuleVerification({ ruleId: id });
      Alert.alert("Success", "Verification retried");
      fetchDomains();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteDomain = async (id) => {
    Alert.alert(
      "Delete Domain",
      "Are you sure you want to delete this domain rule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await sdk
                .forProject(currentProject.region, currentProject.$id)
                .proxy.deleteRule({ ruleId: id });
              fetchDomains();
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
    <View className="flex-1 bg-background">
      <View className="flex-1 p-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold">Project Domains</Text>
          <Button
            variant="outline"
            size="sm"
            className="flex-row items-center gap-2"
            onPress={onRefresh}
          >
            <Icon as={RefreshCw} size={14} color="gray" />
            <Text>Refresh</Text>
          </Button>
        </View>

        {domains && domains.length > 0 ? (
          <DataTable
            data={domains}
            columns={[
              {
                id: "domain",
                header: "Domain",
                accessorKey: "domain",
                width: 300,
                cell: ({ row }) => (
                  <TouchableOpacity
                    className="py-3 flex-row items-center gap-2"
                    onPress={() =>
                      Linking.openURL(`https://${row.original.domain}`)
                    }
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {row.original.domain}
                    </Text>
                  </TouchableOpacity>
                ),
              },
              {
                id: "target",
                header: "Target",
                accessorKey: "redirectUrl",
                width: 250,
                cell: ({ row }) => (
                  <View className="py-3">
                    <Text className="text-xs text-muted-foreground font-medium">
                      {getTargetLabel(row.original)}
                    </Text>
                  </View>
                ),
              },
              {
                id: "actions",
                header: "",
                width: 60,
                cell: ({ row }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Icon as={MoreVertical} size={16} color="gray" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onPress={() => handleRetry(row.original.$id)}
                      >
                        <Icon
                          as={RefreshCcw}
                          size={14}
                          className="mr-2"
                          color="gray"
                        />
                        <Text>Retry Verification</Text>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onPress={() => handleDeleteDomain(row.original.$id)}
                      >
                        <Icon
                          as={Trash2}
                          size={14}
                          className="mr-2 text-destructive"
                        />
                        <Text className="text-destructive">Delete Domain</Text>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            pagination={true}
            itemsPerPage={10}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-20 bg-muted/5 rounded-xl border border-dashed border-border mt-4">
            <Icon
              as={Globe}
              size={48}
              className="text-muted-foreground/20 mb-4"
            />
            <Text className="text-muted-foreground font-medium">
              No domains found
            </Text>
            <Text className="text-muted-foreground text-xs mt-1">
              Add a custom domain to your site to see it here.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Domains;
