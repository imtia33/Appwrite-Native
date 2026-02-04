import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from "react-native";
import useDatabaseStore from "../../appwrite/data-services/databaseService";
import { useProjectStore } from "../../appwrite/store/projectStore";
import DataTable from "../blocks/DataTable";
import { Icon } from "../ui/icon";
import {
  FileText,
  Plus,
  Upload,
  Filter,
  Search as SearchIcon,
  Copy,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react-native";
import { Button } from "../ui/button";
import { Query } from "@appwrite.io/console";
import * as Clipboard from "expo-clipboard";
import { FontAwesome } from "@expo/vector-icons";

const Rows = ({ databaseId, tableId }) => {
  const { currentProject } = useProjectStore();
  const { fetchRows, fetchColumns, documentCache } = useDatabaseStore();
  const cacheKey = `${databaseId}:${tableId}`;
  const cache = documentCache[cacheKey] || {
    items: [],
    hasMore: true,
    loading: false,
  };

  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);

  // Pagination state (internal to component for manual triggers)
  const [limit, setLimit] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isLoadingColumns, setIsLoadingColumns] = useState(true);

  const loadColumns = useCallback(async () => {
    if (!currentProject || !databaseId || !tableId) return;
    setIsLoadingColumns(true);
    try {
      const cols = await fetchColumns(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        tableId,
      );
      setColumns(cols);
    } catch (err) {
      console.error("Error loading columns:", err);
    } finally {
      setIsLoadingColumns(false);
    }
  }, [currentProject?.$id, databaseId, tableId, fetchColumns]);

  const loadRows = useCallback(
    async (
      query = "",
      isNextPage = false,
      currentLimit = 25,
      forceRefresh = false,
    ) => {
      if (!currentProject || !databaseId || !tableId) return;

      if (isNextPage) {
        setIsLoadingMore(true);
      }
      setError(null);
      try {
        const queries = [];
        if (query) {
          queries.push(Query.contains("$id", query));
        }

        await fetchRows(
          currentProject.$id,
          currentProject.region || "fra",
          databaseId,
          tableId,
          {
            queries,
            isNextPage,
            forceRefresh,
            limit: currentLimit,
          },
        );
      } catch (err) {
        console.error("Error loading rows:", err);
        setError("Failed to load rows");
      } finally {
        setIsLoadingMore(false);
      }
    },
    [currentProject?.$id, databaseId, tableId, fetchRows],
  );

  const formattedRows = useMemo(() => {
    return cache.items.map((row) => {
      const formatted = {
        ...row,
        $formattedCreatedAt: new Date(row.$createdAt).toLocaleString(),
        $formattedUpdatedAt: new Date(row.$updatedAt).toLocaleString(),
      };

      columns.forEach((col) => {
        const value = row[col.key];
        if (value !== null && typeof value === "object") {
          formatted[`$stringified_${col.key}`] = JSON.stringify(value);
        }
      });

      return formatted;
    });
  }, [cache.items, columns]);

  useEffect(() => {
    loadColumns();
  }, [loadColumns]);

  useEffect(() => {
    loadRows(searchQuery, false, limit, false);
  }, [loadRows, limit, searchQuery]);

  const copyToClipboard = useCallback(async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid?.show?.("Copied to clipboard", ToastAndroid.SHORT);
  }, []);

  const handleEndReached = () => {
    if (cache.hasMore && !isLoadingMore && cache.items.length > 0) {
      loadRows(searchQuery, true, limit, false);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const handleImportCSV = () => {
    Alert.alert(
      "Import CSV",
      "CSV import is not yet implemented in this version.",
    );
  };

  const tableColumns = useMemo(() => {
    const baseColumns = [
      { id: "select", width: 50 },
      {
        id: "$id",
        accessorKey: "$id",
        header: "ID",
        width: 200,
        cell: ({ row }) => (
          <TouchableOpacity
            onPress={() => copyToClipboard(row.original.$id)}
            className="flex-row items-center bg-input px-2 py-1 rounded-sm"
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
    ];

    const attrColumns = columns
      .filter((col) => col.status === "available")
      .map((col) => ({
        id: col.key,
        accessorKey: col.key,
        header: col.key,
        width: 150,
        cell: ({ row }) => {
          const value = row.original[col.key];
          if (value === null || value === undefined) {
            return (
              <Text className="text-muted-foreground italic text-xs">null</Text>
            );
          }
          if (typeof value === "object") {
            return (
              <Text className="text-foreground text-sm" numberOfLines={1}>
                {row.original[`$stringified_${col.key}`] ||
                  JSON.stringify(value)}
              </Text>
            );
          }
          return (
            <Text className="text-foreground text-sm" numberOfLines={1}>
              {String(value)}
            </Text>
          );
        },
      }));

    const metaColumns = [
      {
        id: "$createdAt",
        accessorKey: "$createdAt",
        header: "Created At",
        width: 200,
        cell: ({ row }) => (
          <Text className="text-muted-foreground text-xs">
            {row.original.$formattedCreatedAt}
          </Text>
        ),
      },
      {
        id: "$updatedAt",
        accessorKey: "$updatedAt",
        header: "Updated At",
        width: 200,
        cell: ({ row }) => (
          <Text className="text-muted-foreground text-xs">
            {row.original.$formattedUpdatedAt}
          </Text>
        ),
      },
    ];

    return [...baseColumns, ...attrColumns, ...metaColumns];
  }, [columns]);

  if ((cache.loading && cache.items.length === 0) || isLoadingColumns) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#FD366E" />
        <Text className="text-muted-foreground mt-4">Loading rows...</Text>
      </View>
    );
  }

  const rows = formattedRows;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-2 border-b border-border flex-row items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          style={{
            borderWidth: 1,
            borderColor: "gray",
            transform: [{ rotate: "90deg" }],
          }}
          className="h-10 "
        >
          <FontAwesome name="bars" size={16} color="gray" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          style={{ borderWidth: 1, borderColor: "gray" }}
          className="h-10 bg-input"
          onPress={handleImportCSV}
        >
          <FontAwesome name="filter" size={18} color="gray" />
          <Text className="text-muted-foreground text-[15px] font-medium">
            Filter
          </Text>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 bg-input"
          style={{ borderWidth: 1, borderColor: "gray" }}
          onPress={handleImportCSV}
        >
          <Icon as={Upload} size={16} color="gray" />
          <Text className="text-muted-foreground text-[15px] font-medium">
            Import CSV
          </Text>
        </Button>
        <Button
          size="sm"
          className="h-10 px-3 bg-primary"
          //onPress={() => setIsCreateModalOpen(true)}
        >
          <Icon as={Plus} size={18} color="white" />
        </Button>
      </View>

      {cache.items.length === 0 && !cache.loading ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
            <Icon as={FileText} size={32} className="text-muted-foreground" />
          </View>
          <Text className="text-lg font-semibold text-foreground">
            No rows found
          </Text>
          <Text className="text-muted-foreground text-center mt-2 max-w-xs">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "This table doesn't have any rows yet."}
          </Text>
          {!searchQuery && (
            <Button
              className="mt-6 bg-primary"
              //onPress={() => setIsCreateModalOpen(true)}
            >
              <Text className="text-white font-bold">Create First Row</Text>
            </Button>
          )}
        </View>
      ) : (
        <View className="flex-1">
          <DataTable
            data={rows}
            columns={tableColumns}
            showSearch={false}
            showColumnSelector={false}
            pagination={false}
            showGridLines={true}
            onEndReached={handleEndReached}
            isLoadingMore={isLoadingMore}
            selectColumnKey="$sequence"
            onRowPress={(item) => {
              // setSelectedRow(item);
              // setIsEditModalOpen(true);
            }}
          />
        </View>
      )}
    </View>
  );
};

export default memo(Rows);
