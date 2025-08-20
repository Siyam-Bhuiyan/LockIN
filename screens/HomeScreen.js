import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  FlatList,
  Animated,
  PanResponder,
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
  const [neetCodeProgress, setNeetCodeProgress] = useState({
    solved: 0,
    total: 150,
    easy: { solved: 0, total: 61 },
    medium: { solved: 0, total: 76 },
    hard: { solved: 0, total: 13 },
    lastSolved: null,
  });
  const [dailyTracker] = useState({
    todayTasks: 5,
    completedTasks: 3,
    totalHours: 8.5,
    completedHours: 6.0,
    streak: 7,
  });

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
      const [projects, videos, problems, roadmaps, neetCodeData] =
        await Promise.all([
          StorageService.getProjects(),
          StorageService.getVideos(),
          StorageService.getProblems(),
          StorageService.getRoadmaps(),
          StorageService.getNeetCodeProgress(),
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

      if (neetCodeData) {
        setNeetCodeProgress(neetCodeData);
      }
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

  const NeetCodeTracker = () => {
    const overallProgress = neetCodeProgress.solved / neetCodeProgress.total;
    const progressPercentage = Math.round(overallProgress * 100);

    return (
      <TouchableOpacity
        style={styles.neetCodeContainer}
        onPress={() => navigation.navigate("NeetCode")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#6366F115", "#6366F108"]}
          style={styles.neetCodeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.neetCodeHeader}>
            <View style={styles.neetCodeTitleContainer}>
              <Text style={[styles.neetCodeTitle, { color: theme.text }]}>
                NeetCode 150
              </Text>
              <Text
                style={[
                  styles.neetCodeSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                {neetCodeProgress.solved}/{neetCodeProgress.total} solved
              </Text>
            </View>
            <View
              style={[styles.neetCodeBadge, { backgroundColor: "#6366F120" }]}
            >
              <Text style={[styles.neetCodeBadgeText, { color: "#6366F1" }]}>
                {progressPercentage}%
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={overallProgress}
            height={8}
            color="#6366F1"
            animated={true}
            style={styles.neetCodeProgress}
          />

          <View style={styles.neetCodeStats}>
            <View style={styles.difficultyStats}>
              <View style={styles.difficultyItem}>
                <View
                  style={[styles.difficultyDot, { backgroundColor: "#22C55E" }]}
                />
                <Text
                  style={[
                    styles.difficultyText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Easy: {neetCodeProgress.easy.solved}/
                  {neetCodeProgress.easy.total}
                </Text>
              </View>
              <View style={styles.difficultyItem}>
                <View
                  style={[styles.difficultyDot, { backgroundColor: "#F59E0B" }]}
                />
                <Text
                  style={[
                    styles.difficultyText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Medium: {neetCodeProgress.medium.solved}/
                  {neetCodeProgress.medium.total}
                </Text>
              </View>
              <View style={styles.difficultyItem}>
                <View
                  style={[styles.difficultyDot, { backgroundColor: "#EF4444" }]}
                />
                <Text
                  style={[
                    styles.difficultyText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Hard: {neetCodeProgress.hard.solved}/
                  {neetCodeProgress.hard.total}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: "#6366F1" }]}
              onPress={() => navigation.navigate("NeetCode")}
            >
              <Text style={styles.continueButtonText}>Continue Solving</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const DailyTrackerCard = () => {
    const progressPercentage =
      dailyTracker.totalHours > 0
        ? (dailyTracker.completedHours / dailyTracker.totalHours) * 100
        : 0;

    const taskProgress =
      dailyTracker.todayTasks > 0
        ? (dailyTracker.completedTasks / dailyTracker.todayTasks) * 100
        : 0;

    return (
      <TouchableOpacity
        style={styles.dailyChallengeContainer}
        onPress={() => navigation.navigate("DailyTracker")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.primary + "15", theme.primary + "08"]}
          style={styles.dailyChallengeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dailyChallengeHeader}>
            <View style={styles.dailyChallengeTitleContainer}>
              <Text style={[styles.dailyChallengeTitle, { color: theme.text }]}>
                Daily Tracker
              </Text>
              <View style={styles.dailyChallengeMeta}>
                <View style={styles.categoryContainer}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={theme.success}
                  />
                  <Text style={[styles.categoryText, { color: theme.success }]}>
                    {dailyTracker.completedHours}h / {dailyTracker.totalHours}h
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.pointsBadge,
                { backgroundColor: theme.success + "20" },
              ]}
            >
              <Text style={[styles.pointsBadgeText, { color: theme.success }]}>
                {dailyTracker.streak} day streak
              </Text>
            </View>
          </View>

          <View style={styles.trackerStatsRow}>
            <View style={styles.trackerStat}>
              <Text style={[styles.trackerStatNumber, { color: theme.text }]}>
                {dailyTracker.completedTasks}
              </Text>
              <Text
                style={[
                  styles.trackerStatLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Tasks Done
              </Text>
            </View>
            <View style={styles.trackerStat}>
              <Text style={[styles.trackerStatNumber, { color: theme.text }]}>
                {dailyTracker.todayTasks}
              </Text>
              <Text
                style={[
                  styles.trackerStatLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Total Tasks
              </Text>
            </View>
            <View style={styles.trackerStat}>
              <Text style={[styles.trackerStatNumber, { color: theme.text }]}>
                {progressPercentage.toFixed(0)}%
              </Text>
              <Text
                style={[
                  styles.trackerStatLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Progress
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progressPercentage / 100}
              height={8}
              color={theme.primary}
              animated={true}
              style={styles.progressBarTracker}
            />
          </View>

          <View style={styles.dailyChallengeFooter}>
            <View style={styles.categoryContainer}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.categoryText, { color: theme.textTertiary }]}
              >
                Today's Focus
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.solveButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate("DailyTracker")}
            >
              <Text style={styles.solveButtonText}>Track Now</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const CheatSheetPreview = () => {
    const [cheatSheets, setCheatSheets] = useState([]);

    useEffect(() => {
      loadCheatSheets();
    }, []);

    const loadCheatSheets = async () => {
      try {
        const sheets = await StorageService.getCheatSheets();
        setCheatSheets(sheets.slice(0, 3)); // Get first 3 cheat sheets for compact design
      } catch (error) {
        console.error("Error loading cheat sheets:", error);
      }
    };

    const categoryColors = {
      Algorithms: "#6366F1",
      "Data Structures": "#8B5CF6",
      Arrays: "#10B981",
      Strings: "#F59E0B",
      Trees: "#EF4444",
      Graphs: "#06B6D4",
      "Dynamic Programming": "#EC4899",
      Sorting: "#84CC16",
      Searching: "#F97316",
      Math: "#3B82F6",
      "Bit Manipulation": "#6B7280",
      "Design Patterns": "#8B5CF6",
      "System Design": "#059669",
      Other: "#6B7280",
    };

    const getCategoryIcon = (category) => {
      const icons = {
        Algorithms: "calculator-outline",
        "Data Structures": "layers-outline",
        Arrays: "grid-outline",
        Strings: "text-outline",
        Trees: "git-network-outline",
        Graphs: "share-outline",
        "Dynamic Programming": "flash-outline",
        Sorting: "swap-vertical-outline",
        Searching: "search-outline",
        Math: "calculator-outline",
        "Bit Manipulation": "code-slash-outline",
        "Design Patterns": "construct-outline",
        "System Design": "server-outline",
        Other: "code-outline",
      };
      return icons[category] || "code-outline";
    };

    return (
      <TouchableOpacity
        style={styles.cheatSheetContainer}
        onPress={() => navigation.navigate("CheatSheets")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#8B5CF615", "#8B5CF608"]}
          style={[styles.cheatSheetCard, { borderColor: "#8B5CF625" }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cheatSheetHeader}>
            <View style={styles.cheatSheetTitleContainer}>
              <Text style={[styles.cheatSheetTitle, { color: theme.text }]}>
                📚 Quick Reference
              </Text>
              <Text
                style={[
                  styles.cheatSheetSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                {cheatSheets.length > 0
                  ? `${cheatSheets.length} code snippets ready`
                  : "Code snippets & templates"}
              </Text>
            </View>
            <View
              style={[styles.cheatSheetBadge, { backgroundColor: "#8B5CF620" }]}
            >
              <Text style={[styles.cheatSheetBadgeText, { color: "#8B5CF6" }]}>
                {cheatSheets.length || 0}
              </Text>
            </View>
          </View>

          {cheatSheets.length > 0 ? (
            <View style={styles.cheatSheetPreviewList}>
              {cheatSheets.slice(0, 2).map((sheet, index) => {
                const categoryColor =
                  categoryColors[sheet.category] || categoryColors["Other"];
                return (
                  <View
                    key={sheet.id || index}
                    style={styles.cheatSheetPreviewItem}
                  >
                    <View
                      style={[
                        styles.cheatSheetPreviewIcon,
                        { backgroundColor: `${categoryColor}20` },
                      ]}
                    >
                      <Ionicons
                        name={getCategoryIcon(sheet.category)}
                        size={16}
                        color={categoryColor}
                      />
                    </View>
                    <View style={styles.cheatSheetPreviewContent}>
                      <Text
                        style={[
                          styles.cheatSheetPreviewTitle,
                          { color: theme.text },
                        ]}
                        numberOfLines={1}
                      >
                        {sheet.title}
                      </Text>
                      <Text
                        style={[
                          styles.cheatSheetPreviewCategory,
                          { color: categoryColor },
                        ]}
                        numberOfLines={1}
                      >
                        {sheet.category} • {sheet.codes?.length || 0} snippets
                      </Text>
                    </View>
                  </View>
                );
              })}
              {cheatSheets.length > 2 && (
                <Text
                  style={[
                    styles.cheatSheetMoreText,
                    { color: theme.textTertiary },
                  ]}
                >
                  +{cheatSheets.length - 2} more cheat sheets
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.cheatSheetEmptyState}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={theme.textTertiary}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.cheatSheetEmptyText,
                  { color: theme.textSecondary },
                ]}
              >
                No cheat sheets yet
              </Text>
            </View>
          )}

          <View style={styles.cheatSheetFooter}>
            <TouchableOpacity
              style={[
                styles.cheatSheetViewAllButton,
                { backgroundColor: "#8B5CF615" },
              ]}
              onPress={() => navigation.navigate("CheatSheets")}
            >
              <Text
                style={[styles.cheatSheetViewAllText, { color: "#8B5CF6" }]}
              >
                {cheatSheets.length > 0 ? "View All" : "Create First"}
              </Text>
              <Ionicons
                name={cheatSheets.length > 0 ? "arrow-forward" : "add"}
                size={16}
                color="#8B5CF6"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

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
    // NeetCode Tracker Styles
    neetCodeContainer: {
      marginBottom: 4,
    },
    neetCodeCard: {
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#6366F120",
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    neetCodeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    neetCodeTitleContainer: {
      flex: 1,
    },
    neetCodeTitle: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    neetCodeSubtitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    neetCodeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 16,
    },
    neetCodeBadgeText: {
      fontSize: 14,
      fontWeight: "700",
    },
    neetCodeProgress: {
      marginBottom: 16,
      borderRadius: 4,
    },
    neetCodeStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    difficultyStats: {
      flex: 1,
    },
    difficultyItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    difficultyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
    },
    continueButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    continueButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "white",
    },
    // Daily Challenge Styles
    dailyChallengeContainer: {
      marginBottom: 4,
    },
    dailyChallengeCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#10B98120",
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    dailyChallengeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    dailyChallengeTitleContainer: {
      flex: 1,
    },
    dailyChallengeTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    dailyChallengeMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    difficultyBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    dailyChallengeTime: {
      fontSize: 12,
      fontWeight: "600",
    },
    pointsBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      marginLeft: 16,
    },
    pointsBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    dailyChallengeProblem: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 6,
    },
    dailyChallengeDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      marginBottom: 16,
    },
    dailyChallengeFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "600",
    },
    solveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
    },
    solveButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "white",
    },
    // Daily Tracker Specific Styles
    trackerStatsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 16,
    },
    trackerStat: {
      alignItems: "center",
      flex: 1,
    },
    trackerStatNumber: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    trackerStatLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    progressContainer: {
      marginVertical: 12,
    },
    progressBarTracker: {
      borderRadius: 4,
    },
    // Cheat Sheet Styles - Compact Design
    cheatSheetContainer: {
      marginBottom: 4,
    },
    cheatSheetCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
      minHeight: 160, // Compact height similar to other cards
    },
    cheatSheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    cheatSheetTitleContainer: {
      flex: 1,
    },
    cheatSheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    cheatSheetSubtitle: {
      fontSize: 14,
      fontWeight: "500",
    },
    cheatSheetBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 16,
    },
    cheatSheetBadgeText: {
      fontSize: 14,
      fontWeight: "700",
    },
    cheatSheetPreviewList: {
      marginBottom: 16,
    },
    cheatSheetPreviewItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    cheatSheetPreviewIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cheatSheetPreviewContent: {
      flex: 1,
    },
    cheatSheetPreviewTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 2,
    },
    cheatSheetPreviewCategory: {
      fontSize: 12,
      fontWeight: "600",
    },
    cheatSheetMoreText: {
      fontSize: 12,
      fontWeight: "500",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 4,
    },
    cheatSheetEmptyState: {
      alignItems: "center",
      paddingVertical: 16,
      marginBottom: 16,
    },
    cheatSheetEmptyText: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    cheatSheetFooter: {
      marginTop: "auto",
    },
    cheatSheetViewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 6,
    },
    cheatSheetViewAllText: {
      fontSize: 14,
      fontWeight: "700",
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

          {/* NeetCode 150 Tracker */}
          <View style={styles.section}>
            <NeetCodeTracker />
          </View>

          {/* Daily Tracker */}
          <View style={styles.section}>
            <DailyTrackerCard />
          </View>

          {/* Cheat Sheets */}
          <View style={styles.section}>
            <CheatSheetPreview />
          </View>

          {/* My Progress - Moved Down */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>� My Progress</Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
