import { View, Text, Linking, Alert } from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/blocks/DataTable";
import {
  Plus,
  X,
  Globe,
  Users,
  User,
  ShieldCheck,
  UserPlus,
  ShieldPlus,
} from "lucide-react-native";
import { symmetricDifference } from "@/lib/helpers/array";
import SelectUsersModal from "../modal/SelectUsersModal";
import SelectTeamsModal from "../modal/SelectTeamsModal";
import LabelModal from "../modal/LabelModal";
import CustomIdModal from "../modal/CustomIdModal";
import { sdk } from "../../../appwrite/appwrite";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import useDatabaseStore from "../../../appwrite/data-services/databaseService";

const ROLES = [
  { value: "any", label: "Any", icon: Globe },
  { value: "guests", label: "All Guests", icon: Users },
  { value: "users", label: "All Users", icon: Users },
  { value: "user", label: "User", icon: User },
  { value: "team", label: "Team", icon: ShieldCheck },
  { value: "label", label: "Label", icon: ShieldCheck },
  { value: "select-users", label: "Select Users", icon: UserPlus },
  { value: "select-teams", label: "Select Teams", icon: ShieldPlus },
];

const ACTIONS = ["create", "read", "update", "delete"];

const Permissions = ({ databaseId, collectionId }) => {
  const { currentProject } = useProjectStore();
  const { collections, fetchCollections } = useDatabaseStore();

  // Get collection from store
  const collection = collections[databaseId]?.find(
    (c) => c.$id === collectionId,
  );

  const [permissions, setPermissions] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]);
  const [arePermsDisabled, setArePermsDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSelectUsersModalOpen, setIsSelectUsersModalOpen] = useState(false);
  const [isSelectTeamsModalOpen, setIsSelectTeamsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [visibleGroups, setVisibleGroups] = useState([]);

  // Load collection data
  useEffect(() => {
    if (collection) {
      const perms = collection.$permissions || [];
      setPermissions(perms);
      setInitialPermissions(perms);

      const groups = {};
      perms.forEach((p) => {
        const match = p.match(/^(\w+)\("([^"]+)"\)$/);
        if (match) {
          let role = match[2];
          let id = "";

          if (role.includes(":")) {
            const parts = role.split(":");
            role = parts[0];
            id = parts[1];
          }
          const key = id ? `${role}:${id}` : role;
          if (!groups[key]) {
            groups[key] = { role, id };
          }
        }
      });
      setVisibleGroups(Object.values(groups));

      setIsLoading(false);
    }
  }, [collection]);

  // Group permissions by role
  const groupedPermissions = useMemo(() => {
    return visibleGroups.map((group) => {
      const actions = {};
      ACTIONS.forEach((action) => {
        const roleStr = group.id ? `${group.role}:${group.id}` : group.role;
        const permString = `${action}("${roleStr}")`;
        actions[action] = permissions.includes(permString);
      });
      return { ...group, actions };
    });
  }, [visibleGroups, permissions]);

  // Get available roles (exclude already added ones)
  const availableRoles = useMemo(() => {
    const usedRoles = new Set(
      groupedPermissions.map((g) => (g.id ? `${g.role}:${g.id}` : g.role)),
    );
    return ROLES.filter((role) => {
      if (
        role.value === "user" ||
        role.value === "team" ||
        role.value === "label" ||
        role.value === "select-users" ||
        role.value === "select-teams"
      ) {
        return true; // These can have multiple instances
      }
      return !usedRoles.has(role.value);
    });
  }, [groupedPermissions]);

  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  useEffect(() => {
    // Check if permissions have changed
    const hasChanges =
      permissions &&
      symmetricDifference(permissions, initialPermissions).length > 0;
    setArePermsDisabled(!hasChanges);
  }, [permissions, initialPermissions]);

  const handleSave = async () => {
    if (!currentProject || !collection) return;

    setIsSaving(true);
    try {
      const projectSdk = sdk.forProject(
        currentProject.region || "fra",
        currentProject.$id,
      );

      await projectSdk.databases.updateCollection(
        databaseId,
        collectionId,
        collection.name || "",
        permissions,
        collection.documentSecurity || false,
        collection.enabled !== false,
      );

      setInitialPermissions([...permissions]);

      // Refresh collections in store
      await fetchCollections(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
      );

      Alert.alert("Success", "Permissions have been updated");
    } catch (error) {
      console.error("Error updating permissions:", error);
      Alert.alert("Error", error.message || "Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const openDocumentation = () => {
    Linking.openURL("https://appwrite.io/docs/products/databases/permissions");
  };

  const addPermissionRole = (role) => {
    setSelectedRole(role);
    if (role.value === "label") {
      setIsLabelModalOpen(true);
    } else if (role.value === "user" || role.value === "team") {
      setIsCustomModalOpen(true);
    } else if (role.value === "select-users") {
      setIsSelectUsersModalOpen(true);
    } else if (role.value === "select-teams") {
      setIsSelectTeamsModalOpen(true);
    } else {
      // Add empty permission group
      const key = role.value;
      setVisibleGroups((prev) => {
        if (prev.some((g) => (g.id ? `${g.role}:${g.id}` : g.role) === key))
          return prev;
        return [...prev, { role: role.value, id: "" }];
      });
      setIsAddPopoverOpen(false);
    }
  };

  const handleLabelAdd = (labelName) => {
    const key = `label:${labelName}`;
    setVisibleGroups((prev) => {
      if (prev.some((g) => (g.id ? `${g.role}:${g.id}` : g.role) === key))
        return prev;
      return [...prev, { role: "label", id: labelName }];
    });
    setIsAddPopoverOpen(false);
  };

  const handleCustomIdAdd = (id) => {
    if (selectedRole) {
      const rolePrefix = selectedRole.value;
      const key = `${rolePrefix}:${id}`;
      setVisibleGroups((prev) => {
        if (prev.some((g) => (g.id ? `${g.role}:${g.id}` : g.role) === key))
          return prev;
        return [...prev, { role: rolePrefix, id }];
      });
      setIsAddPopoverOpen(false);
    }
  };

  const handleUsersSelected = (userIds) => {
    setVisibleGroups((prev) => {
      const newGroups = [];
      const existingKeys = new Set(
        prev.map((g) => (g.id ? `${g.role}:${g.id}` : g.role)),
      );

      userIds.forEach((userId) => {
        const key = `user:${userId}`;
        if (!existingKeys.has(key)) {
          newGroups.push({ role: "user", id: userId });
          existingKeys.add(key);
        }
      });

      return [...prev, ...newGroups];
    });
    setSelectedUserIds(userIds);
    setIsAddPopoverOpen(false);
  };

  const handleTeamsSelected = (teamIds) => {
    setVisibleGroups((prev) => {
      const newGroups = [];
      const existingKeys = new Set(
        prev.map((g) => (g.id ? `${g.role}:${g.id}` : g.role)),
      );

      teamIds.forEach((teamId) => {
        const key = `team:${teamId}`;
        if (!existingKeys.has(key)) {
          newGroups.push({ role: "team", id: teamId });
          existingKeys.add(key);
        }
      });

      return [...prev, ...newGroups];
    });
    setSelectedTeamIds(teamIds);
    setIsAddPopoverOpen(false);
  };

  const removePermissionGroup = (role, id) => {
    const key = id ? `${role}:${id}` : role;

    // Remove from permissions
    const newPerms = permissions.filter((p) => {
      const match = p.match(/^(\w+)\("([^"]+)"\)$/);
      if (match) {
        let permRole = match[2];
        let permId = "";
        if (permRole.includes(":")) {
          const parts = permRole.split(":");
          permRole = parts[0];
          permId = parts[1];
        }
        const permKey = permId ? `${permRole}:${permId}` : permRole;
        return permKey !== key;
      }
      return true;
    });
    setPermissions(newPerms);

    // Remove from visibleGroups
    setVisibleGroups((prev) =>
      prev.filter((g) => {
        const gKey = g.id ? `${g.role}:${g.id}` : g.role;
        return gKey !== key;
      }),
    );
  };

  const togglePermission = (role, id, action, enabled) => {
    const roleStr = id ? `${role}:${id}` : role;
    const permString = `${action}("${roleStr}")`;

    if (enabled) {
      if (!permissions.includes(permString)) {
        setPermissions([...permissions, permString]);
      }
    } else {
      setPermissions(permissions.filter((p) => p !== permString));
    }
  };

  // DataTable columns
  const columns = [
    {
      id: "role",
      header: (
        <Text className="text-muted-foreground font-medium text-sm uppercase">
          Role
        </Text>
      ),
      accessorKey: "role",
      cell: ({ row }) => {
        const group = row.original;
        const role = ROLES.find((r) => r.value === group.role);
        const displayName = group.id
          ? group.role === "label"
            ? `Label: ${group.id}`
            : group.role === "user"
              ? `User: ${group.id}`
              : `Team: ${group.id}`
          : role
            ? role.label
            : group.role;

        return (
          <View className="flex-row items-center gap-2">
            {role?.icon && <Icon as={role.icon} size={16} color="gray" />}
            <Text className="text-muted-foreground font-medium">
              {displayName}
            </Text>
          </View>
        );
      },
    },
    ...ACTIONS.map((action) => ({
      id: action,
      header: (
        <Text className="text-muted-foreground font-medium text-sm uppercase">
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Text>
      ),
      accessorKey: action,
      cell: ({ row }) => {
        const group = row.original;
        const isEnabled = group.actions[action];
        const roleStr = group.id ? `${group.role}:${group.id}` : group.role;

        return (
          <View className="items-center justify-center">
            <Checkbox
              checked={isEnabled}
              onCheckedChange={(checked) =>
                togglePermission(group.role, group.id, action, checked)
              }
            />
          </View>
        );
      },
    })),
    {
      id: "actions",
      header: (
        <Text className="text-muted-foreground font-medium text-sm uppercase">
          Actions
        </Text>
      ),
      accessorKey: "actions",
      cell: ({ row }) => {
        const group = row.original;
        return (
          <View className="items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onPress={() => removePermissionGroup(group.role, group.id)}
            >
              <Icon as={X} size={16} color="gray" />
            </Button>
          </View>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <Text className="text-muted-foreground">Loading permissions...</Text>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 mb-4">
        <CardTitle>Permissions</CardTitle>
        <CardDescription>
          Choose who can access your tables and rows.
          <Text className="text-primary underline" onPress={openDocumentation}>
            Learn more
          </Text>
        </CardDescription>
        <CardContent className="p-0 pt-4">
          {/* Empty state */}
          {groupedPermissions.length === 0 ? (
            <View className="items-center justify-center ">
              <Popover
                open={isAddPopoverOpen}
                onOpenChange={setIsAddPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    style={{ borderColor: "#343434ff" }}
                    className="flex-col h-56 w-56 rounded-2xl border-2 border-dashed "
                  >
                    <Icon as={Plus} size={24} color="gray" className="mb-2" />
                    <Text className="text-muted-foreground text-xs font-medium">
                      Add Role
                    </Text>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <View className="gap-1">
                    {availableRoles.map((role) => (
                      <Button
                        key={role.value}
                        variant="ghost"
                        className="justify-start w-full"
                        onPress={() => addPermissionRole(role)}
                      >
                        <Icon
                          as={role.icon}
                          size={16}
                          color="gray"
                          className="mr-2"
                        />
                        <Text className="text-foreground">{role.label}</Text>
                      </Button>
                    ))}
                  </View>
                </PopoverContent>
              </Popover>
              <Text className="text-muted-foreground text-sm mt-4 text-center">
                No permissions configured
              </Text>
            </View>
          ) : (
            <>
              {/* Permissions DataTable */}
              <DataTable
                data={groupedPermissions}
                columns={columns}
                showSearch={false}
                pagination={false}
                className="border rounded-lg"
              />

              {/* Add Role Button */}
              <View className="mt-4">
                <Popover
                  open={isAddPopoverOpen}
                  onOpenChange={setIsAddPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={availableRoles.length === 0}
                    >
                      <Icon as={Plus} size={16} color="gray" className="mr-2" />
                      <Text className="text-foreground">Add Role</Text>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <View className="gap-1">
                      {availableRoles.map((role) => (
                        <Button
                          key={role.value}
                          variant="ghost"
                          className="justify-start w-full"
                          onPress={() => addPermissionRole(role)}
                        >
                          <Icon
                            as={role.icon}
                            size={16}
                            color="gray"
                            className="mr-2"
                          />
                          <Text className="text-foreground">{role.label}</Text>
                        </Button>
                      ))}
                    </View>
                  </PopoverContent>
                </Popover>
              </View>
            </>
          )}

          {/* Update Button */}
          <View className="mt-6">
            <Button
              disabled={arePermsDisabled}
              loading={isSaving}
              onPress={handleSave}
              className={arePermsDisabled ? "w-full opacity-50" : "w-full"}
            >
              <Text className="text-white font-bold">Update Permissions</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* Label Modal */}
      <LabelModal
        isOpen={isLabelModalOpen}
        onOpenChange={setIsLabelModalOpen}
        onAdd={handleLabelAdd}
        initialValue={""}
      />

      {/* Custom ID Modal (User/Team) */}
      <CustomIdModal
        isOpen={isCustomModalOpen}
        onOpenChange={setIsCustomModalOpen}
        onAdd={handleCustomIdAdd}
        roleType={selectedRole?.value === "team" ? "team" : "user"}
        initialValue={""}
      />

      {/* Select Users Modal */}
      <SelectUsersModal
        isOpen={isSelectUsersModalOpen}
        onOpenChange={setIsSelectUsersModalOpen}
        onSelected={handleUsersSelected}
        selectedUsers={selectedUserIds}
      />

      {/* Select Teams Modal */}
      <SelectTeamsModal
        isOpen={isSelectTeamsModalOpen}
        onOpenChange={setIsSelectTeamsModalOpen}
        onSelected={handleTeamsSelected}
        selectedTeams={selectedTeamIds}
      />
    </>
  );
};

export default Permissions;
