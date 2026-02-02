import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useProjectStore } from "@/appwrite/store/projectStore";
import { sdk, Query } from "@/appwrite/appwrite";
import { useTheme } from "@/lib/theme-context";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { RefreshCw, Info, Terminal, Search } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/blocks/DataTable";
import { timeAgo } from "@/lib/helpers/time";
import { Input } from "@/components/ui/input";

const Logs = ({ route }) => {
  const { siteId } = route.params;
  const { currentProject } = useProjectStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const fetchLogs = async (newOffset = 0) => {
    try {
      if (!siteId || !currentProject) return;

      const queries = [
        Query.limit(limit),
        Query.offset(newOffset),
        Query.orderDesc("$createdAt"),
      ];

      if (search) {
        // For sites.listLogs, search might not be supported the same way as console.listEvents
        // But we'll follow the pattern if the search query is provided
        queries.push(Query.equal("event", search));
      }

      const logsData = await sdk
        .forProject(currentProject.region, currentProject.$id)
        .sites.listLogs({
          siteId,
          queries,
        });

      setLogs(logsData.executions);
      setTotal(logsData.total);
      setOffset(newOffset);
    } catch (error) {
      console.error("Failed to fetch logs data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [siteId, currentProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs(0);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchLogs(0);
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
      <View className="p-4 gap-4">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 relative">
            <Input
              placeholder="Search logs..."
              value={search}
              onChangeText={setSearch}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onPress={handleSearch}
            >
              <Icon as={Search} size={16} color="gray" />
            </Button>
          </View>
          <Button variant="outline" size="icon" onPress={onRefresh}>
            <Icon as={RefreshCw} size={16} color="gray" />
          </Button>
        </View>

        <DataTable
          data={logs}
          columns={[
            {
              id: "event",
              header: "Event",
              accessorKey: "event",
              width: 250,
              cell: ({ row }) => (
                <View className="flex-row items-center gap-2">
                  <Icon as={Terminal} size={14} color="gray" />
                  <Text className="text-xs font-medium" numberOfLines={1}>
                    {row.original.event}
                  </Text>
                </View>
              ),
            },
            {
              id: "ip",
              header: "IP",
              accessorKey: "ip",
              width: 120,
              cell: ({ row }) => (
                <Text className="text-xs text-muted-foreground">
                  {row.original.ip}
                </Text>
              ),
            },
            {
              id: "created",
              header: "Occurred",
              accessorKey: "$createdAt",
              width: 120,
              cell: ({ row }) => (
                <Text className="text-xs text-muted-foreground">
                  {timeAgo(row.original.$createdAt)}
                </Text>
              ),
            },
          ]}
          pagination={true}
          totalCount={total}
          onPageChange={(page) => fetchLogs(page * limit)}
        />
      </View>
    </View>
  );
};

export default Logs;
