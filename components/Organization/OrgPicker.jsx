import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import { Platform, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { LayoutDashboard } from "lucide-react-native";

export function OrganizationPicker({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
}) {
  const pathname = usePathname();
  const isInOrgLayout = pathname.startsWith("/Organization");

  const ref = React.useRef(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <Select
      value={selectedOrganization?.$id}
      onValueChange={(value) => {
        const val =
          typeof value === "object" ? value.value || value.$id : value;

        if (val === "__org_overview__") {
          router.replace("/Organization");
          return;
        }

        const org = organizations.find((o) => o.$id === val);
        if (org) {
          setSelectedOrganization(org);
        }
      }}
    >
      <SelectTrigger
        ref={ref}
        className="w-auto border border-0 bg-transparent"
      >
        <SelectValue
          className="font-medium text-foreground dark:text-white"
          placeholder={selectedOrganization?.name || "Select Organization"}
        />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-[180px]">
        <SelectGroup>
          {!isInOrgLayout && (
            <SelectItem
              key="org-overview"
              label="Org Overview"
              value="__org_overview__"
            >
              <View className="flex-row items-center gap-2">
                <LayoutDashboard size={14} color="#969696" />
                <Text className="text-foreground font-medium">
                  Org Overview
                </Text>
              </View>
            </SelectItem>
          )}
          <SelectLabel className="text-muted-foreground">
            Organizations
          </SelectLabel>
          {organizations.map((org) => (
            <SelectItem key={org.$id} label={org.name} value={org.$id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
