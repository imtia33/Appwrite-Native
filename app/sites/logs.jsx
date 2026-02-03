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
import {
  RefreshCw,
  Info,
  Terminal,
  Search,
  FileText,
} from "lucide-react-native";
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
      <View className="flex-1 p-4 gap-4">
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
              id: "logId",
              header: "Log ID",
              accessorKey: "$id",
              width: 220,
              cell: ({ row }) => (
                <View className="flex-row items-center gap-2 bg-muted/20 self-start px-2 py-1 rounded-md border border-border/50">
                  <Icon as={FileText} size={14} color="gray" />
                  <Text className="text-[11px] font-mono font-medium text-foreground">
                    {row.original.$id}
                  </Text>
                </View>
              ),
            },
            {
              id: "path",
              header: "Path",
              accessorKey: "requestPath",
              width: 280,
              cell: ({ row }) => (
                <Text
                  className="text-xs text-foreground py-1"
                  numberOfLines={1}
                >
                  {row.original.requestPath || "/"}
                </Text>
              ),
            },
            {
              id: "method",
              header: "Method",
              accessorKey: "requestMethod",
              width: 100,
              cell: ({ row }) => (
                <Text className="text-xs text-foreground font-medium py-1">
                  {(row.original.requestMethod || "get").toLowerCase()}
                </Text>
              ),
            },
            {
              id: "status",
              header: "Status code",
              accessorKey: "responseStatusCode",
              width: 100,
              cell: ({ row }) => (
                <View
                  className={`px-2 py-1 rounded self-start ${
                    row.original.responseStatusCode >= 200 &&
                    row.original.responseStatusCode < 400
                      ? "bg-teal-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      row.original.responseStatusCode >= 200 &&
                      row.original.responseStatusCode < 400
                        ? "text-teal-500"
                        : "text-red-500"
                    }`}
                  >
                    {row.original.responseStatusCode || "---"}
                  </Text>
                </View>
              ),
            },
            {
              id: "duration",
              header: "Duration",
              accessorKey: "duration",
              width: 100,
              cell: ({ row }) => (
                <Text className="text-xs text-foreground py-1">
                  {Math.round((row.original.duration || 0) * 1000)}ms
                </Text>
              ),
            },
            {
              id: "created",
              header: "Created",
              accessorKey: "$createdAt",
              width: 150,
              cell: ({ row }) => (
                <Text className="text-xs text-muted-foreground py-1">
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
