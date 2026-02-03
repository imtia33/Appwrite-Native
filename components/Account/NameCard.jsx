import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const NameCard = ({ user, onUpdate }) => {
  const [name, setName] = useState(user?.name || '')

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate({ name })
    }
  }

  return (
    <Card className='p-6 gap-0'>
      <CardTitle className='text-2xl font-regular text-foreground'>Name</CardTitle>

      <Label className='text-lg font-regular text-muted-foreground mt-2'>Name</Label>
      <Input
        className='mt-2'
        value={name}
        onChangeText={setName}
      />
      <View style={{borderTopWidth:1}} className='mt-10 pt-3 border-border'>
        <Button
          style={{width:100}}
          className='mt-2 self-end'
          onPress={handleUpdate}
        >
          <Text className='text-lg font-regular text-white'>Update</Text>
        </Button>
      </View>
    </Card>
  )
}

export default NameCard
