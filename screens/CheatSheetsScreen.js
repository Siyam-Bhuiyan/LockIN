import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";

const { width, height } = Dimensions.get("window");

const CheatSheetsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cheatSheets, setCheatSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Algorithms",
    description: "",
    codes: [],
  });

  const [codeSnippet, setCodeSnippet] = useState({
    title: "",
    code: "",
    description: "",
  });

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
    "Other",
  ];

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
    "Design Patterns": "#8B5CF6",
    "System Design": "#059669",
    Other: "#64748B",
  };

  const sampleCheatSheets = [
    {
      id: 1,
      title: "Array Methods",
      category: "Arrays",
      description: "Essential JavaScript array operations and transformations",
      createdAt: new Date().toISOString(),
      codes: [
        {
          id: 1,
          title: "Filter & Map",
          code: "// Filter elements and transform\nconst numbers = [1, 2, 3, 4, 5, 6];\nconst filtered = numbers.filter(x => x > 3);\nconst mapped = filtered.map(x => x * 2);\nconsole.log(mapped); // [8, 10, 12]",
          description: "Common array transformations",
        },
        {
          id: 2,
          title: "Reduce",
          code: "// Accumulate array values\nconst numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((acc, val) => acc + val, 0);\nconst max = numbers.reduce((acc, val) => Math.max(acc, val));\nconsole.log(sum); // 15\nconsole.log(max); // 5",
          description: "Accumulate array values",
        },
      ],
    },
    {
      id: 2,
      title: "Binary Search",
      category: "Algorithms",
      description: "Classic search algorithm for sorted arrays",
      createdAt: new Date().toISOString(),
      codes: [
        {
          id: 1,
          title: "Standard Binary Search",
          code: "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1;\n}",
          description: "Find target in sorted array - O(log n)",
        },
      ],
    },
  ];

  useEffect(() => {
    loadCheatSheets();
    animateEntrance();
  }, []);

  // Memoized handlers to prevent keyboard dismissal
  const handleTitleChange = useCallback((text) => {
    setFormData((prev) => ({ ...prev, title: text }));
  }, []);

  const handleDescriptionChange = useCallback((text) => {
    setFormData((prev) => ({ ...prev, description: text }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFormData((prev) => ({ ...prev, category }));
  }, []);

  const handleCodeTitleChange = useCallback((text) => {
    setCodeSnippet((prev) => ({ ...prev, title: text }));
  }, []);

  const handleCodeChange = useCallback((text) => {
    setCodeSnippet((prev) => ({ ...prev, code: text }));
  }, []);

  const handleCodeDescriptionChange = useCallback((text) => {
    setCodeSnippet((prev) => ({ ...prev, description: text }));
  }, []);

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

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setString(text);
      Alert.alert("✅ Copied!", "Code snippet copied to clipboard", [
        { text: "OK", style: "default" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const shareCode = async (code) => {
    try {
      await Share.share({
        message: code.code,
        title: code.title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share code");
    }
  };

  const saveCheatSheet = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title for the cheat sheet");
      return;
    }

    if (formData.codes.length === 0) {
      Alert.alert("Error", "Please add at least one code snippet");
      return;
    }

    try {
      const sheet = {
        ...formData,
        id: isEditing ? editingSheet.id : generateId(),
        createdAt: isEditing
          ? editingSheet.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedSheets;
      if (isEditing) {
        updatedSheets = cheatSheets.map((s) => (s.id === sheet.id ? sheet : s));
      } else {
        updatedSheets = [sheet, ...cheatSheets];
      }

      setCheatSheets(updatedSheets);
      await StorageService.saveCheatSheets(updatedSheets);

      resetForm();
      setShowCreateModal(false);
      Alert.alert(
        "Success",
        `Cheat sheet ${isEditing ? "updated" : "created"} successfully!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save cheat sheet");
    }
  };

  const deleteCheatSheet = (sheetId) => {
    Alert.alert(
      "Delete Cheat Sheet",
      "Are you sure you want to delete this cheat sheet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedSheets = cheatSheets.filter((s) => s.id !== sheetId);
              setCheatSheets(updatedSheets);
              await StorageService.saveCheatSheets(updatedSheets);
              setShowModal(false);
              Alert.alert("Success", "Cheat sheet deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete cheat sheet");
            }
          },
        },
      ]
    );
  };

  const editCheatSheet = (sheet) => {
    setEditingSheet(sheet);
    setIsEditing(true);
    setFormData({
      title: sheet.title,
      category: sheet.category,
      description: sheet.description,
      codes: [...sheet.codes],
    });
    setShowModal(false);
    setShowCreateModal(true);
  };

  const addCodeSnippet = () => {
    if (!codeSnippet.title.trim() || !codeSnippet.code.trim()) {
      Alert.alert("Error", "Please fill in both title and code");
      return;
    }

    const codeWithId = {
      ...codeSnippet,
      id: generateId(),
    };

    setFormData((prev) => ({
      ...prev,
      codes: [...prev.codes, codeWithId],
    }));

    setCodeSnippet({ title: "", code: "", description: "" });
  };

  const removeCodeSnippet = (index) => {
    setFormData((prev) => ({
      ...prev,
      codes: prev.codes.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Algorithms",
      description: "",
      codes: [],
    });
    setCodeSnippet({ title: "", code: "", description: "" });
    setIsEditing(false);
    setEditingSheet(null);
  };

  const filteredSheets = cheatSheets.filter((sheet) => {
    const matchesCategory =
      selectedCategory === "All" || sheet.category === selectedCategory;
    const matchesSearch =
      sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "#22C55E";
      case "Intermediate":
        return "#F59E0B";
      case "Advanced":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const CheatSheetCard = ({ sheet, index }) => {
    const categoryColor = getColorForCategory(sheet.category);

    return (
      <TouchableOpacity
        style={styles.modernCard}
        onPress={() => {
          setSelectedSheet(sheet);
          setShowModal(true);
        }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={
            isDark
              ? [
                  `${categoryColor}25`,
                  `${categoryColor}15`,
                  `${categoryColor}08`,
                ]
              : [`${categoryColor}15`, `${categoryColor}08`, "transparent"]
          }
          style={styles.modernCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Card Header */}
          <View style={styles.modernCardHeader}>
            <View
              style={[styles.categoryIcon, { backgroundColor: categoryColor }]}
            >
              <Ionicons name="code-slash" size={18} color="white" />
            </View>
            <View style={styles.cardTitleSection}>
              <Text style={[styles.modernCardTitle, { color: theme.text }]}>
                {sheet.title}
              </Text>
              <Text
                style={[styles.modernCardCategory, { color: categoryColor }]}
              >
                {sheet.category}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textSecondary}
              />
            </View>
          </View>

          {/* Card Description */}
          <Text
            style={[
              styles.modernCardDescription,
              { color: theme.textSecondary },
            ]}
            numberOfLines={2}
          >
            {sheet.description}
          </Text>

          {/* Card Footer */}
          <View style={styles.modernCardFooter}>
            <View style={styles.snippetCount}>
              <View
                style={[
                  styles.snippetIcon,
                  { backgroundColor: `${categoryColor}20` },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color={categoryColor}
                />
              </View>
              <Text
                style={[styles.snippetText, { color: theme.textSecondary }]}
              >
                {sheet.codes?.length || 0} snippets
              </Text>
            </View>
            <Text style={[styles.cardDate, { color: theme.textTertiary }]}>
              {new Date(sheet.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const CodeSnippetCard = ({ code, sheet }) => (
    <View style={[styles.codeSnippetCard, { backgroundColor: theme.surface }]}>
      <LinearGradient
        colors={[`${getColorForCategory(sheet.category)}08`, "transparent"]}
        style={styles.codeSnippetGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.codeSnippetHeader}>
          <View style={styles.codeSnippetInfo}>
            <Text style={[styles.codeSnippetTitle, { color: theme.text }]}>
              {code.title}
            </Text>
            <Text
              style={[
                styles.codeSnippetDescription,
                { color: theme.textSecondary },
              ]}
            >
              {code.description}
            </Text>
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => copyToClipboard(code.code)}
            >
              <Ionicons name="copy-outline" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.secondary },
              ]}
              onPress={() => shareCode(code)}
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
        <View
          style={[styles.codePreview, { backgroundColor: theme.background }]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.codeText, { color: theme.text }]}>
              {code.code.length > 150
                ? code.code.substring(0, 150) + "..."
                : code.code}
            </Text>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );

  const DetailModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <SafeAreaView
        style={[{ flex: 1 }, { backgroundColor: theme.background }]}
      >
        <LinearGradient
          colors={[
            `${getColorForCategory(selectedSheet?.category)}08`,
            "transparent",
          ]}
          style={styles.modalGradient}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: theme.border }]}
          >
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
              <Text
                style={[styles.modalSubtitle, { color: theme.textSecondary }]}
              >
                {selectedSheet?.category} • {selectedSheet?.difficulty}
              </Text>
            </View>
            <View style={styles.modalActions}>
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

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.modalDescriptionContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.modalDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {selectedSheet?.description}
              </Text>
            </View>

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
      <SafeAreaView
        style={[{ flex: 1 }, { backgroundColor: theme.background }]}
      >
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
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => copyToClipboard(selectedCode?.code)}
            >
              <Ionicons name="copy-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondary }]}
              onPress={() => shareCode(selectedCode)}
            >
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View
            style={[
              styles.fullCodeContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <Text style={[styles.fullCodeText, { color: theme.text }]}>
                {selectedCode?.code}
              </Text>
            </ScrollView>
          </View>
          <View
            style={[
              styles.modalDescriptionContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text
              style={[styles.modalDescription, { color: theme.textSecondary }]}
            >
              {selectedCode?.description}
            </Text>
          </View>
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
          {/* Modern Header */}
          <View
            style={[
              styles.modernModalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
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
            {/* Sheet Details Section */}
            <View
              style={[
                styles.modernFormSection,
                { backgroundColor: theme.surface },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Cheat Sheet Details
              </Text>

              <View style={styles.modernInputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Title
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
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                />
              </View>

              <View style={styles.modernInputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Description
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
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                />
              </View>

              <View style={styles.modernInputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categorySelector}
                >
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor:
                              formData.category === category
                                ? getColorForCategory(category)
                                : theme.background,
                            borderColor:
                              formData.category === category
                                ? getColorForCategory(category)
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
            </View>

            {/* Code Snippets Section */}
            <View
              style={[
                styles.modernFormSection,
                { backgroundColor: theme.surface },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Code Snippets
                </Text>
                <View
                  style={[
                    styles.snippetCounter,
                    { backgroundColor: theme.primary },
                  ]}
                >
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
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={theme.primary}
                  />
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
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                />

                <View style={styles.codeInputWrapper}>
                  <View style={styles.codeInputHeader}>
                    <Ionicons
                      name="code-slash-outline"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.codeInputHeaderText,
                        { color: theme.textSecondary },
                      ]}
                    >
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
                    numberOfLines={6}
                    textAlignVertical="top"
                    autoCorrect={false}
                    spellCheck={false}
                    blurOnSubmit={false}
                    enablesReturnKeyAutomatically={false}
                  />
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
                  value={codeSnippet.description}
                  onChangeText={handleCodeDescriptionChange}
                  placeholder="Brief description (optional)"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                />

                <TouchableOpacity
                  style={[
                    styles.modernAddButton,
                    { backgroundColor: theme.primary },
                  ]}
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
                    <Text style={[styles.snippetTitle, { color: theme.text }]}>
                      {code.title}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.deleteSnippet,
                        { backgroundColor: theme.error },
                      ]}
                      onPress={() => removeCodeSnippet(index)}
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      styles.snippetPreview,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {code.code.length > 100
                      ? code.code.substring(0, 100) + "..."
                      : code.code}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Modern Card Styles
    modernCard: {
      backgroundColor: isDark ? "#334155" : theme.surface,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: isDark ? 2 : 1,
      borderColor: isDark ? "#475569" : theme.border,
      overflow: "hidden",
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 12,
      elevation: isDark ? 8 : 3,
    },
    modernCardGradient: {
      padding: 20,
      backgroundColor: isDark ? "#475569" : "transparent",
      borderRadius: 16,
      minHeight: 120,
    },
    modernCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cardTitleSection: {
      flex: 1,
    },
    modernCardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    modernCardCategory: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardActions: {
      padding: 4,
    },
    modernCardDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
    modernCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    snippetCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    snippetIcon: {
      width: 24,
      height: 24,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    snippetText: {
      fontSize: 13,
      fontWeight: "500",
    },
    cardDate: {
      fontSize: 12,
      fontWeight: "500",
    },

    // Modern Modal Styles
    modernModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
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

    // Modern Form Styles
    modernFormSection: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: isDark ? "#475569" : theme.surface,
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
      backgroundColor: theme.primary,
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
      alignItems: "center",
      marginBottom: 8,
    },
    snippetTitle: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
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

    // Header styles
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
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    createButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    // Search and Category Styles
    searchContainer: {
      marginBottom: 20,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      borderWidth: 1.5,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      backgroundColor: theme.surfaceColor,
      borderColor: theme.borderColor,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryScroll: {
      paddingHorizontal: 24,
      gap: 12,
    },
    categoryChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.3,
    },

    // Content and Layout
    content: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },

    // Empty State
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: "center",
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
    content: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },
    sheetCard: {
      marginBottom: 20,
      borderRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    sheetCardGradient: {
      padding: 24,
      borderRadius: 24,
      borderWidth: 1.5,
      position: "relative",
      overflow: "hidden",
    },
    floatingDot: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    cardHeaderLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
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
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 6,
      letterSpacing: -0.5,
      lineHeight: 24,
    },
    cardCategory: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    difficultyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "800",
      color: "white",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    cardDescription: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      fontWeight: "400",
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    codeCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconWrapper: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    codeCountText: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardDate: {
      fontSize: 12,
      fontWeight: "600",
    },
    chevronWrapper: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 12,
      color: theme.text,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
    },
    modalGradient: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1.5,
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
    },
    modalSubtitle: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
      letterSpacing: 0.5,
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
    codeSnippetCard: {
      marginBottom: 20,
      borderRadius: 20,
      borderWidth: 1.5,
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
      borderBottomWidth: 1.5,
      borderBottomColor: theme.border,
    },
    codeSnippetInfo: {
      flex: 1,
      marginRight: 16,
    },
    codeSnippetTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 6,
      letterSpacing: -0.3,
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
      fontFamily: "monospace",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
    fullCodeContainer: {
      padding: 24,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    fullCodeText: {
      fontFamily: "monospace",
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
    },
    // Form Styles
    formSection: {
      marginBottom: 24,
    },
    formRow: {
      flexDirection: "row",
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    formInput: {
      borderWidth: 1.5,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      fontWeight: "500",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    formTextArea: {
      borderWidth: 1.5,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      fontWeight: "500",
      minHeight: 100,
      textAlignVertical: "top",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    formCodeArea: {
      borderWidth: 1.5,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 14,
      fontWeight: "500",
      minHeight: 120,
      textAlignVertical: "top",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    pickerScroll: {
      maxHeight: 60,
    },
    pickerOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    pickerText: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    formSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    counterBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    counterText: {
      fontSize: 12,
      fontWeight: "800",
      color: "white",
      letterSpacing: 0.5,
    },
    addCodeSection: {
      padding: 20,
      borderRadius: 20,
      borderWidth: 1.5,
      marginBottom: 20,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    addCodeHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    addCodeTitle: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.3,
    },
    codeInputContainer: {
      marginVertical: 12,
    },
    codeInputHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    codeInputLabel: {
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
    addButton: {
      borderRadius: 16,
      marginTop: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    addButtonInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 8,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      letterSpacing: 0.5,
    },
    existingCodeItem: {
      marginBottom: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      overflow: "hidden",
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    existingCodeGradient: {
      flex: 1,
    },
    existingCodeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1.5,
      borderBottomColor: theme.border,
    },
    existingCodeTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 8,
    },
    existingCodeTitle: {
      fontSize: 16,
      fontWeight: "700",
      flex: 1,
      letterSpacing: -0.3,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    existingCodePreview: {
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      margin: 16,
      marginTop: 0,
      borderRadius: 12,
    },
    existingCodeText: {
      fontFamily: "monospace",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.statusBar}
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

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
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
                      ? getColorForCategory(category) || theme.primary
                      : theme.surface,
                  borderColor:
                    selectedCategory === category
                      ? getColorForCategory(category) || theme.primary
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

      <FlatList
        data={filteredSheets}
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
        ListEmptyComponent={() => (
          <Animated.View
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.textSecondary}
              style={{ marginBottom: 20 }}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Cheat Sheets Found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              Try adjusting your search or category filter, or create a new
              cheat sheet by tapping the + button
            </Text>
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        getItemLayout={(data, index) => ({
          length: 140,
          offset: 140 * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
      />

      <DetailModal />
      <CodeModal />
      <CreateModal />
    </SafeAreaView>
  );
};

export default CheatSheetsScreen;
