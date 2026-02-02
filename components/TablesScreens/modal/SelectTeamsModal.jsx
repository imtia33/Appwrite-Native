import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ShieldCheck, Users } from "lucide-react-native";
import useAuthStore from "@/appwrite/data-services/authService";
import { useProjectStore } from "@/appwrite/store/projectStore";

const SelectTeamsModal = ({
  isOpen,
  onOpenChange,
  onSelected,
  selectedTeams = [],
}) => {
  const { currentProject } = useProjectStore();
  const { listTeams } = useAuthStore();

  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState(
    new Set(selectedTeams),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      setSelectedTeamIds(new Set(selectedTeams));
    }
  }, [isOpen, selectedTeams]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter((team) =>
        team.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTeams(filtered);
    }
  }, [searchQuery, teams]);

  const loadTeams = async () => {
    if (!currentProject) return;

    setLoading(true);
    setError(null);
    try {
      const result = await listTeams(
        currentProject.$id,
        currentProject.region || "fra",
      );
      setTeams(result.teams || []);
      setFilteredTeams(result.teams || []);
    } catch (err) {
      console.error("Error loading teams:", err);
      setError("Failed to load teams");
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (teamId) => {
    const newSelected = new Set(selectedTeamIds);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeamIds(newSelected);
  };

  const handleSave = () => {
    onSelected(Array.from(selectedTeamIds));
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedTeamIds(new Set(selectedTeams));
    onOpenChange(false);
  };

  const renderTeamItem = ({ item }) => {
    const isSelected = selectedTeamIds.has(item.$id);

    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-border ${isSelected ? "bg-primary/10" : "bg-background"}`}
        onPress={() => toggleTeam(item.$id)}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-3">
            <Icon
              as={ShieldCheck}
              size={20}
              className="text-muted-foreground"
            />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-foreground">{item.name}</Text>
            <View className="flex-row items-center mt-1">
              <Icon
                as={Users}
                size={14}
                className="text-muted-foreground mr-1"
              />
              <Text className="text-sm text-muted-foreground">
                {item.total} member{item.total !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleTeam(item.$id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[500px] min-w-[350px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Select Teams</DialogTitle>
        </DialogHeader>

        <View className="flex-1">
          {/* Search Bar */}
          <View className="p-4 border-b border-border">
            <View className="flex-row items-center bg-muted/10 rounded-lg px-3">
              <Icon
                as={Search}
                size={20}
                className="text-muted-foreground mr-2"
              />
              <Input
                placeholder="Search teams by name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 h-12 border-0 bg-transparent"
              />
            </View>
          </View>

          {/* Selected Count */}
          <View className="px-4 py-2 border-b border-border bg-muted/5">
            <Text className="text-sm text-muted-foreground">
              Selected: {selectedTeamIds.size} team
              {selectedTeamIds.size !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Team List */}
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-2 text-muted-foreground">
                  Loading teams...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-destructive text-center">{error}</Text>
                <Button className="mt-4" onPress={loadTeams}>
                  <Text className="text-white font-bold">Retry</Text>
                </Button>
              </View>
            ) : filteredTeams.length === 0 ? (
              <View className="flex-1 items-center justify-center p-4">
                <Icon
                  as={ShieldCheck}
                  size={48}
                  className="text-muted-foreground mb-2"
                />
                <Text className="text-muted-foreground text-center">
                  {searchQuery ? "No teams found" : "No teams available"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTeams}
                renderItem={renderTeamItem}
                keyExtractor={(item) => item.$id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        {/* Footer */}
        <DialogFooter className="flex-row items-center gap-3 py-2">
          <Button
            variant="outline"
            className="flex-1 h-8"
            onPress={handleCancel}
          >
            <Text className="font-medium">Cancel</Text>
          </Button>
          <Button
            className="flex-1 h-8"
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-bold">
              Select ({selectedTeamIds.size})
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectTeamsModal;
