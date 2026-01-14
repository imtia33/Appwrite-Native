import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  withSequence, 
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';

// Create an animated version of the SVG Path
const AnimatedPath = Animated.createAnimatedComponent(Path);

const DASH_ARRAY = 600;

const Loading = ({ size = 200 }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // This mimics the CSS: 0% (start), 45% (full), 55% (hold), 100% (reverse)
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2250, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }), // Draw in
        withDelay(500, withTiming(0, { duration: 2250, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) })) // Pause then Draw out
      ),
      -1 // Infinite loop
    );
  }, []);

  // Animated props for the outer path
  const outerPathProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [DASH_ARRAY, 0]),
  }));

  // Animated props for the inner path (with a slight perceived delay logic)
  const innerPathProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [DASH_ARRAY, 0]),
  }));

  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="-5 -5 122 108"
    >
      {/* Main outer path */}
      <AnimatedPath
        d="M111.1 73.4729V97.9638H48.8706C30.7406 97.9638 14.9105 88.114 6.44112 73.4729C5.2099 71.3444 4.13229 69.1113 3.22835 66.7935C1.45387 62.2516 0.338421 57.3779 0 52.2926V45.6712C0.0734729 44.5379 0.189248 43.4135 0.340647 42.3025C0.650124 40.0227 1.11768 37.7918 1.73218 35.6232C7.54544 15.0641 26.448 0 48.8706 0C71.2932 0 90.1935 15.0641 96.0068 35.6232H69.3985C65.0302 28.9216 57.4692 24.491 48.8706 24.491C40.272 24.491 32.711 28.9216 28.3427 35.6232C27.0113 37.6604 25.9782 39.9069 25.3014 42.3025C24.7002 44.4266 24.3796 46.6664 24.3796 48.9819C24.3796 56.0019 27.3319 62.3295 32.0653 66.7935C36.4515 70.9369 42.3649 73.4729 48.8706 73.4729H111.1Z"
        stroke="#FD366E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={DASH_ARRAY}
        animatedProps={outerPathProps}
      />
      
      {/* Secondary inner path */}
      <AnimatedPath
        d="M111.1 42.3027V66.7937H65.6759C70.4094 62.3297 73.3616 56.0021 73.3616 48.9821C73.3616 46.6666 73.041 44.4268 72.4399 42.3027H111.1Z"
        stroke="#FD366E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={DASH_ARRAY}
        animatedProps={innerPathProps}
      />
    </Svg>
  );
};

const styles = StyleSheet.create({});

export default Loading;