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
  bg1: "#0A0E1A",
  bg2: "#1A1B2E", 
  g1: "#16213E",
  g2: "#0F3460",
  g3: "#533A71",
  g4: "#2D1B69",
  accent1: "#E94560", // vibrant red
  accent2: "#F39C12", // golden
  accent3: "#00D4AA", // mint
  accent4: "#7C4DFF", // violet
  accent5: "#00BCD4", // cyan
  text: "#FFFFFF",
  textSoft: "rgba(255,255,255,0.9)",
  muted: "rgba(255,255,255,0.6)",
  tile: "rgba(255,255,255,0.05)",
  tileBorder: "rgba(255,255,255,0.15)",
  glow: "rgba(124, 77, 255, 0.4)",
  shimmer: "rgba(255,255,255,0.15)",
};

const TILE_SIZE = 160;

const SplashScreen = ({ onAnimationComplete }) => {
  // Core animations
  const masterFade = useRef(new Animated.Value(0)).current;
  const masterScale = useRef(new Animated.Value(0.8)).current;
  
  // Background elements
  const bgParticle1 = useRef(new Animated.Value(0)).current;
  const bgParticle2 = useRef(new Animated.Value(0)).current;
  const bgParticle3 = useRef(new Animated.Value(0)).current;
  const bgWave = useRef(new Animated.Value(0)).current;
  
  // Main tile
  const tileAppear = useRef(new Animated.Value(0)).current;
  const tileRotate = useRef(new Animated.Value(0)).current;
  const tileGlow = useRef(new Animated.Value(0)).current;
  const tilePulse = useRef(new Animated.Value(1)).current;
  
  // Monogram letters
  const letterL = useRef(new Animated.Value(0)).current;
  const letterI = useRef(new Animated.Value(0)).current;
  const letterN = useRef(new Animated.Value(0)).current;
  const divider = useRef(new Animated.Value(0)).current;
  
  // Title and tagline
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  
  // Feature chips with individual animations
  const chip1Scale = useRef(new Animated.Value(0)).current;
  const chip2Scale = useRef(new Animated.Value(0)).current;
  const chip3Scale = useRef(new Animated.Value(0)).current;
  const chip4Scale = useRef(new Animated.Value(0)).current;
  
  // Floating elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  
  // Shimmer and sparkles
  const shimmer = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  
  // Credit animation
  const creditFade = useRef(new Animated.Value(0)).current;
  const creditGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance sequence
    Animated.sequence([
      // Initial fade in
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
      
      // Tile entrance with rotation
      Animated.parallel([
        Animated.spring(tileAppear, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(tileRotate, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(tileGlow, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // Letters appear sequentially
      Animated.stagger(150, [
        Animated.spring(letterL, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(divider, {
          toValue: 1,
          friction: 6,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.spring(letterI, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(letterN, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
      ]),
      
      // Title and tagline slide up
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
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
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 700,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      
      // Feature chips bounce in
      Animated.stagger(120, [
        Animated.spring(chip1Scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(chip2Scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(chip3Scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(chip4Scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      
      // Final credit and sparkles
      Animated.parallel([
        Animated.timing(creditFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(creditGlow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold for a moment
      Animated.delay(800),
    ]).start(() => {
      onAnimationComplete && onAnimationComplete();
    });

    // Continuous background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgParticle1, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgParticle1, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgParticle2, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgParticle2, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgParticle3, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgParticle3, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float3, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Tile pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(tilePulse, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tilePulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer sweep
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();

    // Sparkle animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle1, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle1, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(sparkle2, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle2, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(2200),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(sparkle3, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle3, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ])
    ).start();
  }, []);

  const tileRotation = tileRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-TILE_SIZE, TILE_SIZE],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Dynamic Background Gradient */}
      <LinearGradient
        colors={[PALETTE.bg1, PALETTE.g1, PALETTE.g2, PALETTE.g3, PALETTE.g4]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Background Particles */}
      <Animated.View
        style={[
          styles.bgParticle,
          styles.particle1,
          {
            opacity: bgParticle1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            transform: [
              {
                translateY: bgParticle1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
              {
                scale: bgParticle1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.3, 1],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.bgParticle,
          styles.particle2,
          {
            opacity: bgParticle2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.7],
            }),
            transform: [
              {
                translateX: bgParticle2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
              {
                rotate: bgParticle2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.bgParticle,
          styles.particle3,
          {
            opacity: bgParticle3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.9],
            }),
            transform: [
              {
                translateY: bgParticle3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
              {
                translateX: bgParticle3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      />

      {/* Floating Elements */}
      <Animated.View
        style={[
          styles.floatingElement,
          styles.floating1,
          {
            opacity: float1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.6, 1, 0.6],
            }),
            transform: [
              {
                translateY: float1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="code-outline" size={20} color={PALETTE.accent4} />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.floating2,
          {
            opacity: float2.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 0.9, 0.5],
            }),
            transform: [
              {
                translateY: float2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="bulb-outline" size={18} color={PALETTE.accent2} />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.floating3,
          {
            opacity: float3.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.8, 0.4],
            }),
            transform: [
              {
                translateX: float3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="rocket-outline" size={22} color={PALETTE.accent3} />
      </Animated.View>

      {/* Sparkles */}
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle1,
          {
            opacity: sparkle1,
            transform: [
              {
                scale: sparkle1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.5, 0],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle2,
          {
            opacity: sparkle2,
            transform: [
              {
                scale: sparkle2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.2, 0],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle3,
          {
            opacity: sparkle3,
            transform: [
              {
                scale: sparkle3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.8, 0],
                }),
              },
            ],
          },
        ]}
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: masterFade,
            transform: [{ scale: masterScale }],
          },
        ]}
      >
        {/* Enhanced Monogram Tile */}
        <Animated.View
          style={[
            styles.tile,
            {
              opacity: tileAppear,
              transform: [
                { scale: tileAppear },
                { rotate: tileRotation },
                { scale: tilePulse },
              ],
            },
          ]}
        >
          {/* Multiple Glow Layers */}
          <Animated.View style={[styles.tileGlow, styles.glowOuter, { opacity: tileGlow }]} />
          <Animated.View style={[styles.tileGlow, styles.glowInner, { opacity: tileGlow }]} />
          
          {/* Shimmer Effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: shimmer,
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />

          {/* Monogram Letters */}
          <View style={styles.monogramContainer}>
            <Animated.Text
              style={[
                styles.monogramL,
                {
                  opacity: letterL,
                  transform: [
                    {
                      translateY: letterL.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      scale: letterL.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              L
            </Animated.Text>

            <Animated.View
              style={[
                styles.monogramDivider,
                {
                  opacity: divider,
                  transform: [
                    {
                      scaleY: divider.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />

            <View style={styles.inContainer}>
              <Animated.Text
                style={[
                  styles.monogramI,
                  {
                    opacity: letterI,
                    transform: [
                      {
                        translateY: letterI.interpolate({
                          inputRange: [0, 1],
                          outputRange: [15, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                I
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.monogramN,
                  {
                    opacity: letterN,
                    transform: [
                      {
                        translateY: letterN.interpolate({
                          inputRange: [0, 1],
                          outputRange: [15, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                N
              </Animated.Text>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleFade,
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          <Text style={styles.title}>LockIN</Text>
          <View style={styles.titleUnderline} />
        </Animated.View>

        {/* Enhanced Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineFade,
              transform: [{ translateY: taglineSlide }],
            },
          ]}
        >
          <Text style={styles.tagline}>Track. Learn. Plan. Win.</Text>
          <Text style={styles.subtitle}>Your Ultimate Productivity Companion</Text>
        </Animated.View>

        {/* Enhanced Feature Chips */}
        <View style={styles.chipsContainer}>
          <Animated.View
            style={[
              styles.chip,
              styles.chipProjects,
              {
                opacity: chip1Scale,
                transform: [
                  { scale: chip1Scale },
                  {
                    rotate: chip1Scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-5deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.chipIcon}>
              <Ionicons name="folder" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.chipText}>Projects</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.chip,
              styles.chipLearning,
              {
                opacity: chip2Scale,
                transform: [
                  { scale: chip2Scale },
                  {
                    rotate: chip2Scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["3deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.chipIcon}>
              <Ionicons name="play-circle" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.chipText}>Learning</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.chip,
              styles.chipRoadmap,
              {
                opacity: chip3Scale,
                transform: [
                  { scale: chip3Scale },
                  {
                    rotate: chip3Scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-2deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.chipIcon}>
              <Ionicons name="map" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.chipText}>Roadmap</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.chip,
              styles.chipCP,
              {
                opacity: chip4Scale,
                transform: [
                  { scale: chip4Scale },
                  {
                    rotate: chip4Scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["4deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.chipIcon}>
              <Ionicons name="trophy" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.chipText}>CP Tracker</Text>
          </Animated.View>
        </View>

        {/* Enhanced Footer Credit */}
        <Animated.View
          style={[
            styles.creditContainer,
            {
              opacity: creditFade,
              transform: [
                {
                  scale: creditGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.creditBorder} />
          <Text style={styles.credit}>
            <Text style={styles.creditEmoji}>✨ </Text>
            Created with passion by
            <Text style={styles.creditName}> @siyam </Text>
            <Text style={styles.creditEmoji}>✨</Text>
          </Text>
          <Animated.View
            style={[
              styles.creditGlow,
              {
                opacity: creditGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg1,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  // Background Particles
  bgParticle: {
    position: "absolute",
    borderRadius: 100,
  },
  particle1: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(233, 69, 96, 0.15)",
    top: height * 0.15,
    left: -60,
  },
  particle2: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(0, 212, 170, 0.12)",
    top: height * 0.3,
    right: -30,
  },
  particle3: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(124, 77, 255, 0.18)",
    bottom: height * 0.2,
    left: -50,
  },

  // Floating Elements
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  floating1: {
    top: height * 0.25,
    right: width * 0.15,
  },
  floating2: {
    bottom: height * 0.35,
    left: width * 0.1,
  },
  floating3: {
    top: height * 0.4,
    left: width * 0.08,
  },

  // Sparkles
  sparkle: {
    position: "absolute",
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  sparkle1: {
    top: height * 0.2,
    right: width * 0.25,
  },
  sparkle2: {
    bottom: height * 0.25,
    right: width * 0.2,
  },
  sparkle3: {
    top: height * 0.35,
    left: width * 0.2,
  },

  // Enhanced Monogram Tile
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 32,
    backgroundColor: PALETTE.tile,
    borderWidth: 2,
    borderColor: PALETTE.tileBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: PALETTE.accent4,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: Platform.select({ ios: 0.4, android: 0.6 }),
    shadowRadius: 25,
    elevation: 20,
    overflow: "hidden",
    position: "relative",
  },

  // Glow Effects
  tileGlow: {
    position: "absolute",
    borderRadius: TILE_SIZE * 0.8,
  },
  glowOuter: {
    width: TILE_SIZE * 1.8,
    height: TILE_SIZE * 1.8,
    backgroundColor: PALETTE.glow,
    top: -TILE_SIZE * 0.4,
    left: -TILE_SIZE * 0.4,
    opacity: 0.3,
  },
  glowInner: {
    width: TILE_SIZE * 1.3,
    height: TILE_SIZE * 1.3,
    backgroundColor: PALETTE.accent4,
    top: -TILE_SIZE * 0.15,
    left: -TILE_SIZE * 0.15,
    opacity: 0.2,
  },

  // Shimmer Effect
  shimmer: {
    position: "absolute",
    width: 120,
    height: TILE_SIZE + 40,
    top: -20,
    left: TILE_SIZE / 2 - 60,
    backgroundColor: PALETTE.shimmer,
    transform: [{ rotate: "25deg" }],
    borderRadius: 20,
  },

  // Monogram Container
  monogramContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    zIndex: 10,
  },
  inContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },

  // Monogram Letters
  monogramL: {
    fontSize: 64,
    fontWeight: "900",
    color: PALETTE.accent1,
    letterSpacing: -2,
    textShadowColor: "rgba(233, 69, 96, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  monogramI: {
    fontSize: 48,
    fontWeight: "900",
    color: PALETTE.accent3,
    letterSpacing: -1,
    textShadowColor: "rgba(0, 212, 170, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  monogramN: {
    fontSize: 48,
    fontWeight: "900",
    color: PALETTE.accent5,
    letterSpacing: -1,
    marginBottom: 2,
    textShadowColor: "rgba(0, 188, 212, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  monogramDivider: {
    width: 4,
    height: 48,
    backgroundColor: PALETTE.accent2,
    borderRadius: 2,
    marginBottom: 8,
    shadowColor: PALETTE.accent2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },

  // Enhanced Title
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: PALETTE.text,
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  titleUnderline: {
    width: 80,
    height: 3,
    backgroundColor: PALETTE.accent2,
    borderRadius: 2,
    marginTop: 8,
    shadowColor: PALETTE.accent2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },

  // Enhanced Tagline
  taglineContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  tagline: {
    fontSize: 16,
    color: PALETTE.textSoft,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: PALETTE.muted,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Enhanced Feature Chips
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chipProjects: {
    backgroundColor: PALETTE.accent1,
    shadowColor: PALETTE.accent1,
  },
  chipLearning: {
    backgroundColor: PALETTE.accent4,
    shadowColor: PALETTE.accent4,
  },
  chipRoadmap: {
    backgroundColor: PALETTE.accent3,
    shadowColor: PALETTE.accent3,
  },
  chipCP: {
    backgroundColor: PALETTE.accent2,
    shadowColor: PALETTE.accent2,
  },
  chipIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Enhanced Footer Credit
  creditContainer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  creditBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  credit: {
    fontSize: 13,
    color: PALETTE.textSoft,
    fontWeight: "600",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  creditEmoji: {
    fontSize: 14,
  },
  creditName: {
    color: PALETTE.accent2,
    fontWeight: "900",
    textShadowColor: "rgba(243, 156, 18, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  creditGlow: {
    position: "absolute",
    width: "120%",
    height: "150%",
    backgroundColor: PALETTE.accent2,
    opacity: 0.1,
    borderRadius: 30,
    top: -6,
    left: "-10%",
  },
});

export default SplashScreen;