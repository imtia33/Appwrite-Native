import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useOrganizationStore } from "../../appwrite/store/organizationStore";
import { useProjectStore } from "../../appwrite/store/projectStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { getProjects } from "../../appwrite/organization/organization";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";

const Projects = () => {
  const { currentOrganization } = useOrganizationStore();
  const { setCurrentProject } = useProjectStore();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjectsList = async () => {
      if (!currentOrganization?.$id) return;

      setLoadingProjects(true);
      try {
        const fetchedProjects = await getProjects(currentOrganization.$id);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjectsList();
  }, [currentOrganization?.$id]);

  const getUniquePlatforms = (platforms = []) => {
    const uniqueTypes = new Set();
    const result = [];

    platforms.forEach((platform) => {
      const type = platform.type || "";
      const name = platform.name || "";

      let detectedType = "";
      if (type.includes("flutter")) {
        detectedType = "flutter";
      } else if (type.includes("react-native")) {
        detectedType = "react-native";
      } else if (name.toLowerCase().includes("react")) {
        detectedType = "react";
      } else if (
        name.toLowerCase().includes("javascript") ||
        name.toLowerCase().includes("js")
      ) {
        detectedType = "js";
      } else if (type.includes("android")) {
        detectedType = "android";
      } else if (type.includes("ios") || type.includes("apple")) {
        detectedType = "ios";
      } else {
        detectedType = "web";
      }

      if (!uniqueTypes.has(detectedType)) {
        uniqueTypes.add(detectedType);
        result.push(detectedType);
      }
    });

    return result;
  };

  const getPlatformIcon = (detectedType) => {
    switch (detectedType) {
      case "flutter":
        return { component: FontAwesome6, name: "flutter" };
      case "react":
      case "react-native":
        return { component: MaterialCommunityIcons, name: "react" };
      case "js":
        return {
          component: MaterialCommunityIcons,
          name: "language-javascript",
        };
      case "android":
        return { component: MaterialCommunityIcons, name: "android" };
      case "ios":
        return { component: MaterialCommunityIcons, name: "apple" };
      default:
        return { component: MaterialCommunityIcons, name: "web" };
    }
  };

  const getPlatformLabel = (detectedType) => {
    switch (detectedType) {
      case "flutter":
        return "Flutter";
      case "react":
        return "React";
      case "react-native":
        return "React Native";
      case "js":
        return "JS";
      case "android":
        return "Android";
      case "ios":
        return "iOS";
      default:
        return "Web";
    }
  };

  const getRegionName = (region) => {
    const regions = {
      fra: "Frankfurt",
      nyc: "New York",
      syd: "Sydney",
      sgp: "Singapore",
      sfo: "San Francisco",
      tor: "Toronto",
      default: "Default",
    };
    return regions[region] || region;
  };

  const filteredProjects = projects.filter((proj) =>
    proj.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 p-4">
        <View className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-input border-input placeholder:text-muted-foreground h-10"
          />
        </View>
        <Button className="rounded-xl px-2 h-10 flex-row items-center gap-1">
          <Icon as={Plus} size={14} color="#fff" />
          <Text
            style={{ fontSize: 16, marginBottom: 2 }}
            className="text-primary-foreground font-regular"
          >
            Create Project
          </Text>
        </Button>
      </View>

      <ScrollView className="flex-1 px-2">
        {loadingProjects ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#FD366E" />
          </View>
        ) : filteredProjects.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted-foreground text-lg">
              {searchQuery
                ? `No projects found for "${searchQuery}"`
                : "No projects found"}
            </Text>
          </View>
        ) : (
          filteredProjects.map((proj) => {
            const platformTypes = getUniquePlatforms(proj.platforms);
            return (
              <TouchableOpacity
                key={proj.$id}
                onPress={() => {
                  setCurrentProject(proj);
                  router.replace("/Project");
                }}
                activeOpacity={0.7}
              >
                <Card className="bg-card border-border shadow-none rounded-2xl mb-4">
                  <View className="px-4 py-3">
                    <Text className="text-muted-foreground text-sm font-regular mb-1">
                      {proj.platforms?.length || 0} apps
                    </Text>
                    <Text
                      style={{ marginBottom: 80 }}
                      className="text-foreground text-2xl font-regular"
                    >
                      {proj.name}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row gap-2 flex-wrap flex-1">
                        {platformTypes.slice(0, 3).map((type, idx) => {
                          const iconData = getPlatformIcon(type);
                          const IconComponent = iconData.component;
                          return (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="px-3 py-2 rounded-xl border-0"
                            >
                              <IconComponent
                                name={iconData.name}
                                size={16}
                                color="#969696"
                                style={{ marginRight: 6 }}
                              />
                              <Text className="text-foreground font-medium">
                                {getPlatformLabel(type)}
                              </Text>
                            </Badge>
                          );
                        })}
                        {platformTypes.length > 3 && (
                          <View className="self-center ml-1">
                            <Text className="text-muted-foreground text-sm font-medium">
                              +{platformTypes.length - 3} more
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-muted-foreground text-lg font-medium ml-2">
                        {getRegionName(proj.region)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default Projects;
