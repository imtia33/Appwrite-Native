import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ToastAndroid } from 'react-native';
import { Card } from '../../ui/card';
import { Icon } from '../../ui/icon';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Copy, Settings as SettingsIcon, Eye } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../ui/button';
import { sdk } from '../../../appwrite/appwrite';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useDatabaseStore from '../../../appwrite/data-services/databaseService';

const GeneralInfo = ({ databaseId, collectionId }) => {
  const { currentProject } = useProjectStore();
  const { collections, fetchCollections } = useDatabaseStore();
  
  // Get collection from store
  const collection = collections[databaseId]?.find(c => c.$id === collectionId);
  
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setEnabled(collection.enabled !== false);
      setIsLoading(false);
    }
  }, [collection]);


  // Detect changes
  useEffect(() => {
    if (collection) {
      const nameChanged = name !== (collection.name || '');
      const enabledChanged = enabled !== (collection.enabled !== false);
      setHasChanges(nameChanged || enabledChanged);
    }
  }, [name, enabled, collection]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };


  const handleUpdate = async () => {
    if (!currentProject || !collection) return;
    
    setIsSaving(true);
    try {
      const projectSdk = sdk.forProject(currentProject.region || 'fra', currentProject.$id);
      
      await projectSdk.databases.updateCollection(
        databaseId,
        collectionId,
        name,
        collection.$permissions || [],
        collection.documentSecurity || false,
        enabled
      );
      
      // Refresh collections in store
      await fetchCollections(currentProject.$id, currentProject.region || 'fra', databaseId, true);
      ToastAndroid.show("General settings updated successfully.", ToastAndroid.SHORT);
    } catch (err) {
      console.error('Error updating general info:', err);
      ToastAndroid.show(err.message || "Failed to update general settings", ToastAndroid.SHORT);
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
      <Card className="p-4 mb-4 gap-4">
        <View>
          <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">Name</Text>
          <Input 
            value={name}
            onChangeText={setName}
            placeholder="Collection Name"
            className="bg-muted/10"
          />
        </View>
        <View className="flex-row items-center gap-3 ">
          
          <Switch 
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Text className="text-lg font-bold text-foreground"> {enabled ? "Enabled" : "Disabled"}</Text>
          
        </View>
        <Text className="text-xs text-muted-foreground">Disabling this lets others from using this table</Text>
        
  
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
            <Text className="text-white font-bold">Update</Text>
          </Button>
        )}
      </Card>
  );
};

export default GeneralInfo;
