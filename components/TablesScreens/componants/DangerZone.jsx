import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { Trash2, AlertTriangle } from "lucide-react-native";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import useDatabaseStore from "../../../appwrite/data-services/databaseService";
import { useRouter } from "expo-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";

const DangerZone = ({ databaseId, tableId }) => {
  const { currentProject } = useProjectStore();
  const { tables, deleteTable } = useDatabaseStore();
  const router = useRouter();

  // Get table from store
  const table = tables[databaseId]?.find((t) => t.$id === tableId);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (table) {
      setIsLoading(false);
    }
  }, [table]);

  const handleDelete = async () => {
    if (!currentProject || !table) return;

    setIsDeleting(true);
    try {
      await deleteTable(
        currentProject.$id,
        currentProject.region || "fra",
        databaseId,
        tableId,
      );

      // Close dialog
      setIsDialogOpen(false);

      // Navigate back to database view
      router.back();
    } catch (err) {
      console.error("Error deleting table:", err);
      // We could set an error state here to show in the dialog if we wanted
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <Text className="text-muted-foreground">Loading...</Text>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-border mb-10 bg-card">
      <View className="flex-row items-center gap-2 mb-2">
        <Icon as={AlertTriangle} size={20} className="text-destructive" />
        <Text className="text-lg font-bold text-foreground">Delete Table</Text>
      </View>
      <Text className="text-sm text-muted-foreground mb-4">
        Deleting this table will permanently remove all documents and data
        associated with it. This action is irreversible.
      </Text>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="secondary"
            className="flex-row items-center justify-center gap-2"
          >
            <Icon as={Trash2} size={18} color="white" />
            <Text className="text-white font-bold ml-2">Delete Table</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[90%] max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              table
              <Text className="font-bold text-foreground">
                {" "}
                "{table?.name}"{" "}
              </Text>
              and remove all data associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-muted-foreground"
              style={{ borderColor: "#2e2e2eff" }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isDeleting}
              variant="secondary"
              onPress={handleDelete}
              className="px-4 bg-primary"
            >
              {isDeleting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium">Deleting...</Text>
                </View>
              ) : (
                <Text className="text-white font-medium">Delete</Text>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DangerZone;
