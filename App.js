// App.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SplashScreenExpo from "expo-splash-screen";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import ProjectsScreen from "./screens/ProjectsScreen";
import LearningScreen from "./screens/LearningScreen";
import RoadmapScreen from "./screens/RoadmapScreen";
import CPTrackerScreen from "./screens/CPTrackerScreen";

// Keep the native splash visible until we explicitly hide it
SplashScreenExpo.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { theme, isDark } = useTheme();

  const getIconName = (routeName, focused) => {
    switch (routeName) {
      case "Home":
        return focused ? "home" : "home-outline";
      case "Projects":
        return focused ? "folder" : "folder-outline";
      case "Learning":
        return focused ? "play-circle" : "play-circle-outline";
      case "Roadmap":
        return focused ? "map" : "map-outline";
      case "CP Tracker":
        return focused ? "trophy" : "trophy-outline";
      default:
        return "ellipse-outline";
    }
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              height: 70,
              paddingBottom: Platform.select({ ios: 10, android: 8 }),
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
              marginBottom: 4,
            },
            tabBarIcon: ({ focused, color }) => {
              if (route.name === "Home") {
                const homeName = getIconName("Home", focused);
                return (
                  <View
                    style={{
                      position: "absolute",
                      top: -18,
                      backgroundColor: theme.surface,
                      borderRadius: 40,
                      padding: 10,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name={homeName} size={34} color={theme.primary} />
                  </View>
                );
              }
              const iconName = getIconName(route.name, focused);
              return <Ionicons name={iconName} size={24} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Projects" component={ProjectsScreen} />
          <Tab.Screen name="Learning" component={LearningScreen} />
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "" }} />
          <Tab.Screen name="Roadmap" component={RoadmapScreen} />
          <Tab.Screen name="CP Tracker" component={CPTrackerScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);   // controls custom JS splash visibility
  const [appIsReady, setAppIsReady] = useState(false); // gates first render

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts / storage / any init here
        await new Promise((resolve) => setTimeout(resolve, 100)); // demo delay
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // Hide the native (Expo) splash as soon as *any* UI lays out (Splash or App)
  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreenExpo.hideAsync();
    } catch (e) {
      // no-op if it's already hidden
    }
  }, []);

  const handleSplashComplete = () => setIsLoading(false);

  if (!appIsReady) {
    // Keep native splash visible until we're ready to render
    return null;
  }

  // While loading, show your custom animated splash (and hide native on layout)
  if (isLoading) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <SplashScreen onAnimationComplete={handleSplashComplete} />
        </ThemeProvider>
      </View>
    );
    // Tip: If you prefer, you can call SplashScreenExpo.hideAsync() inside SplashScreen's useEffect instead.
  }

  // Main app (also hides native splash if not already hidden)
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </View>
  );
}
