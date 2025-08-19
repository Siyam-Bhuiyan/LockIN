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
  Alert,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";

const { width } = Dimensions.get("window");

const CheatSheetsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCheatSheet, setSelectedCheatSheet] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteSheets, setFavoriteSheets] = useState([]);

  const cheatSheets = [
    {
      id: 1,
      title: "Array Operations",
      category: "Arrays",
      description: "Essential array methods and operations",
      color: "#FF6B6B",
      icon: "grid-outline",
      difficulty: "Beginner",
      snippets: [
        {
          title: "Array Initialization",
          description: "Different ways to create and initialize arrays",
          code: `// Create empty array
const arr = [];
const arr2 = new Array();

// Create array with size
const arr3 = new Array(5); // [undefined, undefined, ...]

// Create array with values
const arr4 = [1, 2, 3, 4, 5];
const arr5 = Array.from({length: 5}, (_, i) => i + 1); // [1,2,3,4,5]

// Fill array with same value
const arr6 = new Array(5).fill(0); // [0,0,0,0,0]`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
        },
        {
          title: "Common Array Methods",
          description: "Most frequently used array operations",
          code: `const arr = [1, 2, 3, 4, 5];

// Add/Remove elements
arr.push(6);           // Add to end: [1,2,3,4,5,6]
arr.pop();             // Remove from end: [1,2,3,4,5]
arr.unshift(0);        // Add to start: [0,1,2,3,4,5]
arr.shift();           // Remove from start: [1,2,3,4,5]

// Slice and Splice
arr.slice(1, 3);       // Get subarray: [2,3] (original unchanged)
arr.splice(1, 2, 'a'); // Replace: [1,'a',4,5] (modifies original)

// Find elements
arr.indexOf(3);        // Find index: 2
arr.includes(3);       // Check existence: true
arr.find(x => x > 3);  // Find first: 4
arr.filter(x => x > 3); // Find all: [4,5]`,
          timeComplexity: "O(1) to O(n)",
          spaceComplexity: "O(1) to O(n)",
        },
        {
          title: "Array Iteration",
          description: "Different ways to loop through arrays",
          code: `const arr = [1, 2, 3, 4, 5];

// Basic for loop
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}

// For...of loop (values)
for (const value of arr) {
    console.log(value);
}

// For...in loop (indices)
for (const index in arr) {
    console.log(index, arr[index]);
}

// Higher-order functions
arr.forEach((value, index) => console.log(value));
arr.map(x => x * 2);          // Transform: [2,4,6,8,10]
arr.reduce((sum, x) => sum + x, 0); // Accumulate: 15`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1) to O(n)",
        },
      ],
    },
    {
      id: 2,
      title: "Binary Search Templates",
      category: "Algorithms",
      description: "Binary search patterns and implementations",
      color: "#4ECDC4",
      icon: "search-outline",
      difficulty: "Intermediate",
      snippets: [
        {
          title: "Standard Binary Search",
          description: "Find exact target in sorted array",
          code: `function binarySearch(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Not found
}

// Usage
const nums = [1, 3, 5, 7, 9, 11];
console.log(binarySearch(nums, 7)); // 3`,
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
        },
        {
          title: "Find First/Last Position",
          description: "Binary search for first or last occurrence",
          code: `function findFirst(nums, target) {
    let left = 0, right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            result = mid;
            right = mid - 1; // Continue searching left
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

function findLast(nums, target) {
    let left = 0, right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            result = mid;
            left = mid + 1; // Continue searching right
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}`,
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
        },
        {
          title: "Search Insert Position",
          description: "Find position where target should be inserted",
          code: `function searchInsert(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return left; // Insert position
}

// Usage
const nums = [1, 3, 5, 6];
console.log(searchInsert(nums, 5)); // 2
console.log(searchInsert(nums, 2)); // 1
console.log(searchInsert(nums, 7)); // 4`,
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
        },
      ],
    },
    {
      id: 3,
      title: "DFS Patterns",
      category: "Trees & Graphs",
      description: "Depth-First Search implementations",
      color: "#45B7D1",
      icon: "git-network-outline",
      difficulty: "Intermediate",
      snippets: [
        {
          title: "Tree DFS (Recursive)",
          description: "Basic recursive tree traversal",
          code: `// Tree node definition
class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Preorder traversal (Root -> Left -> Right)
function preorder(root, result = []) {
    if (!root) return result;
    
    result.push(root.val);      // Visit root
    preorder(root.left, result);  // Visit left subtree
    preorder(root.right, result); // Visit right subtree
    
    return result;
}

// Inorder traversal (Left -> Root -> Right)
function inorder(root, result = []) {
    if (!root) return result;
    
    inorder(root.left, result);   // Visit left subtree
    result.push(root.val);        // Visit root
    inorder(root.right, result);  // Visit right subtree
    
    return result;
}

// Postorder traversal (Left -> Right -> Root)
function postorder(root, result = []) {
    if (!root) return result;
    
    postorder(root.left, result);  // Visit left subtree
    postorder(root.right, result); // Visit right subtree
    result.push(root.val);         // Visit root
    
    return result;
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(h) where h is height",
        },
        {
          title: "Tree DFS (Iterative)",
          description: "Iterative tree traversal using stack",
          code: `function preorderIterative(root) {
    if (!root) return [];
    
    const result = [];
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        
        // Push right first (LIFO)
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    
    return result;
}

function inorderIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current || stack.length > 0) {
        // Go to leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // Process node
        current = stack.pop();
        result.push(current.val);
        
        // Move to right subtree
        current = current.right;
    }
    
    return result;
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
        },
        {
          title: "Graph DFS",
          description: "DFS for graph traversal and cycle detection",
          code: `// Adjacency list representation
function dfsGraph(graph, start, visited = new Set()) {
    const result = [];
    
    function dfs(node) {
        visited.add(node);
        result.push(node);
        
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
    }
    
    dfs(start);
    return result;
}

// Check if graph has cycle (undirected)
function hasCycle(graph) {
    const visited = new Set();
    
    function dfs(node, parent) {
        visited.add(node);
        
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor, node)) return true;
            } else if (neighbor !== parent) {
                return true; // Back edge found
            }
        }
        return false;
    }
    
    for (const node in graph) {
        if (!visited.has(node)) {
            if (dfs(node, -1)) return true;
        }
    }
    return false;
}`,
          timeComplexity: "O(V + E)",
          spaceComplexity: "O(V)",
        },
      ],
    },
    {
      id: 4,
      title: "Dynamic Programming",
      category: "Algorithms",
      description: "DP patterns and common problems",
      color: "#96CEB4",
      icon: "analytics-outline",
      difficulty: "Advanced",
      snippets: [
        {
          title: "1D DP Template",
          description: "Basic 1D dynamic programming pattern",
          code: `// Fibonacci sequence
function fibonacci(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Space optimized version
function fibonacciOptimized(n) {
    if (n <= 1) return n;
    
    let prev2 = 0, prev1 = 1;
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Climbing stairs (similar pattern)
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev2 = 1, prev1 = 2;
    
    for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1) optimized",
        },
        {
          title: "2D DP Template",
          description: "Grid-based dynamic programming",
          code: `// Unique paths in grid
function uniquePaths(m, n) {
    const dp = Array(m).fill().map(() => Array(n).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i < m; i++) dp[i][0] = 1;
    for (let j = 0; j < n; j++) dp[0][j] = 1;
    
    // Fill the DP table
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    
    return dp[m-1][n-1];
}

// Minimum path sum
function minPathSum(grid) {
    const m = grid.length, n = grid[0].length;
    const dp = Array(m).fill().map(() => Array(n).fill(0));
    
    dp[0][0] = grid[0][0];
    
    // Initialize first row
    for (let j = 1; j < n; j++) {
        dp[0][j] = dp[0][j-1] + grid[0][j];
    }
    
    // Initialize first column
    for (let i = 1; i < m; i++) {
        dp[i][0] = dp[i-1][0] + grid[i][0];
    }
    
    // Fill the DP table
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
        }
    }
    
    return dp[m-1][n-1];
}`,
          timeComplexity: "O(m × n)",
          spaceComplexity: "O(m × n)",
        },
      ],
    },
    {
      id: 5,
      title: "Two Pointers Techniques",
      category: "Algorithms",
      description: "Two pointer patterns and problems",
      color: "#FFB347",
      icon: "arrow-back-outline",
      difficulty: "Beginner",
      snippets: [
        {
          title: "Opposite Direction",
          description: "Pointers moving from both ends",
          code: `// Two sum in sorted array
function twoSum(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [-1, -1];
}

// Valid palindrome
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

// Reverse array in place
function reverseArray(arr) {
    let left = 0, right = arr.length - 1;
    
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    
    return arr;
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
        },
        {
          title: "Same Direction (Fast & Slow)",
          description: "Fast and slow pointer technique",
          code: `// Remove duplicates from sorted array
function removeDuplicates(nums) {
    if (nums.length === 0) return 0;
    
    let slow = 0;
    
    for (let fast = 1; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    
    return slow + 1;
}

// Linked list cycle detection (Floyd's algorithm)
function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head, fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            return true;
        }
    }
    
    return false;
}

// Move zeros to end
function moveZeroes(nums) {
    let slow = 0;
    
    for (let fast = 0; fast < nums.length; fast++) {
        if (nums[fast] !== 0) {
            [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
            slow++;
        }
    }
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
        },
      ],
    },
    {
      id: 6,
      title: "Sliding Window",
      category: "Algorithms",
      description: "Sliding window patterns and optimizations",
      color: "#DA70D6",
      icon: "expand-outline",
      difficulty: "Intermediate",
      snippets: [
        {
          title: "Fixed Size Window",
          description: "Window with constant size",
          code: `// Maximum sum subarray of size k
function maxSumSubarray(arr, k) {
    if (arr.length < k) return -1;
    
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
}

// Average of subarrays of size k
function findAverages(arr, k) {
    const result = [];
    let windowSum = 0;
    
    for (let i = 0; i < arr.length; i++) {
        windowSum += arr[i];
        
        if (i >= k - 1) {
            result.push(windowSum / k);
            windowSum -= arr[i - k + 1];
        }
    }
    
    return result;
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
        },
        {
          title: "Variable Size Window",
          description: "Dynamic window size based on condition",
          code: `// Longest substring without repeating characters
function lengthOfLongestSubstring(s) {
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
}

// Minimum window substring
function minWindow(s, t) {
    const need = new Map();
    const window = new Map();
    
    for (const char of t) {
        need.set(char, (need.get(char) || 0) + 1);
    }
    
    let left = 0, right = 0;
    let valid = 0;
    let start = 0, len = Infinity;
    
    while (right < s.length) {
        const c = s[right];
        right++;
        
        if (need.has(c)) {
            window.set(c, (window.get(c) || 0) + 1);
            if (window.get(c) === need.get(c)) {
                valid++;
            }
        }
        
        while (valid === need.size) {
            if (right - left < len) {
                start = left;
                len = right - left;
            }
            
            const d = s[left];
            left++;
            
            if (need.has(d)) {
                if (window.get(d) === need.get(d)) {
                    valid--;
                }
                window.set(d, window.get(d) - 1);
            }
        }
    }
    
    return len === Infinity ? "" : s.substr(start, len);
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(k) where k is unique chars",
        },
      ],
    },
  ];

  const categories = [
    "All",
    "Arrays",
    "Algorithms",
    "Trees & Graphs",
    "Strings",
    "Math",
  ];

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await StorageService.getItem("favoriteCheatSheets");
      if (data) {
        setFavoriteSheets(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (favorites) => {
    try {
      await StorageService.setItem(
        "favoriteCheatSheets",
        JSON.stringify(favorites)
      );
      setFavoriteSheets(favorites);
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const toggleFavorite = async (sheetId) => {
    const newFavorites = favoriteSheets.includes(sheetId)
      ? favoriteSheets.filter((id) => id !== sheetId)
      : [...favoriteSheets, sheetId];

    await saveFavorites(newFavorites);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const copyToClipboard = async (code) => {
    try {
      await Clipboard.setString(code);
      Alert.alert("Copied!", "Code copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  const getFilteredSheets = () => {
    let filtered = cheatSheets;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (sheet) => sheet.category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (sheet) =>
          sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sheet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sheet.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const CheatSheetCard = ({ sheet }) => (
    <TouchableOpacity
      style={[styles.cheatSheetCard, { backgroundColor: theme.surface }]}
      onPress={() => setSelectedCheatSheet(sheet)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[sheet.color + "08", sheet.color + "04"]}
        style={[styles.cheatSheetGradient, { borderColor: sheet.color + "20" }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cheatSheetHeader}>
          <View
            style={[
              styles.cheatSheetIcon,
              { backgroundColor: sheet.color + "20" },
            ]}
          >
            <Ionicons name={sheet.icon} size={24} color={sheet.color} />
          </View>
          <View style={styles.cheatSheetInfo}>
            <Text style={[styles.cheatSheetTitle, { color: theme.text }]}>
              {sheet.title}
            </Text>
            <Text
              style={[
                styles.cheatSheetDescription,
                { color: theme.textSecondary },
              ]}
            >
              {sheet.description}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(sheet.id)}
          >
            <Ionicons
              name={
                favoriteSheets.includes(sheet.id) ? "heart" : "heart-outline"
              }
              size={20}
              color={
                favoriteSheets.includes(sheet.id)
                  ? "#FF6B6B"
                  : theme.textTertiary
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cheatSheetMeta}>
          <View
            style={[styles.badge, { backgroundColor: theme.primary + "15" }]}
          >
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              {sheet.difficulty}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sheet.color + "15" }]}>
            <Text style={[styles.badgeText, { color: sheet.color }]}>
              {sheet.snippets.length} snippets
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const SnippetCard = ({ snippet, sheetColor }) => (
    <View style={[styles.snippetCard, { backgroundColor: theme.surface }]}>
      <View style={styles.snippetHeader}>
        <View style={styles.snippetTitleContainer}>
          <Text style={[styles.snippetTitle, { color: theme.text }]}>
            {snippet.title}
          </Text>
          <Text
            style={[styles.snippetDescription, { color: theme.textSecondary }]}
          >
            {snippet.description}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: sheetColor + "15" }]}
          onPress={() => copyToClipboard(snippet.code)}
        >
          <Ionicons name="copy-outline" size={18} color={sheetColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.complexityInfo}>
        <Text style={[styles.complexityText, { color: theme.textTertiary }]}>
          Time: {snippet.timeComplexity} | Space: {snippet.spaceComplexity}
        </Text>
      </View>

      <ScrollView
        horizontal
        style={styles.codeScrollView}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={[styles.codeText, { color: theme.textSecondary }]}>
          {snippet.code}
        </Text>
      </ScrollView>
    </View>
  );

  const DetailModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={!!selectedCheatSheet}
      onRequestClose={() => setSelectedCheatSheet(null)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedCheatSheet(null)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {selectedCheatSheet?.title}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(selectedCheatSheet?.id)}
          >
            <Ionicons
              name={
                favoriteSheets.includes(selectedCheatSheet?.id)
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={
                favoriteSheets.includes(selectedCheatSheet?.id)
                  ? "#FF6B6B"
                  : theme.textTertiary
              }
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedCheatSheet?.snippets.map((snippet, index) => (
            <SnippetCard
              key={index}
              snippet={snippet}
              sheetColor={selectedCheatSheet.color}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const CategoryFilter = () => (
    <View style={styles.filterContainer}>
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

  const filteredSheets = getFilteredSheets();

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
      marginBottom: 24,
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
    filterContainer: {
      marginBottom: 24,
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
    cheatSheetCard: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    cheatSheetGradient: {
      padding: 20,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cheatSheetHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    cheatSheetIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cheatSheetInfo: {
      flex: 1,
    },
    cheatSheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    cheatSheetDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    favoriteButton: {
      padding: 4,
    },
    cheatSheetMeta: {
      flexDirection: "row",
      gap: 8,
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
      flex: 1,
      textAlign: "center",
    },
    modalContent: {
      flex: 1,
      padding: 24,
    },
    snippetCard: {
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
    snippetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    snippetTitleContainer: {
      flex: 1,
      marginRight: 12,
    },
    snippetTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    snippetDescription: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    copyButton: {
      padding: 8,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    complexityInfo: {
      marginBottom: 16,
    },
    complexityText: {
      fontSize: 12,
      fontWeight: "600",
    },
    codeScrollView: {
      backgroundColor: theme.background,
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
        <Text style={styles.headerTitle}>Cheat Sheets</Text>
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
            <Text style={styles.introTitle}>Quick Reference Library</Text>
            <Text style={styles.introSubtitle}>
              Copy-paste ready code snippets for common algorithms and data
              structures.
            </Text>
          </View>

          <CategoryFilter />

          {filteredSheets.length > 0 ? (
            filteredSheets.map((sheet) => (
              <CheatSheetCard key={sheet.id} sheet={sheet} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No cheat sheets found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DetailModal />
    </SafeAreaView>
  );
};

export default CheatSheetsScreen;
