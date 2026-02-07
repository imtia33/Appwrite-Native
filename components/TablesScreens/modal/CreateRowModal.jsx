import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Checkbox } from "../../ui/checkbox";

import { Textarea } from "../../ui/textarea";
import useDatabaseStore from "../../../appwrite/data-services/databaseService";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import { ID } from "@appwrite.io/console";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Icon } from "../../ui/icon";
import { Plus, X, Calendar, ChevronDown } from "lucide-react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const CreateRowModal = ({
  isOpen,
  onClose,
  columns,
  databaseId,
  tableId,
  onRowCreated,
}) => {
  const { currentProject } = useProjectStore();
  const { createRow } = useDatabaseStore();

  const [formData, setFormData] = useState({});
  const [rowId, setRowId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomId, setUseCustomId] = useState(false);

  // Date Picker State
  const [datePickerState, setDatePickerState] = useState({
    show: false,
    columnKey: null,
    mode: "date", // 'date' or 'time'
    value: new Date(),
  });

  // Array Input State (Temporary storage for adding items)
  const [arrayInputs, setArrayInputs] = useState({});

  // Filter out system columns and prepare initial state
  const availableColumns = useMemo(() => {
    return columns.filter(
      (col) =>
        ![
          "$id",
          "$createdAt",
          "$updatedAt",
          "$permissions",
          "$databaseId",
          "$collectionId",
        ].includes(col.key),
    );
  }, [columns]);

  useEffect(() => {
    if (isOpen) {
      const initialData = {};
      const initialArrayInputs = {};

      availableColumns.forEach((col) => {
        if (col.array) {
          initialData[col.key] = [];
          initialArrayInputs[col.key] = "";
        } else if (col.type === "boolean") {
          initialData[col.key] = col.default || false;
        } else if (col.type === "datetime") {
          initialData[col.key] = null; // null for datetime usually means not set
        } else {
          initialData[col.key] = col.default || "";
        }
      });
      setFormData(initialData);
      setArrayInputs(initialArrayInputs);
      setRowId("");
      setUseCustomId(false);
    }
  }, [isOpen, availableColumns]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayInputChange = (key, value) => {
    setArrayInputs((prev) => ({ ...prev, [key]: value }));
  };

  const addArrayItem = (colKey) => {
    const valueToAdd = arrayInputs[colKey];
    if (!valueToAdd && valueToAdd !== 0) return; // Prevent empty adds (unless 0 for number)

    // Type conversion for array item
    const col = availableColumns.find((c) => c.key === colKey);
    let finalValue = valueToAdd;

    if (col) {
      if (col.type === "integer" || col.type === "double") {
        finalValue = Number(valueToAdd);
        if (isNaN(finalValue)) {
          ToastAndroid.show("Please enter a valid number.", ToastAndroid.SHORT);
          return;
        }
      }
      // Add other type validations if needed
    }

    setFormData((prev) => ({
      ...prev,
      [colKey]: [...(prev[colKey] || []), finalValue],
    }));
    setArrayInputs((prev) => ({ ...prev, [colKey]: "" }));
  };

  const removeArrayItem = (colKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [colKey]: (prev[colKey] || []).filter((_, i) => i !== index),
    }));
  };

  const onDateChange = (event, selectedDate) => {
    const { columnKey, mode } = datePickerState;

    // Close picker immediately on Android
    if (Platform.OS === "android") {
      setDatePickerState((prev) => ({ ...prev, show: false }));
    }

    if (event.type === "dismissed") return;

    if (selectedDate && columnKey) {
      // Formating to ISO string for Appwrite: YYYY-MM-DDThh:mm:ss.sss+00:00
      // We will just store the ISO string.
      handleChange(columnKey, selectedDate.toISOString());
    }
  };

  const showDatePicker = (key, currentVal) => {
    setDatePickerState({
      show: true,
      columnKey: key,
      mode: "date", // Can be enhanced to pick time too
      value: currentVal ? new Date(currentVal) : new Date(),
    });
  };

  const handleSubmit = async () => {
    if (!currentProject) return;
    setIsSubmitting(true);

    try {
      // Process data types
      const processedData = {};

      for (const col of availableColumns) {
        let value = formData[col.key];

        if (col.array) {
          // Already an array in state
          processedData[col.key] = value || [];
          continue;
        }

        if (col.type === "integer" || col.type === "double") {
          if (value === "" || value === null) {
            processedData[col.key] = null;
          } else {
            const num = Number(value);
            if (isNaN(num))
              throw new Error(`Invalid number for column ${col.key}`);
            processedData[col.key] = num;
          }
        } else if (col.type === "boolean") {
          processedData[col.key] = Boolean(value);
        } else if (col.type === "datetime") {
          // value is already ISO string or null
          processedData[col.key] = value || null;
        } else {
          // Empty strings for text fields? Appwrite might prefer null if not required.
          // For now sending empty string if it's set to empty string.
          // If it's a relationship (type string usually), we send null if empty.
          if (value === "") value = null;
          processedData[col.key] = value;
        }
      }

      // Check row ID
      const finalRowId = useCustomId && rowId ? rowId : ID.unique();

      await createRow(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        tableId,
        processedData,
        [], // permissions - keeping generic for now
        finalRowId,
      );

      if (onRowCreated) {
        onRowCreated();
        ToastAndroid.show("Row created successfully", ToastAndroid.SHORT);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create row:", error);
      ToastAndroid.show(
        error.message || "Failed to create row",
        ToastAndroid.LONG,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (col) => {
    const value = formData[col.key];

    // Array Handling
    if (col.array) {
      const currentList = value || [];
      return (
        <View className="gap-2">
          <Label>
            {col.key} (Array of {col.type})
          </Label>

          {/* List of items */}
          <View className="flex-row flex-wrap gap-2 mb-2">
            {currentList.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center bg-secondary px-2 py-1 rounded-md"
              >
                <Text className="text-secondary-foreground mr-1">
                  {String(item)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeArrayItem(col.key, index)}
                >
                  <Icon as={X} size={14} color="gray" />
                </TouchableOpacity>
              </View>
            ))}
            {currentList.length === 0 && (
              <Text className="text-muted-foreground text-xs italic">
                No items added
              </Text>
            )}
          </View>

          {/* Add Item Input */}
          <View className="flex-row gap-2">
            <Input
              className="flex-1 h-9"
              value={arrayInputs[col.key] || ""}
              onChangeText={(text) => handleArrayInputChange(col.key, text)}
              placeholder={`Add ${col.type} item`}
              keyboardType={
                col.type === "integer" || col.type === "double"
                  ? "numeric"
                  : "default"
              }
              onSubmitEditing={() => addArrayItem(col.key)}
            />
            <Button
              size="sm"
              variant="outline"
              onPress={() => addArrayItem(col.key)}
              className="h-9 w-9 p-0"
            >
              <Icon as={Plus} size={16} color="gray" />
            </Button>
          </View>
        </View>
      );
    }

    if (col.type === "boolean") {
      return (
        <View className="flex-row items-center justify-between py-2 border border-transparent">
          <Label className="text-foreground">{col.key}</Label>
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => handleChange(col.key, checked)}
          />
        </View>
      );
    }

    if (col.type === "datetime") {
      return (
        <View className="gap-2">
          <Label>{col.key}</Label>
          <View className="flex-row gap-2">
            <Button
              style={{ borderColor: "#454545ff" }}
              variant="outline"
              onPress={() => showDatePicker(col.key, value)}
              className="flex-1 justify-start "
            >
              <Icon as={Calendar} size={16} color="gray" className="mr-2" />
              <Text
                className={value ? "text-foreground" : "text-muted-foreground"}
              >
                {value ? new Date(value).toLocaleString() : "Pick date & time"}
              </Text>
            </Button>
            {value && (
              <Button
                variant="ghost"
                size="icon"
                onPress={() => handleChange(col.key, null)}
              >
                <Icon as={X} size={16} color="gray" />
              </Button>
            )}
          </View>
        </View>
      );
    }

    if (col.type === "enum") {
      return (
        <View className="gap-2">
          <Label>{col.key}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-row items-center justify-between px-3 border-input"
              >
                <Text
                  className={
                    value ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {value || `Select ${col.key}`}
                </Text>
                <Icon as={ChevronDown} size={16} color="gray" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {col.elements &&
                col.elements.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onPress={() => handleChange(col.key, opt)}
                  >
                    <Text className="text-foreground">{opt}</Text>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      );
    }

    if (col.type === "integer" || col.type === "double") {
      return (
        <View className="gap-2">
          <Label>{col.key}</Label>
          <Input
            value={String(value === null ? "" : value)}
            onChangeText={(text) => handleChange(col.key, text)}
            keyboardType="numeric"
            placeholder={`Enter ${col.type}`}
          />
        </View>
      );
    }

    if (col.size > 255) {
      return (
        <View className="gap-2">
          <Label>{col.key}</Label>
          <Textarea
            value={String(value || "")}
            onChangeText={(text) => handleChange(col.key, text)}
            placeholder={`Enter ${col.key}`}
          />
        </View>
      );
    }

    return (
      <View className="gap-2">
        <Label>{col.key}</Label>
        <Input
          value={String(value || "")}
          onChangeText={(text) => handleChange(col.key, text)}
          placeholder={`Enter ${col.key}`}
        />
      </View>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ height: 650 }} className="max-w-[350px] ">
        <DialogHeader>
          <DialogTitle>Create Row</DialogTitle>
        </DialogHeader>

        <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="gap-4">
              {/* Row ID Section */}
              <View className="gap-2 mb-2">
                <View className="flex-row items-center gap-2">
                  <Checkbox
                    checked={useCustomId}
                    onCheckedChange={setUseCustomId}
                  />
                  <Label onPress={() => setUseCustomId(!useCustomId)}>
                    Custom ID
                  </Label>
                </View>
                {useCustomId && (
                  <Input
                    value={rowId}
                    onChangeText={setRowId}
                    placeholder="unique()"
                  />
                )}
              </View>

              {availableColumns.map((col) => (
                <View key={col.key}>{renderInput(col)}</View>
              ))}
            </View>
          </KeyboardAvoidingView>
          <View className="h-20"></View>
        </ScrollView>

        <DialogFooter className="flex-row items-center justify-center gap-3 border-t border-border pt-4">
          <Button
            style={{ borderColor: "#454545ff" }}
            variant="outline"
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text className="text-foreground">Cancel</Text>
          </Button>
          <Button onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white">Create</Text>
            )}
          </Button>
        </DialogFooter>

        {datePickerState.show && (
          <DateTimePicker
            value={datePickerState.value}
            mode={datePickerState.mode}
            display="default"
            onChange={onDateChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRowModal;
