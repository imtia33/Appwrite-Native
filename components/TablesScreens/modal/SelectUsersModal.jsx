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
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, User, Check } from "lucide-react-native";
import useAuthStore from "@/appwrite/data-services/authService";
import { useProjectStore } from "@/appwrite/store/projectStore";

const SelectUsersModal = ({
  isOpen,
  onOpenChange,
  onSelected,
  selectedUsers = [],
}) => {
  const { currentProject } = useProjectStore();
  const { listUsers } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState(
    new Set(selectedUsers),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserIds(new Set(selectedUsers));
    }
  }, [isOpen, selectedUsers]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    if (!currentProject) return;

    setLoading(true);
    setError(null);
    try {
      const result = await listUsers(
        currentProject.$id,
        currentProject.region || "fra",
      );
      setUsers(result.users || []);
      setFilteredUsers(result.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSave = () => {
    onSelected(Array.from(selectedUserIds));
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedUserIds(new Set(selectedUsers));
    onOpenChange(false);
  };

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUserIds.has(item.$id);

    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 border-b border-border ${isSelected ? "bg-primary/10" : "bg-background"}`}
        onPress={() => toggleUser(item.$id)}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-3">
            <Icon as={User} size={20} className="text-muted-foreground" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-foreground">
              {item.name || "Unnamed User"}
            </Text>
            <Text className="text-sm text-muted-foreground">{item.email}</Text>
          </View>
        </View>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleUser(item.$id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[500px] min-w-[350px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Select Users</DialogTitle>
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
                placeholder="Search users by name or email"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 h-12 border-0 bg-transparent"
              />
            </View>
          </View>

          {/* Selected Count */}
          <View className="px-4 py-2 border-b border-border bg-muted/5">
            <Text className="text-sm text-muted-foreground">
              Selected: {selectedUserIds.size} user
              {selectedUserIds.size !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* User List */}
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-2 text-muted-foreground">
                  Loading users...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-destructive text-center">{error}</Text>
                <Button className="mt-4" onPress={loadUsers}>
                  <Text className="text-white font-bold">Retry</Text>
                </Button>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View className="flex-1 items-center justify-center p-4">
                <Icon
                  as={User}
                  size={48}
                  className="text-muted-foreground mb-2"
                />
                <Text className="text-muted-foreground text-center">
                  {searchQuery ? "No users found" : "No users available"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
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
              Select ({selectedUserIds.size})
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectUsersModal;
