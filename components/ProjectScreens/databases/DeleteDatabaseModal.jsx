import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';

const DeleteDatabaseModal = ({ open, onOpenChange, onConfirm, database, isLoading }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm(database.$id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete database</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <Text className="font-bold text-foreground">{database?.name || database?.$id}</Text>? 
            Once deleted, this database and its backups cannot be restored. This action is irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <View className="flex-row items-center gap-3 py-4">
          <Checkbox 
            id="confirm-delete" 
            checked={confirmed} 
            onCheckedChange={setConfirmed}
          />
          <Label 
            nativeID="confirm-delete-label" 
            onPress={() => setConfirmed(!confirmed)}
            className="text-sm font-medium"
          >
            I understand and confirm
          </Label>
        </View>

        <AlertDialogFooter className='flex-row justify-end gap-3'>
          <AlertDialogCancel style={{ borderColor: "#373938ff" }} onPress={() => onOpenChange(false)}>
            <Text className="text-muted-foreground">Cancel</Text>
          </AlertDialogCancel>
          <Button 
            variant="destructive" 
            onPress={handleConfirm} 
            disabled={!confirmed || isLoading}
            style={{ borderColor: "#373938ff" }}
            className={(!confirmed || isLoading) ? 'opacity-50' : ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-foreground font-semibold">Delete</Text>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDatabaseModal;
