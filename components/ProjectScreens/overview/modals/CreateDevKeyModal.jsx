import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@/lib/theme-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ChevronDown } from "lucide-react-native";
import { sdk } from "@/appwrite/appwrite";

export const CreateDevKeyModal = ({
  isOpen,
  onOpenChange,
  projectId,
  onCreated,
}) => {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [expire, setExpire] = useState("never");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name) {
      setError("Please enter a name for the dev key");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sdk.forConsole.projects.createDevKey({
        projectId,
        name,
        expire: expire === "never" ? undefined : expire,
      });
      onCreated?.();
      onOpenChange(false);
      // Reset form
      setName("");
      setExpire("never");
    } catch (err) {
      setError(err.message || "Failed to create dev key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] w-[95%] p-0 overflow-hidden bg-background border-border flex-1 max-h-[80vh]">
        <DialogHeader className="p-6 pb-0 border-b-0">
          <DialogTitle className="text-xl font-bold flex-row items-center gap-2">
            Create dev key
          </DialogTitle>
        </DialogHeader>

        <ScrollView scrollEnabled={true} className=" max-h-[60vh] flex-1 p-6">
          <View className="gap-6">
            <View className="gap-4">
              <Text className="text-muted-foreground text-sm leading-relaxed">
                Bypass Appwrite rate limits and CORS errors in your development
                environment.
              </Text>
            </View>

            <View className="gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
              <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Configuration
              </Text>

              <View className="gap-2">
                <Label nativeID="key-name">Name</Label>
                <Input
                  placeholder="Enter key name"
                  value={name}
                  onChangeText={setName}
                  className="bg-background"
                />
              </View>

              <View className="gap-2">
                <Label nativeID="expiration">Expiration date</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-row items-center justify-between px-3 bg-background border-input"
                    >
                      <Text
                        className={
                          !expire ? "text-muted-foreground" : "text-foreground"
                        }
                      >
                        {expire === "never" ? "Never" : expire}
                      </Text>
                      <Icon as={ChevronDown} size={14} color="gray" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    {[
                      { value: "never", label: "Never" },
                      { value: "30d", label: "30 Days" },
                      { value: "90d", label: "90 Days" },
                      { value: "365d", label: "365 Days" },
                    ].map((item) => (
                      <DropdownMenuItem
                        key={item.value}
                        onPress={() => setExpire(item.value)}
                      >
                        <Text className="text-muted-foreground">
                          {item.label}
                        </Text>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
            </View>

            {error && (
              <View className="bg-destructive/10 p-3 rounded-lg border border-destructive">
                <Text className="text-destructive text-xs text-center">
                  {error}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <DialogFooter
          style={{ borderTopWidth: 1 }}
          className="p-6 border-border flex-row gap-3"
        >
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              <Text className="text-foreground">Cancel</Text>
            </Button>
          </DialogClose>
          <Button
            onPress={handleCreate}
            disabled={loading}
            className="flex-1 bg-primary"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-semibold text-white">Create</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
