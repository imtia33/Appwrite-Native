import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const EmailCard = ({ user, onUpdate }) => {
  const [email, setEmail] = useState(user?.email || '')

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate({ email })
    }
  }

  return (
    <Card className='p-6 gap-0 mt-3'>
      <View className='flex-row justify-between items-center'>
        <CardTitle className='text-2xl font-regular text-foreground'>Email</CardTitle>
        {user?.emailVerification && (
          <Badge variant='success' className='mt-2'>
            <Text className='text-lg font-regular text-foreground'>
              Verified
            </Text>
          </Badge>
        )}
      </View>

      <Label className='text-lg font-regular text-muted-foreground mt-2'>Email</Label>
      <Input
        className='mt-2'
        value={email}
        onChangeText={setEmail}
      />
      <View style={{borderTopWidth:1}} className='mt-7 pt-3 border-border'>
        <Button
          style={{width:100}}
          className='mt-2 self-end'
          onPress={handleUpdate}
        >
          <Text className='text-lg font-regular text-foreground'>Update</Text>
        </Button>
      </View>
    </Card>
  )
}

export default EmailCard
