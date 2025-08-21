import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Simple and stable animation sequence
    Animated.sequence([
      // Background fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // Logo appear
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Title slide up
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Hold for a moment
      Animated.delay(1500),
    ]).start(() => {
      // Ensure callback exists before calling
      if (onAnimationComplete && typeof onAnimationComplete === "function") {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <StatusBar hidden />

      {/* Simple gradient background */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Logo Section */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="lock-closed" size={80} color="white" />
        </View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          <Text style={styles.title}>LockIN</Text>
          <Text style={styles.subtitle}>Focus • Learn • Achieve</Text>
        </Animated.View>
      </Animated.View>

      {/* Simple decorative elements */}
      <View style={styles.decorTop}>
        <Ionicons name="star" size={20} color="rgba(255,255,255,0.3)" />
      </View>
      <View style={styles.decorBottom}>
        <Ionicons name="trophy" size={24} color="rgba(255,255,255,0.4)" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "300",
    letterSpacing: 1,
  },
  decorTop: {
    position: "absolute",
    top: height * 0.15,
    right: width * 0.15,
  },
  decorBottom: {
    position: "absolute",
    bottom: height * 0.15,
    left: width * 0.15,
  },
});

export default SplashScreen;
