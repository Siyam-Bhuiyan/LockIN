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
  car: "#F44336", // Red car
  pc: "#607D8B", // Computer gray
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
  shadow: "rgba(0,0,0,0.3)",
  halftone: "#FF9800",

  // Comic effects
  pop: "#FFD54F",
  boom: "#FF7043",
  zap: "#42A5F5",
};

const TILE_SIZE = 160;

const SplashScreen = ({ onAnimationComplete }) => {
  // Core animations
  const masterFade = useRef(new Animated.Value(0)).current;
  const masterScale = useRef(new Animated.Value(0.8)).current;

  // Comic characters and objects
  const humanWalk = useRef(new Animated.Value(0)).current;
  const humanBob = useRef(new Animated.Value(0)).current;
  const carDrive = useRef(new Animated.Value(0)).current;
  const carBounce = useRef(new Animated.Value(0)).current;
  const pcScreen = useRef(new Animated.Value(0)).current;
  const pcKeys = useRef(new Animated.Value(0)).current;
  const coffeeSteam = useRef(new Animated.Value(0)).current;
  const coffeeRotate = useRef(new Animated.Value(0)).current;

  // Background elements
  const cloudFloat1 = useRef(new Animated.Value(0)).current;
  const cloudFloat2 = useRef(new Animated.Value(0)).current;
  const sunRotate = useRef(new Animated.Value(0)).current;
  const buildingFloat = useRef(new Animated.Value(0)).current;

  // Comic effects
  const popEffect = useRef(new Animated.Value(0)).current;
  const boomEffect = useRef(new Animated.Value(0)).current;
  const zapEffect = useRef(new Animated.Value(0)).current;
  const halftoneRotate = useRef(new Animated.Value(0)).current;

  // Main elements
  const logoAppear = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const speechBubble = useRef(new Animated.Value(0)).current;

  // Title and text
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Comic book entrance sequence
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
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),

      // Characters entrance
      Animated.parallel([
        // Human character walks in
        Animated.timing(humanWalk, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Car drives across screen
        Animated.timing(carDrive, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // PC screen lights up
        Animated.timing(pcScreen, {
          toValue: 1,
          duration: 1200,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),

      // Comic effects
      Animated.stagger(200, [
        Animated.spring(popEffect, {
          toValue: 1,
          friction: 5,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.spring(boomEffect, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(zapEffect, {
          toValue: 1,
          friction: 6,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),

      // Logo and speech bubble
      Animated.parallel([
        Animated.spring(logoAppear, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(speechBubble, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // Title and tagline with comic style
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 700,
          delay: 150,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 700,
          delay: 150,
          useNativeDriver: true,
        }),
      ]),

      // Hold for comic effect
      Animated.delay(1000),
    ]).start(() => {
      onAnimationComplete && onAnimationComplete();
    });

    // Continuous character animations

    // Human bobbing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(humanBob, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(humanBob, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Car bouncing
    Animated.loop(
      Animated.sequence([
        Animated.timing(carBounce, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(carBounce, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // PC keyboard typing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pcKeys, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pcKeys, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    ).start();

    // Coffee steam
    Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeSteam, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(coffeeSteam, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background elements

    // Clouds floating
    Animated.loop(
      Animated.timing(cloudFloat1, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(cloudFloat2, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Sun rotation
    Animated.loop(
      Animated.timing(sunRotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Building float
    Animated.loop(
      Animated.sequence([
        Animated.timing(buildingFloat, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(buildingFloat, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Halftone rotation
    Animated.loop(
      Animated.timing(halftoneRotate, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Coffee cup rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(coffeeRotate, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(coffeeRotate, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const tileRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

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

      {/* Comic book background with halftone pattern */}
      <LinearGradient
        colors={[PALETTE.bg1, PALETTE.bg2, PALETTE.bg3]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Halftone pattern overlay */}
      <Animated.View
        style={[
          styles.halftoneOverlay,
          {
            transform: [
              {
                rotate: halftoneRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      />

      {/* Background clouds */}
      <Animated.View
        style={[
          styles.cloud,
          styles.cloud1,
          {
            transform: [
              {
                translateX: cloudFloat1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, width + 100],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="cloud" size={60} color={PALETTE.accent2} />
      </Animated.View>

      <Animated.View
        style={[
          styles.cloud,
          styles.cloud2,
          {
            transform: [
              {
                translateX: cloudFloat2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width + 50, -150],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="cloud" size={40} color={PALETTE.accent3} />
      </Animated.View>

      {/* Sun in corner */}
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
            ],
          },
        ]}
      >
        <Ionicons name="sunny" size={50} color={PALETTE.accent3} />
      </Animated.View>

      {/* Animated human character */}
      <Animated.View
        style={[
          styles.humanCharacter,
          {
            opacity: humanWalk,
            transform: [
              {
                translateX: humanWalk.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 50],
                }),
              },
              {
                translateY: humanBob.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="person" size={40} color={PALETTE.human} />
      </Animated.View>

      {/* Animated car */}
      <Animated.View
        style={[
          styles.carCharacter,
          {
            opacity: carDrive,
            transform: [
              {
                translateX: carDrive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width + 50, -50],
                }),
              },
              {
                translateY: carBounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="car-sport" size={35} color={PALETTE.car} />
      </Animated.View>

      {/* Animated PC setup */}
      <Animated.View
        style={[
          styles.pcCharacter,
          {
            opacity: pcScreen,
            transform: [
              {
                scale: pcKeys.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="desktop" size={30} color={PALETTE.pc} />
      </Animated.View>

      {/* Coffee cup with steam */}
      <Animated.View
        style={[
          styles.coffeeCharacter,
          {
            transform: [
              {
                rotate: coffeeRotate.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ["-5deg", "5deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="cafe" size={25} color={PALETTE.coffee} />
        <Animated.View
          style={[
            styles.steam,
            {
              opacity: coffeeSteam,
              transform: [
                {
                  translateY: coffeeSteam.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.steamText}>☁️</Text>
        </Animated.View>
      </Animated.View>

      {/* Floating buildings */}
      <Animated.View
        style={[
          styles.buildingGroup,
          {
            transform: [
              {
                translateY: buildingFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="business" size={30} color={PALETTE.accent4} />
        <Ionicons name="home" size={25} color={PALETTE.accent2} />
      </Animated.View>

      {/* Comic effects - POW, BOOM, ZAP */}
      <Animated.View
        style={[
          styles.comicEffect,
          styles.powEffect,
          {
            opacity: popEffect,
            transform: [
              {
                scale: popEffect.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.comicText, { backgroundColor: PALETTE.pop }]}>
          POW!
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.comicEffect,
          styles.boomEffect,
          {
            opacity: boomEffect,
            transform: [
              {
                scale: boomEffect.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.comicText, { backgroundColor: PALETTE.boom }]}>
          BOOM!
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.comicEffect,
          styles.zapEffect,
          {
            opacity: zapEffect,
            transform: [
              {
                scale: zapEffect.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1.3],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.comicText, { backgroundColor: PALETTE.zap }]}>
          ZAP!
        </Text>
      </Animated.View>

      {/* Main logo area with speech bubble */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.speechBubble,
            {
              opacity: speechBubble,
              transform: [
                {
                  scale: speechBubble.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.speechText}>Welcome to coding!</Text>
          <View style={styles.speechTail} />
        </Animated.View>

        {/* Animated logo */}
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
                {
                  rotate: logoRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "5deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoTile}>
            <Ionicons name="code-slash" size={50} color={PALETTE.textWhite} />
          </View>
        </Animated.View>

        {/* App title with comic style */}
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
        </Animated.View>

        {/* Tagline with comic styling */}
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
          <Text style={styles.tagline}>🦸‍♂️ Master Your Coding Powers!</Text>
        </Animated.View>
      </View>

      {/* Comic book frame border */}
      <View style={styles.comicFrame} />

      {/* Small comic elements scattered around */}
      <View style={styles.smallElements}>
        <Text style={[styles.smallText, { top: 100, left: 30 }]}>💻</Text>
        <Text style={[styles.smallText, { top: 150, right: 40 }]}>⚡</Text>
        <Text style={[styles.smallText, { bottom: 200, left: 50 }]}>🚀</Text>
        <Text style={[styles.smallText, { bottom: 120, right: 30 }]}>💡</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg1,
  },

  // Comic book elements
  halftoneOverlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    opacity: 0.5,
  },

  // Clouds
  cloud: {
    position: "absolute",
    top: 50,
  },
  cloud1: {
    top: 60,
  },
  cloud2: {
    top: 100,
  },

  // Sun
  sun: {
    position: "absolute",
    top: 40,
    right: 40,
  },

  // Character positions
  humanCharacter: {
    position: "absolute",
    bottom: 200,
    left: 20,
  },

  carCharacter: {
    position: "absolute",
    bottom: 150,
    zIndex: 1,
  },

  pcCharacter: {
    position: "absolute",
    top: 120,
    right: 60,
  },

  coffeeCharacter: {
    position: "absolute",
    bottom: 300,
    right: 80,
  },

  steam: {
    position: "absolute",
    top: -25,
    alignItems: "center",
  },

  steamText: {
    fontSize: 12,
    opacity: 0.7,
  },

  buildingGroup: {
    position: "absolute",
    bottom: 100,
    left: width / 2 - 30,
    flexDirection: "row",
    gap: 10,
  },

  // Comic effects
  comicEffect: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  powEffect: {
    top: 150,
    left: 50,
  },

  boomEffect: {
    top: 180,
    right: 80,
  },

  zapEffect: {
    bottom: 250,
    left: 100,
  },

  comicText: {
    fontSize: 20,
    fontWeight: "900",
    color: PALETTE.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    borderWidth: 3,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    transform: [{ rotate: "-5deg" }],
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  speechBubble: {
    backgroundColor: PALETTE.bubble,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 30,
    position: "relative",
    shadowColor: PALETTE.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },

  speechText: {
    color: PALETTE.text,
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },

  speechTail: {
    position: "absolute",
    bottom: -15,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: PALETTE.bubble,
  },

  logoContainer: {
    marginBottom: 25,
  },

  logoTile: {
    width: 120,
    height: 120,
    backgroundColor: PALETTE.accent1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 15,
  },

  titleContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  appTitle: {
    fontSize: 56,
    fontWeight: "900",
    color: PALETTE.text,
    textShadowColor: PALETTE.accent2,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    letterSpacing: 3,
  },

  comicSubtitle: {
    fontSize: 20,
    fontWeight: "800",
    color: PALETTE.accent1,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  taglineContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  tagline: {
    fontSize: 18,
    fontWeight: "700",
    color: PALETTE.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  // Comic frame border
  comicFrame: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 6,
    borderColor: "#000",
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  // Small elements
  smallElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  smallText: {
    position: "absolute",
    fontSize: 24,
    opacity: 0.8,
  },
});

export default SplashScreen;
