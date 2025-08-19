import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const PALETTE = {
  bg1: "#0B1020",
  g1: "#241B4D", // plum
  g2: "#2C3E8F", // indigo
  g3: "#1AA7C6", // cyan
  text: "#EAF2FF",
  muted: "rgba(234,242,255,0.7)",
  tile: "#10172A",
  tileBorder: "rgba(255,255,255,0.08)",
  glow: "rgba(124, 58, 237, 0.45)", // violet glow
  accentViolet: "#C084FC",
  accentCyan: "#22D3EE",
  accentAmber: "#FDE68A",
  accentEmerald: "#34D399",
};

const TILE_SIZE = 136;

const SplashScreen = ({ onAnimationComplete }) => {
  // core anims
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  // monogram tile
  const tileScale = useRef(new Animated.Value(0.7)).current;
  const tileRotate = useRef(new Animated.Value(0)).current;
  const tileGlow = useRef(new Animated.Value(0)).current;

  // text + byline
  const titleY = useRef(new Animated.Value(24)).current;
  const bylineY = useRef(new Animated.Value(38)).current;

  // chips (stagger in)
  const chip1 = useRef(new Animated.Value(0)).current; // Projects
  const chip2 = useRef(new Animated.Value(0)).current; // Learning
  const chip3 = useRef(new Animated.Value(0)).current; // Roadmap
  const chip4 = useRef(new Animated.Value(0)).current; // CP

  // background orbs drift
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  // shimmer across tile
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // entry timeline
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.spring(tileScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tileRotate, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tileGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(bylineY, { toValue: 0, duration: 650, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.stagger(110, [
        Animated.spring(chip1, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(chip2, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(chip3, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
        Animated.spring(chip4, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
      ]),
      Animated.timing(bounce, {
        toValue: 1,
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(700),
    ]).start(() => {
      onAnimationComplete && onAnimationComplete();
    });

    // looping ambient anims
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 5000, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 5200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 5200, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotation = tileRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "0deg"],
  });

  const glowOpacity = tileGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  const bounceY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const chipStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
      { translateY: bounceY },
    ],
  });

  const orbDrift1 = {
    transform: [
      {
        translateY: orb1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 16],
        }),
      },
      {
        translateX: orb1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  const orbDrift2 = {
    transform: [
      {
        translateY: orb2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -14],
        }),
      },
      {
        translateX: orb2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 12],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background gradient */}
      <LinearGradient
        colors={[PALETTE.bg1, PALETTE.g1, PALETTE.g2, PALETTE.g3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, orbDrift1]} />
      <Animated.View style={[styles.orb, styles.orb2, orbDrift2]} />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Monogram Tile */}
        <Animated.View
          style={[
            styles.tile,
            {
              transform: [{ scale: tileScale }, { rotate: rotation }],
              shadowOpacity: Platform.select({ ios: 0.35, android: 0.5 }),
            },
          ]}
        >
          {/* soft glow */}
          <Animated.View style={[styles.tileGlow, { opacity: glowOpacity }]} />

          {/* “LI” monogram */}
          <View style={styles.monogramRow}>
            <Text style={styles.monogramL}>L</Text>
            <View style={styles.monogramDivider} />
            <Text style={styles.monogramIN}>IN</Text>
          </View>

          {/* shimmer sweep */}
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
        </Animated.View>

        {/* Title & Tagline */}
        <Animated.View style={{ alignItems: "center", transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>LockIN</Text>
        </Animated.View>
        <Animated.View style={{ alignItems: "center", transform: [{ translateY: bylineY }] }}>
          <Text style={styles.tagline}>Track. Learn. Plan. Win.</Text>
        </Animated.View>

        {/* Feature Chips */}
        <View style={styles.chipsRow}>
          <Animated.View style={[styles.chip, chipStyle(chip1)]}>
            <Ionicons name="folder-outline" size={16} color="#081018" />
            <Text style={styles.chipText}>Projects</Text>
          </Animated.View>

          <Animated.View style={[styles.chip, styles.chipCyan, chipStyle(chip2)]}>
            <Ionicons name="play-circle-outline" size={16} color="#07181C" />
            <Text style={styles.chipTextDark}>Learning</Text>
          </Animated.View>

          <Animated.View style={[styles.chip, styles.chipAmber, chipStyle(chip3)]}>
            <Ionicons name="map-outline" size={16} color="#1B1607" />
            <Text style={styles.chipTextDark}>Roadmap</Text>
          </Animated.View>

          <Animated.View style={[styles.chip, styles.chipEmerald, chipStyle(chip4)]}>
            <Ionicons name="trophy-outline" size={16} color="#08140E" />
            <Text style={styles.chipTextDark}>CP Tracker</Text>
          </Animated.View>
        </View>

        {/* Footer credit */}
        <Text style={styles.credit}>Created by @siyam</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  // Orbs
  orb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(192,132,252,0.18)", // violet
  },
  orb1: { top: height * 0.18, left: -60 },
  orb2: { bottom: height * 0.12, right: -50, backgroundColor: "rgba(34,211,238,0.16)" },

  // Monogram tile
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 28,
    backgroundColor: PALETTE.tile,
    borderWidth: 1.5,
    borderColor: PALETTE.tileBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 12,
    overflow: "hidden",
  },
  tileGlow: {
    position: "absolute",
    width: TILE_SIZE * 1.4,
    height: TILE_SIZE * 1.4,
    borderRadius: TILE_SIZE * 0.7,
    backgroundColor: PALETTE.glow,
    top: -TILE_SIZE * 0.2,
    left: -TILE_SIZE * 0.2,
    opacity: 0.6,
  },
  shimmer: {
    position: "absolute",
    width: 80,
    height: TILE_SIZE + 16,
    top: -8,
    left: TILE_SIZE / 2 - 40,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "20deg" }],
    borderRadius: 16,
  },

  monogramRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  monogramL: {
    fontSize: 56,
    fontWeight: "800",
    color: PALETTE.accentViolet,
    letterSpacing: -1,
  },
  monogramDivider: {
    width: 3,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    marginBottom: 6,
  },
  monogramIN: {
    fontSize: 40,
    fontWeight: "800",
    color: PALETTE.accentCyan,
    letterSpacing: -0.5,
    marginBottom: 2,
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
    color: PALETTE.text,
    letterSpacing: 1,
    textAlign: "center",
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: PALETTE.muted,
    fontWeight: "500",
    letterSpacing: 0.4,
    textAlign: "center",
  },

  chipsRow: {
    marginTop: 26,
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PALETTE.accentViolet,
    borderRadius: 14,
  },
  chipCyan: { backgroundColor: PALETTE.accentCyan },
  chipAmber: { backgroundColor: PALETTE.accentAmber },
  chipEmerald: { backgroundColor: PALETTE.accentEmerald },
  chipText: {
    color: "#0B1020",
    fontSize: 12,
    fontWeight: "800",
  },
  chipTextDark: {
    color: "#0B1020",
    fontSize: 12,
    fontWeight: "800",
  },

  credit: {
    position: "absolute",
    bottom: 40,
    color: "rgba(234,242,255,0.8)",
    fontSize: 12,
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
