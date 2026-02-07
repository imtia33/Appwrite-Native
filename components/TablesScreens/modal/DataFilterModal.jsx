import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Plus, X, ChevronDown } from "lucide-react-native";
import { Icon } from "../../ui/icon";
import { cn } from "../../../lib/utils";

const OPERATORS = {
  equal: {
    label: "Equal",
    types: ["string", "integer", "double", "boolean", "datetime"],
  },
  notEqual: {
    label: "Not Equal",
    types: ["string", "integer", "double", "boolean", "datetime"],
  },
  startsWith: { label: "Starts With", types: ["string"] },
  endsWith: { label: "Ends With", types: ["string"] },
  greaterThan: {
    label: "Greater Than",
    types: ["integer", "double", "datetime"],
  },
  greaterThanEqual: {
    label: "Greater Than Equal",
    types: ["integer", "double", "datetime"],
  },
  lessThan: { label: "Less Than", types: ["integer", "double", "datetime"] },
  lessThanEqual: {
    label: "Less Than Equal",
    types: ["integer", "double", "datetime"],
  },
  contains: { label: "Contains", types: ["string"] },
  isNull: {
    label: "Is Null",
    types: ["string", "integer", "double", "boolean", "datetime"],
    noInput: true,
  },
  isNotNull: {
    label: "Is Not Null",
    types: ["string", "integer", "double", "boolean", "datetime"],
    noInput: true,
  },
};

const DataFilterModal = ({
  isOpen,
  onClose,
  columns,
  onApply,
  activeFilters = [],
}) => {
  const [localFilters, setLocalFilters] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [value, setValue] = useState("");

  // Sync with current filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters);
    }
  }, [isOpen, activeFilters]);

  const filteredOperators = useMemo(() => {
    if (!selectedColumn) return [];
    return Object.entries(OPERATORS)
      .filter(([_, op]) => op.types.includes(selectedColumn.type))
      .map(([key, op]) => ({ key, label: op.label, noInput: op.noInput }));
  }, [selectedColumn]);

  const addCondition = () => {
    if (!selectedColumn || !selectedOperator) return;
    if (!selectedOperator.noInput && value === "") return;

    const newFilter = {
      id: Date.now().toString(),
      column: selectedColumn.key,
      operator: selectedOperator.key,
      operatorLabel: selectedOperator.label,
      value: selectedOperator.noInput ? null : value,
    };

    setLocalFilters([...localFilters, newFilter]);
    setSelectedOperator(null);
    setValue("");
  };

  const removeCondition = (id) => {
    setLocalFilters(localFilters.filter((f) => f.id !== id));
  };

  const handleApply = () => {
    let finalFilters = [...localFilters];

    // Check if there's a pending valid condition to auto-add
    const isValidPending =
      selectedColumn &&
      selectedOperator &&
      (selectedOperator.noInput || value !== "");

    if (isValidPending) {
      const pendingFilter = {
        id: Date.now().toString(),
        column: selectedColumn.key,
        operator: selectedOperator.key,
        operatorLabel: selectedOperator.label,
        value: selectedOperator.noInput ? null : value,
      };
      finalFilters.push(pendingFilter);
    }

    onApply(finalFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[350px] self-center">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <Text className="text-muted-foreground text-xs">
            Apply filter rules to refine the table view
          </Text>
        </DialogHeader>

        <View className="gap-6 py-4">
          <View className="gap-4">
            <View className="flex-row gap-2">
              <View className="flex-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-row items-center justify-between px-3 border-border"
                      style={{ borderColor: "#333232ff" }}
                    >
                      <Text
                        className={cn(
                          "text-sm",
                          !selectedColumn && "text-muted-foreground",
                        )}
                      >
                        {selectedColumn ? selectedColumn.key : "Select column"}
                      </Text>
                      <Icon as={ChevronDown} size={14} color="gray" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[180px]">
                    <ScrollView className="max-h-[300px] flex-1">
                      {columns.map((col) => (
                        <DropdownMenuItem
                          key={col.key}
                          onPress={() => {
                            setSelectedColumn(col);
                            setSelectedOperator(null);
                          }}
                        >
                          <Text>{col.key}</Text>
                        </DropdownMenuItem>
                      ))}
                    </ScrollView>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
              <View className="flex-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-row items-center justify-between px-3 border-border"
                      style={{ borderColor: "#333232ff" }}
                      disabled={!selectedColumn}
                    >
                      <Text
                        className={cn(
                          "text-sm",
                          !selectedOperator && "text-muted-foreground",
                        )}
                      >
                        {selectedOperator
                          ? selectedOperator.label
                          : "Select operator"}
                      </Text>
                      <Icon as={ChevronDown} size={14} color="gray" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[180px]">
                    <ScrollView className="max-h-[300px]">
                      {filteredOperators.map((op) => (
                        <DropdownMenuItem
                          key={op.key}
                          onPress={() => setSelectedOperator(op)}
                        >
                          <Text className="text-muted-foreground">{op.label}</Text>
                        </DropdownMenuItem>
                      ))}
                    </ScrollView>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
            </View>

            {selectedOperator && !selectedOperator.noInput && (
              <TextInput
                className="h-10 border border-border rounded-md px-3 text-foreground bg-card"
                placeholder="Enter value"
                value={value}
                onChangeText={setValue}
                placeholderTextColor="#666"
              />
            )}

            <Button
              variant="outline"
              className="flex-row items-center justify-center gap-2 border-dashed border-primary"
              style={{ borderWidth: 1, borderColor: "#FD366E" }}
              onPress={addCondition}
              disabled={
                !selectedColumn ||
                !selectedOperator ||
                (!selectedOperator.noInput && value === "")
              }
            >
              <Icon as={Plus} size={16} color="#FD366E" />
              <Text className="text-primary font-medium">Add Condition</Text>
            </Button>
          </View>

          {localFilters.length > 0 && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase">
                Active Conditions
              </Text>
              <ScrollView className="max-h-[150px]">
                <View className="flex-row flex-wrap gap-2">
                  {localFilters.map((filter) => (
                    <View
                      key={filter.id}
                      className="bg-muted/30 border border-border rounded-full px-3 py-1 flex-row items-center gap-2"
                    >
                      <Text className="text-xs text-foreground">
                        <Text className="font-bold">{filter.column}</Text>{" "}
                        {filter.operatorLabel.toLowerCase()}{" "}
                        {filter.value !== null && (
                          <Text className="font-bold">"{filter.value}"</Text>
                        )}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeCondition(filter.id)}
                      >
                        <Icon as={X} size={14} color="gray" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <DialogFooter className="flex-row justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            style={{ borderColor: "#333232ff" }}
            onPress={() => {
              setLocalFilters([]);
              onApply([]);
              onClose();
            }}
          >
            <Text className="text-muted-foreground">Clear all</Text>
          </Button>
          <Button onPress={handleApply} className="bg-primary">
            <Text className="text-white font-medium">Apply</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DataFilterModal);
