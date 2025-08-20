import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

const LoadingSpinner = ({ message = "Loading...", size = "large" }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={theme.gradient}
          style={styles.spinnerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ActivityIndicator size={size} color="#fff" />
        </LinearGradient>
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LoadingSpinner;
