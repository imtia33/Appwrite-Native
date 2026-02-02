import React, { useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const SIZE_CONFIG = {
  sm: { buttonSize: 28, iconSize: 12, padding: 2, gap: 0 },
  md: { buttonSize: 36, iconSize: 16, padding: 4, gap: 0 },
  lg: { buttonSize: 44, iconSize: 20, padding: 6, gap: 0 },
};

const ThemeToggle = ({ size = 'md' }) => {
  const { theme, setTheme, isDark } = useTheme();
  const config = SIZE_CONFIG[size];

  // Map theme value to index
  const themeIndex = THEMES.findIndex((t) => t.value === theme) === -1 
    ? 1 // Default to dark if not found
    : THEMES.findIndex((t) => t.value === theme);

  // The sliding indicator's position
  const translateX = useSharedValue(themeIndex * config.buttonSize);

  useEffect(() => {
    translateX.value = withTiming(themeIndex * config.buttonSize, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
  }, [themeIndex, config.buttonSize]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      style={{ 
        padding: config.padding, 
      }}
      className={cn(
        "flex-row items-center rounded-xl relative border border-border",
        isDark ? "bg-secondary/40" : "bg-muted"
      )}
    >
      {/* Sliding Background Indicator */}
      <Animated.View
        style={[
          animatedIndicatorStyle,
          {
            position: 'absolute',
            left: config.padding,
            width: config.buttonSize,
            height: config.buttonSize,
            borderRadius: 8,
          }
        ]}
        className={cn(
          "shadow-sm",
          isDark ? "bg-primary" : "bg-primary"
        )}
      />

      {/* Theme Buttons */}
      {THEMES.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;

        return (
          <Pressable
            key={t.value}
            onPress={() => setTheme(t.value)}
            style={{
              width: config.buttonSize,
              height: config.buttonSize,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className="z-10"
          >
            <Animated.View
              style={{
                transform: [{ scale: isActive ? 1 : 0.9 }],
                opacity: isActive ? 1 : 0.5,
              }}
            >
              <Icon 
                size={config.iconSize} 
                color={isActive 
                  ? (isDark ? '#F1F5F9' : '#1E293B') 
                  : (isDark ? '#94A3B8' : '#64748B')
                } 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default ThemeToggle;