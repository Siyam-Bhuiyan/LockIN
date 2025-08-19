import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import StorageService from "../services/StorageService";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalVideos: 0,
    watchedVideos: 0,
    totalProblems: 0,
    solvedProblems: 0,
    totalRoadmaps: 0,
    completedRoadmaps: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [greetingTime, setGreetingTime] = useState("");

  useEffect(() => {
    loadStats();
    setGreetingTime(getGreetingTime());
  }, []);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const loadStats = async () => {
    try {
      const [projects, videos, problems, roadmaps] = await Promise.all([
        StorageService.getProjects(),
        StorageService.getVideos(),
        StorageService.getProblems(),
        StorageService.getRoadmaps(),
      ]);

      setStats({
        totalProjects: projects.length,
        completedProjects: projects.filter(
          (p) => p.tasks?.length > 0 && p.tasks.every((t) => t.completed)
        ).length,
        totalVideos: videos.length,
        watchedVideos: videos.filter((v) => v.completed).length,
        totalProblems: problems.length,
        solvedProblems: problems.filter((p) => p.status === "Solved").length,
        totalRoadmaps: roadmaps.length,
        completedRoadmaps: roadmaps.filter(
          (r) => r.steps?.length > 0 && r.steps.every((s) => s.completed)
        ).length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const StatCard = ({
    title,
    value,
    total,
    color,
    icon,
    onPress,
    subtitle,
  }) => {
    const progress = total > 0 ? value / total : 0;
    const progressPercentage = Math.round(progress * 100);

    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.statCardContainer}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[`${color}08`, `${color}03`]}
          style={[styles.statCard, { borderColor: `${color}20` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: `${color}15` }]}
            >
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statTitle, { color: theme.textSecondary }]}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[styles.statSubtitle, { color: theme.textTertiary }]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statContent}>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {value}
              </Text>
              {total > 0 && (
                <Text
                  style={[styles.statTotal, { color: theme.textSecondary }]}
                >
                  /{total}
                </Text>
              )}
            </View>
            {total > 0 && (
              <Text style={[styles.progressText, { color: color }]}>
                {progressPercentage}%
              </Text>
            )}
          </View>

          {total > 0 && (
            <ProgressBar
              progress={progress}
              height={6}
              color={color}
              animated={true}
              style={styles.progressBar}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const QuickActionButton = ({ title, icon, color, onPress, description }) => (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor: `${color}15` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[`${color}08`, `${color}04`]}
        style={styles.actionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: `${color}20` },
          ]}
        >
          <Ionicons name={icon} size={26} color={color} />
        </View>
        <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
        <Text
          style={[styles.actionDescription, { color: theme.textSecondary }]}
        >
          {description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const MotivationalQuote = () => {
    const quotes = [
      "Bro cooked 💀",
      "No task? Skill issue 🫠",
      "Touch some grass after this ✅🌱",
      "Ratioed by deadlines 📉",
      "NPCs don’t finish quests either 🤖",
      "Grind now, gyatt later 😩🔥",
      "You fell off (but can climb back) 📉➡️📈",
      "This assignment ain’t bussin fr 🤡",
      "Lock in before I tweak out 🔒😤",
      "Main character energy loading… ⏳",
      "Certified procrastinator arc 💤",
      "That task? Lowkey free 🆓",
      "Cooked? Nah, still preheating 🍳",
      "Homework speedrun (WR attempt) ⏱️",
      "Deadlines got you in a side quest 🗺️",
      "Wanna be him? Finish this task 🤴",
      "Bro thinks he has infinite continues 🎮",
      "This project ain’t real, stay woke 🛌",
      "Sigma grindset? More like sigma napset 😴",
      "Finish it now, flex it later 📸",
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
      <LinearGradient
        colors={[theme.primary + "15", theme.accent + "10"]}
        style={styles.motivationCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.motivationText, { color: theme.text }]}>
          {randomQuote}
        </Text>
      </LinearGradient>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    greetingContainer: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "500",
      marginBottom: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.8,
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 18,
      color: theme.textSecondary,
      marginTop: 6,
      fontWeight: "600",
      opacity: 0.8,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.4,
      flex: 1,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
      opacity: 0.8,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 16,
    },
    statCardContainer: {
      width: (width - 64) / 2,
      marginBottom: 4,
    },
    statCard: {
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      minHeight: 140,
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    statInfo: {
      flex: 1,
    },
    statTitle: {
      fontSize: 15,
      fontWeight: "600",
      lineHeight: 18,
    },
    statSubtitle: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 2,
    },
    statContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 12,
    },
    statValueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    statValue: {
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -1.5,
      lineHeight: 36,
    },
    statTotal: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 2,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "700",
    },
    progressBar: {
      borderRadius: 3,
    },
    quickActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 16,
    },
    actionButton: {
      width: (width - 64) / 2,
      borderRadius: 20,
      borderWidth: 1,
      overflow: "hidden",
    },
    actionGradient: {
      padding: 20,
      alignItems: "center",
      minHeight: 120,
      justifyContent: "center",
    },
    actionIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 12,
      textAlign: "center",
      fontWeight: "500",
      opacity: 0.8,
    },
    motivationCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      alignItems: "center",
    },
    motivationText: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 22,
    },
    overallTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 16,
      textAlign: "center",
    },
  });

  const totalCompleted =
    stats.completedProjects +
    stats.watchedVideos +
    stats.solvedProblems +
    stats.completedRoadmaps;
  const totalItems =
    stats.totalProjects +
    stats.totalVideos +
    stats.totalProblems +
    stats.totalRoadmaps;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.statusBar}
        translucent={false}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Text style={styles.title}>Hey Siyam!👋</Text>
            <Text style={styles.subtitle}>Get Better</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <MotivationalQuote />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 My Progress</Text>
              <Text style={styles.sectionSubtitle}>Lessgo</Text>
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title="Projects"
                subtitle="Varsity & Personal"
                value={stats.completedProjects}
                total={stats.totalProjects}
                color={theme.primary}
                icon="folder-outline"
                onPress={() => navigation.navigate("Projects")}
              />
              <StatCard
                title="Learning"
                subtitle="Videos & Courses"
                value={stats.watchedVideos}
                total={stats.totalVideos}
                color={theme.accent}
                icon="play-circle-outline"
                onPress={() => navigation.navigate("Learning")}
              />
              <StatCard
                title="CP Problems"
                subtitle="Coding Practice"
                value={stats.solvedProblems}
                total={stats.totalProblems}
                color={theme.success}
                icon="code-slash-outline"
                onPress={() => navigation.navigate("CP Tracker")}
              />
              <StatCard
                title="Roadmaps"
                subtitle="Learning Paths"
                value={stats.completedRoadmaps}
                total={stats.totalRoadmaps}
                color={theme.secondary}
                icon="map-outline"
                onPress={() => navigation.navigate("Roadmap")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Start now</Text>
            </View>
            <View style={styles.quickActions}>
              <QuickActionButton
                title="New Project"
                description="Track your work"
                icon="add-circle-outline"
                color={theme.primary}
                onPress={() => navigation.navigate("Projects")}
              />
              <QuickActionButton
                title="Add Video"
                description="Save to learn later"
                icon="videocam-outline"
                color={theme.accent}
                onPress={() => navigation.navigate("Learning")}
              />
              <QuickActionButton
                title="CP Problem"
                description="Practice coding"
                icon="trophy-outline"
                color={theme.success}
                onPress={() => navigation.navigate("CP Tracker")}
              />
              <QuickActionButton
                title="Create Roadmap"
                description="Plan your learning"
                icon="rocket-outline"
                color={theme.secondary}
                onPress={() => navigation.navigate("Roadmap")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
