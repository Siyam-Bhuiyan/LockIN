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
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";

const { width } = Dimensions.get("window");

const DailyChallengeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userSolution, setUserSolution] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({
    streak: 0,
    totalSolved: 0,
    pointsEarned: 0,
    lastSolvedDate: null,
    history: [],
  });
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // Sample daily challenges pool
  const challengesPool = [
    {
      id: 1,
      title: "Valid Parentheses",
      difficulty: "Easy",
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      category: "Stack",
      points: 50,
      estimatedTime: "15 min",
      examples: [
        { input: `"()"`, output: "true" },
        { input: `"()[]{}"`, output: "true" },
        { input: `"(]"`, output: "false" },
      ],
      constraints: [
        "1 <= s.length <= 10^4",
        "s consists of parentheses only '()[]{}'.",
      ],
      hints: [
        "Think about what makes parentheses valid - each opening bracket needs a corresponding closing bracket.",
        "Consider using a stack data structure. What would you push and pop?",
        "When you see an opening bracket, push it. When you see a closing bracket, check if it matches the most recent opening bracket.",
        "The string is valid if the stack is empty at the end and no mismatches occurred.",
      ],
      solution: {
        explanation:
          "We use a stack to keep track of opening brackets. For each character, if it's an opening bracket, we push it to the stack. If it's a closing bracket, we check if it matches the most recent opening bracket (top of stack). If the stack is empty at the end, the string is valid.",
        code: `function isValid(s) {
    const stack = [];
    const map = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in map) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
        timeComplexity: "O(n) - we visit each character once",
        spaceComplexity:
          "O(n) - worst case, all characters are opening brackets",
      },
      leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    },
    {
      id: 2,
      title: "Two Sum",
      difficulty: "Easy",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      category: "Array & Hashing",
      points: 50,
      estimatedTime: "10 min",
      examples: [
        { input: `nums = [2,7,11,15], target = 9`, output: "[0,1]" },
        { input: `nums = [3,2,4], target = 6`, output: "[1,2]" },
        { input: `nums = [3,3], target = 6`, output: "[0,1]" },
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists.",
      ],
      hints: [
        "A brute force approach would check every pair, but that's O(n²). Can we do better?",
        "Think about what you need to find: for each number, you need to find its complement (target - current number).",
        "Hash maps provide O(1) lookup time. Can you use one to store numbers you've seen?",
        "For each number, check if its complement exists in the hash map. If not, add the current number to the map.",
      ],
      solution: {
        explanation:
          "We use a hash map to store numbers we've seen along with their indices. For each number, we calculate its complement (target - current number) and check if it exists in our hash map. If it does, we found our answer. If not, we add the current number to the hash map.",
        code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return []; // Should never reach here given constraints
}`,
        timeComplexity: "O(n) - we visit each element once",
        spaceComplexity: "O(n) - hash map can contain up to n elements",
      },
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    },
    {
      id: 3,
      title: "Palindrome Number",
      difficulty: "Easy",
      description:
        "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
      category: "Math",
      points: 40,
      estimatedTime: "12 min",
      examples: [
        { input: `x = 121`, output: "true" },
        { input: `x = -121`, output: "false" },
        { input: `x = 10`, output: "false" },
      ],
      constraints: ["-2^31 <= x <= 2^31 - 1"],
      hints: [
        "Negative numbers are not palindromes. Numbers ending in 0 (except 0 itself) are not palindromes.",
        "You could convert to string, but can you solve it without string conversion?",
        "Try reversing half of the number. How do you know when you've reached the middle?",
        "Compare the first half with the reversed second half.",
      ],
      solution: {
        explanation:
          "Instead of reversing the entire number, we reverse only half of it. We stop when the original number becomes less than or equal to the reversed number. For odd-digit numbers, we need to remove the middle digit from the reversed number.",
        code: `function isPalindrome(x) {
    // Negative numbers and numbers ending in 0 (except 0) are not palindromes
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
        return false;
    }
    
    let reversedHalf = 0;
    while (x > reversedHalf) {
        reversedHalf = reversedHalf * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    
    // For odd number of digits, we need to remove the middle digit
    // by reversedHalf / 10
    return x === reversedHalf || x === Math.floor(reversedHalf / 10);
}`,
        timeComplexity: "O(log n) - we process half the digits",
        spaceComplexity: "O(1) - constant extra space",
      },
      leetcodeUrl: "https://leetcode.com/problems/palindrome-number/",
    },
  ];

  useEffect(() => {
    loadDailyProgress();
    generateDailyChallenge();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const data = await StorageService.getItem("dailyChallengeProgress");
      if (data) {
        setDailyProgress(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading daily progress:", error);
    }
  };

  const saveDailyProgress = async (progress) => {
    try {
      await StorageService.setItem(
        "dailyChallengeProgress",
        JSON.stringify(progress)
      );
      setDailyProgress(progress);
    } catch (error) {
      console.error("Error saving daily progress:", error);
    }
  };

  const generateDailyChallenge = () => {
    // In a real app, this would be based on the current date
    // and potentially user's skill level and previous attempts
    const today = new Date().toDateString();
    const savedChallenge = dailyProgress.history.find((h) => h.date === today);

    if (savedChallenge) {
      setCurrentChallenge(savedChallenge.challenge);
      setIsSubmitted(savedChallenge.completed);
    } else {
      // Generate new challenge
      const randomIndex = Math.floor(Math.random() * challengesPool.length);
      const challenge = challengesPool[randomIndex];
      setCurrentChallenge(challenge);
      setIsSubmitted(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyProgress();
    generateDailyChallenge();
    setRefreshing(false);
  };

  const submitSolution = async () => {
    if (!userSolution.trim()) {
      Alert.alert("Error", "Please enter your solution before submitting.");
      return;
    }

    // In a real app, this would validate the solution
    // For now, we'll just mark it as submitted
    const today = new Date().toDateString();
    const isFirstTimeToday = !dailyProgress.history.some(
      (h) => h.date === today
    );

    let newStreak = dailyProgress.streak;
    let newPoints = dailyProgress.pointsEarned;

    if (isFirstTimeToday) {
      // Check if this continues the streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      const solvedYesterday = dailyProgress.history.some(
        (h) => h.date === yesterdayString && h.completed
      );

      if (solvedYesterday || dailyProgress.streak === 0) {
        newStreak = dailyProgress.streak + 1;
      } else {
        newStreak = 1; // Reset streak
      }

      newPoints = dailyProgress.pointsEarned + currentChallenge.points;
    }

    const updatedProgress = {
      ...dailyProgress,
      streak: newStreak,
      totalSolved: isFirstTimeToday
        ? dailyProgress.totalSolved + 1
        : dailyProgress.totalSolved,
      pointsEarned: newPoints,
      lastSolvedDate: today,
      history: [
        ...dailyProgress.history.filter((h) => h.date !== today),
        {
          date: today,
          challenge: currentChallenge,
          completed: true,
          solution: userSolution,
          points: currentChallenge.points,
        },
      ],
    };

    await saveDailyProgress(updatedProgress);
    setIsSubmitted(true);

    Alert.alert(
      "Great Job! 🎉",
      `You've earned ${
        currentChallenge.points
      } points! Current streak: ${newStreak} day${newStreak !== 1 ? "s" : ""}`,
      [{ text: "Awesome!" }]
    );
  };

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

  const showNextHint = () => {
    if (currentHintIndex < currentChallenge.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const ProgressHeader = () => (
    <LinearGradient
      colors={[theme.success + "15", theme.success + "08"]}
      style={styles.progressHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={[styles.progressNumber, { color: theme.success }]}>
            {dailyProgress.streak}
          </Text>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Day Streak
          </Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={[styles.progressNumber, { color: theme.accent }]}>
            {dailyProgress.totalSolved}
          </Text>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Total Solved
          </Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={[styles.progressNumber, { color: theme.primary }]}>
            {dailyProgress.pointsEarned}
          </Text>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Points
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const ChallengeCard = () => (
    <View style={[styles.challengeCard, { backgroundColor: theme.surface }]}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeTitleContainer}>
          <Text style={[styles.challengeTitle, { color: theme.text }]}>
            {currentChallenge?.title}
          </Text>
          <View style={styles.challengeMeta}>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    getDifficultyColor(currentChallenge?.difficulty) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyBadgeText,
                  { color: getDifficultyColor(currentChallenge?.difficulty) },
                ]}
              >
                {currentChallenge?.difficulty}
              </Text>
            </View>
            <Text
              style={[styles.challengeTime, { color: theme.textSecondary }]}
            >
              {currentChallenge?.estimatedTime}
            </Text>
            <View
              style={[
                styles.pointsBadge,
                { backgroundColor: theme.accent + "20" },
              ]}
            >
              <Text style={[styles.pointsBadgeText, { color: theme.accent }]}>
                +{currentChallenge?.points}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text
        style={[styles.challengeDescription, { color: theme.textSecondary }]}
      >
        {currentChallenge?.description}
      </Text>

      <View style={styles.examplesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Examples:
        </Text>
        {currentChallenge?.examples.map((example, index) => (
          <View
            key={index}
            style={[styles.exampleItem, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.exampleText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: "700" }}>Input:</Text> {example.input}
            </Text>
            <Text style={[styles.exampleText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: "700" }}>Output:</Text>{" "}
              {example.output}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.constraintsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Constraints:
        </Text>
        {currentChallenge?.constraints.map((constraint, index) => (
          <Text
            key={index}
            style={[styles.constraintText, { color: theme.textTertiary }]}
          >
            • {constraint}
          </Text>
        ))}
      </View>
    </View>
  );

  const SolutionModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showSolutionModal}
      onRequestClose={() => setShowSolutionModal(false)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSolutionModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Solution
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.solutionCard, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Explanation:
            </Text>
            <Text
              style={[
                styles.solutionExplanation,
                { color: theme.textSecondary },
              ]}
            >
              {currentChallenge?.solution.explanation}
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Code:
            </Text>
            <ScrollView
              horizontal
              style={styles.codeScrollView}
              showsHorizontalScrollIndicator={false}
            >
              <Text style={[styles.codeText, { color: theme.textSecondary }]}>
                {currentChallenge?.solution.code}
              </Text>
            </ScrollView>

            <View style={styles.complexityContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Complexity:
              </Text>
              <Text
                style={[styles.complexityText, { color: theme.textSecondary }]}
              >
                <Text style={{ fontWeight: "700" }}>Time:</Text>{" "}
                {currentChallenge?.solution.timeComplexity}
              </Text>
              <Text
                style={[styles.complexityText, { color: theme.textSecondary }]}
              >
                <Text style={{ fontWeight: "700" }}>Space:</Text>{" "}
                {currentChallenge?.solution.spaceComplexity}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 24,
    },
    progressHeader: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.success + "20",
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    progressItem: {
      alignItems: "center",
    },
    progressNumber: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 4,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    challengeCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    challengeHeader: {
      marginBottom: 16,
    },
    challengeTitleContainer: {
      flex: 1,
    },
    challengeTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },
    challengeMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    challengeTime: {
      fontSize: 12,
      fontWeight: "600",
    },
    pointsBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    pointsBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    challengeDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 22,
      marginBottom: 20,
    },
    examplesContainer: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
    },
    exampleItem: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    exampleText: {
      fontSize: 13,
      fontFamily: "monospace",
      marginBottom: 4,
    },
    constraintsContainer: {
      marginBottom: 8,
    },
    constraintText: {
      fontSize: 13,
      fontWeight: "500",
      marginBottom: 4,
      lineHeight: 18,
    },
    solutionContainer: {
      marginBottom: 24,
    },
    solutionInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 14,
      fontFamily: "monospace",
      color: theme.text,
      backgroundColor: theme.surface,
      minHeight: 120,
      textAlignVertical: "top",
    },
    actionsContainer: {
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
    },
    secondaryButtonText: {
      fontWeight: "700",
    },
    hintsContainer: {
      marginTop: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.primary + "20",
      backgroundColor: theme.primary + "05",
    },
    hintText: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    hintButton: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.primary + "20",
    },
    hintButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.primary,
    },
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    closeButton: {
      padding: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    modalContent: {
      flex: 1,
      padding: 24,
    },
    solutionCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    solutionExplanation: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 22,
      marginBottom: 20,
    },
    codeScrollView: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    codeText: {
      fontFamily: "monospace",
      fontSize: 12,
      lineHeight: 18,
      minWidth: width - 100,
    },
    complexityContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 16,
    },
    complexityText: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
    },
  });

  if (!currentChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Loading today's challenge...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Daily Challenge</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ProgressHeader />
          <ChallengeCard />

          <View style={styles.solutionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Solution:
            </Text>
            <TextInput
              style={styles.solutionInput}
              placeholder="Write your solution here..."
              placeholderTextColor={theme.textTertiary}
              value={userSolution}
              onChangeText={setUserSolution}
              multiline
              editable={!isSubmitted}
            />
          </View>

          {showHints && (
            <View style={styles.hintsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Hint {currentHintIndex + 1}:
              </Text>
              <Text style={styles.hintText}>
                {currentChallenge.hints[currentHintIndex]}
              </Text>
              {currentHintIndex < currentChallenge.hints.length - 1 && (
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={showNextHint}
                >
                  <Text style={styles.hintButtonText}>Next Hint</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.actionsContainer}>
            {!isSubmitted ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.success },
                  ]}
                  onPress={submitSolution}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Submit Solution</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.secondaryButton,
                    { borderColor: theme.primary },
                  ]}
                  onPress={() => setShowHints(!showHints)}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color={theme.primary}
                  />
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: theme.primary },
                    ]}
                  >
                    {showHints ? "Hide Hints" : "Get Hint"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => setShowSolutionModal(true)}
              >
                <Ionicons name="bulb-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>View Solution</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.secondaryButton,
                { borderColor: theme.accent },
              ]}
              onPress={() => {
                Alert.alert(
                  "LeetCode",
                  `Open ${currentChallenge.title} on LeetCode?`
                );
              }}
            >
              <Ionicons name="open-outline" size={20} color={theme.accent} />
              <Text
                style={[styles.secondaryButtonText, { color: theme.accent }]}
              >
                Open in LeetCode
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SolutionModal />
    </SafeAreaView>
  );
};

export default DailyChallengeScreen;
