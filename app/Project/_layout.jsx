import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/theme-context'
const ProjectLayout = () => {
  const theme = useTheme();
  return (
    <SafeAreaView className='h-full'>
      <Slot />
      <StatusBar backgroundColor={theme.theme !== 'dark' ? '#EDEDF0' : '#19191D'} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} animated={true} />
    </SafeAreaView>
  )
}

export default ProjectLayout