import React, { useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, ChevronDown, Boxes } from "lucide-react-native";
import { darkIcons, lightIcons, getIconFromRuntime } from "@/constants/icons";
import { Image } from "react-native";

const StepDetails = ({ data, onNext, onBack }) => {
  const { getThemeValue, isDark } = useTheme();
  const [name, setName] = useState(data.name || "");
  const [id, setId] = useState(data.id || "");
  const [runtime, setRuntime] = useState(data.runtime || "node-18.0");
  const [showCustomId, setShowCustomId] = useState(false);
  const icons = isDark ? darkIcons : lightIcons;

  const runtimes = [
    { label: "Node.js 18.0", value: "node-18.0" },
    { label: "Node.js 20.0", value: "node-20.0" },
    { label: "PHP 8.0", value: "php-8.0" },
    { label: "Python 3.9", value: "python-3.9" },
    { label: "Dart 2.17", value: "dart-2.17" },
  ];

  const selectedRuntimeLabel =
    runtimes.find((r) => r.value === runtime)?.label || runtime;

  const renderRuntimeIcon = (runtimeKey, size = 16) => {
    const iconName = getIconFromRuntime(runtimeKey);
    const iconAsset = icons[iconName];
    if (!iconAsset) return <Icon as={Boxes} size={size} color="gray" />;

    const ResolvedIcon = iconAsset.default || iconAsset;
    if (typeof ResolvedIcon === "function") {
      return <ResolvedIcon width={size} height={size} />;
    }
    return (
      <Image source={ResolvedIcon} style={{ width: size, height: size }} />
    );
  };

  return (
    <View className="gap-6">
      <View className="gap-4">
        <View className="gap-2">
          <Label className="text-foreground">Name</Label>
          <Input
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            className="bg-card border-border text-foreground"
          />
        </View>

        {showCustomId ? (
          <View className="gap-2">
            <Label className="text-foreground">Function ID</Label>
            <Input
              placeholder="Enter function ID"
              value={id}
              onChangeText={setId}
              className="bg-card border-border text-foreground"
            />
            <TouchableOpacity onPress={() => setShowCustomId(false)}>
              <Text className="text-primary text-xs">
                Use auto-generated ID
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowCustomId(true)}
            className="flex-row items-center gap-2 self-start bg-muted px-3 py-1.5 rounded-full"
          >
            <Icon
              as={Pencil}
              size={12}
              color={getThemeValue("#6b7280", "#9ca3af")}
            />
            <Text className="text-foreground text-xs font-medium">
              Function ID
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="gap-2">
        <Label className="text-foreground">Runtime</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-row items-center justify-between bg-card border border-border px-4 py-3 rounded-xl">
            <View className="flex-row items-center gap-3">
              {renderRuntimeIcon(runtime, 20)}
              <Text className="text-foreground">{selectedRuntimeLabel}</Text>
            </View>
            <Icon as={ChevronDown} size={16} color="gray" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]">
            {runtimes.map((r) => (
              <DropdownMenuItem
                key={r.value}
                onPress={() => setRuntime(r.value)}
                className="flex-row items-center gap-3"
              >
                {renderRuntimeIcon(r.value, 16)}
                <Text className="text-popover-foreground">{r.label}</Text>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      <View className="mt-8 flex-row gap-3">
        <Button
          variant="outline"
          onPress={onBack}
          className="flex-1 border-border bg-transparent"
        >
          <Text className="text-foreground">Back</Text>
        </Button>
        <Button
          onPress={() => onNext({ name, id, runtime })}
          className="flex-1 bg-primary"
          disabled={!name}
        >
          <Text className="text-white font-bold">Next</Text>
        </Button>
      </View>
    </View>
  );
};

export default StepDetails;
