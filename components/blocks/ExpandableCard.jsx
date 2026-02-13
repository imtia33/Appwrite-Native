import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";

const ExpandableCard = ({
  name,
  tags = [],
  screenshot,
  onScreenshotPress,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const height = useSharedValue(250);
  const opacity = useSharedValue(0);

  const toggleExpand = () => {
    if (isExpanded) {
      // Collapse flow
      setShowContent(false);
      opacity.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) {
          height.value = withTiming(250, { duration: 300 });
          runOnJS(setIsExpanded)(false);
        }
      });
    } else {
      // Expand flow
      height.value = withTiming(560, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsExpanded)(true);
          runOnJS(setShowContent)(true);
          opacity.value = withTiming(1, { duration: 300 });
        }
      });
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[{ borderRadius: 28, overflow: "hidden", borderWidth: 1,borderStyle: "dashed", }, animatedContainerStyle]}
      className="bg-card p-3 mt-4 border-border"
    >
      {/* Header/Main Image Area - Now Clickable for Redirection */}
      <Pressable onPress={onScreenshotPress}>
        <View
          style={{ height: 200, borderRadius: 25, overflow: "hidden" }}
          className="w-full bg-muted/20"
        >
          {screenshot}
        </View>
      </Pressable>

      {/* Expanded Content */}
      {showContent && (
        <Animated.View style={[animatedContentStyle]} className="gap-3 ">
          <View
            style={{ height: 290, borderRadius: 25 }}
            className="w-full bg-muted/30 p-4"
          >
            <Text className="text-xl font-bold text-foreground">{name}</Text>

            {/* tags container - showing framework as tags[0] */}
            <View className="pb-4 pt-2 flex-row gap-2 border-b border-border">
              {tags.length > 0 && (
                <View className="bg-input rounded-sm px-3 py-1">
                  <Text className="text-muted-foreground font-medium text-xs uppercase">
                    {tags[0]}
                  </Text>
                </View>
              )}
            </View>

            {/* Area for more JSON data */}
            <View
              style={{ maxHeight: 160, borderRadius: 24 }}
              className="h-full w-full mt-2 bg-muted/10 p-4"
            >
              {children}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Expand/Collapse Toggle Button */}
      <Pressable
        onPress={toggleExpand}
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Entypo
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="gray"
        />
      </Pressable>
    </Animated.View>
  );
};

export default ExpandableCard;
