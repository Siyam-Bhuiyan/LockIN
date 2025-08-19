import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const ProgressBar = ({
  progress = 0,
  height = 8,
  style,
  showPercentage = false,
  animated = true,
  color,
}) => {
  const { theme } = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const progressValue = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progressValue,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progressValue);
    }
  }, [progressValue, animated]);

  const containerStyle = {
    height,
    backgroundColor: theme.border,
    borderRadius: height / 2,
    overflow: "hidden",
    width: "100%",
  };

  const barStyle = {
    height: "100%",
    backgroundColor: color || theme.primary,
    borderRadius: height / 2,
    width: animatedWidth.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }),
  };

  return (
    <View style={style}>
      <View style={containerStyle}>
        <Animated.View style={barStyle} />
      </View>
      {showPercentage && (
        <Text style={[styles.percentageText, { color: theme.textSecondary }]}>
          {Math.round(progressValue * 100)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },
});

export default ProgressBar;
