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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import ProgressBar from "../components/ui/ProgressBar";
import StorageService from "../services/StorageService";

const { width } = Dimensions.get("window");

const KnowledgeScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { topic } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(topic || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProgress, setUserProgress] = useState({});

  const knowledgeTopics = [
    {
      id: 1,
      title: "Array & Hashing",
      description: "Master fundamental data structures and hash tables",
      color: "#FF6B6B",
      icon: "grid-outline",
      difficulty: "Beginner",
      estimatedTime: "2-3 hours",
      concepts: [
        {
          title: "Arrays Basics",
          description:
            "Understanding array operations, indexing, and iteration",
          timeComplexity: "O(1) access, O(n) search",
          spaceComplexity: "O(n)",
          keyPoints: [
            "Random access with O(1) time complexity",
            "Fixed size in most languages",
            "Contiguous memory allocation",
            "Cache-friendly due to locality",
          ],
          codeExample: `// Array initialization and basic operations
const arr = [1, 2, 3, 4, 5];

// Access element - O(1)
console.log(arr[0]); // 1

// Insert at end - O(1) amortized
arr.push(6);

// Search for element - O(n)
const index = arr.indexOf(3);

// Remove element - O(n) worst case
arr.splice(2, 1);`,
          leetcodeProblems: [
            "Two Sum",
            "Best Time to Buy and Sell Stock",
            "Contains Duplicate",
          ],
          completed: false,
        },
        {
          title: "Hash Tables",
          description: "Key-value mappings with constant time operations",
          timeComplexity: "O(1) average, O(n) worst case",
          spaceComplexity: "O(n)",
          keyPoints: [
            "Fast lookups using hash functions",
            "Handle collisions with chaining or open addressing",
            "Load factor affects performance",
            "Great for counting and frequency problems",
          ],
          codeExample: `// Hash table operations in JavaScript
const map = new Map();

// Insert/Update - O(1) average
map.set('key1', 'value1');
map.set('key2', 'value2');

// Lookup - O(1) average
const value = map.get('key1');

// Check existence - O(1) average
if (map.has('key1')) {
    console.log('Key exists');
}

// Common pattern: frequency counting
const freq = new Map();
for (const char of "hello") {
    freq.set(char, (freq.get(char) || 0) + 1);
}`,
          leetcodeProblems: ["Two Sum", "Group Anagrams", "Valid Anagram"],
          completed: false,
        },
      ],
    },
    {
      id: 2,
      title: "Two Pointers",
      description: "Optimize your solutions with pointer techniques",
      color: "#4ECDC4",
      icon: "arrow-back-outline",
      difficulty: "Beginner",
      estimatedTime: "1-2 hours",
      concepts: [
        {
          title: "Opposite Ends Technique",
          description: "Start pointers from both ends and move towards center",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          keyPoints: [
            "Reduces space complexity from O(n) to O(1)",
            "Common in palindrome and pair sum problems",
            "Works on sorted arrays efficiently",
            "Eliminates need for nested loops",
          ],
          codeExample: `// Two pointers from opposite ends
function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    
    while (left < right) {
        if (s[left] !== s[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

// Two sum on sorted array
function twoSum(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) return [left, right];
        else if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`,
          leetcodeProblems: ["Valid Palindrome", "Two Sum II", "3Sum"],
          completed: false,
        },
      ],
    },
    {
      id: 3,
      title: "Sliding Window",
      description: "Efficient substring and subarray problems",
      color: "#45B7D1",
      icon: "expand-outline",
      difficulty: "Intermediate",
      estimatedTime: "3-4 hours",
      concepts: [
        {
          title: "Fixed Size Window",
          description:
            "Maintain a window of fixed size while sliding through array",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1) or O(k)",
          keyPoints: [
            "Avoids recalculating entire window each time",
            "Add new element, remove old element",
            "Useful for finding max/min in subarrays",
            "Common in string and array problems",
          ],
          codeExample: `// Fixed size sliding window
function maxSumSubarray(arr, k) {
    let maxSum = 0, windowSum = 0;
    
    // Calculate first window
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    maxSum = windowSum;
    
    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}`,
          leetcodeProblems: [
            "Maximum Average Subarray I",
            "Sliding Window Maximum",
          ],
          completed: false,
        },
        {
          title: "Variable Size Window",
          description: "Expand and contract window based on conditions",
          timeComplexity: "O(n)",
          spaceComplexity: "O(k) where k is unique characters",
          keyPoints: [
            "Two pointers: start and end of window",
            "Expand window by moving right pointer",
            "Contract window by moving left pointer",
            "Maintain window properties using hash map",
          ],
          codeExample: `// Variable size sliding window
function longestSubstringWithoutRepeating(s) {
    const charMap = new Map();
    let left = 0, maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charMap.has(s[right])) {
            left = Math.max(left, charMap.get(s[right]) + 1);
        }
        
        charMap.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`,
          leetcodeProblems: [
            "Longest Substring Without Repeating Characters",
            "Minimum Window Substring",
          ],
          completed: false,
        },
      ],
    },
    {
      id: 4,
      title: "Stack",
      description: "LIFO data structure for various problems",
      color: "#96CEB4",
      icon: "layers-outline",
      difficulty: "Beginner",
      estimatedTime: "2-3 hours",
      concepts: [
        {
          title: "Basic Stack Operations",
          description: "Push, pop, peek operations and their applications",
          timeComplexity: "O(1) for all operations",
          spaceComplexity: "O(n)",
          keyPoints: [
            "Last In, First Out (LIFO) principle",
            "Used for function calls, undo operations",
            "Perfect for matching parentheses",
            "Helps in expression evaluation",
          ],
          codeExample: `// Stack implementation and usage
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(item) {
        this.items.push(item);
    }
    
    pop() {
        return this.items.pop();
    }
    
    peek() {
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}

// Valid parentheses checker
function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    
    for (const char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
          leetcodeProblems: [
            "Valid Parentheses",
            "Min Stack",
            "Daily Temperatures",
          ],
          completed: false,
        },
      ],
    },
  ];

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const data = await StorageService.getItem("knowledgeProgress");
      if (data) {
        setUserProgress(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading knowledge progress:", error);
    }
  };

  const saveUserProgress = async (progress) => {
    try {
      await StorageService.setItem(
        "knowledgeProgress",
        JSON.stringify(progress)
      );
      setUserProgress(progress);
    } catch (error) {
      console.error("Error saving knowledge progress:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProgress();
    setRefreshing(false);
  };

  const toggleConceptCompletion = async (topicId, conceptIndex) => {
    const key = `${topicId}-${conceptIndex}`;
    const newProgress = {
      ...userProgress,
      [key]: !userProgress[key],
    };
    await saveUserProgress(newProgress);
  };

  const getTopicProgress = (topic) => {
    if (!topic || !topic.concepts || !Array.isArray(topic.concepts)) {
      return 0;
    }
    const totalConcepts = topic.concepts.length;
    const completedConcepts = topic.concepts.filter(
      (_, index) => userProgress[`${topic.id}-${index}`]
    ).length;
    return totalConcepts > 0 ? completedConcepts / totalConcepts : 0;
  };

  const TopicCard = ({ topic }) => {
    const progress = getTopicProgress(topic);
    const progressPercentage = Math.round(progress * 100);

    return (
      <TouchableOpacity
        style={styles.topicCard}
        onPress={() => setSelectedTopic(topic)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[topic.color + "08", topic.color + "04"]}
          style={[
            styles.topicCardGradient,
            { borderColor: topic.color + "20" },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.topicHeader}>
            <View
              style={[
                styles.topicIcon,
                { backgroundColor: topic.color + "20" },
              ]}
            >
              <Ionicons name={topic.icon} size={24} color={topic.color} />
            </View>
            <View style={styles.topicInfo}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>
                {topic.title}
              </Text>
              <Text
                style={[
                  styles.topicDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {topic.description}
              </Text>
            </View>
          </View>

          <View style={styles.topicMeta}>
            <View style={styles.topicBadges}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.primary + "15" },
                ]}
              >
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {topic.difficulty}
                </Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: theme.accent + "15" }]}
              >
                <Text style={[styles.badgeText, { color: theme.accent }]}>
                  {topic.estimatedTime}
                </Text>
              </View>
            </View>
            <Text style={[styles.progressText, { color: topic.color }]}>
              {progressPercentage}% Complete
            </Text>
          </View>

          <ProgressBar
            progress={progress}
            height={6}
            color={topic.color}
            animated={true}
            style={styles.topicProgressBar}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const ConceptCard = ({ concept, topicId, index, topicColor }) => {
    if (!concept) {
      return null;
    }

    const isCompleted = userProgress[`${topicId}-${index}`];

    return (
      <View style={[styles.conceptCard, { backgroundColor: theme.surface }]}>
        <View style={styles.conceptHeader}>
          <View style={styles.conceptTitleContainer}>
            <Text style={[styles.conceptTitle, { color: theme.text }]}>
              {concept.title || "Untitled Concept"}
            </Text>
            <Text
              style={[
                styles.conceptDescription,
                { color: theme.textSecondary },
              ]}
            >
              {concept.description || "No description available"}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted
                ? { backgroundColor: theme.success + "20" }
                : { backgroundColor: theme.border },
            ]}
            onPress={() => toggleConceptCompletion(topicId, index)}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isCompleted ? theme.success : theme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.conceptMeta}>
          <View style={styles.complexityInfo}>
            <Text
              style={[styles.complexityLabel, { color: theme.textTertiary }]}
            >
              Time: {concept.timeComplexity || "N/A"}
            </Text>
            <Text
              style={[styles.complexityLabel, { color: theme.textTertiary }]}
            >
              Space: {concept.spaceComplexity || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.keyPointsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Key Points:
          </Text>
          {concept.keyPoints?.map((point, i) => (
            <View key={i} style={styles.keyPoint}>
              <View style={[styles.bullet, { backgroundColor: topicColor }]} />
              <Text
                style={[styles.keyPointText, { color: theme.textSecondary }]}
              >
                {point}
              </Text>
            </View>
          )) || []}
        </View>

        <View style={styles.codeContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Code Example:
          </Text>
          <ScrollView
            horizontal
            style={styles.codeScrollView}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={[styles.codeText, { color: theme.textSecondary }]}>
              {concept.codeExample || "// No code example available"}
            </Text>
          </ScrollView>
        </View>

        <View style={styles.problemsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Related Problems:
          </Text>
          <View style={styles.problemsList}>
            {concept.leetcodeProblems?.map((problem, i) => (
              <View
                key={i}
                style={[
                  styles.problemBadge,
                  { backgroundColor: topicColor + "15" },
                ]}
              >
                <Text style={[styles.problemText, { color: topicColor }]}>
                  {problem}
                </Text>
              </View>
            )) || []}
          </View>
        </View>
      </View>
    );
  };

  const DetailModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={!!selectedTopic}
      onRequestClose={() => setSelectedTopic(null)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedTopic(null)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {selectedTopic?.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedTopic?.concepts?.map((concept, index) => (
            <ConceptCard
              key={index}
              concept={concept}
              topicId={selectedTopic.id}
              index={index}
              topicColor={selectedTopic.color}
            />
          )) || []}
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
    introContainer: {
      marginBottom: 32,
    },
    introTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 8,
    },
    introSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "500",
      lineHeight: 24,
    },
    topicCard: {
      marginBottom: 20,
    },
    topicCardGradient: {
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    topicHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    topicIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    topicInfo: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 6,
    },
    topicDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    topicMeta: {
      marginBottom: 16,
    },
    topicBadges: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    progressText: {
      fontSize: 14,
      fontWeight: "700",
    },
    topicProgressBar: {
      borderRadius: 3,
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
    conceptCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    conceptHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    conceptTitleContainer: {
      flex: 1,
      marginRight: 16,
    },
    conceptTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
    },
    conceptDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    completeButton: {
      padding: 8,
      borderRadius: 12,
    },
    conceptMeta: {
      marginBottom: 20,
    },
    complexityInfo: {
      flexDirection: "row",
      gap: 16,
    },
    complexityLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    keyPointsContainer: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
    },
    keyPoint: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      marginRight: 12,
    },
    keyPointText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    codeContainer: {
      marginBottom: 20,
    },
    codeScrollView: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    codeText: {
      fontFamily: "monospace",
      fontSize: 12,
      lineHeight: 18,
      minWidth: width - 100,
    },
    problemsContainer: {
      marginBottom: 8,
    },
    problemsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    problemBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    problemText: {
      fontSize: 12,
      fontWeight: "600",
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
        <Text style={styles.headerTitle}>Knowledge Hub</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Master Programming Concepts</Text>
            <Text style={styles.introSubtitle}>
              Deep dive into fundamental algorithms and data structures with
              interactive examples and detailed explanations.
            </Text>
          </View>

          {knowledgeTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </View>
      </ScrollView>

      <DetailModal />
    </SafeAreaView>
  );
};

export default KnowledgeScreen;
