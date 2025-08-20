import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
  Share,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList,
  PanResponder,
  Vibration,
  ActivityIndicator,
  Pressable,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";

const { width, height } = Dimensions.get("window");

const CheatSheetsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cheatSheets, setCheatSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name, category
  const [viewMode, setViewMode] = useState("card"); // card, list, compact
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const searchRef = useRef(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Algorithms",
    description: "",
    tags: [],
    difficulty: "Beginner",
    language: "JavaScript",
    codes: [],
  });

  const [codeSnippet, setCodeSnippet] = useState({
    title: "",
    code: "",
    description: "",
    complexity: "O(n)",
  });

  const [newTag, setNewTag] = useState("");

  // Categories with enhanced metadata
  const categories = [
    "All",
    "Algorithms",
    "Data Structures", 
    "Arrays",
    "Strings",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Sorting",
    "Searching",
    "Math",
    "Design Patterns",
    "System Design",
    "Web Development",
    "Mobile Development",
    "Database",
    "Security",
    "Testing",
    "DevOps",
    "Machine Learning",
    "Other",
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const languages = [
    "JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
    "TypeScript", "Swift", "Kotlin", "PHP", "Ruby", "SQL", "Other"
  ];

  const sortOptions = [
    { key: "newest", label: "Newest First", icon: "time-outline" },
    { key: "oldest", label: "Oldest First", icon: "hourglass-outline" },
    { key: "name", label: "Name A-Z", icon: "text-outline" },
    { key: "category", label: "Category", icon: "folder-outline" },
    { key: "difficulty", label: "Difficulty", icon: "trophy-outline" },
  ];

  const viewModes = [
    { key: "card", icon: "grid-outline" },
    { key: "list", icon: "list-outline" },
    { key: "compact", icon: "reorder-three-outline" },
  ];

  // Enhanced category colors with gradients
  const categoryColors = {
    Algorithms: { primary: "#6366F1", secondary: "#8B5CF6", light: "#E0E7FF" },
    "Data Structures": { primary: "#8B5CF6", secondary: "#A855F7", light: "#F3E8FF" },
    Arrays: { primary: "#10B981", secondary: "#059669", light: "#D1FAE5" },
    Strings: { primary: "#F59E0B", secondary: "#D97706", light: "#FEF3C7" },
    Trees: { primary: "#EF4444", secondary: "#DC2626", light: "#FEE2E2" },
    Graphs: { primary: "#06B6D4", secondary: "#0891B2", light: "#CFFAFE" },
    "Dynamic Programming": { primary: "#EC4899", secondary: "#DB2777", light: "#FCE7F3" },
    Sorting: { primary: "#84CC16", secondary: "#65A30D", light: "#ECFCCB" },
    Searching: { primary: "#F97316", secondary: "#EA580C", light: "#FED7AA" },
    Math: { primary: "#3B82F6", secondary: "#2563EB", light: "#DBEAFE" },
    "Design Patterns": { primary: "#8B5CF6", secondary: "#7C3AED", light: "#F3E8FF" },
    "System Design": { primary: "#059669", secondary: "#047857", light: "#D1FAE5" },
    "Web Development": { primary: "#0EA5E9", secondary: "#0284C7", light: "#E0F2FE" },
    "Mobile Development": { primary: "#8B5CF6", secondary: "#7C3AED", light: "#F3E8FF" },
    Database: { primary: "#DC2626", secondary: "#B91C1C", light: "#FEE2E2" },
    Security: { primary: "#7C2D12", secondary: "#92400E", light: "#FEF3C7" },
    Testing: { primary: "#059669", secondary: "#047857", light: "#D1FAE5" },
    DevOps: { primary: "#1F2937", secondary: "#374151", light: "#F3F4F6" },
    "Machine Learning": { primary: "#7C3AED", secondary: "#6D28D9", light: "#F3E8FF" },
    Other: { primary: "#64748B", secondary: "#475569", light: "#F1F5F9" },
  };

  // Enhanced sample data
  const sampleCheatSheets = [
    {
      id: 1,
      title: "JavaScript Array Methods",
      category: "Arrays",
      description: "Comprehensive guide to JavaScript array operations, transformations, and advanced techniques",
      difficulty: "Intermediate",
      language: "JavaScript",
      tags: ["arrays", "javascript", "methods", "functional"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      favorited: false,
      viewCount: 145,
      codes: [
        {
          id: 1,
          title: "Filter & Map Chain",
          code: `// Filter elements and transform with method chaining
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
  .filter(x => x > 3)           // Filter values > 3
  .map(x => x * 2)              // Double each value
  .filter(x => x < 20);         // Keep values < 20

console.log(result); // [8, 10, 12, 14, 16, 18]

// Advanced: Custom filter predicates
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 17, active: false },
  { name: 'Bob', age: 30, active: true }
];

const activeAdults = users
  .filter(user => user.age >= 18 && user.active)
  .map(user => ({ ...user, category: 'adult' }));`,
          description: "Chain filter and map for efficient array transformations",
          complexity: "O(n)",
        },
        {
          id: 2,
          title: "Advanced Reduce Patterns",
          code: `// Reduce for accumulation and transformation
const numbers = [1, 2, 3, 4, 5];

// Basic sum
const sum = numbers.reduce((acc, val) => acc + val, 0);

// Find max value
const max = numbers.reduce((acc, val) => Math.max(acc, val));

// Group by property
const people = [
  { name: 'John', department: 'IT' },
  { name: 'Jane', department: 'HR' },
  { name: 'Bob', department: 'IT' }
];

const groupedByDept = people.reduce((acc, person) => {
  const dept = person.department;
  acc[dept] = acc[dept] || [];
  acc[dept].push(person);
  return acc;
}, {});

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana'];
const counts = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});`,
          description: "Master reduce for complex data transformations",
          complexity: "O(n)",
        },
      ],
    },
    {
      id: 2,
      title: "Binary Search Algorithms",
      category: "Searching",
      description: "Complete implementation of binary search variants and applications",
      difficulty: "Intermediate",
      language: "JavaScript",
      tags: ["search", "algorithms", "binary", "optimization"],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      favorited: true,
      viewCount: 89,
      codes: [
        {
          id: 1,
          title: "Standard Binary Search",
          code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found target
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  
  return -1; // Target not found
}

// Example usage
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
console.log(binarySearch(sortedArray, 7)); // Output: 3
console.log(binarySearch(sortedArray, 6)); // Output: -1`,
          description: "Classic binary search implementation - O(log n) time complexity",
          complexity: "O(log n)",
        },
        {
          id: 2,
          title: "Binary Search Variants",
          code: `// Find first occurrence of target
function findFirst(arr, target) {
  let left = 0, right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // Continue searching left
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}

// Find insertion point
function searchInsert(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return left;
}`,
          description: "Advanced binary search patterns for different use cases",
          complexity: "O(log n)",
        },
      ],
    },
    {
      id: 3,
      title: "React Hooks Patterns",
      category: "Web Development",
      description: "Modern React hooks patterns and custom hook implementations",
      difficulty: "Advanced",
      language: "JavaScript",
      tags: ["react", "hooks", "patterns", "custom"],
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
      favorited: false,
      viewCount: 234,
      codes: [
        {
          id: 1,
          title: "Custom useLocalStorage Hook",
          code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// Usage example
function App() {
  const [name, setName] = useLocalStorage('name', 'Anonymous');
  
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}`,
          description: "Persistent state with localStorage integration",
          complexity: "O(1)",
        },
      ],
    },
  ];

  // Memoized handlers
  const handleTitleChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, title: text }));
  }, []);

  const handleDescriptionChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFormData(prev => ({ ...prev, category }));
  }, []);

  const handleDifficultyChange = useCallback((difficulty) => {
    setFormData(prev => ({ ...prev, difficulty }));
  }, []);

  const handleLanguageChange = useCallback((language) => {
    setFormData(prev => ({ ...prev, language }));
  }, []);

  const handleCodeTitleChange = useCallback((text) => {
    setCodeSnippet(prev => ({ ...prev, title: text }));
  }, []);

  const handleCodeChange = useCallback((text) => {
    setCodeSnippet(prev => ({ ...prev, code: text }));
  }, []);

  const handleCodeDescriptionChange = useCallback((text) => {
    setCodeSnippet(prev => ({ ...prev, description: text }));
  }, []);

  const handleComplexityChange = useCallback((text) => {
    setCodeSnippet(prev => ({ ...prev, complexity: text }));
  }, []);

  // Enhanced initialization
  useEffect(() => {
    loadCheatSheets();
    animateEntrance();
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (showModal || showCreateModal || showCodeModal) {
      setShowModal(false);
      setShowCreateModal(false);
      setShowCodeModal(false);
      return true;
    }
    return false;
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadCheatSheets = async () => {
    try {
      setLoading(true);
      const sheets = await StorageService.getCheatSheets();
      if (sheets.length === 0) {
        setCheatSheets(sampleCheatSheets);
        await StorageService.saveCheatSheets(sampleCheatSheets);
      } else {
        setCheatSheets(sheets);
      }
    } catch (error) {
      console.error("Error loading cheat sheets:", error);
      setCheatSheets(sampleCheatSheets);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCheatSheets();
    setRefreshing(false);
  };

  const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const getColorForCategory = (category) => {
    return categoryColors[category] || categoryColors["Other"];
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: "#22C55E",
      Intermediate: "#F59E0B", 
      Advanced: "#EF4444",
      Expert: "#8B5CF6",
    };
    return colors[difficulty] || "#6B7280";
  };

  // Enhanced clipboard functionality with feedback
  const copyToClipboard = async (text, title = "Code") => {
    try {
      await Clipboard.setString(text);
      Vibration.vibrate(50);
      
      // Animate scale for visual feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert(
        "✅ Copied!",
        `${title} copied to clipboard`,
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  // Enhanced sharing functionality
  const shareCode = async (code, sheetTitle) => {
    try {
      const shareContent = {
        message: `${sheetTitle} - ${code.title}\n\n${code.description}\n\n${code.code}`,
        title: `${sheetTitle} - ${code.title}`,
      };
      
      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Code shared successfully');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share code");
    }
  };

  const shareSheet = async (sheet) => {
    try {
      const codesList = sheet.codes.map(code => 
        `${code.title}:\n${code.code}\n`
      ).join('\n---\n\n');
      
      const shareContent = {
        message: `${sheet.title}\n\nCategory: ${sheet.category}\nDifficulty: ${sheet.difficulty}\nLanguage: ${sheet.language}\n\n${sheet.description}\n\n${codesList}`,
        title: sheet.title,
      };
      
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert("Error", "Failed to share cheat sheet");
    }
  };

  // Enhanced save functionality with validation
  const saveCheatSheet = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter a title for the cheat sheet");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Validation Error", "Please enter a description");
      return;
    }

    if (formData.codes.length === 0) {
      Alert.alert("Validation Error", "Please add at least one code snippet");
      return;
    }

    try {
      const sheet = {
        ...formData,
        id: isEditing ? editingSheet.id : generateId(),
        createdAt: isEditing ? editingSheet.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorited: isEditing ? editingSheet.favorited || false : false,
        viewCount: isEditing ? editingSheet.viewCount || 0 : 0,
      };

      let updatedSheets;
      if (isEditing) {
        updatedSheets = cheatSheets.map(s => s.id === sheet.id ? sheet : s);
      } else {
        updatedSheets = [sheet, ...cheatSheets];
      }

      setCheatSheets(updatedSheets);
      await StorageService.saveCheatSheets(updatedSheets);

      resetForm();
      setShowCreateModal(false);
      
      Vibration.vibrate(100);
      Alert.alert(
        "✅ Success",
        `Cheat sheet ${isEditing ? "updated" : "created"} successfully!`,
        [{ text: "OK", style: "default" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save cheat sheet");
    }
  };

  // Enhanced delete with confirmation
  const deleteCheatSheet = (sheetId) => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const updatedSheets = cheatSheets.filter(s => s.id !== selectedSheet.id);
      setCheatSheets(updatedSheets);
      await StorageService.saveCheatSheets(updatedSheets);
      
      setShowDeleteConfirm(false);
      setShowModal(false);
      
      Vibration.vibrate([100, 50, 100]);
      Alert.alert("Success", "Cheat sheet deleted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete cheat sheet");
    }
  };

  // Enhanced editing
  const editCheatSheet = (sheet) => {
    setEditingSheet(sheet);
    setIsEditing(true);
    setFormData({
      title: sheet.title,
      category: sheet.category,
      description: sheet.description,
      difficulty: sheet.difficulty || "Beginner",
      language: sheet.language || "JavaScript",
      tags: sheet.tags || [],
      codes: [...sheet.codes],
    });
    setShowModal(false);
    setShowCreateModal(true);
  };

  // Enhanced code snippet management
  const addCodeSnippet = () => {
    if (!codeSnippet.title.trim()) {
      Alert.alert("Validation Error", "Please enter a title for the code snippet");
      return;
    }
    
    if (!codeSnippet.code.trim()) {
      Alert.alert("Validation Error", "Please enter the code");
      return;
    }

    const codeWithId = {
      ...codeSnippet,
      id: generateId(),
    };

    setFormData(prev => ({
      ...prev,
      codes: [...prev.codes, codeWithId],
    }));

    setCodeSnippet({
      title: "",
      code: "",
      description: "",
      complexity: "O(n)",
    });

    Vibration.vibrate(50);
  };

  const removeCodeSnippet = (index) => {
    Alert.alert(
      "Remove Code Snippet",
      "Are you sure you want to remove this code snippet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              codes: prev.codes.filter((_, i) => i !== index),
            }));
            Vibration.vibrate(50);
          },
        },
      ]
    );
  };

  // Tag management
  const addTag = () => {
    if (!newTag.trim()) return;
    
    const tag = newTag.trim().toLowerCase();
    if (formData.tags.includes(tag)) {
      Alert.alert("Tag exists", "This tag has already been added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const toggleFavorite = async (sheetId) => {
    const updatedSheets = cheatSheets.map(sheet => 
      sheet.id === sheetId 
        ? { ...sheet, favorited: !sheet.favorited }
        : sheet
    );
    
    setCheatSheets(updatedSheets);
    await StorageService.saveCheatSheets(updatedSheets);
    
    if (selectedSheet && selectedSheet.id === sheetId) {
      setSelectedSheet(prev => ({ ...prev, favorited: !prev.favorited }));
    }
    
    Vibration.vibrate(50);
  };

  const incrementViewCount = async (sheetId) => {
    const updatedSheets = cheatSheets.map(sheet =>
      sheet.id === sheetId
        ? { ...sheet, viewCount: (sheet.viewCount || 0) + 1 }
        : sheet
    );
    
    setCheatSheets(updatedSheets);
    await StorageService.saveCheatSheets(updatedSheets);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Algorithms",
      description: "",
      difficulty: "Beginner",
      language: "JavaScript",
      tags: [],
      codes: [],
    });
    setCodeSnippet({
      title: "",
      code: "",
      description: "",
      complexity: "O(n)",
    });
    setNewTag("");
    setIsEditing(false);
    setEditingSheet(null);
  };

  // Enhanced filtering and sorting
  const sortedAndFilteredSheets = useMemo(() => {
    let filtered = cheatSheets.filter(sheet => {
      const matchesCategory = selectedCategory === "All" || sheet.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sheet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sheet.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        case "difficulty":
          const difficultyOrder = { "Beginner": 0, "Intermediate": 1, "Advanced": 2, "Expert": 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cheatSheets, selectedCategory, searchQuery, sortBy]);

  // Enhanced Card Components with different view modes
  const CheatSheetCard = ({ sheet, index }) => {
    const categoryColor = getColorForCategory(sheet.category);
    const difficultyColor = getDifficultyColor(sheet.difficulty);

    const handlePress = () => {
      incrementViewCount(sheet.id);
      setSelectedSheet(sheet);
      setShowModal(true);
    };

    const renderCardView = () => (
      <TouchableOpacity
        style={[styles.modernCard, { backgroundColor: isDark ? "#1E293B" : theme.surface }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[
            `${categoryColor.primary}15`,
            `${categoryColor.primary}08`,
            "transparent"
          ]}
          style={styles.modernCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.modernCardHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryColor.primary }]}>
              <Ionicons name="code-slash" size={18} color="white" />
            </View>
            <View style={styles.cardTitleSection}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.modernCardTitle, { color: theme.text }]} numberOfLines={1}>
                  {sheet.title}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(sheet.id)}
                  style={styles.favoriteButton}
                >
                  <Ionicons
                    name={sheet.favorited ? "heart" : "heart-outline"}
                    size={18}
                    color={sheet.favorited ? "#EF4444" : theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.modernCardCategory, { color: categoryColor.primary }]}>
                {sheet.category}
              </Text>
            </View>
          </View>

          {/* Tags */}
          {sheet.tags && sheet.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sheet.tags.slice(0, 3).map((tag, tagIndex) => (
                  <View
                    key={tagIndex}
                    style={[styles.tag, { backgroundColor: `${categoryColor.primary}20` }]}
                  >
                    <Text style={[styles.tagText, { color: categoryColor.primary }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
                {sheet.tags.length > 3 && (
                  <Text style={[styles.moreTagsText, { color: theme.textSecondary }]}>
                    +{sheet.tags.length - 3} more
                  </Text>
                )}
              </ScrollView>
            </View>
          )}

          {/* Description */}
          <Text
            style={[styles.modernCardDescription, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {sheet.description}
          </Text>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                <Text style={styles.difficultyText}>{sheet.difficulty}</Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="code-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
                {sheet.language}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modernCardFooter}>
            <View style={styles.snippetCount}>
              <View style={[styles.snippetIcon, { backgroundColor: `${categoryColor.primary}20` }]}>
                <Ionicons name="document-text-outline" size={14} color={categoryColor.primary} />
              </View>
              <Text style={[styles.snippetText, { color: theme.textSecondary }]}>
                {sheet.codes?.length || 0} snippets
              </Text>
            </View>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={12} color={theme.textTertiary} />
                <Text style={[styles.statText, { color: theme.textTertiary }]}>
                  {sheet.viewCount || 0}
                </Text>
              </View>
              <Text style={[styles.cardDate, { color: theme.textTertiary }]}>
                {new Date(sheet.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );

    const renderListView = () => (
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.listCardContent}>
          <View style={[styles.listCategoryIcon, { backgroundColor: categoryColor.primary }]}>
            <Ionicons name="code-slash" size={16} color="white" />
          </View>
          <View style={styles.listCardInfo}>
            <View style={styles.listCardHeader}>
              <Text style={[styles.listCardTitle, { color: theme.text }]} numberOfLines={1}>
                {sheet.title}
              </Text>
              <TouchableOpacity onPress={() => toggleFavorite(sheet.id)}>
                <Ionicons
                  name={sheet.favorited ? "heart" : "heart-outline"}
                  size={16}
                  color={sheet.favorited ? "#EF4444" : theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.listCardDescription, { color: theme.textSecondary }]} numberOfLines={1}>
              {sheet.description}
            </Text>
            <View style={styles.listCardMeta}>
              <Text style={[styles.listCardCategory, { color: categoryColor.primary }]}>
                {sheet.category}
              </Text>
              <Text style={styles.listCardSeparator}>•</Text>
              <Text style={[styles.listCardDifficulty, { color: difficultyColor }]}>
                {sheet.difficulty}
              </Text>
              <Text style={styles.listCardSeparator}>•</Text>
              <Text style={[styles.listCardSnippets, { color: theme.textSecondary }]}>
                {sheet.codes?.length || 0} snippets
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

    const renderCompactView = () => (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactCardContent}>
          <View style={[styles.compactCategoryDot, { backgroundColor: categoryColor.primary }]} />
          <View style={styles.compactCardInfo}>
            <Text style={[styles.compactCardTitle, { color: theme.text }]} numberOfLines={1}>
              {sheet.title}
            </Text>
            <View style={styles.compactCardMeta}>
              <Text style={[styles.compactCardCategory, { color: categoryColor.primary }]}>
                {sheet.category}
              </Text>
              <Text style={styles.compactCardSeparator}>•</Text>
              <Text style={[styles.compactCardSnippets, { color: theme.textSecondary }]}>
                {sheet.codes?.length || 0}
              </Text>
            </View>
          </View>
          <View style={styles.compactCardActions}>
            <TouchableOpacity onPress={() => toggleFavorite(sheet.id)}>
              <Ionicons
                name={sheet.favorited ? "heart" : "heart-outline"}
                size={16}
                color={sheet.favorited ? "#EF4444" : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );

    switch (viewMode) {
      case "list":
        return renderListView();
      case "compact":
        return renderCompactView();
      default:
        return renderCardView();
    }
  };

  const CodeSnippetCard = ({ code, sheet }) => (
    <View style={[styles.codeSnippetCard, { backgroundColor: theme.surface }]}>
      <LinearGradient
        colors={[`${getColorForCategory(sheet.category).primary}08`, "transparent"]}
        style={styles.codeSnippetGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.codeSnippetHeader}>
          <View style={styles.codeSnippetInfo}>
            <View style={styles.codeSnippetTitleRow}>
              <Text style={[styles.codeSnippetTitle, { color: theme.text }]}>
                {code.title}
              </Text>
              {code.complexity && (
                <View style={[styles.complexityBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.complexityText}>{code.complexity}</Text>
                </View>
              )}
            </View>
            {code.description && (
              <Text style={[styles.codeSnippetDescription, { color: theme.textSecondary }]}>
                {code.description}
              </Text>
            )}
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => copyToClipboard(code.code, code.title)}
            >
              <Ionicons name="copy-outline" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
              onPress={() => shareCode(code, sheet.title)}
            >
              <Ionicons name="share-outline" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.accent }]}
              onPress={() => {
                setSelectedCode(code);
                setShowCodeModal(true);
              }}
            >
              <Ionicons name="expand-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.codePreview, { backgroundColor: theme.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.codeText, { color: theme.text }]}>
              {code.code.length > 200 ? code.code.substring(0, 200) + "..." : code.code}
            </Text>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );

  // Enhanced Modal Components
  const DetailModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[
            `${getColorForCategory(selectedSheet?.category).primary}08`,
            "transparent",
          ]}
          style={styles.modalGradient}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.surface }]}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedSheet?.title}
              </Text>
              <View style={styles.modalSubtitleContainer}>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {selectedSheet?.category}
                </Text>
                <Text style={styles.modalSeparator}>•</Text>
                <Text style={[
                  styles.modalSubtitle, 
                  { color: getDifficultyColor(selectedSheet?.difficulty) }
                ]}>
                  {selectedSheet?.difficulty}
                </Text>
                <Text style={styles.modalSeparator}>•</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {selectedSheet?.language}
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.secondary }]}
                onPress={() => shareSheet(selectedSheet)}
              >
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => editCheatSheet(selectedSheet)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={() => deleteCheatSheet(selectedSheet?.id)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Sheet Info */}
            <View style={[styles.modalDescriptionContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                {selectedSheet?.description}
              </Text>
              
              {/* Tags */}
              {selectedSheet?.tags && selectedSheet.tags.length > 0 && (
                <View style={styles.modalTagsContainer}>
                  <Text style={[styles.tagsLabel, { color: theme.text }]}>Tags</Text>
                  <View style={styles.modalTags}>
                    {selectedSheet.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[
                          styles.modalTag,
                          { backgroundColor: `${getColorForCategory(selectedSheet.category).primary}20` }
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalTagText,
                            { color: getColorForCategory(selectedSheet.category).primary }
                          ]}
                        >
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Statistics */}
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {selectedSheet?.viewCount || 0} views
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="document-text-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {selectedSheet?.codes?.length || 0} snippets
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {selectedSheet && new Date(selectedSheet.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Code Snippets */}
            {selectedSheet?.codes?.map((code, index) => (
              <CodeSnippetCard
                key={code.id || index}
                code={code}
                sheet={selectedSheet}
              />
            ))}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  const CodeModal = () => (
    <Modal
      visible={showCodeModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowCodeModal(false)}
    >
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.surface }]}
            onPress={() => setShowCodeModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.modalTitleContainer}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedCode?.title}
            </Text>
            {selectedCode?.complexity && (
              <View style={[styles.complexityBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.complexityText}>{selectedCode.complexity}</Text>
              </View>
            )}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => copyToClipboard(selectedCode?.code, selectedCode?.title)}
            >
              <Ionicons name="copy-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondary }]}
              onPress={() => shareCode(selectedCode, "Code Snippet")}
            >
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={[styles.fullCodeContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.codeHeader}>
              <View style={styles.codeHeaderLeft}>
                <View style={styles.codeLangBadge}>
                  <Text style={[styles.codeLangText, { color: theme.textSecondary }]}>
                    Code
                  </Text>
                </View>
              </View>
              <View style={styles.codeHeaderActions}>
                <TouchableOpacity
                  style={[styles.codeHeaderButton, { backgroundColor: theme.primary }]}
                  onPress={() => copyToClipboard(selectedCode?.code, selectedCode?.title)}
                >
                  <Ionicons name="copy-outline" size={16} color="white" />
                  <Text style={styles.codeHeaderButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.codeScrollContainer}
            >
              <Text style={[styles.fullCodeText, { color: theme.text }]}>
                {selectedCode?.code}
              </Text>
            </ScrollView>
          </View>
          
          {selectedCode?.description && (
            <View style={[styles.modalDescriptionContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.descriptionLabel, { color: theme.text }]}>Description</Text>
              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                {selectedCode.description}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const CreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        resetForm();
        setShowCreateModal(false);
      }}
    >
      <KeyboardAvoidingView
        style={[{ flex: 1 }, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.modernModalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                resetForm();
                setShowCreateModal(false);
              }}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleSection}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {isEditing ? "Edit Cheat Sheet" : "New Cheat Sheet"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.primary }]}
              onPress={saveCheatSheet}
            >
              <Ionicons name="checkmark" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modernModalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            nestedScrollEnabled={true}
          >
            {/* Basic Details Section */}
            <View style={[styles.modernFormSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Basic Details
              </Text>

              <View style={styles.modernInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Title *
                </Text>
                <TextInput
                  style={[
                    styles.modernInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.title}
                  onChangeText={handleTitleChange}
                  placeholder="Enter cheat sheet title"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.modernInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Description *
                </Text>
                <TextInput
                  style={[
                    styles.modernInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                      height: 80,
                    },
                  ]}
                  value={formData.description}
                  onChangeText={handleDescriptionChange}
                  placeholder="Brief description of the cheat sheet"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Category Selection */}
              <View style={styles.modernInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categorySelector}
                >
                  {categories
                    .filter(cat => cat !== "All")
                    .map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor:
                              formData.category === category
                                ? getColorForCategory(category).primary
                                : theme.background,
                            borderColor:
                              formData.category === category
                                ? getColorForCategory(category).primary
                                : theme.border,
                          },
                        ]}
                        onPress={() => handleCategoryChange(category)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            {
                              color:
                                formData.category === category
                                  ? "#fff"
                                  : theme.text,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {/* Difficulty & Language Row */}
              <View style={styles.formRow}>
                <View style={[styles.modernInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Difficulty
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.difficultySelector}
                  >
                    {difficulties.map(difficulty => (
                      <TouchableOpacity
                        key={difficulty}
                        style={[
                          styles.difficultyOption,
                          {
                            backgroundColor:
                              formData.difficulty === difficulty
                                ? getDifficultyColor(difficulty)
                                : theme.background,
                            borderColor:
                              formData.difficulty === difficulty
                                ? getDifficultyColor(difficulty)
                                : theme.border,
                          },
                        ]}
                        onPress={() => handleDifficultyChange(difficulty)}
                      >
                        <Text
                          style={[
                            styles.difficultyOptionText,
                            {
                              color:
                                formData.difficulty === difficulty
                                  ? "#fff"
                                  : theme.text,
                            },
                          ]}
                        >
                          {difficulty}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.modernInputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Language
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.languageSelector}
                  >
                    {languages.slice(0, 8).map(language => (
                      <TouchableOpacity
                        key={language}
                        style={[
                          styles.languageOption,
                          {
                            backgroundColor:
                              formData.language === language
                                ? theme.primary
                                : theme.background,
                            borderColor:
                              formData.language === language
                                ? theme.primary
                                : theme.border,
                          },
                        ]}
                        onPress={() => handleLanguageChange(language)}
                      >
                        <Text
                          style={[
                            styles.languageOptionText,
                            {
                              color:
                                formData.language === language
                                  ? "#fff"
                                  : theme.text,
                            },
                          ]}
                        >
                          {language}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Tags Section */}
              <View style={styles.modernInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Tags
                </Text>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={[
                      styles.tagInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add a tag"
                    placeholderTextColor={theme.textSecondary}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.addTagButton, { backgroundColor: theme.primary }]}
                    onPress={addTag}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                
                {formData.tags.length > 0 && (
                  <View style={styles.existingTags}>
                    {formData.tags.map((tag, index) => (
                      <View key={index} style={[styles.existingTag, { backgroundColor: theme.primary }]}>
                        <Text style={styles.existingTagText}>#{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(tag)}>
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Code Snippets Section */}
            <View style={[styles.modernFormSection, { backgroundColor: theme.surface }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Code Snippets
                </Text>
                <View style={[styles.snippetCounter, { backgroundColor: theme.primary }]}>
                  <Text style={styles.snippetCounterText}>
                    {formData.codes.length}
                  </Text>
                </View>
              </View>

              {/* Add New Snippet Form */}
              <View
                style={[
                  styles.addSnippetForm,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.formHeader}>
                  <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                  <Text style={[styles.formHeaderText, { color: theme.text }]}>
                    Add New Snippet
                  </Text>
                </View>

                <TextInput
                  style={[
                    styles.modernInput,
                    {
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={codeSnippet.title}
                  onChangeText={handleCodeTitleChange}
                  placeholder="Snippet title (e.g., 'Binary Search')"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="next"
                />

                <View style={styles.codeInputWrapper}>
                  <View style={styles.codeInputHeader}>
                    <Ionicons name="code-slash-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.codeInputHeaderText, { color: theme.textSecondary }]}>
                      Code
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.modernCodeInput,
                      {
                        backgroundColor: theme.surface,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    value={codeSnippet.code}
                    onChangeText={handleCodeChange}
                    placeholder="// Enter your code here..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>

                <View style={styles.formRow}>
                  <TextInput
                    style={[
                      styles.modernInput,
                      {
                        backgroundColor: theme.surface,
                        color: theme.text,
                        borderColor: theme.border,
                        flex: 2,
                        marginRight: 8,
                      },
                    ]}
                    value={codeSnippet.description}
                    onChangeText={handleCodeDescriptionChange}
                    placeholder="Brief description (optional)"
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="next"
                  />
                  
                  <TextInput
                    style={[
                      styles.modernInput,
                      {
                        backgroundColor: theme.surface,
                        color: theme.text,
                        borderColor: theme.border,
                        flex: 1,
                        marginLeft: 8,
                      },
                    ]}
                    value={codeSnippet.complexity}
                    onChangeText={handleComplexityChange}
                    placeholder="O(n)"
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="done"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.modernAddButton, { backgroundColor: theme.primary }]}
                  onPress={addCodeSnippet}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.modernAddButtonText}>Add Snippet</Text>
                </TouchableOpacity>
              </View>

              {/* Existing Snippets */}
              {formData.codes.map((code, index) => (
                <View
                  key={code.id || index}
                  style={[
                    styles.existingSnippet,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.snippetHeader}>
                    <View style={styles.snippetHeaderLeft}>
                      <Text style={[styles.snippetTitle, { color: theme.text }]}>
                        {code.title}
                      </Text>
                      {code.complexity && (
                        <View style={[styles.complexityBadge, { backgroundColor: theme.primary }]}>
                          <Text style={styles.complexityText}>{code.complexity}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.deleteSnippet, { backgroundColor: theme.error }]}
                      onPress={() => removeCodeSnippet(index)}
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  {code.description && (
                    <Text style={[styles.snippetDescription, { color: theme.textSecondary }]}>
                      {code.description}
                    </Text>
                  )}
                  <Text style={[styles.snippetPreview, { color: theme.textSecondary }]}>
                    {code.code.length > 150 ? code.code.substring(0, 150) + "..." : code.code}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Sort Modal
  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={[styles.sortModalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.sortModalHeader}>
            <Text style={[styles.sortModalTitle, { color: theme.text }]}>Sort by</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                { backgroundColor: sortBy === option.key ? theme.primary : 'transparent' }
              ]}
              onPress={() => {
                setSortBy(option.key);
                setShowSortModal(false);
              }}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={sortBy === option.key ? 'white' : theme.text}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  { color: sortBy === option.key ? 'white' : theme.text }
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <Modal
      visible={showDeleteConfirm}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDeleteConfirm(false)}
    >
      <View style={styles.deleteModalOverlay}>
        <View style={[styles.deleteModalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.deleteModalHeader}>
            <Ionicons name="warning" size={48} color={theme.error} />
            <Text style={[styles.deleteModalTitle, { color: theme.text }]}>
              Delete Cheat Sheet
            </Text>
            <Text style={[styles.deleteModalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to delete "{selectedSheet?.title}"? This action cannot be undone.
            </Text>
          </View>
          
          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={[styles.deleteModalButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setShowDeleteConfirm(false)}
            >
              <Text style={[styles.deleteModalButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteModalButton, { backgroundColor: theme.error }]}
              onPress={confirmDelete}
            >
              <Text style={[styles.deleteModalButtonText, { color: 'white' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const EmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[`${theme.primary}20`, `${theme.primary}10`, 'transparent']}
        style={styles.emptyStateGradient}
      >
        <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={theme.primary}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          {searchQuery || selectedCategory !== "All" 
            ? "No matching cheat sheets found"
            : "No cheat sheets yet"
          }
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          {searchQuery || selectedCategory !== "All"
            ? "Try adjusting your search or filters"
            : "Create your first cheat sheet to get started with organizing your code snippets and references"
          }
        </Text>
        {!searchQuery && selectedCategory === "All" && (
          <TouchableOpacity
            style={[styles.emptyActionButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.emptyActionButtonText}>Create Cheat Sheet</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
        Loading cheat sheets...
      </Text>
    </View>
  );

  // Enhanced styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Header Styles
    header: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
      color: theme.text,
      textAlign: "center",
    },
    createButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },

    // Header Actions
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerActionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },

    // Search Styles
    searchContainer: {
      marginBottom: 20,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      borderWidth: 1.5,
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
    },

    // Category Styles
    categoryContainer: {
      marginBottom: 24,
    },
    categoryScroll: {
      paddingHorizontal: 24,
      gap: 12,
    },
    categoryChip: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1.5,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    // Content Styles
    content: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },

    // Modern Card Styles
    modernCard: {
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 16,
      elevation: isDark ? 8 : 4,
    },
    modernCardGradient: {
      padding: 24,
      borderRadius: 20,
      minHeight: 140,
    },
    modernCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitleSection: {
      flex: 1,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    modernCardTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
      flex: 1,
      marginRight: 12,
    },
    favoriteButton: {
      padding: 4,
    },
    modernCardCategory: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    // Tags
    tagsContainer: {
      marginBottom: 12,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "600",
    },
    moreTagsText: {
      fontSize: 12,
      fontWeight: "500",
      alignSelf: 'center',
      marginLeft: 4,
    },

    // Card Content
    modernCardDescription: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
      fontWeight: "400",
    },

    // Metadata Row
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metadataText: {
      fontSize: 12,
      fontWeight: "600",
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: "800",
      color: "white",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // Card Footer
    modernCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    snippetCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    snippetIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    snippetText: {
      fontSize: 13,
      fontWeight: "600",
    },
    cardStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
      fontWeight: "500",
    },
    cardDate: {
      fontSize: 12,
      fontWeight: "600",
    },

    // List View Styles
    listCard: {
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    listCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    listCategoryIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listCardInfo: {
      flex: 1,
    },
    listCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    listCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      flex: 1,
      marginRight: 12,
    },
    listCardDescription: {
      fontSize: 14,
      marginBottom: 6,
    },
    listCardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    listCardCategory: {
      fontSize: 12,
      fontWeight: "600",
    },
    listCardSeparator: {
      color: theme.textSecondary,
      fontSize: 12,
    },
    listCardDifficulty: {
      fontSize: 12,
      fontWeight: "600",
    },
    listCardSnippets: {
      fontSize: 12,
      fontWeight: "500",
    },

    // Compact View Styles
    compactCard: {
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    compactCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 12,
    },
    compactCategoryDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    compactCardInfo: {
      flex: 1,
    },
    compactCardTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 2,
    },
    compactCardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    compactCardCategory: {
      fontSize: 12,
      fontWeight: "500",
    },
    compactCardSeparator: {
      color: theme.textSecondary,
      fontSize: 12,
    },
    compactCardSnippets: {
      fontSize: 12,
      fontWeight: "500",
    },
    compactCardActions: {
      padding: 4,
    },

    // Modal Styles
    modalGradient: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1,
    },
    modalButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    modalTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    modalSubtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: 6,
    },
    modalSubtitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    modalSeparator: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: "row",
      gap: 8,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    modalDescriptionContainer: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalDescription: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
    },

    // Modal Tags
    modalTagsContainer: {
      marginTop: 16,
    },
    tagsLabel: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
    },
    modalTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    modalTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    modalTagText: {
      fontSize: 12,
      fontWeight: "600",
    },

    // Modal Stats
    modalStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 4,
    },

    // Code Snippet Card
    codeSnippetCard: {
      marginBottom: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    codeSnippetGradient: {
      flex: 1,
    },
    codeSnippetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    codeSnippetInfo: {
      flex: 1,
      marginRight: 16,
    },
    codeSnippetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 8,
    },
    codeSnippetTitle: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
      flex: 1,
    },
    complexityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    complexityText: {
      fontSize: 11,
      fontWeight: "700",
      color: "white",
    },
    codeSnippetDescription: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
    codeActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    codePreview: {
      padding: 20,
      borderRadius: 16,
      margin: 20,
      marginTop: 0,
      borderWidth: 1,
      borderColor: theme.border,
    },
    codeText: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },

    // Full Code Modal
    fullCodeContainer: {
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
    },
    codeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: isDark ? theme.surface : `${theme.primary}05`,
    },
    codeHeaderLeft: {
      flex: 1,
    },
    codeLangBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.border,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    codeLangText: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    codeHeaderActions: {
      flexDirection: 'row',
      gap: 8,
    },
    codeHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
    },
    codeHeaderButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: "600",
    },
    codeScrollContainer: {
      maxHeight: height * 0.6,
    },
    fullCodeText: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
      padding: 20,
    },
    descriptionLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },

    // Create Modal Styles
    modernModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleSection: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    modernModalContent: {
      flex: 1,
      padding: 20,
    },

    // Form Styles
    modernFormSection: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    snippetCounter: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: "center",
    },
    snippetCounterText: {
      color: "white",
      fontSize: 12,
      fontWeight: "700",
    },
    modernInputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    modernInput: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontWeight: "500",
    },

    // Form Row
    formRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },

    // Selectors
    categorySelector: {
      marginTop: 8,
    },
    categoryOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
    },
    categoryOptionText: {
      fontSize: 14,
      fontWeight: "600",
    },
    
    difficultySelector: {
      marginTop: 8,
    },
    difficultyOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      marginRight: 6,
    },
    difficultyOptionText: {
      fontSize: 12,
      fontWeight: "600",
    },
    
    languageSelector: {
      marginTop: 8,
    },
    languageOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      marginRight: 6,
    },
    languageOptionText: {
      fontSize: 12,
      fontWeight: "600",
    },

    // Tags Input
    tagInputContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    tagInput: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      fontWeight: "500",
    },
    addTagButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    existingTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    existingTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    existingTagText: {
      color: 'white',
      fontSize: 12,
      fontWeight: "600",
    },

    // Add Snippet Form
    addSnippetForm: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginBottom: 16,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 8,
    },
    formHeaderText: {
      fontSize: 16,
      fontWeight: "600",
    },
    codeInputWrapper: {
      marginVertical: 8,
    },
    codeInputHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    codeInputHeaderText: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    modernCodeInput: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 14,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      lineHeight: 20,
      minHeight: 120,
    },
    modernAddButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 8,
      gap: 6,
    },
    modernAddButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },

    // Existing Snippets
    existingSnippet: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
    },
    snippetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    snippetHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    snippetTitle: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
    },
    snippetDescription: {
      fontSize: 14,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    deleteSnippet: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    snippetPreview: {
      fontSize: 12,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      lineHeight: 16,
    },

    // Sort Modal
    sortModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sortModalContent: {
      margin: 20,
      borderRadius: 20,
      padding: 20,
      width: width - 40,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    sortModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    sortModalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      gap: 12,
    },
    sortOptionText: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },

    // Delete Modal
    deleteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteModalContent: {
      margin: 20,
      borderRadius: 20,
      padding: 24,
      width: width - 40,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    deleteModalHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    deleteModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    deleteModalMessage: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    deleteModalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    deleteModalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    deleteModalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },

    // Empty State
    emptyState: {
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyStateGradient: {
      alignItems: "center",
      padding: 40,
      borderRadius: 24,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 12,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      fontWeight: "500",
      marginBottom: 24,
    },
    emptyActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      gap: 8,
    },
    emptyActionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },

    // Loading State
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Cheat Sheets</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="funnel-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setViewMode(prev => {
                const modes = ['card', 'list', 'compact'];
                const currentIndex = modes.indexOf(prev);
                return modes[(currentIndex + 1) % modes.length];
              })}
            >
              <Ionicons 
                name={viewModes.find(v => v.key === viewMode)?.icon || 'grid-outline'} 
                size={20} 
                color={theme.text} 
              />
            </TouchableOpacity>
            
            <LinearGradient
              colors={[theme.primary, `${theme.primary}CC`]}
              style={styles.createButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search cheat sheets..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? getColorForCategory(category)?.primary || theme.primary
                      : theme.surface,
                  borderColor:
                    selectedCategory === category
                      ? getColorForCategory(category)?.primary || theme.primary
                      : theme.border,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: selectedCategory === category ? "white" : theme.text,
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={sortedAndFilteredSheets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <CheatSheetCard sheet={item} index={index} />
          )}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
          ItemSeparatorComponent={() => viewMode === 'compact' ? <View style={{ height: 4 }} /> : null}
          getItemLayout={viewMode === 'compact' ? (data, index) => ({
            length: 60,
            offset: 60 * index,
            index,
          }) : undefined}
          removeClippedSubviews={true}
          maxToRenderPerBatch={viewMode === 'compact' ? 20 : 10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={viewMode === 'compact' ? 20 : 10}
          windowSize={21}
        />
      )}

      <DetailModal />
      <CodeModal />
      <CreateModal />
      <SortModal />
      <DeleteConfirmModal />
    </SafeAreaView>
  );
};

export default CheatSheetsScreen;