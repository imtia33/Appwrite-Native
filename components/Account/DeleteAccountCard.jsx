import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DeleteAccountModal from './modals/DeleteAccountModal'

const DeleteAccountCard = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Card className='p-6 gap-0 mt-6 border-primary/20 bg-primary/5'>
      <CardTitle className='text-xl font-medium text-foreground'>Delete account</CardTitle>

      <Text className='text-sm font-regular text-muted-foreground mt-2 leading-5'>
        Your account will be permanently deleted and access will be lost to any of your teams and data. This action is irreversible.
      </Text>

      <View style={{ borderTopWidth: 1 }} className='mt-8 pt-3 border-primary/20'>
        <Button
          variant="primary"
          style={{ width: 90 }}
          className='mt-2 self-end h-10'
          onPress={() => setShowModal(true)}
        >
          <Text className='text-sm font-medium text-white'>Delete</Text>
        </Button>
      </View>

      <DeleteAccountModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
      />
    </Card>
  )
}

export default DeleteAccountCard
