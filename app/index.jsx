import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { useGlobalContext } from '../context/appwriteContext'

const index = () => {
  const { isLogged, loading } = useGlobalContext();

  useEffect(() => {
    if (!loading) {
      if (isLogged) {
        router.replace('/Project')
      } else {
        router.replace('/login')
      }
    }
  }, [isLogged, loading])

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Initializing...</Text>
    </View>
  )
}

export default index