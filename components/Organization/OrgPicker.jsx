import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import * as React from "react";
import { Platform, View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { ChevronDown, LayoutDashboard } from "lucide-react-native";
import { cn } from "@/lib/utils";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex-row items-center gap-2 px-2 h-10"
        >
          <Text
            className={cn(
              "font-medium text-base",
              selectedOrganization
                ? "text-foreground dark:text-white"
                : "text-muted-foreground",
            )}
          >
            {selectedOrganization?.name || "Select Organization"}
          </Text>
          <Icon as={ChevronDown} size={14} color="gray" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets} className="w-[220px]">
        <ScrollView className="max-h-[300px]">
          {!isInOrgLayout && (
            <DropdownMenuItem
              onPress={() => router.replace("/Organization")}
              className="flex-row items-center gap-2"
            >
              <Icon as={LayoutDashboard} size={14} color="gray" />
              <Text className="text-foreground font-medium">Org Overview</Text>
            </DropdownMenuItem>
          )}

          <Text className="text-muted-foreground text-xs font-semibold px-2 py-1.5 mt-1">
            Organizations
          </Text>

          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.$id}
              onPress={() => setSelectedOrganization(org)}
            >
              <Text className="text-muted-foreground">{org.name}</Text>
            </DropdownMenuItem>
          ))}
        </ScrollView>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
