import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring,
  interpolateColor,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme-context';

const ToggleSwitch = ({ 
  initialState = true, // Default to true (dark mode) as per user preference
  onToggle, 
  activeIcon: ActiveIcon, 
  inactiveIcon: InactiveIcon,
  activeColor = "#09090B",
  inactiveColor = "#FD366E", // slate-30
  trackWidth = 60,
  trackHeight = 30,
  thumbSize = 24,
  thumbBorderPadding = 4 // Space from edge for thumb
}) => {
  const { theme, toggleTheme, isDark, setTheme } = useTheme();
  const isOn = isDark; // Use the theme context state
  
  const progress = useSharedValue(0);
  
  useEffect(() => {
    progress.value = withTiming(isOn ? 1 : 0, { duration: 400 });
  }, [isOn, progress]);

  const handleToggle = () => {
    toggleTheme();
    
    if (onToggle) onToggle(!isOn);
  };

  // Calculate positions based on sizes
  const startX = thumbBorderPadding;
  const endX = trackWidth - thumbSize - thumbBorderPadding;

  // 1. Track Animation (Background Color)
  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );
    return { backgroundColor };
  });

  // 2. Knob Animation (Movement)
  const animatedKnobStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [startX, endX] // Adjust based on dynamic sizes
    );
    return { transform: [{ translateX }] };
  });

  // 3. Icon Animations (Scale and Rotation inside the knob)
  const activeIconStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.5, 1]) },
        { rotate: `${interpolate(progress.value, [0, 1], [-90, 0])}deg` }
      ],
    };
  });

  const inactiveIconStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - progress.value,
      transform: [
        { scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
        { rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` }
      ],
    };
  });

  // Create dynamic styles based on props
  const dynamicStyles = StyleSheet.create({
    track: {
      width: trackWidth,
      height: trackHeight,
      borderRadius: trackHeight / 2,
      justifyContent: 'center',
      paddingHorizontal: 0,
      position: 'relative',
    },
    knob: {
      width: thumbSize,
      height: thumbSize,
      borderRadius: thumbSize / 2,
      backgroundColor: 'white',
      elevation: 3, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: thumbSize * 0.625, // 20px when thumbSize is 32px
      height: thumbSize * 0.625,
      position: 'relative',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

  return (
    <Pressable onPress={handleToggle}>
      <Animated.View style={[dynamicStyles.track, animatedTrackStyle]}>
        
        {/* Sliding Knob */}
        <Animated.View style={[dynamicStyles.knob, animatedKnobStyle]}>
          <View style={dynamicStyles.iconContainer}>
            {ActiveIcon && (
              <Animated.View style={[StyleSheet.absoluteFill, dynamicStyles.center, activeIconStyle]}>
                <ActiveIcon size={thumbSize * 0.625} color={activeColor} />
              </Animated.View>
            )}
            {InactiveIcon && (
              <Animated.View style={[StyleSheet.absoluteFill, dynamicStyles.center, inactiveIconStyle]}>
                <InactiveIcon size={thumbSize * 0.625} color="#64748b" />
              </Animated.View>
            )}
          </View>
        </Animated.View>

      </Animated.View>
    </Pressable>
  );
};

export default ToggleSwitch;