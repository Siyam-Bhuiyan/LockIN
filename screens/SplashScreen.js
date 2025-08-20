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
  // Comic Book Color Palette
  bg1: "#FF6B6B", // Vibrant coral
  bg2: "#4ECDC4", // Turquoise
  bg3: "#45B7D1", // Sky blue
  bg4: "#FFA726", // Orange
  bg5: "#AB47BC", // Purple

  // Character colors
  human: "#FFB74D", // Skin tone
  humanClothes: "#2196F3", // Blue clothes
  car: "#F44336", // Red car
  pc: "#607D8B", // Computer gray
  pcScreen: "#00E676", // Green screen
  coffee: "#8D6E63", // Coffee brown

  // Comic accents
  accent1: "#FF5722", // Deep orange
  accent2: "#FFEB3B", // Bright yellow
  accent3: "#4CAF50", // Green
  accent4: "#2196F3", // Blue
  accent5: "#9C27B0", // Purple

  // Text and effects
  text: "#263238", // Dark text for comic style
  textWhite: "#FFFFFF",
  bubble: "#FFFFFF",
  shadow: "rgba(0,0,0,0.8)",
  halftone: "#FF9800",

  // Comic effects
  pop: "#FFD54F",
  boom: "#FF7043",
  zap: "#42A5F5",
  kapow: "#E91E63",
  bam: "#9C27B0",
};

const SplashScreen = ({ onAnimationComplete }) => {
  // Core animations
  const masterFade = useRef(new Animated.Value(0)).current;
  const masterScale = useRef(new Animated.Value(0.8)).current;

  // Main characters (simplified)
  const humanWalk = useRef(new Animated.Value(0)).current;
  const carDrive = useRef(new Animated.Value(0)).current;
  const pcScreen = useRef(new Animated.Value(0)).current;

  // Background elements (simplified)
  const cloudFloat1 = useRef(new Animated.Value(0)).current;
  const sunRotate = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(0)).current;

  // Main elements
  const logoAppear = useRef(new Animated.Value(0)).current;

  // Title and text
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simplified comic book entrance sequence
    Animated.sequence([
      // Initial scene setup
      Animated.parallel([
        Animated.timing(masterFade, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(masterScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),

      // Main elements entrance
      Animated.parallel([
        Animated.timing(humanWalk, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(carDrive, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pcScreen, {
          toValue: 1,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),

      // Logo and title appearance
      Animated.parallel([
        Animated.spring(logoAppear, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 800,
          delay: 250,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 800,
          delay: 250,
          useNativeDriver: true,
        }),
      ]),

      // Extended hold for better UX
      Animated.delay(2500),
    ]).start(() => {
      onAnimationComplete && onAnimationComplete();
    });

    // Simple background animations
    Animated.loop(
      Animated.timing(sunRotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: masterFade,
          transform: [{ scale: masterScale }],
        },
      ]}
    >
      <StatusBar hidden />

      {/* Enhanced comic book background */}
      <LinearGradient
        colors={[PALETTE.bg1, PALETTE.bg2, PALETTE.bg3, PALETTE.bg4]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
      />

      {/* Enhanced background clouds */}
      <Animated.View
        style={[
          styles.cloud,
          styles.cloud1,
          {
            transform: [
              {
                translateX: cloudFloat1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, width + 120],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="cloud" size={70} color={PALETTE.accent2} />
        <Text style={styles.cloudShadow}>☁️</Text>
      </Animated.View>

      {/* Enhanced sun with superhero glow */}
      <Animated.View
        style={[
          styles.sun,
          {
            transform: [
              {
                rotate: sunRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
              {
                scale: sunPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="sunny" size={60} color={PALETTE.accent2} />
        <View style={styles.sunGlow} />
      </Animated.View>

      {/* Enhanced human character with superhero cape */}
      <Animated.View
        style={[
          styles.humanCharacter,
          {
            opacity: humanWalk,
            transform: [
              {
                translateX: humanWalk.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-150, 60],
                }),
              },
            ],
          },
        ]}
      >
        {/* Cape */}
        <View style={styles.cape} />
        {/* Body */}
        <View style={styles.humanBody}>
          <Ionicons name="person" size={45} color={PALETTE.human} />
        </View>
        {/* Superhero emblem */}
        <View style={styles.superheroEmblem}>
          <Text style={styles.emblemText}>C</Text>
        </View>
        {/* Waving hand */}
        <View style={styles.wavingHand}>
          <Text style={styles.handEmoji}>👋</Text>
        </View>
      </Animated.View>

      {/* Enhanced car with smoke trail */}
      <Animated.View
        style={[
          styles.carCharacter,
          {
            opacity: carDrive,
            transform: [
              {
                translateX: carDrive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width + 80, -80],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="car-sport" size={40} color={PALETTE.car} />
        {/* Car smoke trail */}
        <View style={styles.carSmoke}>
          <Text style={styles.smokeText}>💨</Text>
        </View>
      </Animated.View>

      {/* Enhanced PC setup with screen glow */}
      <Animated.View
        style={[
          styles.pcCharacter,
          {
            opacity: pcScreen,
          },
        ]}
      >
        <Ionicons name="desktop" size={35} color={PALETTE.pc} />
        {/* Screen glow effect */}
        <View style={styles.screenGlow} />
        {/* Code symbols floating */}
        <View style={styles.codeSymbols}>
          <Text style={styles.codeText}>{"<>"}</Text>
          <Text style={[styles.codeText, { left: 20 }]}>{"{ }"}</Text>
          <Text style={[styles.codeText, { left: -15, top: 15 }]}>{"[ ]"}</Text>
        </View>
      </Animated.View>

      {/* Enhanced coffee cup (simplified) */}
      <View style={styles.coffeeCharacter}>
        <Ionicons name="cafe" size={30} color={PALETTE.coffee} />
        {/* Simple steam */}
        <View style={styles.steam}>
          <Text style={styles.steamText}>☁️</Text>
        </View>
      </View>

      {/* Enhanced floating buildings cityscape (simplified) */}
      <View style={styles.buildingGroup}>
        <Ionicons name="business" size={35} color={PALETTE.accent4} />
        <Ionicons name="home" size={28} color={PALETTE.accent2} />
        <Ionicons name="storefront" size={30} color={PALETTE.accent5} />
        {/* City lights */}
        <View style={styles.cityLights}>
          <Text style={styles.lightDot}>💡</Text>
          <Text style={[styles.lightDot, { left: 15 }]}>💡</Text>
          <Text style={[styles.lightDot, { left: 30 }]}>💡</Text>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.centerContent}>
        {/* Enhanced logo with simpler styling */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoAppear,
              transform: [
                {
                  scale: logoAppear.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoTile}>
            <Ionicons name="code-slash" size={80} color={PALETTE.textWhite} />
          </View>
        </Animated.View>

        {/* Enhanced title with superhero glow */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleFade,
              transform: [
                {
                  translateY: titleSlide,
                },
              ],
            },
          ]}
        >
          <Text style={styles.appTitle}>LockIN</Text>
          <Text style={styles.comicSubtitle}>CODING HERO</Text>
          <View style={styles.titleDecorations}>
            <Text style={styles.decorationText}>⚡</Text>
            <Text style={[styles.decorationText, { right: 0 }]}>🚀</Text>
          </View>
        </Animated.View>

        {/* Enhanced tagline with comic styling */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineFade,
              transform: [
                {
                  translateY: taglineSlide,
                },
              ],
            },
          ]}
        >
          <Text style={styles.tagline}>🦸‍♂️ Master Your Coding Powers! 💻</Text>
          <Text style={styles.subTagline}>
            Transform into a code superhero!
          </Text>
        </Animated.View>

        {/* Simple credit */}
        <Animated.View
          style={[
            styles.creditContainer,
            {
              opacity: taglineFade,
            },
          ]}
        >
          <Text style={styles.creditText}>Made by Siyam</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg1,
  },

  // Enhanced comic book elements
  halftoneOverlay: {
    position: "absolute",
    width: width * 2,
    height: height * 2,
    left: -width / 2,
    top: -height / 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: width,
  },

  speedLines: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "transparent",
  },

  // Enhanced clouds with shadows
  cloud: {
    position: "absolute",
    alignItems: "center",
  },
  cloud1: {
    top: 50,
  },
  cloud2: {
    top: 90,
  },
  cloud3: {
    top: 130,
  },

  cloudShadow: {
    position: "absolute",
    fontSize: 20,
    opacity: 0.3,
    top: 5,
    left: 5,
  },

  // Enhanced sun with glow
  sun: {
    position: "absolute",
    top: 30,
    right: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  sunGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    backgroundColor: PALETTE.accent2,
    borderRadius: 40,
    opacity: 0.2,
    zIndex: -1,
  },

  // Enhanced human character (bigger)
  humanCharacter: {
    position: "absolute",
    bottom: 180,
    left: 20,
    alignItems: "center",
    transform: [{ scale: 1.5 }],
  },

  cape: {
    position: "absolute",
    width: 30,
    height: 40,
    backgroundColor: PALETTE.accent1,
    borderRadius: 15,
    top: 5,
    left: -5,
    zIndex: -1,
    borderWidth: 2,
    borderColor: "#000",
  },

  humanBody: {
    backgroundColor: PALETTE.humanClothes,
    borderRadius: 25,
    padding: 5,
    borderWidth: 3,
    borderColor: "#000",
  },

  superheroEmblem: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 20,
    height: 20,
    backgroundColor: PALETTE.accent2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },

  emblemText: {
    fontSize: 12,
    fontWeight: "900",
    color: PALETTE.text,
  },

  wavingHand: {
    position: "absolute",
    top: -10,
    right: -15,
  },

  handEmoji: {
    fontSize: 20,
  },

  // Enhanced car with smoke
  carCharacter: {
    position: "absolute",
    bottom: 140,
    zIndex: 1,
    alignItems: "center",
    transform: [{ scale: 1.4 }],
  },

  carSmoke: {
    position: "absolute",
    left: -40,
    top: -5,
  },

  smokeText: {
    fontSize: 16,
  },

  // Enhanced PC character
  pcCharacter: {
    position: "absolute",
    top: 100,
    right: 50,
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },

  screenGlow: {
    position: "absolute",
    width: 50,
    height: 35,
    backgroundColor: PALETTE.pcScreen,
    borderRadius: 8,
    opacity: 0.6,
    top: 5,
  },

  codeSymbols: {
    position: "absolute",
    top: -20,
    width: 60,
  },

  codeText: {
    position: "absolute",
    fontSize: 12,
    color: PALETTE.pcScreen,
    fontWeight: "bold",
  },

  // Enhanced coffee character
  coffeeCharacter: {
    position: "absolute",
    bottom: 280,
    right: 70,
    alignItems: "center",
  },

  steam: {
    position: "absolute",
    top: -35,
    alignItems: "center",
  },

  steamText: {
    fontSize: 14,
    opacity: 0.8,
  },

  // Enhanced building group
  buildingGroup: {
    position: "absolute",
    bottom: 80,
    left: width / 2 - 50,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },

  cityLights: {
    position: "absolute",
    top: -15,
    width: 100,
  },

  lightDot: {
    position: "absolute",
    fontSize: 8,
    opacity: 0.7,
  },

  // Enhanced comic effects
  comicEffect: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  kapowEffect: {
    top: 120,
    left: 40,
  },

  powEffect: {
    top: 160,
    left: 60,
  },

  boomEffect: {
    top: 170,
    right: 70,
  },

  zapEffect: {
    bottom: 230,
    left: 90,
  },

  bamEffect: {
    bottom: 200,
    right: 50,
  },

  comicText: {
    fontSize: 22,
    fontWeight: "900",
    color: PALETTE.text,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    borderWidth: 4,
    borderColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    overflow: "hidden",
  },

  comicBurst: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: PALETTE.kapow,
    borderRadius: 30,
    opacity: 0.3,
    zIndex: -1,
  },

  comicStar: {
    position: "absolute",
    width: 8,
    height: 8,
    backgroundColor: PALETTE.accent2,
    transform: [{ rotate: "45deg" }],
    top: -5,
    right: -5,
  },

  comicExplosion: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: PALETTE.boom,
    borderRadius: 25,
    opacity: 0.4,
    zIndex: -1,
  },

  comicLightning: {
    position: "absolute",
    width: 20,
    height: 3,
    backgroundColor: PALETTE.accent2,
    top: 10,
    right: -25,
    transform: [{ rotate: "15deg" }],
  },

  comicImpact: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: PALETTE.bam,
    borderRadius: 20,
    opacity: 0.5,
    zIndex: -1,
  },

  // Superhero glow effect
  superheroGlowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PALETTE.accent2,
    opacity: 0.1,
  },

  // Enhanced center content
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Enhanced speech bubbles
  speechBubble: {
    backgroundColor: PALETTE.bubble,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#000",
    position: "absolute",
    shadowColor: PALETTE.shadow,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 15,
  },

  speechBubble1: {
    top: -100,
    left: -50,
  },

  speechBubble2: {
    top: -80,
    right: -60,
    backgroundColor: PALETTE.accent3,
  },

  speechText: {
    color: PALETTE.text,
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },

  speechTail: {
    position: "absolute",
    bottom: -18,
    left: 40,
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: PALETTE.bubble,
  },

  speechTailRight: {
    left: undefined,
    right: 40,
    borderTopColor: PALETTE.accent3,
  },

  // Thought bubble
  thoughtBubble: {
    position: "absolute",
    top: -140,
    left: 20,
    backgroundColor: PALETTE.bubble,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#000",
  },

  thoughtText: {
    color: PALETTE.text,
    fontWeight: "700",
    fontSize: 14,
  },

  thoughtBubbles: {
    position: "absolute",
    bottom: -25,
    left: 30,
  },

  thoughtDot: {
    width: 8,
    height: 8,
    backgroundColor: PALETTE.bubble,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
    position: "absolute",
  },

  thoughtDot2: {
    width: 6,
    height: 6,
    top: 12,
    left: -8,
  },

  thoughtDot3: {
    width: 4,
    height: 4,
    top: 20,
    left: -15,
  },

  // Enhanced logo
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },

  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    backgroundColor: PALETTE.accent2,
    borderRadius: 30,
    zIndex: -1,
  },

  logoTile: {
    width: 130,
    height: 130,
    backgroundColor: PALETTE.accent1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
  },

  logoLightning: {
    position: "absolute",
    top: -10,
    right: -10,
  },

  lightningText: {
    fontSize: 24,
  },

  // Enhanced title
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },

  titleGlow: {
    position: "absolute",
    width: 300,
    height: 80,
    backgroundColor: PALETTE.accent2,
    borderRadius: 40,
    opacity: 0.3,
    zIndex: -1,
  },

  appTitle: {
    fontSize: 64,
    fontWeight: "900",
    color: PALETTE.text,
    textShadowColor: PALETTE.accent2,
    textShadowOffset: { width: 6, height: 6 },
    textShadowRadius: 0,
    letterSpacing: 4,
  },

  comicSubtitle: {
    fontSize: 24,
    fontWeight: "800",
    color: PALETTE.accent1,
    marginTop: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },

  titleDecorations: {
    position: "absolute",
    top: -20,
    width: 200,
    height: 40,
  },

  decorationText: {
    position: "absolute",
    fontSize: 30,
    left: 0,
  },

  // Enhanced tagline
  taglineContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  tagline: {
    fontSize: 20,
    fontWeight: "800",
    color: PALETTE.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    marginBottom: 8,
  },

  subTagline: {
    fontSize: 16,
    fontWeight: "700",
    color: PALETTE.accent1,
    textAlign: "center",
    backgroundColor: PALETTE.accent2,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  // Credit styles
  creditContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  creditText: {
    fontSize: 16,
    fontWeight: "600",
    color: PALETTE.textWhite,
    opacity: 0.8,
    textAlign: "center",
  },

  // Enhanced comic frame
  comicFrame: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 8,
    borderColor: "#000",
    borderRadius: 25,
    backgroundColor: "transparent",
  },

  // Panel dividers
  panelDividers: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  panelLine: {
    position: "absolute",
    backgroundColor: "#000",
    opacity: 0.3,
  },

  verticalLine: {
    width: 3,
    height: height * 0.6,
    left: width * 0.25,
    top: height * 0.2,
  },

  horizontalLine: {
    height: 3,
    width: width * 0.6,
    top: height * 0.35,
    left: width * 0.2,
  },

  // Enhanced small elements
  smallElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  smallText: {
    position: "absolute",
    fontSize: 28,
    opacity: 0.9,
  },

  // Action lines for dynamic effect
  actionLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  actionLine: {
    position: "absolute",
    backgroundColor: "#000",
    opacity: 0.1,
  },

  actionLine1: {
    width: 2,
    height: 100,
    top: 150,
    left: 50,
    transform: [{ rotate: "15deg" }],
  },

  actionLine2: {
    width: 2,
    height: 80,
    top: 200,
    right: 80,
    transform: [{ rotate: "-20deg" }],
  },

  actionLine3: {
    width: 2,
    height: 120,
    bottom: 200,
    left: 100,
    transform: [{ rotate: "25deg" }],
  },

  actionLine4: {
    width: 2,
    height: 90,
    bottom: 150,
    right: 60,
    transform: [{ rotate: "-18deg" }],
  },
});

export default SplashScreen;
