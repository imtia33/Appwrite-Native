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
import useBucketStore from "../../appwrite/data-services/storageService";
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
  Download,
  RefreshCcw,
  X,
  ChevronDown,
} from "lucide-react-native";
import { Button } from "../ui/button";
import { Query } from "@appwrite.io/console";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import { FontAwesome } from "@expo/vector-icons";
import { realtime } from "../../appwrite/appwrite";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Separator } from "../ui/separator";
import { cn } from "../../lib/utils";
import ColumnSelectionModal from "./modal/ColumnSelectionModal";
import DataFilterModal from "./modal/DataFilterModal";
import CreateRowModal from "./modal/CreateRowModal";

const ExportModal = ({
  isOpen,
  onClose,
  columns,
  onExport,
  tableName,
  isExporting,
}) => {
  const [filename, setFilename] = useState("");
  const [delimiter, setDelimiter] = useState({ label: "Comma", value: "," });
  const [includeHeader, setIncludeHeader] = useState(true);
  const [selectedCols, setSelectedCols] = useState({});

  const systemCols = useMemo(
    () => ["$id", "$createdAt", "$updatedAt", "$permissions"],
    [],
  );

  const userColumnKeys = useMemo(() => {
    return columns.map((c) => c.key).filter((key) => !systemCols.includes(key));
  }, [columns, systemCols]);

  useEffect(() => {
    if (isOpen) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      setFilename(`${tableName || "table"}_export_${timestamp}.csv`);

      const initial = {};
      userColumnKeys.forEach((key) => {
        initial[key] = true;
      });
      setSelectedCols(initial);
    }
  }, [isOpen, tableName, userColumnKeys]);

  const toggleCol = (key) => {
    setSelectedCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    const next = {};
    userColumnKeys.forEach((key) => (next[key] = true));
    setSelectedCols(next);
  };

  const handleDeselectAll = () => {
    const next = {};
    userColumnKeys.forEach((key) => (next[key] = false));
    setSelectedCols(next);
  };

  const handleExport = () => {
    if (!filename) {
      Alert.alert("Error", "Please provide a filename");
      return;
    }

    const chosenUserCols = Object.entries(selectedCols)
      .filter(([_, selected]) => selected)
      .map(([key]) => key);

    // Combine system columns (mandatory) with user selections
    const finalCols = [...systemCols, ...chosenUserCols];

    onExport({
      filename,
      delimiter: delimiter.value,
      header: includeHeader,
      columns: finalCols,
    });
  };

  const delimiters = [
    { label: "Comma", value: "," },
    { label: "Semicolon", value: ";" },
    { label: "Tab", value: "\t" },
    { label: "Pipe", value: "|" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[350px]">
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
        </DialogHeader>

        <View className="gap-6 py-4">
          <View className="gap-2.5">
            <Text className="text-sm font-medium text-foreground">Columns</Text>
            <View className="flex-row gap-4 mb-1">
              <TouchableOpacity onPress={handleSelectAll}>
                <Text className="text-sm text-primary">Select all</Text>
              </TouchableOpacity>
              <Separator style={{ width: 1 }} className="h-5  " />
              <TouchableOpacity onPress={handleDeselectAll}>
                <Text className="text-sm text-primary">Deselect all</Text>
              </TouchableOpacity>
            </View>

            <View className="max-h-[200px] border border-border rounded-md bg-card">
              <ScrollView className="p-2">
                <View className="flex-row flex-wrap gap-x-6 gap-y-2">
                  {userColumnKeys.map((key) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleCol(key)}
                      className="flex-row items-center py-1 min-w-[100px]"
                    >
                      <Checkbox
                        checked={selectedCols[key]}
                        onCheckedChange={() => toggleCol(key)}
                      />
                      <Text className="ml-2.5 text-sm text-foreground">
                        {key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Text className="text-[10px] text-muted-foreground mt-1">
              Note: System columns ($id, $createdAt, etc.) are always included.
            </Text>
          </View>

          <View className="gap-4 border-t border-border pt-4">
            <Text className="text-sm font-medium text-foreground">
              Export options
            </Text>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Filename
              </Text>
              <Input
                value={filename}
                onChangeText={setFilename}
                placeholder="export.csv"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground mb-1">
                Delimiter
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-row items-center justify-between px-3 border-border"
                    style={{ borderColor: "#333232ff" }}
                  >
                    <Text className="text-sm">
                      {delimiter ? delimiter.label : "Select delimiter"}
                    </Text>
                    <Icon as={ChevronDown} size={14} color="gray" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  {delimiters.map((d) => (
                    <DropdownMenuItem
                      key={d.value}
                      onPress={() => setDelimiter(d)}
                    >
                      <Text>{d.label}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </View>

            <View className="flex-row items-center gap-2">
              <Checkbox
                checked={includeHeader}
                onCheckedChange={setIncludeHeader}
              />
              <View>
                <Text className="text-sm font-medium text-foreground">
                  Include header row
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Column names will be added as the first row in the CSV
                </Text>
              </View>
            </View>
          </View>
        </View>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            style={{ borderColor: "#333232ff" }}
            onPress={onClose}
            disabled={isExporting}
          >
            <Text className="text-muted-foreground">Cancel</Text>
          </Button>
          <Button
            onPress={handleExport}
            disabled={isExporting}
            className="bg-primary"
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Export</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Rows = ({ databaseId, tableId }) => {
  const { currentProject } = useProjectStore();
  const {
    fetchRows,
    fetchColumns,
    importCSV,
    exportCSV,
    fetchMigrations,
    updateMigrationState,
    migrations,
    loading: storeLoading,
  } = useDatabaseStore();
  const { createFile, createConsoleFile, fetchBuckets, buckets } =
    useBucketStore();

  const [rows, setRows] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState([]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const allAvailableColumns = useMemo(() => {
    const system = [
      { key: "$id", label: "ID", fixed: true },
      { key: "$createdAt", label: "Created At", fixed: true },
      { key: "$updatedAt", label: "Updated At", fixed: true },
    ];
    return [...system, ...columns.map((c) => ({ key: c.key, label: c.key }))];
  }, [columns]);

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
      if (visibleColumnKeys.length === 0) {
        const initialVisible = [
          "$id",
          "$createdAt",
          "$updatedAt",
          ...cols.map((c) => c.key),
        ];
        setVisibleColumnKeys(initialVisible);
      }
    } catch (err) {
      console.error("Error loading columns:", err);
    } finally {
      setIsLoadingColumns(false);
    }
  }, [
    currentProject?.$id,
    databaseId,
    tableId,
    fetchColumns,
    visibleColumnKeys.length,
  ]);

  const loadRows = useCallback(
    async (
      query = "",
      isNextPage = false,
      currentLimit = 25,
      forceRefresh = false,
      filters = [],
      cursorAfter = undefined,
    ) => {
      if (!currentProject || !databaseId || !tableId) return;

      if (isNextPage) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
        setRows([]);
      }
      setError(null);
      try {
        const queries = [];
        if (query) {
          queries.push(Query.contains("$id", query));
        }

        // Add complex filters from modal
        filters.forEach((f) => {
          if (f.operator === "isNull") {
            queries.push(Query.isNull(f.column));
          } else if (f.operator === "isNotNull") {
            queries.push(Query.isNotNull(f.column));
          } else if (f.operator === "startsWith") {
            queries.push(Query.startsWith(f.column, f.value));
          } else if (f.operator === "endsWith") {
            queries.push(Query.endsWith(f.column, f.value));
          } else if (f.operator === "greaterThan") {
            queries.push(Query.greaterThan(f.column, f.value));
          } else if (f.operator === "greaterThanEqual") {
            queries.push(Query.greaterThanEqual(f.column, f.value));
          } else if (f.operator === "lessThan") {
            queries.push(Query.lessThan(f.column, f.value));
          } else if (f.operator === "lessThanEqual") {
            queries.push(Query.lessThanEqual(f.column, f.value));
          } else if (f.operator === "contains") {
            queries.push(Query.contains(f.column, f.value));
          } else if (f.operator === "notEqual") {
            queries.push(Query.notEqual(f.column, f.value));
          } else {
            queries.push(Query.equal(f.column, f.value));
          }
        });

        const cursorAfterToUse = cursorAfter;

        const newRows = await fetchRows(
          currentProject.$id,
          currentProject.region || "fra",
          databaseId,
          tableId,
          {
            queries,
            isNextPage,
            forceRefresh,
            limit: currentLimit,
            cursorAfter: cursorAfterToUse,
          },
        );

        setRows((prev) => (isNextPage ? [...prev, ...newRows] : newRows));
        setHasMore(newRows.length === currentLimit);
      } catch (err) {
        console.error("Error loading rows:", err);
        setError("Failed to load rows");
        Alert.alert("Error", "Failed to fetch data with current filters.");
      } finally {
        setIsLoadingMore(false);
        setIsInitialLoading(false);
      }
    },
    [currentProject?.$id, databaseId, tableId, fetchRows],
  );

  const formattedRows = useMemo(() => {
    return rows.map((row) => {
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
  }, [rows, columns]);

  useEffect(() => {
    loadColumns();
  }, [loadColumns]);

  useEffect(() => {
    loadRows(searchQuery, false, limit, false, activeFilters);
  }, [loadRows, limit, searchQuery, activeFilters]);

  const activeMigrations = useMemo(() => {
    return migrations.filter(
      (m) =>
        ["csv"].includes(m.source.toLowerCase()) &&
        m.resourceId === `${databaseId}:${tableId}` &&
        ["pending", "processing"].includes(m.status),
    );
  }, [migrations, databaseId, tableId]);

  useEffect(() => {
    if (!currentProject) return;

    fetchMigrations(currentProject.$id, currentProject.region || "fra", [
      Query.equal("source", "CSV"),
      Query.equal("status", ["pending", "processing"]),
    ]);

    const unsubscribe = realtime.forConsole(
      currentProject.region || "fra",
      "console",
      (response) => {
        if (!response.channels.includes(`projects.${currentProject.$id}`))
          return;
        if (response.events.includes("migrations.*")) {
          const migration = response.payload;
          if (
            ["csv"].includes(migration.source.toLowerCase()) &&
            migration.resourceId === `${databaseId}:${tableId}`
          ) {
            updateMigrationState(migration);
            if (migration.status === "completed") {
              loadRows(searchQuery, false, limit, true, activeFilters);
            }
          }
        }
      },
    );

    return () => unsubscribe();
  }, [
    currentProject?.$id,
    databaseId,
    tableId,
    loadRows,
    searchQuery,
    limit,
    activeFilters,
  ]);

  const getMigrationProgress = (status) => {
    switch (status) {
      case "pending":
        return 10;
      case "processing":
        return 30;
      case "uploading":
        return 60;
      case "completed":
      case "failed":
        return 100;
      default:
        return 30;
    }
  };

  const copyToClipboard = useCallback(async (text) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid?.show?.("Copied to clipboard", ToastAndroid.SHORT);
  }, []);

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore && rows.length > 0) {
      const lastId = rows[rows.length - 1].$id;
      loadRows(searchQuery, true, limit, false, activeFilters, lastId);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const handleRefresh = useCallback(() => {
    loadRows(searchQuery, false, limit, true, activeFilters);
  }, [loadRows, searchQuery, limit, activeFilters]);

  const handleImportCSV = async () => {
    if (!currentProject) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setIsLoadingMore(true);

      // Upload file to console level storage (project 'console', bucket 'default')
      const uploadedFile = await createConsoleFile(
        currentProject.region || "fra",
        "default",
        {
          name: file.name,
          type: "text/csv", // Force text/csv for migrations
          size: file.size,
          uri: file.uri,
        },
      );

      // Trigger import with bucketId as 'default' and internalFile: true
      await importCSV(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        tableId,
        "default",
        uploadedFile.$id,
        true, // internalFile: true
      );

      ToastAndroid?.show?.(
        "CSV import process triggered successfully.",
        ToastAndroid.LONG,
      );
    } catch (err) {
      console.error("Error importing CSV:", err);
      Alert.alert("Error", err.message || "Failed to import CSV");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleExportCSV = async ({
    filename,
    delimiter,
    header,
    columns: exportCols,
  }) => {
    if (!currentProject) return;

    setIsExporting(true);
    try {
      await exportCSV(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        tableId,
        filename,
        exportCols,
        [],
        delimiter,
        header,
      );

      setIsExportModalOpen(false);
      ToastAndroid?.show?.(
        "CSV export process started successfully.",
        ToastAndroid.LONG,
      );
    } catch (err) {
      console.error("Error exporting CSV:", err);
      Alert.alert("Error", err.message || "Failed to start export");
    } finally {
      setIsExporting(false);
    }
  };

  const tableColumns = useMemo(() => {
    const baseColumns = [
      { id: "select", width: 50 },
      {
        id: "$id",
        accessorKey: "$id",
        header: "ID",
        width: 200,
        hidden: !visibleColumnKeys.includes("$id"),
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
      .filter(
        (col) =>
          col.status === "available" && visibleColumnKeys.includes(col.key),
      )
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
        hidden: !visibleColumnKeys.includes("$createdAt"),
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
        hidden: !visibleColumnKeys.includes("$updatedAt"),
        cell: ({ row }) => (
          <Text className="text-muted-foreground text-xs">
            {row.original.$formattedUpdatedAt}
          </Text>
        ),
      },
    ];

    return [
      ...baseColumns.filter((c) => !c.hidden),
      ...attrColumns,
      ...metaColumns.filter((c) => !c.hidden),
    ];
  }, [columns, visibleColumnKeys]);

  if ((isInitialLoading && rows.length === 0) || isLoadingColumns) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#FD366E" />
        <Text className="text-muted-foreground mt-4">Loading rows...</Text>
      </View>
    );
  }

  const displayRows = formattedRows;

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
          onPress={() => setIsColumnModalOpen(true)}
        >
          <FontAwesome name="bars" size={16} color="gray" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          style={{ borderWidth: 1, borderColor: "gray" }}
          className="h-10 bg-input"
          onPress={() => setIsFilterModalOpen(true)}
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
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 bg-input"
          style={{ borderWidth: 1, borderColor: "gray" }}
          onPress={() => setIsExportModalOpen(true)}
        >
          <Icon as={Download} size={16} color="gray" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 bg-input"
          style={{ borderWidth: 1, borderColor: "gray" }}
          onPress={handleRefresh}
        >
          <Icon as={RefreshCcw} size={16} color="gray" />
        </Button>
        <Button
          size="sm"
          className="h-10 px-3 bg-primary"
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Icon as={Plus} size={18} color="white" />
        </Button>
      </View>

      {activeFilters.length > 0 && (
        <View className="px-4 py-2 border-b border-border bg-muted/10">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2">
              <Text className="text-[10px] text-muted-foreground uppercase font-bold mr-1">
                Filters:
              </Text>
              {activeFilters.map((f) => (
                <View
                  key={f.id}
                  className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 flex-row items-center gap-2"
                >
                  <Text className="text-xs text-primary font-medium">
                    {f.column} {f.operatorLabel.toLowerCase()}{" "}
                    {f.value !== null && `"${f.value}"`}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setActiveFilters((prev) =>
                        prev.filter((item) => item.id !== f.id),
                      )
                    }
                  >
                    <Icon as={X} size={12} color="#FD366E" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setActiveFilters([])}
                className="ml-2"
              >
                <Text className="text-xs text-muted-foreground underline">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {activeMigrations.length > 0 && (
        <View className="px-4 py-3 bg-muted/20 border-b border-border">
          {activeMigrations.map((m) => (
            <View key={m.$id} className="mb-2 last:mb-0">
              <View className="flex-row justify-between mb-1.5">
                <View className="flex-row items-center">
                  <ActivityIndicator
                    size="small"
                    color="#FD366E"
                    style={{ marginRight: 6, transform: [{ scale: 0.8 }] }}
                  />
                  <Text className="text-xs font-medium text-foreground">
                    {m.destination.toLowerCase() === "csv"
                      ? "Exporting CSV rows..."
                      : "Importing CSV rows..."}
                  </Text>
                </View>
                <Text className="text-[10px] text-muted-foreground uppercase font-bold">
                  {m.status}
                </Text>
              </View>
              <Progress
                value={getMigrationProgress(m.status)}
                className="h-1"
              />
            </View>
          ))}
        </View>
      )}

      {rows.length === 0 && !isInitialLoading ? (
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
              onPress={() => setIsCreateModalOpen(true)}
            >
              <Text className="text-white font-bold">Create First Row</Text>
            </Button>
          )}
        </View>
      ) : (
        <View className="flex-1">
          <DataTable
            data={displayRows}
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

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        columns={columns}
        tableName={tableId}
        onExport={handleExportCSV}
        isExporting={isExporting}
      />

      <ColumnSelectionModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        allColumns={allAvailableColumns}
        visibleColumnKeys={visibleColumnKeys}
        onApply={(selectedKeys) => {
          setVisibleColumnKeys(selectedKeys);
          setIsColumnModalOpen(false);
        }}
      />

      <DataFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        columns={columns}
        activeFilters={activeFilters}
        onApply={(filters) => {
          setActiveFilters(filters);
          setIsFilterModalOpen(false);
        }}
      />

      <CreateRowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        columns={columns}
        databaseId={databaseId}
        tableId={tableId}
        onRowCreated={() => {
          loadRows(searchQuery, false, limit, true, activeFilters);
        }}
      />
    </View>
  );
};

export default memo(Rows);
