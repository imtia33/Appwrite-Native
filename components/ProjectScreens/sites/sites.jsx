import { View, TouchableOpacity, ActivityIndicator, FlatList, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useSitesStore from '../../../appwrite/data-services/sitesService';
import { useTheme } from '../../../lib/theme-context';
import { Card, CardContent } from '../../ui/card';
import { Icon } from '../../ui/icon';
import { Globe, Plus, Trash2, ExternalLink, Clock, AlertCircle, MoreHorizontal, Code } from 'lucide-react-native';
import { darkIcons, lightIcons } from '../../../constants/icons';
import { Skeleton } from '../../ui/skeleton';
import { Text } from '../../ui/text';
import { Button } from '../../ui/button';
import {  sdk } from '../../../appwrite/appwrite';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const timeFromNow = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const SiteScreenshot = ({ site }) => {
  const { isDark } = useTheme();
  const { currentProject } = useProjectStore();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fileId = isDark ? site?.deploymentScreenshotDark : site?.deploymentScreenshotLight;
    
    if (!fileId) {
        setImageUri(null);
        return;
    }

    let isMounted = true;

    const fetchScreenshot = async () => {
      setLoading(true);
      try {
         const region = currentProject?.region === 'default' ? 'fra' : (currentProject?.region || 'fra');
         const consoleSdk = sdk.forConsoleIn(region);
         
         const url = consoleSdk.storage.getFileView({
            bucketId: 'screenshots',
            fileId,
          });

         const response = await consoleSdk.client.call('GET', new URL(url), {}, {}, 'arrayBuffer');
         
         if (isMounted && response) {
            const base64 = arrayBufferToBase64(response);
            setImageUri(`data:image/png;base64,${base64}`);
         }

      } catch (err) {
        console.error("Error fetching site screenshot:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchScreenshot();
    
    return () => { isMounted = false; };
  }, [site, isDark, currentProject]);

  if (loading) {
      return (
         <View className="h-[175px] items-center justify-center">
            <ActivityIndicator />
         </View>
      );
  }

  if (imageUri) {
      return (
        <Image 
          source={{ uri: imageUri }} 
          style={{  height: 175, borderRadius: 10 }}
          resizeMode="contain"
        />
      );
  }

  return (
      <View className="w-full h-full items-center justify-center">
        <Icon as={Globe} size={48} className="text-muted-foreground/30" />
      </View>
  );
};

const sites = () => {
  const { theme, isDark } = useTheme();
  const { currentProject } = useProjectStore();
  const { fetchSites, getSites, isLoading, getError, deleteSite } = useSitesStore();
  
  const allSites = currentProject?.$id ? getSites(currentProject.$id) : [];
  
  const loading = isLoading();
  const error = getError();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      fetchSites(currentProject.$id);
    }
  }, [currentProject?.$id, fetchSites]);

  const onRefresh = async () => {
    if (currentProject?.$id) {
      setRefreshing(true);
      await fetchSites(currentProject.$id);
      setRefreshing(false);
    }
  };



  const handleDelete = (site) => {
    Alert.alert(
      'Delete Site',
      `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSite(currentProject.$id, currentProject.region || 'fra', site.$id);
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const getDeploymentDesc = (site) => {
    if (site?.latestDeploymentStatus === 'building') {
      return `Building...`;
    } else if (site?.deploymentCreatedAt) {
      return `Deployed ${timeFromNow(site.deploymentCreatedAt)}`;
    } else {
      return 'No active deployment';
    }
  };



  if (!currentProject) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-background">
        <Icon as={AlertCircle} className="text-muted-foreground" size={48} />
        <Text variant="muted" className="text-center mt-4 text-foreground">No project selected</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 border-b border-border">
        <View className="flex-row justify-between items-center">
          <View>
            <Text variant="muted" className="text-muted-foreground">Deploy and manage your web applications</Text>
          </View>
          
        </View>
        <Button size="sm" variant="outline" className="flex-row items-center gap-2 bg-primary w-32 mt-2">
            <Icon as={Plus} size={16} color='white' />
            <Text className='text-white'>Create</Text>
          </Button>
      </View>
      

      {loading && allSites.length === 0 ? (
        <View className="p-4 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="mb-4 overflow-hidden">
               <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </View>
      ) : error ? (
        <View className="p-4 items-center justify-center">
          <Text className="text-destructive font-medium">Error loading sites</Text>
          <Text variant="muted" className="text-center mt-1 text-muted-foreground">{error}</Text>
          <Button 
            className="mt-4"
            onPress={() => fetchSites(currentProject.$id)}
          >
            Retry
          </Button>
        </View>
      ) : allSites.length === 0 ? (
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary || '#007AFF']} />}
        >
          <View className="items-center justify-center bg-card p-10 rounded-3xl border border-border w-full">
            <Icon as={Globe} className="text-muted-foreground" size={64} />
            <Text variant="h4" className="mt-6 text-center text-foreground">No sites yet</Text>
            <Text variant="muted" className="text-center mt-2 mb-8 text-muted-foreground">
              Launch your first web app with Appwrite Sites.
            </Text>
            <Button size="lg" className="flex-row items-center">
              <Icon as={Plus} className="text-primary-foreground" size={20} />
              <Text className="text-primary-foreground ml-2">Create site</Text>
            </Button>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={allSites}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary || '#007AFF']} />}
          renderItem={ ({ item: site }) => {
           
            return (
              <Card className="mb-3 overflow-hidden bg-card border-border shadow-lg">
                <View className="px-2 bg-muted/20 ">
                  <SiteScreenshot site={site} />
                    <View style={{borderWidth:1,borderStyle:'dashed',borderColor:'gray'}} className="absolute bottom-3 left-3 rounded-xl ">
                      {(() => {
                        const icons = isDark ? darkIcons : lightIcons;
                        let FrameworkIcon = null;
                        
                        const framework = site.framework ? site.framework.toLowerCase() : '';
                        
                        if (icons[framework]) {
                            FrameworkIcon = icons[framework];
                        } else if (framework === 'react-native') {
                            FrameworkIcon = icons['react'];
                        } else if (framework === 'static') {
                            FrameworkIcon = icons['html5'];
                        } else {
                           
                        }

                        const IconComponent = FrameworkIcon?.default || FrameworkIcon;

                        if (IconComponent) {
                             return <IconComponent width={22} height={22} />;
                        }
                        return <Icon as={Code} size={22} color='gray' />;
                      })()}
                    </View>
                </View>

                  <View className="flex-row justify-between items-start mb-1 px-4">
                    <View className="flex-1">
                      <Text variant="h4" className="text-xl font-bold text-foreground" numberOfLines={1}>
                        {site.name}
                      </Text>
                      <Text variant="muted" className="text-muted-foreground mt-1">
                        {getDeploymentDesc(site)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => {/* Actions */}}>
                      <Icon as={MoreHorizontal} color='gray' size={24} />
                    </TouchableOpacity>
                  </View>

              </Card>
            );
          }}
        />
      )}
    </View>
  );
};

export default sites;