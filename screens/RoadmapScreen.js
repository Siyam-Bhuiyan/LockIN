import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import StorageService from "../services/StorageService";

const { width: screenWidth } = Dimensions.get("window");

const RoadmapScreen = () => {
  const { theme, isDark } = useTheme();
  const [roadmaps, setRoadmaps] = useState([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, progress, alphabetical

  const [newRoadmap, setNewRoadmap] = useState({
    title: "",
    category: "Learning",
    description: "",
    targetDate: "",
    priority: "Medium",
    tags: [],
  });

  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    resources: "",
    priority: "Medium",
  });

  const categories = [
    "All",
    "Learning",
    "Project",
    "Career",
    "Personal",
    "Health",
  ];
  const priorities = ["Low", "Medium", "High"];
  const sortOptions = [
    { key: "newest", label: "Newest First", icon: "time-outline" },
    { key: "oldest", label: "Oldest First", icon: "time-outline" },
    { key: "progress", label: "By Progress", icon: "trending-up-outline" },
    { key: "alphabetical", label: "A-Z", icon: "text-outline" },
  ];

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    loadRoadmaps();
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterAndSortRoadmaps();
  }, [roadmaps, searchQuery, selectedCategory, sortBy]);

  const loadRoadmaps = async () => {
    const savedRoadmaps = await StorageService.getRoadmaps();
    setRoadmaps(savedRoadmaps);
  };

  const saveRoadmaps = async (updatedRoadmaps) => {
    await StorageService.saveRoadmaps(updatedRoadmaps);
    setRoadmaps(updatedRoadmaps);
  };

  const filterAndSortRoadmaps = () => {
    let filtered = roadmaps.filter((roadmap) => {
      const matchesSearch =
        roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roadmap.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || roadmap.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort roadmaps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "progress":
          return getRoadmapProgress(b) - getRoadmapProgress(a);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredRoadmaps(filtered);
  };

  const addRoadmap = async () => {
    if (!newRoadmap.title.trim()) {
      Alert.alert("Error", "Please enter roadmap title");
      return;
    }

    const roadmap = {
      id: Date.now().toString(),
      ...newRoadmap,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRoadmaps = [...roadmaps, roadmap];
    await saveRoadmaps(updatedRoadmaps);
    setModalVisible(false);
    setNewRoadmap({
      title: "",
      category: "Learning",
      description: "",
      targetDate: "",
      priority: "Medium",
      tags: [],
    });

    // Success feedback
    Vibration.vibrate(50);
  };

  const addStep = async () => {
    if (!newStep.title.trim()) {
      Alert.alert("Error", "Please enter step title");
      return;
    }

    const step = {
      id: Date.now().toString(),
      ...newStep,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    const updatedRoadmaps = roadmaps.map((roadmap) =>
      roadmap.id === selectedRoadmap.id
        ? {
            ...roadmap,
            steps: [...roadmap.steps, step],
            updatedAt: new Date().toISOString(),
          }
        : roadmap
    );

    await saveRoadmaps(updatedRoadmaps);
    setStepModalVisible(false);
    setNewStep({
      title: "",
      description: "",
      estimatedHours: "",
      resources: "",
      priority: "Medium",
    });

    Vibration.vibrate(50);
  };

  const toggleStep = async (roadmapId, stepId) => {
    const updatedRoadmaps = roadmaps.map((roadmap) =>
      roadmap.id === roadmapId
        ? {
            ...roadmap,
            steps: roadmap.steps.map((step) =>
              step.id === stepId
                ? {
                    ...step,
                    completed: !step.completed,
                    completedAt: !step.completed
                      ? new Date().toISOString()
                      : null,
                  }
                : step
            ),
            updatedAt: new Date().toISOString(),
          }
        : roadmap
    );

    await saveRoadmaps(updatedRoadmaps);

    // Haptic feedback for completion
    if (
      !roadmaps
        .find((r) => r.id === roadmapId)
        .steps.find((s) => s.id === stepId).completed
    ) {
      Vibration.vibrate(100);
    }
  };

  const deleteRoadmap = (roadmapId) => {
    Alert.alert(
      "Delete Roadmap",
      "Are you sure you want to delete this roadmap? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedRoadmaps = roadmaps.filter((r) => r.id !== roadmapId);
            await saveRoadmaps(updatedRoadmaps);
            Vibration.vibrate(200);
          },
        },
      ]
    );
  };

  const deleteStep = (roadmapId, stepId) => {
    Alert.alert("Delete Step", "Are you sure you want to delete this step?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedRoadmaps = roadmaps.map((roadmap) =>
            roadmap.id === roadmapId
              ? {
                  ...roadmap,
                  steps: roadmap.steps.filter((s) => s.id !== stepId),
                  updatedAt: new Date().toISOString(),
                }
              : roadmap
          );
          await saveRoadmaps(updatedRoadmaps);
        },
      },
    ]);
  };

  const moveStep = async (roadmapId, stepId, direction) => {
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    const stepIndex = roadmap.steps.findIndex((s) => s.id === stepId);

    if (
      (direction === "up" && stepIndex === 0) ||
      (direction === "down" && stepIndex === roadmap.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...roadmap.steps];
    const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;
    [newSteps[stepIndex], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[stepIndex],
    ];

    const updatedRoadmaps = roadmaps.map((r) =>
      r.id === roadmapId
        ? {
            ...r,
            steps: newSteps,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    await saveRoadmaps(updatedRoadmaps);
    Vibration.vibrate(25);
  };

  const toggleExpanded = (roadmapId) => {
    const newExpanded = new Set(expandedRoadmaps);
    if (newExpanded.has(roadmapId)) {
      newExpanded.delete(roadmapId);
    } else {
      newExpanded.add(roadmapId);
    }
    setExpandedRoadmaps(newExpanded);
  };

  const getRoadmapProgress = (roadmap) => {
    if (roadmap.steps.length === 0) return 0;
    const completedSteps = roadmap.steps.filter(
      (step) => step.completed
    ).length;
    return completedSteps / roadmap.steps.length;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Learning":
        return theme.accent;
      case "Project":
        return theme.primary;
      case "Career":
        return theme.secondary;
      case "Personal":
        return "#ff6b6b";
      case "Health":
        return "#51cf66";
      default:
        return theme.accent;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return theme.error;
      case "Medium":
        return theme.warning;
      case "Low":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const getProgressStatus = (progress) => {
    if (progress === 1) return "Completed";
    if (progress >= 0.8) return "Almost Done";
    if (progress >= 0.5) return "In Progress";
    if (progress > 0) return "Started";
    return "Not Started";
  };

  const getTotalStats = useMemo(() => {
    const total = roadmaps.length;
    const completed = roadmaps.filter(
      (r) => getRoadmapProgress(r) === 1
    ).length;
    const inProgress = roadmaps.filter((r) => {
      const progress = getRoadmapProgress(r);
      return progress > 0 && progress < 1;
    }).length;
    const notStarted = roadmaps.filter(
      (r) => getRoadmapProgress(r) === 0
    ).length;

    return { total, completed, inProgress, notStarted };
  }, [roadmaps]);

  const RoadmapCard = ({ roadmap, index }) => {
    const progress = getRoadmapProgress(roadmap);
    const completedSteps = roadmap.steps.filter(
      (step) => step.completed
    ).length;
    const isExpanded = expandedRoadmaps.has(roadmap.id);
    const progressStatus = getProgressStatus(progress);

    return (
      <Animated.View
        style={[
          styles.roadmapCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.surface, isDark ? "#1a202c" : "#f7fafc"]}
          style={styles.cardGradient}
        >
          <Card style={styles.cardContent}>
            {/* Header */}
            <View style={styles.roadmapHeader}>
              <View style={styles.roadmapInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.roadmapTitle, { color: theme.text }]}>
                    {roadmap.title}
                  </Text>
                  {roadmap.priority && (
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(roadmap.priority) },
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {roadmap.priority}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.metaInfo}>
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: getCategoryColor(roadmap.category) },
                    ]}
                  >
                    <Text style={styles.categoryText}>{roadmap.category}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {progressStatus}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => deleteRoadmap(roadmap.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>

            {/* Description */}
            {roadmap.description && (
              <Text
                style={[
                  styles.roadmapDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {roadmap.description}
              </Text>
            )}

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  Progress: {completedSteps}/{roadmap.steps.length} steps
                </Text>
                <Text
                  style={[
                    styles.progressPercentage,
                    { color: getCategoryColor(roadmap.category) },
                  ]}
                >
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={getCategoryColor(roadmap.category)}
                style={styles.progressBar}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.success + "20" },
                ]}
                onPress={() => {
                  setSelectedRoadmap(roadmap);
                  setStepModalVisible(true);
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color={theme.success}
                />
                <Text
                  style={[styles.actionButtonText, { color: theme.success }]}
                >
                  Add Step
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.primary + "20" },
                ]}
                onPress={() => toggleExpanded(roadmap.id)}
              >
                <Ionicons
                  name={
                    isExpanded ? "chevron-up-outline" : "chevron-down-outline"
                  }
                  size={16}
                  color={theme.primary}
                />
                <Text
                  style={[styles.actionButtonText, { color: theme.primary }]}
                >
                  {isExpanded ? "Collapse" : "Expand"} ({roadmap.steps.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expanded Steps */}
            {isExpanded && roadmap.steps.length > 0 && (
              <View style={styles.expandedSteps}>
                <View style={styles.stepsHeader}>
                  <Text style={[styles.stepsTitle, { color: theme.text }]}>
                    Steps
                  </Text>
                </View>

                {roadmap.steps.map((step, stepIndex) => (
                  <View
                    key={step.id}
                    style={[
                      styles.stepItem,
                      { borderBottomColor: theme.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.stepCheckbox}
                      onPress={() => toggleStep(roadmap.id, step.id)}
                    >
                      <Ionicons
                        name={
                          step.completed
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={24}
                        color={
                          step.completed ? theme.success : theme.textSecondary
                        }
                      />
                    </TouchableOpacity>

                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            color: step.completed
                              ? theme.textSecondary
                              : theme.text,
                            textDecorationLine: step.completed
                              ? "line-through"
                              : "none",
                          },
                        ]}
                      >
                        {step.title}
                      </Text>

                      {step.description && (
                        <Text
                          style={[
                            styles.stepDescription,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {step.description}
                        </Text>
                      )}

                      <View style={styles.stepMeta}>
                        {step.estimatedHours && (
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={theme.textSecondary}
                            />
                            <Text
                              style={[
                                styles.metaText,
                                { color: theme.textSecondary },
                              ]}
                            >
                              {step.estimatedHours}h
                            </Text>
                          </View>
                        )}

                        {step.priority && (
                          <View
                            style={[
                              styles.stepPriorityBadge,
                              {
                                backgroundColor:
                                  getPriorityColor(step.priority) + "20",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.stepPriorityText,
                                { color: getPriorityColor(step.priority) },
                              ]}
                            >
                              {step.priority}
                            </Text>
                          </View>
                        )}

                        {step.completed && step.completedAt && (
                          <Text
                            style={[
                              styles.completedDate,
                              { color: theme.success },
                            ]}
                          >
                            ✓ {new Date(step.completedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.stepActions}>
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => moveStep(roadmap.id, step.id, "up")}
                        disabled={stepIndex === 0}
                      >
                        <Ionicons
                          name="chevron-up-outline"
                          size={16}
                          color={
                            stepIndex === 0 ? theme.border : theme.textSecondary
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => moveStep(roadmap.id, step.id, "down")}
                        disabled={stepIndex === roadmap.steps.length - 1}
                      >
                        <Ionicons
                          name="chevron-down-outline"
                          size={16}
                          color={
                            stepIndex === roadmap.steps.length - 1
                              ? theme.border
                              : theme.textSecondary
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => deleteStep(roadmap.id, step.id)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color={theme.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Target Date */}
            {roadmap.targetDate && (
              <View style={styles.targetDate}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.targetDateText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Target: {new Date(roadmap.targetDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card>
        </LinearGradient>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      padding: 12,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      elevation: 1,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.text,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    categoryScroll: {
      flex: 1,
      marginRight: 12,
    },
    categoryContainer: {
      flexDirection: "row",
      paddingRight: 20,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.border,
    },
    categoryButtonActive: {
      backgroundColor: theme.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    categoryButtonTextActive: {
      color: "#ffffff",
    },
    sortButton: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      elevation: 1,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    sortButtonText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    statsContainer: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    roadmapCard: {
      marginBottom: 16,
    },
    cardGradient: {
      borderRadius: 16,
    },
    cardContent: {
      margin: 0,
      padding: 20,
    },
    roadmapHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    roadmapInfo: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    roadmapTitle: {
      fontSize: 18,
      fontWeight: "bold",
      flex: 1,
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 8,
    },
    priorityText: {
      fontSize: 10,
      color: "#ffffff",
      fontWeight: "600",
    },
    metaInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    categoryTag: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    categoryText: {
      fontSize: 12,
      color: "#ffffff",
      fontWeight: "600",
    },
    statusTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
    },
    deleteButton: {
      padding: 4,
      borderRadius: 8,
    },
    roadmapDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
    progressSection: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "bold",
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
    },
    actionButtons: {
      flexDirection: "row",
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },
    expandedSteps: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    stepsHeader: {
      marginBottom: 12,
    },
    stepsTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    stepCheckbox: {
      marginRight: 12,
      marginTop: 2,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    stepDescription: {
      fontSize: 12,
      lineHeight: 16,
      marginBottom: 8,
    },
    stepMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
      marginBottom: 4,
    },
    metaText: {
      fontSize: 11,
      marginLeft: 4,
    },
    stepPriorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 4,
    },
    stepPriorityText: {
      fontSize: 10,
      fontWeight: "600",
    },
    completedDate: {
      fontSize: 11,
      fontWeight: "500",
    },
    stepActions: {
      alignItems: "center",
      marginLeft: 8,
    },
    moveButton: {
      padding: 4,
      marginVertical: 2,
    },
    targetDate: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    targetDateText: {
      fontSize: 12,
      marginLeft: 4,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      color: theme.textSecondary,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      maxHeight: "85%",
      elevation: 10,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    // New Mobile-Responsive Modal Styles
    mobileModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    mobileModalContainer: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      minHeight: "60%",
      flex: 1,
      marginTop: 60,
    },
    mobileModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalCloseButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    mobileModalScrollView: {
      flex: 1,
    },
    mobileModalContent: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingBottom: 20,
    },
    mobileModalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: Platform.select({ ios: 34, android: 20 }),
      gap: 16,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    mobileModalButton: {
      flex: 1,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
      marginBottom: 8,
    },
    inputFocused: {
      borderColor: theme.primary,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    categorySelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    categoryOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      margin: 4,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    categoryOptionSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryOptionText: {
      fontWeight: "600",
      fontSize: 14,
      color: theme.text,
    },
    categoryOptionTextSelected: {
      color: "#ffffff",
    },
    prioritySelector: {
      flexDirection: "row",
      marginBottom: 8,
    },
    priorityOption: {
      flex: 1,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    priorityOptionSelected: {
      borderColor: theme.primary,
    },
    priorityOptionText: {
      fontWeight: "600",
      fontSize: 14,
      color: theme.text,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
    },
    modalButton: {
      flex: 1,
      marginHorizontal: 6,
    },
    sortModal: {
      position: "absolute",
      top: 120,
      right: 20,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 8,
      elevation: 8,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      minWidth: 160,
    },
    sortOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    sortOptionActive: {
      backgroundColor: theme.primary + "20",
    },
    sortOptionText: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 8,
      fontWeight: "500",
    },
    sortOptionTextActive: {
      color: theme.primary,
      fontWeight: "600",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <View style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <Text style={styles.title}>🗺 Roadmap</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search roadmaps..."
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

        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              Alert.alert(
                "Sort Options",
                "Choose sorting method",
                sortOptions.map((option) => ({
                  text: option.label,
                  onPress: () => setSortBy(option.key),
                  style: sortBy === option.key ? "default" : "cancel",
                }))
              );
            }}
          >
            <Ionicons
              name="funnel-outline"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        {roadmaps.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getTotalStats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.success }]}>
                  {getTotalStats.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.warning }]}>
                  {getTotalStats.inProgress}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: theme.textSecondary }]}
                >
                  {getTotalStats.notStarted}
                </Text>
                <Text style={styles.statLabel}>Not Started</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredRoadmaps.map((roadmap, index) => (
          <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} />
        ))}

        {filteredRoadmaps.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="map-outline"
                size={64}
                color={theme.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {roadmaps.length === 0
                ? "No roadmaps yet"
                : "No matching roadmaps"}
            </Text>
            <Text style={styles.emptyText}>
              {roadmaps.length === 0
                ? "Create your first roadmap to start tracking your journey and achieving your goals step by step."
                : "Try adjusting your search or filter criteria to find what you're looking for."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Roadmap Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.mobileModalOverlay}>
          <View style={styles.mobileModalContainer}>
            {/* Modal Header */}
            <View style={styles.mobileModalHeader}>
              <Text style={styles.modalTitle}>Create New Roadmap</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.mobileModalScrollView}
              contentContainerStyle={styles.mobileModalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter roadmap title"
                placeholderTextColor={theme.textSecondary}
                value={newRoadmap.title}
                onChangeText={(text) =>
                  setNewRoadmap({ ...newRoadmap, title: text })
                }
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {categories.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newRoadmap.category === category &&
                        styles.categoryOptionSelected,
                    ]}
                    onPress={() => setNewRoadmap({ ...newRoadmap, category })}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newRoadmap.category === category &&
                          styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newRoadmap.priority === priority &&
                        styles.priorityOptionSelected,
                    ]}
                    onPress={() => setNewRoadmap({ ...newRoadmap, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        newRoadmap.priority === priority && {
                          color: theme.primary,
                        },
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your roadmap goals and objectives"
                placeholderTextColor={theme.textSecondary}
                value={newRoadmap.description}
                onChangeText={(text) =>
                  setNewRoadmap({ ...newRoadmap, description: text })
                }
                multiline
              />

              <Text style={styles.inputLabel}>Target Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={newRoadmap.targetDate}
                onChangeText={(text) =>
                  setNewRoadmap({ ...newRoadmap, targetDate: text })
                }
              />
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View style={styles.mobileModalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.mobileModalButton}
              />
              <Button
                title="Create Roadmap"
                onPress={addRoadmap}
                style={styles.mobileModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Step Modal */}
      <Modal
        visible={stepModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStepModalVisible(false)}
      >
        <View style={styles.mobileModalOverlay}>
          <View style={styles.mobileModalContainer}>
            {/* Modal Header */}
            <View style={styles.mobileModalHeader}>
              <Text style={styles.modalTitle}>Add New Step</Text>
              <TouchableOpacity
                onPress={() => setStepModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.mobileModalScrollView}
              contentContainerStyle={styles.mobileModalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Step Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter step title"
                placeholderTextColor={theme.textSecondary}
                value={newStep.title}
                onChangeText={(text) => setNewStep({ ...newStep, title: text })}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what needs to be done"
                placeholderTextColor={theme.textSecondary}
                value={newStep.description}
                onChangeText={(text) =>
                  setNewStep({ ...newStep, description: text })
                }
                multiline
              />

              <Text style={styles.inputLabel}>Estimated Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="How many hours will this take?"
                placeholderTextColor={theme.textSecondary}
                value={newStep.estimatedHours}
                onChangeText={(text) =>
                  setNewStep({ ...newStep, estimatedHours: text })
                }
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Resources/Links</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add helpful resources, links, or notes"
                placeholderTextColor={theme.textSecondary}
                value={newStep.resources}
                onChangeText={(text) =>
                  setNewStep({ ...newStep, resources: text })
                }
                multiline
              />

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newStep.priority === priority &&
                        styles.priorityOptionSelected,
                    ]}
                    onPress={() => setNewStep({ ...newStep, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        newStep.priority === priority && {
                          color: theme.primary,
                        },
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View style={styles.mobileModalButtons}>
              <Button
                title="Cancel"
                onPress={() => setStepModalVisible(false)}
                variant="outline"
                style={styles.mobileModalButton}
              />
              <Button
                title="Add Step"
                onPress={addStep}
                style={styles.mobileModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RoadmapScreen;
