import React, { useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { Check } from "lucide-react-native";

import AttributeString from "./attributes/AttributeString";
import AttributeInteger from "./attributes/AttributeInteger";
import AttributeFloat from "./attributes/AttributeFloat";
import AttributeBoolean from "./attributes/AttributeBoolean";
import AttributeEnum from "./attributes/AttributeEnum";
import AttributeRelationship from "./attributes/AttributeRelationship";
import AttributePoint from "./attributes/AttributePoint";
import AttributeLine from "./attributes/AttributeLine";
import AttributePolygon from "./attributes/AttributePolygon";
import AttributeDatetime from "./attributes/AttributeDatetime";
import { AttributeGeneric } from "./attributes/AttributeGeneric";

const ATTRIBUTE_TYPES = [
  { label: "String", value: "string" },
  { label: "Integer", value: "integer" },
  { label: "Double", value: "double" },
  { label: "Boolean", value: "boolean" },
  { label: "Datetime", value: "datetime" },
  { label: "Email", value: "email" },
  { label: "URL", value: "url" },
  { label: "IP", value: "ip" },
  { label: "Enum", value: "enum" },
  { label: "Point", value: "point" },
  { label: "Line", value: "linestring" },
  { label: "Polygon", value: "polygon" },
  { label: "Relationship", value: "relationship" },
];

const CreateAttributeModal = ({
  isOpen,
  onOpenChange,
  onCreate,
  collections = [],
}) => {
  const [key, setKey] = useState("");
  const [type, setType] = useState("string");
  const [size, setSize] = useState("255");
  const [required, setRequired] = useState(false);
  const [array, setArray] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");

  // Integer/float states
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // Enum states
  const [elements, setElements] = useState("");

  // Relationship states
  const [relatedTable, setRelatedTable] = useState("");
  const [relationType, setRelationType] = useState("oneToOne");
  const [twoWay, setTwoWay] = useState(false);
  const [twoWayKey, setTwoWayKey] = useState("");
  const [onDelete, setOnDelete] = useState("setNull");

  const [loading, setLoading] = useState(false);

  // Accordion states
  const [typeAccordion, setTypeAccordion] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    try {
      let data = { key, required, array };

      // Spatial types do not support array
      if (["point", "linestring", "polygon"].includes(type)) {
        delete data.array;
      }

      if (type === "string") {
        data.size = Number(size);
      }
      if (type === "integer") {
        if (min) data.min = parseInt(min);
        if (max) data.max = parseInt(max);
        if (defaultValue) data.xdefault = parseInt(defaultValue);
      }
      if (type === "double") {
        if (min) data.min = parseFloat(min);
        if (max) data.max = parseFloat(max);
        if (defaultValue) data.xdefault = parseFloat(defaultValue);
      }
      if (type === "boolean") {
        if (defaultValue === "true") data.xdefault = true;
        if (defaultValue === "false") data.xdefault = false;
      }
      if (type === "enum") {
        data.elements = elements
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e);
      }

      if (type === "relationship") {
        data = {
          ...data,
          relatedTableId: relatedTable,
          type: relationType,
          twoWay,
          twoWayKey: twoWay ? twoWayKey : undefined,
          onDelete,
        };
      }

      // For generic string-based defaults and spatial placeholders
      if (
        [
          "string",
          "email",
          "url",
          "ip",
          "enum",
          "point",
          "linestring",
          "polygon",
        ].includes(type) &&
        defaultValue
      ) {
        data.xdefault = defaultValue;
      }
      if (type === "datetime" && defaultValue) {
        data.xdefault = defaultValue;
      }

      await onCreate({ type, data });
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setKey("");
    setType("string");
    setSize("255");
    setRequired(false);
    setArray(false);
    setDefaultValue("");
    setMin("");
    setMax("");
    setElements("");
    setRelatedTable("");
    setRelationType("oneToOne");
    setTwoWay(false);
    setTwoWayKey("");
    setOnDelete("setNull");
  };

  const renderAttributeDetails = () => {
    const commonProps = {
      required,
      onRequiredChange: setRequired,
      array,
      onArrayChange: setArray,
      defaultValue,
      onDefaultValueChange: setDefaultValue,
    };

    // Spatial types don't support array
    const spatialProps = {
      required,
      onRequiredChange: setRequired,
      defaultValue,
      onDefaultValueChange: setDefaultValue,
    };

    switch (type) {
      case "string":
        return (
          <AttributeString
            size={size}
            onSizeChange={setSize}
            {...commonProps}
          />
        );
      case "integer":
        return (
          <AttributeInteger
            min={min}
            onMinChange={setMin}
            max={max}
            onMaxChange={setMax}
            {...commonProps}
          />
        );
      case "double":
        return (
          <AttributeFloat
            min={min}
            onMinChange={setMin}
            max={max}
            onMaxChange={setMax}
            {...commonProps}
          />
        );
      case "boolean":
        return <AttributeBoolean {...commonProps} />;
      case "enum":
        return (
          <AttributeEnum
            elements={elements}
            onElementsChange={setElements}
            {...commonProps}
          />
        );
      case "relationship":
        return (
          <AttributeRelationship
            tables={tables}
            relatedTable={relatedTable}
            onRelatedTableChange={setRelatedTable}
            relationType={relationType}
            onRelationTypeChange={setRelationType}
            twoWay={twoWay}
            onTwoWayChange={setTwoWay}
            twoWayKey={twoWayKey}
            onTwoWayKeyChange={setTwoWayKey}
            onDelete={onDelete}
            onOnDeleteChange={setOnDelete}
          />
        );
      case "point":
        return <AttributePoint {...spatialProps} />;
      case "linestring":
        return <AttributeLine {...spatialProps} />;
      case "polygon":
        return <AttributePolygon {...spatialProps} />;
      case "datetime":
        return <AttributeDatetime {...commonProps} />;
      case "email":
      case "url":
      case "ip":
        return <AttributeGeneric {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="min-w-[350px] w-[95%] max-w-[500px] p-0 overflow-hidden bg-background border-border rounded-lg shadow-lg">
          <View className="p-6 pb-0">
            <Text className="text-xl font-bold">Create Attribute</Text>
          </View>

          <ScrollView className="p-6 max-h-[60vh]">
            <View className="gap-4">
              <View className="gap-2">
                <Label nativeID="attr-key">Attribute Key</Label>
                <Input
                  placeholder="e.g. title, user_id"
                  value={key}
                  onChangeText={setKey}
                />
              </View>

              <View className="gap-2">
                <Label nativeID="attr-type">Type</Label>
                <Accordion
                  type="single"
                  collapsible
                  value={typeAccordion}
                  onValueChange={setTypeAccordion}
                  className="w-full"
                >
                  <AccordionItem
                    value="type"
                    className="border rounded-md px-3 border-border bg-background"
                  >
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <Text className="text-sm font-normal text-foreground">
                        {ATTRIBUTE_TYPES.find((t) => t.value === type)?.label ||
                          "Select type"}
                      </Text>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <View className="gap-1 mt-2">
                        {ATTRIBUTE_TYPES.map((t) => (
                          <TouchableOpacity
                            key={t.value}
                            onPress={() => {
                              setType(t.value);
                              setTypeAccordion("");
                              setDefaultValue("");
                            }}
                            className={`flex-row items-center justify-between p-2 rounded-sm ${type === t.value ? "bg-accent" : ""}`}
                          >
                            <Text className="text-sm text-foreground">
                              {t.label}
                            </Text>
                            {type === t.value && (
                              <Icon as={Check} size={16} color="#FD366E" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </View>

              {renderAttributeDetails()}
            </View>
            <View className="h-20"></View>
          </ScrollView>

          <View className="p-6 border-t border-border flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => onOpenChange(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              onPress={handleCreate}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Create</Text>
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateAttributeModal;
