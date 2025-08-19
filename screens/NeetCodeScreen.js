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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import ProgressBar from "../components/ui/ProgressBar";
import CompactProblemCard from "../components/CompactProblemCard";
import StorageService from "../services/StorageService";
import {
  neetCodeProblems,
  categories,
  getDifficultyColor,
} from "../data/neetcodeProblems";

const { width } = Dimensions.get("window");

const NeetCodeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState({
    solved: 0,
    total: 150,
    easy: { solved: 0, total: 61 },
    medium: { solved: 0, total: 76 },
    hard: { solved: 0, total: 13 },
    lastSolved: null,
    problems: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await StorageService.getNeetCodeProgress();
      setProgress(data);
    } catch (error) {
      console.error("Error loading NeetCode progress:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  const toggleProblemStatus = async (problemId) => {
    try {
      const updatedProblems = progress.problems.map((p) =>
        p.id === problemId ? { ...p, completed: !p.completed } : p
      );

      // If problem doesn't exist in progress.problems, add it
      const problemExists = progress.problems.some((p) => p.id === problemId);
      if (!problemExists) {
        const problem = neetCodeProblems.find((p) => p.id === problemId);
        if (problem) {
          updatedProblems.push({ ...problem, completed: true });
        }
      }

      // Calculate new stats
      const completedProblems = updatedProblems.filter((p) => p.completed);
      const easySolved = completedProblems.filter(
        (p) => p.difficulty === "Easy"
      ).length;
      const mediumSolved = completedProblems.filter(
        (p) => p.difficulty === "Medium"
      ).length;
      const hardSolved = completedProblems.filter(
        (p) => p.difficulty === "Hard"
      ).length;

      const updatedProgress = {
        ...progress,
        problems: updatedProblems,
        solved: completedProblems.length,
        easy: { ...progress.easy, solved: easySolved },
        medium: { ...progress.medium, solved: mediumSolved },
        hard: { ...progress.hard, solved: hardSolved },
        lastSolved: problemId,
      };

      setProgress(updatedProgress);
      await StorageService.saveNeetCodeProgress(updatedProgress);
    } catch (error) {
      console.error("Error updating problem status:", error);
      Alert.alert("Error", "Failed to update problem status");
    }
  };

  const getFilteredProblems = () => {
    let filtered = neetCodeProblems;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (problem) => problem.category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.map((problem) => ({
      ...problem,
      completed: progress.problems.some(
        (p) => p.id === problem.id && p.completed
      ),
    }));
  };

  const ProgressHeader = () => {
    const overallProgress = progress.solved / progress.total;
    const progressPercentage = Math.round(overallProgress * 100);

    return (
      <LinearGradient
        colors={[theme.primary + "15", theme.accent + "10"]}
        style={styles.progressHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.progressTitleContainer}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>
            NeetCode 150 Progress
          </Text>
          <Text
            style={[styles.progressSubtitle, { color: theme.textSecondary }]}
          >
            Master coding interview patterns
          </Text>
        </View>

        <View style={styles.progressStats}>
          <View style={styles.progressMainStat}>
            <Text style={[styles.progressNumber, { color: theme.primary }]}>
              {progress.solved}
            </Text>
            <Text
              style={[styles.progressTotal, { color: theme.textSecondary }]}
            >
              /{progress.total}
            </Text>
            <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
              Solved ({progressPercentage}%)
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={overallProgress}
          height={8}
          color={theme.primary}
          animated={true}
          style={styles.progressBar}
        />

        <View style={styles.difficultyBreakdown}>
          <View style={styles.difficultyItem}>
            <View
              style={[styles.difficultyDot, { backgroundColor: "#22C55E" }]}
            />
            <Text
              style={[styles.difficultyText, { color: theme.textSecondary }]}
            >
              Easy: {progress.easy.solved}/{progress.easy.total}
            </Text>
          </View>
          <View style={styles.difficultyItem}>
            <View
              style={[styles.difficultyDot, { backgroundColor: "#F59E0B" }]}
            />
            <Text
              style={[styles.difficultyText, { color: theme.textSecondary }]}
            >
              Medium: {progress.medium.solved}/{progress.medium.total}
            </Text>
          </View>
          <View style={styles.difficultyItem}>
            <View
              style={[styles.difficultyDot, { backgroundColor: "#EF4444" }]}
            />
            <Text
              style={[styles.difficultyText, { color: theme.textSecondary }]}
            >
              Hard: {progress.hard.solved}/{progress.hard.total}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const CategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.filterTitle, { color: theme.text }]}>
        Categories
      </Text>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color:
                    selectedCategory === item ? "white" : theme.textSecondary,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const ProblemItem = ({ item }) => (
    <CompactProblemCard
      problem={item}
      isCompleted={item.completed}
      onToggleStatus={toggleProblemStatus}
      onPress={() => navigation.navigate("ProblemDetail", { problem: item })}
    />
  );

  const filteredProblems = getFilteredProblems();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
      flex: 1,
    },
    progressHeader: {
      margin: 24,
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.primary + "20",
    },
    progressTitleContainer: {
      marginBottom: 20,
    },
    progressTitle: {
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 4,
    },
    progressSubtitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    progressStats: {
      marginBottom: 16,
    },
    progressMainStat: {
      alignItems: "center",
    },
    progressNumber: {
      fontSize: 48,
      fontWeight: "900",
      lineHeight: 56,
    },
    progressTotal: {
      fontSize: 24,
      fontWeight: "700",
      marginTop: -8,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
    },
    progressBar: {
      marginBottom: 20,
      borderRadius: 4,
    },
    difficultyBreakdown: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    difficultyItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
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
    filterContainer: {
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },
    categoryList: {
      paddingVertical: 4,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.statusBar}
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NeetCode 150</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProgressHeader />
        <CategoryFilter />

        <View style={{ paddingHorizontal: 24 }}>
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <ProblemItem key={problem.id} item={problem} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No problems found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NeetCodeScreen;
