import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updatePassword } from '@/appwrite/auth/auth'

const PasswordCard = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both password fields.')
      return
    }

    try {
      setLoading(true)
      await updatePassword(newPassword, oldPassword)
      setOldPassword('')
      setNewPassword('')
      Alert.alert('Success', 'Password has been updated successfully.')
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='p-6 gap-0 mt-3'>
      <CardTitle className='text-2xl font-regular text-foreground'>Password</CardTitle>
      
      <View className='mt-2 flex-row flex-wrap items-center'>
        <Text className='text-muted-foreground mr-1'>Forgot your password?</Text>
        <TouchableOpacity>
          <Text className='text-primary font-medium'>Recover your password</Text>
        </TouchableOpacity>
      </View>

      <View className='mt-6'>
        <Label className='text-lg font-regular text-muted-foreground'>Old password</Label>
        <Input
          className='mt-2'
          placeholder="Enter password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
      </View>

      <View className='mt-4'>
        <Label className='text-lg font-regular text-muted-foreground'>New password</Label>
        <Input
          className='mt-2'
          placeholder="Enter password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={{borderTopWidth:1}} className='mt-10 pt-3 border-border'>
        <Button
          style={{width:100}}
          className='mt-2 self-end'
          onPress={handleUpdate}
          disabled={loading || !oldPassword || !newPassword}
        >
          <Text className='text-lg font-regular text-white'>
            {loading ? 'Updating...' : 'Update'}
          </Text>
        </Button>
      </View>
    </Card>
  )
}

export default PasswordCard
