import { View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/blocks/DataTable'
import { listIdentities, deleteIdentity } from '@/appwrite/auth/auth'
import { Icon } from '@/components/ui/icon'
import { Trash2 } from 'lucide-react-native'
import { FontAwesome } from '@expo/vector-icons'

const IdentitiesCard = () => {
  const [identities, setIdentities] = useState([])
  const [loading, setLoading] = useState(true)

  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'github': return 'github';
      case 'google': return 'google';
      case 'facebook': return 'facebook';
      case 'apple': return 'apple';
      default: return 'user';
    }
  }

  useEffect(() => {
    loadIdentities()
  }, [])

  const loadIdentities = async () => {
    try {
      setLoading(true)
      const data = await listIdentities()
      setIdentities(data.identities || [])
    } catch (error) {
      console.error('Failed to load identities:', error)
      setIdentities([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (identityId) => {
    try {
      await deleteIdentity(identityId)
      // Reload identities after deletion
      await loadIdentities()
    } catch (error) {
      console.error('Failed to delete identity:', error)
    }
  }

  const columns = [
    {
      id: 'provider',
      header: 'Provider',
      accessorKey: 'provider',
      cell: ({ row }) => (
        <View className='flex-row items-center gap-2'>
          <FontAwesome 
            name={getProviderIcon(row.original.provider)} 
            size={16} 
            color="gray" 
          />
          <Text className='text-foreground text-sm capitalize'>
            {row.original.provider}
          </Text>
        </View>
      )
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'providerEmail',
      cell: ({ row }) => (
        <Text className='text-foreground text-sm'>
          {row.original.providerEmail}
        </Text>
      )
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessorKey: '$createdAt',
      cell: ({ row }) => (
        <Text className='text-foreground text-sm'>
          {new Date(row.original.$createdAt).toLocaleDateString()}
        </Text>
      )
    },
    {
      id: 'expiryDate',
      header: 'Expiry Date',
      accessorKey: 'providerAccessTokenExpiry',
      cell: ({ row }) => (
        <Text className='text-foreground text-sm'>
          {row.original.providerAccessTokenExpiry 
            ? new Date(row.original.providerAccessTokenExpiry).toLocaleDateString()
            : '-'}
        </Text>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onPress={() => handleDelete(row.original.$id)}
        >
          <Icon as={Trash2} size={18} className="text-destructive" />
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <Card className='p-6 gap-0 mt-3'>
        <CardTitle className='text-2xl font-regular text-foreground'>Identities</CardTitle>
        <CardDescription className='text-lg font-regular text-muted-foreground mt-2'>
          Identities are your connected OAuth accounts. You can sign in using these accounts.
        </CardDescription>
        <View className='mt-6 items-center justify-center py-8'>
          <ActivityIndicator size="large" />
        </View>
      </Card>
    )
  }

  if (identities.length === 0) {
    return (
      <Card className='p-6 gap-0 mt-3'>
        <CardTitle className='text-2xl font-regular text-foreground'>Identities</CardTitle>
        <CardDescription className='text-lg font-regular text-muted-foreground mt-2'>
          Identities are your connected OAuth accounts. You can sign in using these accounts.
        </CardDescription>
        <View className='mt-6 items-center justify-center py-8'>
          <Text className='text-muted-foreground text-center italic'>
            No identities are currently available.{'\n'}
            Once you sign in via OAuth providers, you'll see them here.
          </Text>
        </View>
      </Card>
    )
  }

  return (
    <Card className='p-6 gap-0 mt-3'>
      <CardTitle className='text-2xl font-regular text-foreground'>Identities</CardTitle>
      <CardDescription className='text-lg font-regular text-muted-foreground mt-2'>
        Identities are your connected OAuth accounts. You can sign in using these accounts.
      </CardDescription>
      
      <View className='mt-4'>
        <DataTable
          data={identities}
          columns={columns}
          searchPlaceholder="Search identities..."
          filterKey="providerEmail"
          pagination={false}
        />
      </View>
    </Card>
  )
}

export default IdentitiesCard
