import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Icon } from "../ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react-native";
import {
  useOrganizationStore,
  roles,
} from "../../appwrite/store/organizationStore";

const MemberInviteModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState({ value: "developer", label: "Developer" });
  const { createMembership, loading } = useOrganizationStore();

  const handleSubmit = async () => {
    try {
      await createMembership(email, [role.value], name);
      onOpenChange(false);
      setEmail("");
      setName("");
      setRole({ value: "developer", label: "Developer" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ width: 300 }} className="">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="email">Email</Label>
            <Input
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              aria-labelledby="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="name">Name (Optional)</Label>
            <Input
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              aria-labelledby="name"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="role">Role</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-row items-center justify-between px-3 border-input"
                >
                  <Text className={!role ? "text-muted-foreground" : ""}>
                    {role ? role.label : "Select a role"}
                  </Text>
                  <Icon as={ChevronDown} size={14} color="gray" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px]">
                {roles.map((r) => (
                  <DropdownMenuItem key={r.value} onPress={() => setRole(r)}>
                    <Text className="text-muted-foreground">{r.label}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </View>
        <DialogFooter>
          <Button onPress={handleSubmit} disabled={loading || !email}>
            <Text>{loading ? "Inviting..." : "Send Invite"}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
