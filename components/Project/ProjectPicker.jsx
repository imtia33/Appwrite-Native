import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import * as React from "react";
import { Platform, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";

export function ProjectPicker({
  projects,
  selectedProject,
  setSelectedProject,
}) {
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
            className={
              selectedProject
                ? "font-medium text-foreground dark:text-white text-base"
                : "font-medium text-muted-foreground text-base"
            }
          >
            {selectedProject?.name || "Select Project"}
          </Text>
          <Icon as={ChevronDown} size={14} color="gray" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets} className="w-[220px]">
        <ScrollView className="max-h-[300px]">
          <Text className="text-muted-foreground text-xs font-semibold px-2 py-1.5">
            Projects
          </Text>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.$id}
              onPress={() => setSelectedProject(project)}
            >
              <Text className="text-muted-foreground">{project.name}</Text>
            </DropdownMenuItem>
          ))}
        </ScrollView>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
