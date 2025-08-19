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
    const [cheatSheets, setCheatSheets] = useState([]);

    useEffect(() => {
      loadCheatSheets();
    }, []);

    const loadCheatSheets = async () => {
      try {
        const sheets = await StorageService.getCheatSheets();
        setCheatSheets(sheets.slice(0, 4)); // Get first 4 cheat sheets
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

    const getFirstCodeSnippet = (codes) => {
      if (!codes || codes.length === 0) return "No code snippets";
      const firstCode = codes[0].code;
      // Get first line of code, max 30 chars
      const firstLine = firstCode.split("\n")[0];
      return firstLine.length > 30
        ? firstLine.substring(0, 27) + "..."
        : firstLine;
    };

    return (
      <TouchableOpacity
        style={styles.cheatSheetContainer}
        onPress={() => navigation.navigate("CheatSheets")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.secondary + "12", theme.secondary + "06"]}
          style={[
            styles.cheatSheetCard,
            { borderColor: theme.secondary + "20" },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cheatSheetHeader}>
            <View style={styles.cheatSheetTitleContainer}>
              <Text style={[styles.cheatSheetTitle, { color: theme.text }]}>
                📚 Quick References
              </Text>
              <Text
                style={[
                  styles.cheatSheetSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Code snippets & boilerplates
              </Text>
            </View>
            <View
              style={[
                styles.cheatSheetBadge,
                { backgroundColor: theme.secondary + "15" },
              ]}
            >
              <Ionicons name="code-slash" size={18} color={theme.secondary} />
            </View>
          </View>

          {cheatSheets.length > 0 ? (
            <View style={styles.cheatSheetGrid}>
              {cheatSheets.map((sheet, index) => {
                const categoryColor =
                  categoryColors[sheet.category] || categoryColors["Other"];
                return (
                  <View
                    key={sheet.id || index}
                    style={styles.cheatSheetGridItem}
                  >
                    <LinearGradient
                      colors={[`${categoryColor}15`, `${categoryColor}08`]}
                      style={[
                        styles.cheatSheetMiniCard,
                        { borderColor: `${categoryColor}25` },
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.cheatSheetMiniHeader}>
                        <View
                          style={[
                            styles.cheatSheetMiniIcon,
                            { backgroundColor: `${categoryColor}20` },
                          ]}
                        >
                          <Ionicons
                            name={getCategoryIcon(sheet.category)}
                            size={12}
                            color={categoryColor}
                          />
                        </View>
                        <Text
                          style={[
                            styles.cheatSheetMiniTitle,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {sheet.title}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.cheatSheetMiniPreview,
                          { color: theme.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {getFirstCodeSnippet(sheet.codes)}
                      </Text>
                      <View style={styles.cheatSheetMiniFooter}>
                        <Text
                          style={[
                            styles.cheatSheetMiniCategory,
                            { color: categoryColor },
                          ]}
                          numberOfLines={1}
                        >
                          {sheet.category}
                        </Text>
                        <Text
                          style={[
                            styles.cheatSheetMiniCount,
                            { color: theme.textTertiary },
                          ]}
                        >
                          {sheet.codes?.length || 0}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.cheatSheetEmptyState}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color={theme.textSecondary}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={[
                  styles.cheatSheetEmptyText,
                  { color: theme.textSecondary },
                ]}
              >
                No cheat sheets yet
              </Text>
              <Text
                style={[
                  styles.cheatSheetEmptySubtext,
                  { color: theme.textTertiary },
                ]}
              >
                Create your first code snippet
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.cheatSheetViewAllButton,
              { backgroundColor: theme.secondary + "15" },
            ]}
            onPress={() => navigation.navigate("CheatSheets")}
          >
            <Text
              style={[styles.cheatSheetViewAllText, { color: theme.secondary }]}
            >
              {cheatSheets.length > 0
                ? "View All Cheat Sheets"
                : "Create Cheat Sheet"}
            </Text>
            <Ionicons
              name={cheatSheets.length > 0 ? "arrow-forward" : "add"}
              size={16}
              color={theme.secondary}
            />
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
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cheatSheetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 16,
    },
    cheatSheetGridItem: {
      width: (width - 88) / 2, // Account for padding and gap
    },
    cheatSheetMiniCard: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 80,
    },
    cheatSheetMiniHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    cheatSheetMiniIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    cheatSheetMiniTitle: {
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
    },
    cheatSheetMiniPreview: {
      fontSize: 11,
      fontWeight: "500",
      fontFamily: "monospace",
      marginBottom: 4,
    },
    cheatSheetMiniCategory: {
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      flex: 1,
    },
    cheatSheetMiniFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cheatSheetMiniCount: {
      fontSize: 10,
      fontWeight: "600",
    },
    cheatSheetEmptyState: {
      alignItems: "center",
      paddingVertical: 20,
      marginBottom: 16,
    },
    cheatSheetEmptyText: {
      fontSize: 14,
      fontWeight: "600",
    },
    cheatSheetEmptySubtext: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 2,
    },
    cheatSheetViewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
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
