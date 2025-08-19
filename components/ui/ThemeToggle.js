import React, { useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isDark ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isDark]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: isDark ? "#000" : "#666",
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{
          transform: [{ rotate: rotation }, { scale: scaleAnim }],
        }}
      >
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={22}
          color={isDark ? "#f1c40f" : "#e67e22"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
});

export default ThemeToggle;
