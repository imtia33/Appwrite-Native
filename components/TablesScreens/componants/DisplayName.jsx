import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, ToastAndroid } from "react-native";
import { Card } from "../../ui/card";
import { Icon } from "../../ui/icon";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { Input } from "../../ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../ui/accordion";
import { Eye, Plus, X, Check } from "lucide-react-native";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { sdk } from "../../../appwrite/appwrite";
import { useProjectStore } from "../../../appwrite/store/projectStore";

function getIconByType(type, format) {
  if (type === "string") {
    switch (format) {
      case "email":
        return (
          <MaterialCommunityIcons name="email-outline" size={18} color="gray" />
        );
      case "ip":
        return <Entypo name="location-pin" size={18} color="gray" />;
      case "url":
        return (
          <MaterialCommunityIcons name="link-variant" size={18} color="gray" />
        );
      case "enum":
        return (
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color="gray"
          />
        );
      default:
        return (
          <MaterialCommunityIcons name="format-text" size={18} color="gray" />
        );
    }
  }

  switch (type) {
    case "integer":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />;
    case "double":
    case "float":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />;
    case "boolean":
      return <FontAwesome name="toggle-on" size={18} color="gray" />;
    case "datetime":
      return <Ionicons name="calendar-clear-sharp" size={18} color="gray" />;
    case "point":
      return (
        <MaterialCommunityIcons name="dots-triangle" size={18} color="gray" />
      );
    case "linestring":
      return <Entypo name="flow-line" size={18} color="gray" />;
    case "polygon":
      return <FontAwesome5 name="draw-polygon" size={18} color="gray" />;
    case "relationship":
      return <FontAwesome5 name="arrow-right" size={18} color="gray" />;
    default:
      return null;
  }
}

const DisplayName = ({ databaseId, collectionId }) => {
  const { currentProject } = useProjectStore();

  const [displayNames, setDisplayNames] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [names, setNames] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load attributes and current preferences
  useEffect(() => {
    const init = async () => {
      if (currentProject && databaseId && collectionId) {
        try {
          const projectSdk = sdk.forProject(
            currentProject.region || "fra",
            currentProject.$id,
          );

          // Parallel fetch attributes and preferences
          const [attrRes, prefRes] = await Promise.all([
            projectSdk.databases.listAttributes(databaseId, collectionId),
            sdk.forConsole.account.getPrefs(),
          ]);

          setAttributes(attrRes.attributes || []);

          const prefKey = `displayNames_${collectionId}`;
          const savedNames = prefRes[prefKey] || [];
          setDisplayNames(savedNames);
        } catch (err) {
          console.error("Error loading DisplayName data:", err);
        }
      }
    };
    init();
  }, [currentProject, databaseId, collectionId]);

  // Sync names with displayNames when displayNames change
  useEffect(() => {
    setNames(displayNames.length > 0 ? [...displayNames] : []);
  }, [displayNames]);

  // Get valid string columns (non-array)
  const getValidColumns = () => {
    return attributes.filter((attr) => attr.type === "string" && !attr.array);
  };

  // Get available options for a specific index
  const getOptions = (index) => {
    const current = names[index];
    const validColumns = getValidColumns();

    return validColumns
      .filter((attr) => !names.includes(attr.key) || attr.key === current)
      .map((attr) => ({
        value: attr.key,
        label: attr.key,
        type: attr.type,
        format: attr.format,
      }));
  };

  // Check if all options are exhausted
  const hasExhaustedOptions = () => {
    return getValidColumns().length === names.filter(Boolean).length;
  };

  // Check if add button should be disabled
  const isAddDisabled = () => {
    return names.length >= 5 || (names.length > 0 && !names[names.length - 1]);
  };

  // Check if update button should be disabled
  const isUpdateDisabled = () => {
    // Check if there are no changes
    const hasChanges = JSON.stringify(names) !== JSON.stringify(displayNames);
    // Check if last item is empty
    const lastItemEmpty = names.length > 0 && !names[names.length - 1];

    return !hasChanges || lastItemEmpty || isUpdating;
  };

  const handleAddColumn = () => {
    setNames([...names, null]);
  };

  const handleRemoveColumn = (index) => {
    const newNames = [...names];
    newNames.splice(index, 1);
    setNames(newNames);
    setActiveAccordion("");
  };

  const handleSelectChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
    setActiveAccordion("");
  };

  const handleSave = async () => {
    if (!currentProject) return;

    setIsUpdating(true);
    try {
      const filteredNames = names.filter(Boolean);
      const prefKey = `displayNames_${collectionId}`;

      // Get current prefs first to preserve others
      const currentPrefs = await sdk.forConsole.account.getPrefs();
      const updatedPrefs = {
        ...currentPrefs,
        [prefKey]: filteredNames,
      };

      await sdk.forConsole.account.updatePrefs(updatedPrefs);

      setDisplayNames(filteredNames);
      ToastAndroid.show(
        "Display names updated successfully",
        ToastAndroid.SHORT,
      );
    } catch (err) {
      console.error("Error saving display names:", err);
      ToastAndroid.show("Failed to update display names", ToastAndroid.SHORT);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Icon as={Eye} size={18} className="text-primary" />
          <Text className="text-lg font-bold text-foreground">
            Display Name
          </Text>
        </View>
      </View>

      <View className="gap-4 mt-2">
        <Text className="text-sm text-muted-foreground">
          Select up to 5 string columns to display as row names in the Appwrite
          console. These help identify rows in places like relationships.
        </Text>

        <View className="gap-2">
          {/* Row ID - Always shown, readonly */}
          <View className="flex-row gap-2 items-center">
            <View className="flex-1">
              <Input
                value="Row ID"
                editable={false}
                className="bg-muted/30 text-muted-foreground h-10"
              />
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Dynamic column selectors */}
          {names.map((name, index) => {
            const options = getOptions(index);
            const isDisabled =
              (!!names[index] && names.length > index + 1) ||
              hasExhaustedOptions();

            return (
              <View key={index} className="flex-row gap-2 items-center">
                <View className="flex-1">
                  <Accordion
                    type="single"
                    collapsible
                    value={activeAccordion}
                    onValueChange={setActiveAccordion}
                    className="w-full"
                    disabled={isDisabled}
                  >
                    <AccordionItem
                      value={`display-name-${index}`}
                      className={`border rounded-md px-3 border-border bg-background ${isDisabled ? "opacity-50" : ""}`}
                    >
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <View className="flex-row items-center gap-2">
                          {name &&
                            getIconByType(
                              attributes.find((a) => a.key === name)?.type,
                              attributes.find((a) => a.key === name)?.format,
                            )}
                          <Text
                            className="text-sm font-normal text-foreground"
                            numberOfLines={1}
                          >
                            {name || "Select column"}
                          </Text>
                        </View>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <View className="max-h-40 overflow-hidden">
                          <ScrollView
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                          >
                            <View className="gap-1 mt-2">
                              {options.map((option) => (
                                <TouchableOpacity
                                  key={option.value}
                                  onPress={() =>
                                    handleSelectChange(index, option.value)
                                  }
                                  className={`flex-row items-center gap-2 p-2 rounded-sm ${name === option.value ? "bg-accent" : ""}`}
                                >
                                  {getIconByType(option.type, option.format)}
                                  <Text className="text-sm text-foreground flex-1">
                                    {option.label}
                                  </Text>
                                  {name === option.value && (
                                    <Icon
                                      as={Check}
                                      size={16}
                                      color="#FD366E"
                                    />
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => handleRemoveColumn(index)}
                  className="w-10 h-10"
                >
                  <Icon as={X} size={18} className="text-muted-foreground" />
                </Button>
              </View>
            );
          })}

          {/* Add column button */}
          {!hasExhaustedOptions() && names.length < 5 && (
            <TouchableOpacity
              onPress={handleAddColumn}
              disabled={isAddDisabled()}
              className={`flex-row items-center justify-center gap-2 p-3 rounded-md border border-dashed border-border mt-1 ${isAddDisabled() ? "opacity-50" : "active:bg-muted"}`}
            >
              <Icon as={Plus} size={16} color="gray" />
              <Text className="text-sm text-primary font-medium">
                Add column
              </Text>
            </TouchableOpacity>
          )}

          <Button
            size="sm"
            onPress={handleSave}
            disabled={isUpdateDisabled()}
            className={`mt-2 ${isUpdateDisabled() ? "bg-muted" : "bg-primary"}`}
          >
            <Text
              className={
                isUpdateDisabled()
                  ? "text-muted-foreground"
                  : "text-primary-foreground font-bold"
              }
            >
              Update
            </Text>
          </Button>
        </View>
      </View>
    </Card>
  );
};

export default DisplayName;
