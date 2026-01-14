import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { colorScheme, setColorScheme: setNativeColorScheme } = useColorScheme();
  const [theme, setTheme] = useState(null); // null means loading

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-theme');
        const themeToUse = savedTheme || 'dark'; // Default to dark as per user preference
        setNativeColorScheme(themeToUse);
        setTheme(themeToUse);
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        setNativeColorScheme('dark'); // Default to dark as per user preference
        setTheme('dark');
      }
    };

    loadTheme();
  }, [setNativeColorScheme]);

  // Update local theme state when native theme changes
  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    try {
      await AsyncStorage.setItem('app-theme', newTheme);
      setNativeColorScheme(newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    setTheme: async (newTheme) => {
      try {
        await AsyncStorage.setItem('app-theme', newTheme);
        setNativeColorScheme(newTheme);
        setTheme(newTheme);
      } catch (error) {
        console.error('Failed to save theme to storage:', error);
      }
    }
  };

  if (theme === null) {
    return null; // Don't render children until theme is loaded
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};