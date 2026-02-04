import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Icon } from "../../ui/icon";
import { Pencil, ShieldCheck } from "lucide-react-native";
import { ID } from "@appwrite.io/console";
import { Switch } from "../../ui/switch";

const CreateDatabaseModal = ({ open, onOpenChange, onCreate, isLoading }) => {
  const [name, setName] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [showCustomId, setShowCustomId] = useState(false);
  const [enableBackups, setEnableBackups] = useState(false);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setDatabaseId("");
      setShowCustomId(false);
      setEnableBackups(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name) return;
    onCreate(name, databaseId || ID.unique(), enableBackups);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[325px]">
        <DialogHeader>
          <DialogTitle>Create database</DialogTitle>
        </DialogHeader>

        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="name-label">Name</Label>
            <Input
              placeholder="Enter database name"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {!showCustomId ? (
            <TouchableOpacity
              onPress={() => setShowCustomId(true)}
              className="flex-row items-center gap-2 self-start bg-secondary/50 px-3 py-1.5 rounded-full"
            >
              <Icon as={Pencil} size={14} color="gray" />
              <Text className="text-xs font-medium text-muted-foreground">
                Database ID
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-2 ">
              <Label nativeID="id-label">Database ID</Label>
              <Input
                placeholder="Enter custom ID"
                value={databaseId}
                onChangeText={setDatabaseId}
              />
            </View>
          )}

          <View className="gap-3 mt-2 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon
                  as={ShieldCheck}
                  size={18}
                  color={enableBackups ? "#10b981" : "gray"}
                />
                <Label nativeID="backup-label" className="text-base">
                  Daily backups
                </Label>
              </View>
              <Switch
                checked={enableBackups}
                onCheckedChange={setEnableBackups}
              />
            </View>
            <View className="pl-7">
              <Text className="text-xs text-muted-foreground leading-4">
                Daily backups are retained for 7 days.{" "}
                <Text className="font-semibold text-primary">
                  Upgrade your plan
                </Text>{" "}
                to add customized backup policies.
              </Text>
            </View>
          </View>
        </View>

        <DialogFooter className="flex-row justify-end gap-3">
          <Button
            style={{ borderColor: "#373938ff" }}
            variant="outline"
            onPress={() => onOpenChange(false)}
          >
            <Text className="text-muted-foreground">Cancel</Text>
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={!name || isLoading}
            className={isLoading ? "opacity-70" : ""}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-primary-foreground font-semibold">
                Create
              </Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatabaseModal;
