import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Linking, Platform, Alert } from 'react-native';
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useGlobalContext } from '../../context/appwriteContext';
import { sdk } from '../../appwrite/appwrite';
import CardGrid from '../../components/blocks/CardGrid';
import BoxAvatar from '../../components/blocks/BoxAvatar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import BaaModal from '../../components/modal/BaaModal';
import Soc2Modal from '../../components/modal/Soc2Modal';
import DeleteOrganizationModal from '../../components/modal/DeleteOrganizationModal';
import dpaFile from '../../assets/dpa.pdf';

const Settings = () => {
  const { currentOrganization, user, isCloud } = useGlobalContext();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showBaa, setShowBaa] = useState(false);
  const [showSoc2, setShowSoc2] = useState(false);
  const [locale, setLocale] = useState(null);
  const [countryList, setCountryList] = useState(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      setName(currentOrganization.name);
      fetchOrgStats();
    }
  }, [currentOrganization]);

  useEffect(() => {
    fetchLocaleData();
  }, []);

  const fetchLocaleData = async () => {
    try {
      const localeRes = await sdk.forConsole.locale.get();
      setLocale(localeRes);
      const countriesRes = await sdk.forConsole.locale.listCountries();
      setCountryList(countriesRes);
    } catch (error) {
      console.error('Error fetching locale data:', error);
    }
  };

  const fetchOrgStats = async () => {
    try {
      const projectsRes = await sdk.forConsole.projects.list();
      const filteredProjects = projectsRes.projects.filter(p => p.teamId === currentOrganization.$id);
      setProjectsCount(filteredProjects.length);

      const membersRes = await sdk.forConsole.teams.listMemberships(currentOrganization.$id);
      setMembersCount(membersRes.total);
      setAvatars(membersRes.memberships.map(m => m.userName || m.userEmail));
    } catch (error) {
      console.error('Error fetching org stats:', error);
    }
  };

  const updateName = async () => {
    setLoading(true);
    try {
      await sdk.forConsole.teams.updateName({
        teamId: currentOrganization.$id,
        name
      });
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString();
      const prefs = await sdk.forConsole.account.getPrefs();
      const newPrefs = { ...prefs, DPA: today };
      await sdk.forConsole.account.updatePrefs({ prefs: newPrefs });

      const asset = Asset.fromModule(dpaFile);
      await asset.downloadAsync();

      if (Platform.OS === 'web') {
        // Create a hidden link and trigger download for web
        const link = document.createElement('a');
        link.href = asset.uri;
        link.download = 'dpa.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For native, use FileSystem to save it to a clean local path
        const fileUri = `${FileSystem.documentDirectory}dpa.pdf`;
        await FileSystem.copyAsync({
          from: asset.localUri || asset.uri,
          to: fileUri
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save DPA PDF',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error downloading DPA:', error);
      Alert.alert('Error', 'Failed to download DPA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="pb-10">
        <CardGrid
          title="Name"
          aside={
            <View className="gap-2">
              <Label nativeID='orgName'>Name</Label>
              <Input
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
                aria-labelledby='orgName'
              />
            </View>
          }
          actions={
            <Button
              onPress={updateName}
              disabled={loading || name === currentOrganization?.name || !name}
            >
              <Text>Update</Text>
            </Button>
          }
        />

        {isCloud && (
          <>
            <CardGrid
              title="BAA"
              description="A Business Associate Agreement (BAA) is a HIPAA-required document ensuring outside services handling patient information follow privacy rules."
              aside={
                <View className="p-4 bg-input rounded-lg border border-border mt-0">
                  <Text className="font-bold text-lg text-muted-foreground">Business Associate Agreement (BAA)</Text>
                  <Text className="text-muted-foreground mt-1">
                    After requesting a BAA, we will contact you via email for the next steps.
                  </Text>
                  <Button
                    variant="outline"
                    className="mt-4 border border-1 bg-card border-border"
                    onPress={() => setShowBaa(true)}
                  >
                    <Text className='text-muted-foreground'>Request BAA</Text>
                  </Button>
                </View>
              }
            />

            <CardGrid
              title="SOC-2"
              description="SOC-2 is a framework for managing and protecting sensitive information, ensuring compliance with trust service criteria."
              aside={
                <View className="p-4 bg-input rounded-lg border border-border mt-2">
                  <Text className="font-bold text-lg text-muted-foreground">Service Organization Control Type 2 (SOC-2)</Text>
                  <Text className="text-muted-foreground mt-1">
                    After requesting SOC-2, we will contact you via email for the next steps.
                  </Text>
                  <Button
                    variant="outline"
                    className="mt-4 border border-1 bg-card border-border"
                    onPress={() => setShowSoc2(true)}
                  >
                    <Text className='text-muted-foreground'>Request SOC-2</Text>
                  </Button>
                </View>
              }
            />
            <CardGrid
              title="DPA"
              description={
                <Text>
                  After downloading, have the DPA signed by your organization's compliance authority, such as your CEO or Compliance Manager, and submit it to{' '}
                  <Text className="text-primary" onPress={() => Linking.openURL('mailto:privacy@appwrite.io')}>
                    privacy@appwrite.io
                  </Text>.
                </Text>
              }
              aside={
                <View className="p-4 bg-input rounded-lg border border-border mt-2">
                  <Text className="font-bold text-lg text-muted-foreground">Data Processing Agreement (DPA)</Text>
                  <Text className="text-muted-foreground mt-1">
                    The DPA is a legal document that describes the roles and responsibilities of Appwrite and the organization when personal data is processed.{' '}
                    <Text className="text-primary" onPress={() => Linking.openURL('https://appwrite.io/docs/advanced/security/gdpr#dpa')}>
                      Learn more
                    </Text>.
                  </Text>
                  <Button
                    variant="outline"
                    className="mt-4 border border-1 bg-card border-border flex-row gap-2"
                    onPress={downloadPdf}
                    disabled={loading}
                  >
                    <Text className='text-muted-foreground'>{loading ? 'Downloading...' : 'Download'}</Text>
                  </Button>
                </View>
              }
            />
          </>
        )}

        <CardGrid
          title="Delete organization"
          description="The organization will be permanently deleted, including all projects and data associated with this organization. This action is irreversible."
          aside={
            <BoxAvatar
              name={currentOrganization?.name || 'Organization'}
              description={`${membersCount} ${membersCount === 1 ? 'member' : 'members'}, ${projectsCount} ${projectsCount === 1 ? 'project' : 'projects'}`}
              avatars={avatars}
              total={membersCount}
            />
          }
          actions={
            <Button
              variant="secondary"
              onPress={() => setShowDelete(true)}
            >
              <Text className='text-muted-foreground'>Delete</Text>
            </Button>
          }
        />
      </View>

      <BaaModal
        open={showBaa}
        onOpenChange={setShowBaa}
        locale={locale}
        countryList={countryList}
      />
      <Soc2Modal
        open={showSoc2}
        onOpenChange={setShowSoc2}
        locale={locale}
        countryList={countryList}
      />
      <DeleteOrganizationModal
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </ScrollView>
  );
};

export default Settings;