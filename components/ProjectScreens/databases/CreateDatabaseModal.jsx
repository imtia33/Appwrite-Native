import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Icon } from '../../ui/icon';
import { Pencil } from 'lucide-react-native';
import { ID } from '@appwrite.io/console';

const CreateDatabaseModal = ({ open, onOpenChange, onCreate, isLoading }) => {
  const [name, setName] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [showCustomId, setShowCustomId] = useState(false);

  const handleSubmit = () => {
    if (!name ) return;
    onCreate(name, databaseId || ID.unique());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
              <Text className="text-xs font-medium text-muted-foreground">Database ID</Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-2 animate-in fade-in slide-in-from-top-1">
              <Label nativeID="id-label">Database ID</Label>
              <Input
                placeholder="Enter custom ID"
                value={databaseId}
                onChangeText={setDatabaseId}
              />
            </View>
          )}
        </View>

        <DialogFooter className="flex-row justify-end gap-3">
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            <Text>Cancel</Text>
          </Button>
          <Button 
            onPress={handleSubmit} 
            disabled={!name || isLoading}
            className={isLoading ? 'opacity-70' : ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-primary-foreground font-semibold">Create</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatabaseModal;
