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
  const { setColorScheme: setNativeColorScheme } = useColorScheme();
  // Default to dark mode immediately to ensure consistent initial render
  const [theme, setThemeState] = useState('dark'); 

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-theme');
        // Validate saved theme - only accept 'light' or 'dark'. Default to 'dark' otherwise.
        const themeToUse = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
        
        setNativeColorScheme(themeToUse);
        setThemeState(themeToUse);
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        setNativeColorScheme('dark');
        setThemeState('dark');
      }
    };

    loadTheme();
  }, [setNativeColorScheme]);

  const setTheme = async (newTheme) => {
    // Strictly enforce light/dark
    if (newTheme !== 'light' && newTheme !== 'dark') return;

    try {
      await AsyncStorage.setItem('app-theme', newTheme);
      setNativeColorScheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };
  
  // With system mode removed, the current theme and color scheme are always explicit
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const value = {
    theme, // 'light' | 'dark'
    actualTheme: theme, 
    toggleTheme,
    isDark,
    isLight,
    setTheme,
    getThemeValue: (lightVal, darkVal) => (theme === 'dark' ? darkVal : lightVal),
  };

  // Removed the null check to prevent unmounting children

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};