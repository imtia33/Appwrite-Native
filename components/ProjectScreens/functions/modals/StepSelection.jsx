import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { darkIcons, lightIcons } from "@/constants/icons";
import { sdk } from "@/appwrite/appwrite";
import { useProjectStore } from "@/appwrite/store/projectStore";
import useFunctionStore from "@/appwrite/data-services/functionService";
import {
  ChevronRight,
  Plus,
  Globe,
  Search,
  Github,
  Boxes,
} from "lucide-react-native";
import { Image } from "react-native";

const RepoCard = ({ repo, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-3 border-b border-border/50"
  >
    <View className="flex-row items-center gap-3">
      <Icon as={Github} size={18} color="#6b7280" />
      <View>
        <Text className="text-foreground font-medium">{repo.name}</Text>
        <Text className="text-muted-foreground text-xs">
          {repo.runtime || "Git repository"}
        </Text>
      </View>
    </View>
    <Icon as={ChevronRight} size={16} color="gray" />
  </TouchableOpacity>
);

const StepSelection = ({ onNext }) => {
  const { getThemeValue, isDark } = useTheme();
  const { currentProject } = useProjectStore();
  const [installations, setInstallations] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { templates, fetchTemplates } = useFunctionStore();
  const icons = isDark ? darkIcons : lightIcons;

  const quickStartRuntimes = [
    { id: "node-18.0", name: "Node.js", icon: "node" },
    { id: "python-3.12", name: "Python", icon: "python" },
    { id: "dart-3.10", name: "Dart", icon: "dart" },
    { id: "go-1.23", name: "Go", icon: "go" },
    { id: "php-8.3", name: "PHP", icon: "php" },
    { id: "deno-2.0", name: "Deno", icon: "deno" },
  ];

  useEffect(() => {
    loadGitData();
  }, []);

  const loadGitData = async () => {
    if (!currentProject) return;
    try {
      setLoading(true);

      // Load Installations
      const response = await sdk
        .forProject(currentProject.region || "fra", currentProject.$id)
        .vcs.listInstallations();
      setInstallations(response.installations || []);

      // Load Templates for Quick Start
      try {
        await fetchTemplates(
          currentProject.$id,
          currentProject.region || "fra",
        );
      } catch (templateError) {
        console.error("Error loading templates:", templateError);
      }

      if (response.installations && response.installations.length > 0) {
        const reposResponse = await sdk
          .forProject(currentProject.region || "fra", currentProject.$id)
          .vcs.listRepositories({
            installationId: response.installations[0].$id,
            type: "runtime",
            limit: 5,
          });
        setRepositories(reposResponse.runtimeProviderRepositories || []);
      }
    } catch (error) {
      console.error("Error loading git data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRuntimeIcon = (iconName) => {
    const iconAsset = icons[iconName];
    if (!iconAsset) return <Icon as={Boxes} size={16} color="gray" />;

    const ResolvedIcon = iconAsset.default || iconAsset;
    if (typeof ResolvedIcon === "function") {
      return <ResolvedIcon width={24} height={24} />;
    }
    return <Image source={ResolvedIcon} style={{ width: 24, height: 24 }} />;
  };

  return (
    <View className="gap-6">
      {/* Connect Git Section */}
      <View>
        <Text variant="h4" className="mb-4 text-foreground">
          Connect Git repository
        </Text>
        <Card className="p-4 border-border bg-card">
          {loading ? (
            <ActivityIndicator color="#ef4444" size="small" />
          ) : (
            <View className="gap-4">
              {installations.length === 0 ? (
                <View className="items-center py-4">
                  <Text className="text-muted-foreground text-center mb-4">
                    Configure your project to connect your function to a Git
                    repository.
                  </Text>
                  <TouchableOpacity className="bg-primary flex-row items-center px-4 py-2 rounded-lg">
                    <Icon as={Plus} size={16} color="white" />
                    <Text className="text-white font-medium ml-2">
                      Connect GitHub
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {repositories.length > 0 ? (
                    repositories.map((repo) => (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        onPress={() =>
                          onNext({
                            repository: repo,
                            installationId: installations[0].$id,
                            runtime: repo.runtime,
                          })
                        }
                      />
                    ))
                  ) : (
                    <Text className="text-muted-foreground text-center py-4">
                      No repositories found
                    </Text>
                  )}
                  <TouchableOpacity className="flex-row items-center gap-1 mt-4">
                    <Text className="text-primary text-sm font-medium">
                      Browse all repositories
                    </Text>
                    <Icon as={ChevronRight} size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Card>
      </View>

      <Separator className="bg-border" />

      {/* Quick Start Section */}
      <View>
        <Text variant="h4" className="mb-4 text-foreground">
          Quick start
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {quickStartRuntimes.map((runtime) => (
            <TouchableOpacity
              key={runtime.id}
              onPress={() => {
                // Find a matching template for this runtime
                const template = templates.find((t) =>
                  t.runtimes.some((r) => r.name === runtime.id),
                );
                onNext({
                  runtime: runtime.id,
                  name: `my-${runtime.icon}-function`,
                  template: template,
                });
              }}
              className="w-[48%] bg-card border border-border rounded-xl p-4 items-center justify-center gap-3"
            >
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                {renderRuntimeIcon(runtime.icon)}
              </View>
              <Text className="text-foreground font-medium">
                {runtime.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="flex-row items-center gap-1 mt-6">
          <Text className="text-primary text-sm font-medium">
            Browse all templates
          </Text>
          <Icon as={ChevronRight} size={14} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 mb-20">
        <Text className="text-muted-foreground text-sm">
          You can also create a function{" "}
          <Text className="text-primary">manually</Text> or using the CLI.
        </Text>
      </View>
    </View>
  );
};

export default StepSelection;
