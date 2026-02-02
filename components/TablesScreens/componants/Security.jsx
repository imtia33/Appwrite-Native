import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Card } from '../../ui/card';
import { Icon } from '../../ui/icon';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { UserCheck } from 'lucide-react-native';
import { sdk } from '../../../appwrite/appwrite';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useDatabaseStore from '../../../appwrite/data-services/databaseService';

const Security = ({ databaseId, collectionId }) => {
  const { currentProject } = useProjectStore();
  const { collections, fetchCollections } = useDatabaseStore();
  
  // Get collection from store
  const collection = collections[databaseId]?.find(c => c.$id === collectionId);
  
  const [rowSecurity, setRowSecurity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load collection data
  useEffect(() => {
    if (collection) {
      setRowSecurity(collection.documentSecurity || false);
      setIsLoading(false);
    }
  }, [collection]);

  // Detect changes
  useEffect(() => {
    if (collection) {
      setHasChanges(rowSecurity !== (collection.documentSecurity || false));
    }
  }, [rowSecurity, collection]);

  const handleUpdate = async () => {
    if (!currentProject || !collection) return;
    
    setIsSaving(true);
    try {
      const projectSdk = sdk.forProject(currentProject.region || 'fra', currentProject.$id);
      
      await projectSdk.databases.updateCollection(
        databaseId,
        collectionId,
        collection.name || '',
        collection.$permissions || [],
        rowSecurity,
        collection.enabled !== false
      );
      
      // Refresh collections in store
      await fetchCollections(currentProject.$id, currentProject.region || 'fra', databaseId, true);
      
      Alert.alert("Success", "Security settings updated successfully.");
    } catch (err) {
      console.error('Error updating security:', err);
      Alert.alert("Error", err.message || "Failed to update security settings");
    } finally {
      setIsSaving(false);
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
    <>
      <Card className="p-4 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Icon as={UserCheck} size={18} className="text-primary" />
            <Text className="text-lg font-bold text-foreground">Row Security</Text>
          </View>
          <Switch 
            checked={rowSecurity}
            onCheckedChange={setRowSecurity}
          />
        </View>
        <Text className="text-sm text-muted-foreground leading-relaxed">
          When row security is <Text className="font-bold text-foreground">enabled</Text>, users will be able to access rows for which they have been granted either row or table permissions.
        </Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
          If <Text className="font-bold text-foreground">disabled</Text>, users can access rows only if they have table permissions. Row permissions will be ignored.
        </Text>
      </Card>

      {/* Update Button */}
      {isSaving ? (
        <View className="w-full h-12 mb-4 items-center justify-center bg-muted/10 rounded-xl">
           <ActivityIndicator color="#FD366E" />
        </View>
      ) : (
        <Button 
          className="bg-primary w-full h-12 mb-4" 
          onPress={handleUpdate}
          disabled={!hasChanges}
         >
          <Text className="text-white font-bold">Update Security Settings</Text>
        </Button>
      )}
    </>
  );
};

export default Security;
