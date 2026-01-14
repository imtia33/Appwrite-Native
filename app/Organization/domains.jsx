import { View, Text, TextInput, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { sdk } from '../../appwrite/appwrite';
import { Search, Plus, MoreVertical, RefreshCw, Trash2 } from 'lucide-react-native';
import DeleteDomainModal from '../../components/Domains/DeleteDomainModal';
import RetryDomainModal from '../../components/Domains/RetryDomainModal';
import AddDomainModal from '../../components/Domains/AddDomainModal';

const Domains = () => {
  const { currentOrganization } = useOrganizationStore();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchDomains();
    }
  }, [currentOrganization]);

  const fetchDomains = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      const response = await sdk.forConsole.domains.list(currentOrganization.$id, []);
      setDomains(response.domains || []);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const isDomainVerified = (domain) => {
    return domain.nameservers?.toLowerCase() === 'appwrite';
  };

  const filteredDomains = domains.filter(domain =>
    domain.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRetry = (domain) => {
    setSelectedDomain(domain);
    setShowRetry(true);
    setActiveMenu(null);
  };

  const handleDelete = (domain) => {
    setSelectedDomain(domain);
    setShowDelete(true);
    setActiveMenu(null);
  };

  const DomainActionMenu = ({ domain }) => {
    const isVerified = isDomainVerified(domain);
    const isActive = activeMenu === domain.$id;

    return (
      <View className="relative bg-background">
        <Pressable
          onPress={() => setActiveMenu(isActive ? null : domain.$id)}
          className="p-2"
        >
          <MoreVertical size={20} color="#666" />
        </Pressable>

        {isActive && (
          <View className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            {!isVerified && (
              <Pressable
                onPress={() => handleRetry(domain)}
                className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-100"
              >
                <RefreshCw size={16} color="#666" />
                <Text className="text-gray-700">Retry</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => handleDelete(domain)}
              className="flex-row items-center gap-2 px-4 py-3"
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-red-500">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <Card className="mt-4">
      <CardContent className="items-center justify-center py-12">
        <Text className="text-gray-500 text-lg font-semibold mb-2">Add your first domain</Text>
        <Text className="text-gray-400 text-center mb-6">
          Connect a domain you own to get your project up and running.
        </Text>
        <Button onPress={() => setShowAdd(true)}>
          <Text>Add domain</Text>
        </Button>
      </CardContent>
    </Card>
  );

  const SearchBar = () => (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4">
      <Search size={20} color="#999" />
      <TextInput
        placeholder="Search domains"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="flex-1 ml-2 text-base"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDomains} />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Domains</Text>
          <Button onPress={() => setShowAdd(true)} className="flex-row items-center gap-2">
            <Plus size={18} color="#fff" />
            <Text className="text-white">Add domain</Text>
          </Button>
        </View>

        {/* Search Bar */}
        <SearchBar />

        {/* Domains List */}
        {loading && domains.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-12">
              <Text className="text-center text-gray-500">Loading domains...</Text>
            </CardContent>
          </Card>
        ) : filteredDomains.length === 0 && searchQuery ? (
          <Card className="mt-4">
            <CardContent className="py-12">
              <Text className="text-center text-gray-500">No domains found for "{searchQuery}"</Text>
            </CardContent>
          </Card>
        ) : filteredDomains.length === 0 ? (
          <EmptyState />
        ) : (
          <View className="gap-3">
            {filteredDomains.map((domain) => (
              <Card key={domain.$id}>
                <CardHeader>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <CardTitle>{domain.domain}</CardTitle>
                        {!isDomainVerified(domain) && (
                          <Badge variant="warning" className="ml-2">
                            <Text className="text-xs">Not verified</Text>
                          </Badge>
                        )}
                      </View>
                      <CardDescription>
                        Registrar: {domain.registrar || '-'}
                      </CardDescription>
                    </View>
                    <DomainActionMenu domain={domain} />
                  </View>
                </CardHeader>
                <CardContent>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Nameservers:</Text>
                      <Text className="text-gray-900">{domain.nameservers || '-'}</Text>
                    </View>
                    {domain.expire && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Expiry Date:</Text>
                        <Text className="text-gray-900">
                          {new Date(domain.expire).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {domain.autoRenewal !== undefined && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Auto Renewal:</Text>
                        <Text className="text-gray-900">{domain.autoRenewal ? 'On' : 'Off'}</Text>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <DeleteDomainModal
        open={showDelete}
        onOpenChange={setShowDelete}
        domain={selectedDomain}
        onSuccess={fetchDomains}
      />
      <RetryDomainModal
        open={showRetry}
        onOpenChange={setShowRetry}
        domain={selectedDomain}
        onSuccess={fetchDomains}
      />
      <AddDomainModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchDomains}
      />
    </View>
  );
};

export default Domains;