import React, {
  useState,
  useMemo,
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  InteractionManager,
  Animated,
} from "react-native";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableColumn,
  TableColumnHeader,
  TableColumnCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Icon } from "../ui/icon";
import { Search, SlidersHorizontal, Trash2, X } from "lucide-react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";

const DataRow = memo(
  ({
    item,
    index,
    displayedColumns,
    onRowPress,
    isSelected,
    toggleSelectRow,
    showGridLines,
    ROW_HEIGHT,
    selectColumnKey,
    scrollX,
  }) => {
    return (
      <View className="flex-row">
        {displayedColumns.map((column) => {
          const isSticky = column.id === "select";
          return (
            <View
              key={`cell-${item.$id || item.id || "row"}-${column.id || column.accessorKey}`}
              className={cn(showGridLines && "border-r border-border")}
              style={{
                width: column.width || 150,
                zIndex: isSticky ? 50 : 0,
              }}
            >
              <Animated.View
                style={
                  isSticky
                    ? {
                        transform: [{ translateX: scrollX }],
                        zIndex: 50,
                        height: ROW_HEIGHT,
                        backgroundColor:
                          index % 2 === 0 ? "#09090b" : "#121215", // Ensure solid background (approximate dark theme colors)
                      }
                    : { height: ROW_HEIGHT }
                }
              >
                <TableColumnCell
                  style={{ height: ROW_HEIGHT, flex: 1 }}
                  className={cn(
                    !isSticky &&
                      (index % 2 === 0 ? "bg-background" : "bg-muted/10"),
                  )}
                >
                  {column.id === "select" ? (
                    <TouchableOpacity
                      onPress={() => toggleSelectRow(item.$id || item.id)}
                      className="flex-1 w-full items-center justify-center"
                    >
                      {isSelected ? (
                        <Checkbox
                          checked={true}
                          onCheckedChange={() =>
                            toggleSelectRow(item.$id || item.id)
                          }
                        />
                      ) : selectColumnKey &&
                        item[selectColumnKey] !== undefined ? (
                        <Text className="text-muted-foreground text-xs font-mono">
                          {item[selectColumnKey]}
                        </Text>
                      ) : (
                        <Checkbox
                          checked={false}
                          onCheckedChange={() =>
                            toggleSelectRow(item.$id || item.id)
                          }
                        />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={onRowPress ? 0.7 : 1}
                      onPress={() => onRowPress?.(item)}
                      className="flex-1 w-full justify-center px-4"
                      disabled={!onRowPress || column.id === "actions"}
                    >
                      {column.cell ? (
                        column.cell({ row: { original: item } })
                      ) : (
                        <Text
                          className="text-foreground text-sm"
                          numberOfLines={1}
                        >
                          {item[column.accessorKey]}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </TableColumnCell>
              </Animated.View>
            </View>
          );
        })}
      </View>
    );
  },
);

const DataTable = memo(
  ({
    data,
    columns,
    onRowPress,
    searchPlaceholder = "Search...",
    filterKey = "name",
    pagination = true,
    itemsPerPage = 10,
    showSearch = false,
    showColumnSelector = false,
    onDeleteSelected,
    showGridLines = false,
    onEndReached,
    onEndReachedThreshold = 0.5,
    isLoadingMore = false,
    selectColumnKey = null,
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleColumns, setVisibleColumns] = useState(
      columns
        .filter((col) => !col.hidden)
        .map((col) => col.id || col.accessorKey),
    );
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [page, setPage] = useState(0);

    // Sync visible columns when columns prop changes (e.g. after data load)
    const columnsHash = columns
      .map((c) => `${c.id || c.accessorKey}:${c.hidden ? "h" : "v"}`)
      .join("|");

    useEffect(() => {
      setVisibleColumns(
        columns
          .filter((col) => !col.hidden)
          .map((col) => col.id || col.accessorKey),
      );
    }, [columnsHash]); // Rely on hash to avoid unnecessary resets on re-renders

    // Filtering
    const filteredData = useMemo(() => {
      if (!searchQuery) return data;
      return data.filter((item) => {
        const value = item[filterKey];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    }, [data, searchQuery, filterKey]);

    // Pagination
    const paginatedData = useMemo(() => {
      if (!pagination) return filteredData;
      const start = page * itemsPerPage;
      return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page, itemsPerPage, pagination]);

    const toggleColumn = useCallback((columnId) => {
      InteractionManager.runAfterInteractions(() => {
        setVisibleColumns((prev) =>
          prev.includes(columnId)
            ? prev.filter((id) => id !== columnId)
            : [...prev, columnId],
        );
      });
    }, []);

    const toggleSelectAll = useCallback(() => {
      if (selectedRows.size === paginatedData.length) {
        setSelectedRows(new Set());
      } else {
        setSelectedRows(
          new Set(paginatedData.map((item) => item.$id || item.id)),
        );
      }
    }, [paginatedData, selectedRows.size]);

    const toggleSelectRow = useCallback((id) => {
      setSelectedRows((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        return newSelected;
      });
    }, []);

    const displayedColumns = useMemo(
      () =>
        columns.filter(
          (col) =>
            visibleColumns.includes(col.id || col.accessorKey) ||
            col.id === "actions" ||
            col.id === "select",
        ),
      [columns, visibleColumns],
    );

    const ROW_HEIGHT = 60;
    const scrollX = useRef(new Animated.Value(0)).current;

    return (
      <View className="w-full flex-1">
        {(showSearch || showColumnSelector) && (
          <View className="flex-row items-center py-4 px-1 gap-2">
            {showSearch && (
              <View className="flex-1 relative">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="pl-10 h-10"
                />
                <View className="absolute left-3 top-2.5">
                  <Icon
                    as={Search}
                    size={18}
                    className="text-muted-foreground"
                  />
                </View>
              </View>
            )}

            {showColumnSelector && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-row items-center gap-2"
                  >
                    <Icon as={SlidersHorizontal} size={16} color="gray" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {columns
                    .filter(
                      (col) => col.id !== "actions" && col.id !== "select",
                    )
                    .map((column) => {
                      const id = column.id || column.accessorKey;
                      return (
                        <DropdownMenuCheckboxItem
                          key={id}
                          checked={visibleColumns.includes(id)}
                          onCheckedChange={() => toggleColumn(id)}
                        >
                          <Text className="capitalize text-muted-foreground">
                            {column.header || id}
                          </Text>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </View>
        )}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
        >
          <View className="flex-1">
            {/* Sticky Header Row */}
            <View className="flex-row" style={{ backgroundColor: "#19191c" }}>
              {displayedColumns.map((column) => {
                const isSticky = column.id === "select";
                return (
                  <Animated.View
                    key={`header-${column.id || column.accessorKey}`}
                    style={
                      isSticky
                        ? {
                            transform: [{ translateX: scrollX }],
                            zIndex: 100,
                            width: column.width || 150,
                            backgroundColor: "#0d0d12ff", // Ensure solid header background
                          }
                        : {
                            width: column.width || 150,
                          }
                    }
                  >
                    <TableColumnHeader
                      className="justify-center items-center h-12 border-b border-r border-border"
                      style={{ width: "100%", backgroundColor: "#0d0d12ff" }}
                    >
                      {column.id === "select" ? (
                        <View className="flex-1 items-center justify-center">
                          <Checkbox
                            checked={
                              selectedRows.size === paginatedData.length &&
                              paginatedData.length > 0
                            }
                            onCheckedChange={toggleSelectAll}
                          />
                        </View>
                      ) : (
                        column.header
                      )}
                    </TableColumnHeader>
                  </Animated.View>
                );
              })}
            </View>

            {/* Scrollable Body - Using FlatList for Virtualization */}
            <FlatList
              data={paginatedData}
              renderItem={({ item, index }) => (
                <DataRow
                  item={item}
                  index={index}
                  displayedColumns={displayedColumns}
                  onRowPress={onRowPress}
                  isSelected={selectedRows.has(item.$id || item.id)}
                  toggleSelectRow={toggleSelectRow}
                  showGridLines={showGridLines}
                  ROW_HEIGHT={ROW_HEIGHT}
                  selectColumnKey={selectColumnKey}
                  scrollX={scrollX}
                />
              )}
              keyExtractor={(item, index) =>
                item.$id || item.id || String(index)
              }
              onEndReached={onEndReached}
              onEndReachedThreshold={onEndReachedThreshold}
              ListFooterComponent={() =>
                isLoadingMore ? (
                  <View className="py-4 items-center justify-center">
                    <Text className="text-muted-foreground text-xs font-medium">
                      Loading more...
                    </Text>
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={true} // Performance optimization
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              getItemLayout={(data, index) => ({
                length: ROW_HEIGHT,
                offset: ROW_HEIGHT * index,
                index,
              })}
            />
          </View>
        </Animated.ScrollView>
        {paginatedData.length === 0 && (
          <View className="h-32 items-center justify-center p-4">
            <Text className="text-muted-foreground italic">
              No results found.
            </Text>
          </View>
        )}

        {pagination && filteredData.length > itemsPerPage && (
          <View className="flex-row items-center justify-between py-4 px-1">
            <Text className="text-muted-foreground text-xs">
              {selectedRows.size > 0
                ? `${selectedRows.size} row(s) selected`
                : `Total: ${filteredData.length} items`}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <Text className="text-lg text-foreground font-medium">
                    Previous
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  className="bg-primary"
                  size="sm"
                  disabled={(page + 1) * itemsPerPage >= filteredData.length}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <Text className="text-lg text-white font-medium">Next</Text>
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Selection Actions Toast */}
        {selectedRows.size > 0 && (
          <View
            style={{
              position: "absolute",
              bottom: 20,
              alignSelf: "center",
              backgroundColor: "#1C1C1E",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              zIndex: 1000,
              width: 320,
            }}
          >
            <View className="flex-row items-center gap-4">
              <Text className="text-white font-medium">
                {selectedRows.size} {selectedRows.size === 1 ? "item" : "items"}{" "}
                selected
              </Text>
            </View>

            <View className="flex-row items-center gap-1 ml-2">
              <TouchableOpacity
                onPress={() => {
                  if (onDeleteSelected) {
                    onDeleteSelected(Array.from(selectedRows));
                  }
                  setSelectedRows(new Set());
                }}
                className="bg-destructive px-4 py-2 rounded-lg flex-row items-center gap-2"
              >
                <Icon as={Trash2} size={16} color="white" />
                <Text className="text-white font-semibold">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedRows(new Set())}
                className="bg-muted/20 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-xs font-medium uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  },
);

export default DataTable;
