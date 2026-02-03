import { View, ScrollView } from 'react-native'
import React from 'react'
import { useGlobalContext } from '@/context/appwriteContext'
import NameCard from '@/components/Account/NameCard'
import EmailCard from '@/components/Account/EmailCard'
import IdentitiesCard from '@/components/Account/IdentitiesCard'
import PasswordCard from '@/components/Account/PasswordCard'
import MFACard from '@/components/Account/MFACard'
import DeleteAccountCard from '@/components/Account/DeleteAccountCard'

const OverView = () => {
  const { user } = useGlobalContext();

  const handleNameUpdate = (data) => {
    // TODO: Implement name update logic
  }

  const handleEmailUpdate = (data) => {
    // TODO: Implement email update logic
  }

  return (
    <View className='bg-background h-full'>
      <ScrollView className='h-full p-3'>
        <NameCard user={user} onUpdate={handleNameUpdate} />
        <EmailCard user={user} onUpdate={handleEmailUpdate} />
        <PasswordCard />
        <MFACard />
        <IdentitiesCard />
        <DeleteAccountCard />
      </ScrollView>
    </View>
  )
}

export default OverView