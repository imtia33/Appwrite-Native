import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';

const EditDatabaseModal = ({ open, onOpenChange, onUpdate, database, isLoading }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (database) {
      setName(database.name || '');
    }
  }, [database]);

  const handleSubmit = () => {
    if (!name || name === database?.name) return;
    onUpdate(database.$id, name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update database</DialogTitle>
        </DialogHeader>
        
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="edit-name-label">Name</Label>
            <Input
              placeholder="Enter database name"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        </View>

        <DialogFooter className="flex-row justify-end gap-3">
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            <Text>Cancel</Text>
          </Button>
          <Button 
            onPress={handleSubmit} 
            disabled={!name || name === database?.name || isLoading}
            className={isLoading ? 'opacity-70' : ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-primary-foreground font-semibold">Update</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDatabaseModal;
