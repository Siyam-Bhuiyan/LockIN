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
  FlatList,
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
  const [knowledgeCards] = useState([
    {
      id: 1,
      title: "Array & Hashing",
      description: "Master fundamental data structures and hash tables",
      progress: 0.7,
      color: "#FF6B6B",
      icon: "grid-outline",
      totalProblems: 9,
    },
    {
      id: 2,
      title: "Two Pointers",
      description: "Optimize your solutions with pointer techniques",
      progress: 0.5,
      color: "#4ECDC4",
      icon: "arrow-back-outline",
      totalProblems: 5,
    },
    {
      id: 3,
      title: "Sliding Window",
      description: "Efficient substring and subarray problems",
      progress: 0.3,
      color: "#45B7D1",
      icon: "expand-outline",
      totalProblems: 6,
    },
    {
      id: 4,
      title: "Stack",
      description: "LIFO data structure for various problems",
      progress: 0.8,
      color: "#96CEB4",
      icon: "layers-outline",
      totalProblems: 7,
    },
  ]);
  const [dailyChallenge] = useState({
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Check if brackets are properly balanced",
    estimatedTime: "15 min",
    points: 50,
    category: "Stack",
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
          colors={[theme.primary + "15", theme.accent + "10"]}
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
              style={[
                styles.neetCodeBadge,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Text
                style={[styles.neetCodeBadgeText, { color: theme.primary }]}
              >
                {progressPercentage}%
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={overallProgress}
            height={8}
            color={theme.primary}
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
              style={[
                styles.continueButton,
                { backgroundColor: theme.primary },
              ]}
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

  const KnowledgeCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.knowledgeCardContainer, { width: width * 0.7 }]}
      onPress={() => navigation.navigate("Knowledge", { topic: item.title })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[item.color + "08", item.color + "04"]}
        style={[styles.knowledgeCard, { borderColor: item.color + "20" }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.knowledgeHeader}>
          <View
            style={[
              styles.knowledgeIcon,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.knowledgeInfo}>
            <Text style={[styles.knowledgeTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text
              style={[
                styles.knowledgeDescription,
                { color: theme.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.knowledgeProgress}>
          <View style={styles.knowledgeProgressInfo}>
            <Text style={[styles.knowledgeProgressText, { color: item.color }]}>
              {Math.round(item.progress * 100)}% Complete
            </Text>
            <Text
              style={[
                styles.knowledgeProblemsText,
                { color: theme.textTertiary },
              ]}
            >
              {item.totalProblems} problems
            </Text>
          </View>
          <ProgressBar
            progress={item.progress}
            height={6}
            color={item.color}
            animated={true}
            style={styles.knowledgeProgressBar}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const DailyChallengeCard = () => {
    const getDifficultyColor = (difficulty) => {
      switch (difficulty.toLowerCase()) {
        case "easy":
          return "#22C55E";
        case "medium":
          return "#F59E0B";
        case "hard":
          return "#EF4444";
        default:
          return theme.textSecondary;
      }
    };

    return (
      <TouchableOpacity
        style={styles.dailyChallengeContainer}
        onPress={() => navigation.navigate("DailyChallenge")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.success + "15", theme.success + "08"]}
          style={styles.dailyChallengeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dailyChallengeHeader}>
            <View style={styles.dailyChallengeTitleContainer}>
              <Text style={[styles.dailyChallengeTitle, { color: theme.text }]}>
                Daily Challenge
              </Text>
              <View style={styles.dailyChallengeMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        getDifficultyColor(dailyChallenge.difficulty) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyBadgeText,
                      { color: getDifficultyColor(dailyChallenge.difficulty) },
                    ]}
                  >
                    {dailyChallenge.difficulty}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dailyChallengeTime,
                    { color: theme.textSecondary },
                  ]}
                >
                  {dailyChallenge.estimatedTime}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.pointsBadge,
                { backgroundColor: theme.accent + "20" },
              ]}
            >
              <Text style={[styles.pointsBadgeText, { color: theme.accent }]}>
                +{dailyChallenge.points}
              </Text>
            </View>
          </View>

          <Text style={[styles.dailyChallengeProblem, { color: theme.text }]}>
            {dailyChallenge.title}
          </Text>
          <Text
            style={[
              styles.dailyChallengeDescription,
              { color: theme.textSecondary },
            ]}
          >
            {dailyChallenge.description}
          </Text>

          <View style={styles.dailyChallengeFooter}>
            <View style={styles.categoryContainer}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.categoryText, { color: theme.textTertiary }]}
              >
                {dailyChallenge.category}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.solveButton, { backgroundColor: theme.success }]}
              onPress={() => navigation.navigate("DailyChallenge")}
            >
              <Text style={styles.solveButtonText}>Solve Now</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const CheatSheetPreview = () => {
    const cheatSheets = [
      {
        title: "Array Methods",
        code: "arr.filter(x => x > 5)",
        color: "#FF6B6B",
      },
      {
        title: "Binary Search",
        code: "while (left <= right)",
        color: "#4ECDC4",
      },
      { title: "DFS Template", code: "def dfs(node):", color: "#45B7D1" },
    ];

    return (
      <TouchableOpacity
        style={styles.cheatSheetContainer}
        onPress={() => navigation.navigate("CheatSheets")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.secondary + "15", theme.secondary + "08"]}
          style={styles.cheatSheetCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cheatSheetHeader}>
            <Text style={[styles.cheatSheetTitle, { color: theme.text }]}>
              Quick References
            </Text>
            <Text
              style={[
                styles.cheatSheetSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              Code snippets & algorithms
            </Text>
          </View>

          <View style={styles.cheatSheetPreviews}>
            {cheatSheets.map((sheet, index) => (
              <View key={index} style={styles.cheatSheetPreviewItem}>
                <View
                  style={[
                    styles.cheatSheetIcon,
                    { backgroundColor: sheet.color + "20" },
                  ]}
                >
                  <Ionicons
                    name="code-slash-outline"
                    size={16}
                    color={sheet.color}
                  />
                </View>
                <View style={styles.cheatSheetContent}>
                  <Text
                    style={[styles.cheatSheetItemTitle, { color: theme.text }]}
                  >
                    {sheet.title}
                  </Text>
                  <Text
                    style={[
                      styles.cheatSheetCode,
                      { color: theme.textTertiary },
                    ]}
                  >
                    {sheet.code}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.viewAllButton,
              { backgroundColor: theme.secondary + "20" },
            ]}
            onPress={() => navigation.navigate("CheatSheets")}
          >
            <Text
              style={[styles.viewAllButtonText, { color: theme.secondary }]}
            >
              View All Cheat Sheets
            </Text>
            <Ionicons name="arrow-forward" size={16} color={theme.secondary} />
          </TouchableOpacity>
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
      borderColor: theme.primary + "20",
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
    // Knowledge Cards Styles
    knowledgeCardsList: {
      paddingHorizontal: 4,
    },
    knowledgeCardContainer: {
      marginBottom: 4,
    },
    knowledgeCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
      minHeight: 140,
    },
    knowledgeHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    knowledgeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    knowledgeInfo: {
      flex: 1,
    },
    knowledgeTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    knowledgeDescription: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    knowledgeProgress: {
      marginTop: "auto",
    },
    knowledgeProgressInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    knowledgeProgressText: {
      fontSize: 14,
      fontWeight: "700",
    },
    knowledgeProblemsText: {
      fontSize: 12,
      fontWeight: "600",
    },
    knowledgeProgressBar: {
      borderRadius: 3,
    },
    // Daily Challenge Styles
    dailyChallengeContainer: {
      marginBottom: 4,
    },
    dailyChallengeCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.success + "20",
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
    // Cheat Sheet Styles
    cheatSheetContainer: {
      marginBottom: 4,
    },
    cheatSheetCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.secondary + "20",
      backgroundColor: theme.surface,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    cheatSheetHeader: {
      marginBottom: 16,
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
    cheatSheetPreviews: {
      marginBottom: 16,
    },
    cheatSheetPreviewItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    cheatSheetIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cheatSheetContent: {
      flex: 1,
    },
    cheatSheetItemTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    cheatSheetCode: {
      fontSize: 12,
      fontWeight: "500",
      fontFamily: "monospace",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    viewAllButtonText: {
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

          {/* Knowledge Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Knowledge Hub</Text>
              <Text style={styles.sectionSubtitle}>
                Master the fundamentals
              </Text>
            </View>
            <FlatList
              data={knowledgeCards}
              renderItem={({ item }) => <KnowledgeCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.knowledgeCardsList}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />
          </View>

          {/* Daily Challenge */}
          <View style={styles.section}>
            <DailyChallengeCard />
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
