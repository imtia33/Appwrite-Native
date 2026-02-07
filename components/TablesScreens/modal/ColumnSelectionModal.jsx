import React, { useState, useEffect, memo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Separator } from "../../ui/separator";
import { cn } from "../../../lib/utils";

const ColumnSelectionModal = ({
  isOpen,
  onClose,
  allColumns,
  visibleColumnKeys,
  onApply,
}) => {
  const [selectedCols, setSelectedCols] = useState(visibleColumnKeys);

  useEffect(() => {
    if (isOpen) {
      setSelectedCols(visibleColumnKeys);
    }
  }, [isOpen, visibleColumnKeys]);

  const toggleCol = useCallback(
    (key) => {
      setSelectedCols((prev) => {
        const isFixed = allColumns.find((c) => c.key === key)?.fixed;
        if (isFixed) return prev;
        return prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key];
      });
    },
    [allColumns],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedCols(allColumns.map((c) => c.key));
  }, [allColumns]);

  const handleDeselectAll = useCallback(() => {
    setSelectedCols(allColumns.filter((c) => c.fixed).map((c) => c.key));
  }, [allColumns]);

  const handleApply = useCallback(() => {
    onApply(selectedCols);
  }, [onApply, selectedCols]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[350px] self-center">
        <DialogHeader>
          <DialogTitle>Select Columns</DialogTitle>
        </DialogHeader>

        <View className="gap-6 py-4">
          <View className="flex-row gap-4 mb-2">
            <TouchableOpacity onPress={handleSelectAll}>
              <Text className="text-sm text-primary">Select all</Text>
            </TouchableOpacity>
            <Separator style={{ width: 1 }} className="h-5" />
            <TouchableOpacity onPress={handleDeselectAll}>
              <Text className="text-sm text-primary">Deselect all</Text>
            </TouchableOpacity>
          </View>
          <View className="max-h-[400px] border border-border rounded-md bg-card">
            <ScrollView
              className="p-2"
              getItemLayout={(data, index) => ({
                length: 40,
                offset: 40 * index,
                index,
              })}
            >
              <View className="flex-row flex-wrap gap-x-6 gap-y-2">
                {allColumns.map((col) => (
                  <ColumnItem
                    key={col.key}
                    col={col}
                    isSelected={selectedCols.includes(col.key)}
                    onToggle={toggleCol}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            style={{ borderColor: "#333232ff" }}
            onPress={onClose}
          >
            <Text className="text-muted-foreground">Cancel</Text>
          </Button>
          <Button onPress={handleApply} className="bg-primary">
            <Text className="text-white font-medium">Apply</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ColumnItem = memo(({ col, isSelected, onToggle }) => (
  <TouchableOpacity
    onPress={() => onToggle(col.key)}
    disabled={col.fixed}
    className={cn(
      "flex-row items-center py-1 min-w-[120px]",
      col.fixed && "opacity-50",
    )}
  >
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(col.key)}
      disabled={col.fixed}
    />
    <Text className="ml-2.5 text-sm text-foreground">
      {col.label || col.key}
    </Text>
  </TouchableOpacity>
));

export default memo(ColumnSelectionModal);
