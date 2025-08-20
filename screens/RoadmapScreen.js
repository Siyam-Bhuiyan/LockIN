import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../context/ThemeContext";
import GeminiService from "../services/GeminiService";
import StorageService from "../services/StorageService";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const { width, height } = Dimensions.get("window");

const RoadmapScreen = () => {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [toastMessage, setToastMessage] = useState("");

  const searchRef = useRef(null);

  useEffect(() => {
    loadRoadmaps();

    // Cleanup function
    return () => {
      if (window.notesTimer) {
        clearTimeout(window.notesTimer);
      }
    };
  }, []);

  const loadRoadmaps = async () => {
    try {
      const savedRoadmaps = await StorageService.getRoadmaps();
      setRoadmaps(savedRoadmaps);
    } catch (error) {
      console.error("Error loading roadmaps:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoadmaps();
    setRefreshing(false);
  };

  const generateRoadmap = async () => {
    if (!searchQuery.trim()) {
      Alert.alert(
        "Missing Topic",
        "Please enter a topic to generate your learning roadmap",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setLoading(true);

    try {
      const roadmap = await GeminiService.generateRoadmap(searchQuery.trim());

      const enhancedRoadmap = {
        ...roadmap,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        progress: 0,
      };

      const updatedRoadmaps = [enhancedRoadmap, ...roadmaps];
      setRoadmaps(updatedRoadmaps);
      await StorageService.saveRoadmaps(updatedRoadmaps);

      setCurrentRoadmap(enhancedRoadmap);
      setSearchQuery("");

      showToast("🎉 Roadmap generated successfully!", "success");
    } catch (error) {
      console.error("Error generating roadmap:", error);
      Alert.alert(
        "Generation Failed",
        error.message ||
          "Unable to generate roadmap. Please check your connection and try again.",
        [
          { text: "Retry", onPress: () => generateRoadmap() },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = async (stepIndex) => {
    if (!currentRoadmap) return;

    const updatedSteps = [...currentRoadmap.steps];
    updatedSteps[stepIndex].done = !updatedSteps[stepIndex].done;

    const completedSteps = updatedSteps.filter((step) => step.done).length;
    const progress = (completedSteps / updatedSteps.length) * 100;

    const updatedRoadmap = {
      ...currentRoadmap,
      steps: updatedSteps,
      progress,
      lastUpdated: new Date().toISOString(),
    };

    setCurrentRoadmap(updatedRoadmap);

    const updatedRoadmaps = roadmaps.map((rm) =>
      rm.id === currentRoadmap.id ? updatedRoadmap : rm
    );
    setRoadmaps(updatedRoadmaps);
    await StorageService.saveRoadmaps(updatedRoadmaps);
  };

  const updateNotes = async (stepIndex, notes) => {
    if (!currentRoadmap) return;

    try {
      const updatedSteps = [...currentRoadmap.steps];
      // Ensure the step object exists and has all required properties
      if (!updatedSteps[stepIndex]) {
        console.warn(`Step at index ${stepIndex} does not exist`);
        return;
      }

      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        notes: notes,
      };

      const updatedRoadmap = {
        ...currentRoadmap,
        steps: updatedSteps,
        lastUpdated: new Date().toISOString(),
      };

      setCurrentRoadmap(updatedRoadmap);

      const updatedRoadmaps = roadmaps.map((rm) =>
        rm.id === currentRoadmap.id ? updatedRoadmap : rm
      );
      setRoadmaps(updatedRoadmaps);
      await StorageService.saveRoadmaps(updatedRoadmaps);
    } catch (error) {
      console.error("Error updating notes:", error);
      showToast("❌ Failed to save notes", "error");
    }
  };

  // Debounced version for real-time updates
  const debouncedUpdateNotes = (stepIndex, notes) => {
    // Update UI immediately
    if (currentRoadmap) {
      const updatedSteps = [...currentRoadmap.steps];
      if (updatedSteps[stepIndex]) {
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          notes: notes,
        };

        const updatedRoadmap = {
          ...currentRoadmap,
          steps: updatedSteps,
          lastUpdated: new Date().toISOString(),
        };

        setCurrentRoadmap(updatedRoadmap);
      }
    }

    // Debounce the save operation
    clearTimeout(window.notesTimer);
    window.notesTimer = setTimeout(() => {
      updateNotes(stepIndex, notes);
    }, 1000); // Save after 1 second of no typing
  };

  const toggleExpanded = (stepIndex) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const showToast = (message, type = "success") => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(""), 3000);
  };

  const copyCode = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      showToast("📋 Code copied to clipboard!", "success");
    } catch (error) {
      showToast("❌ Failed to copy code", "error");
    }
  };

  const showCodeModal = (code) => {
    setSelectedCode(code);
    setCodeModalVisible(true);
  };

  const deleteRoadmap = async (roadmapId) => {
    Alert.alert(
      "Delete Roadmap",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedRoadmaps = roadmaps.filter(
              (rm) => rm.id !== roadmapId
            );
            setRoadmaps(updatedRoadmaps);
            await StorageService.saveRoadmaps(updatedRoadmaps);

            if (currentRoadmap?.id === roadmapId) {
              setCurrentRoadmap(null);
            }
            showToast("🗑️ Roadmap deleted", "success");
          },
        },
      ]
    );
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return theme.error;
    if (progress < 50) return theme.warning;
    if (progress < 75) return theme.accent;
    return theme.success;
  };

  // Enhanced search header
  const renderSearchHeader = () => (
    <View style={[styles.header, { opacity: 1 }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.title, { color: theme.text }]}>
          🗺️ AI Roadmaps
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchInputWrapper,
            {
              backgroundColor: theme.surface,
              borderColor: searchQuery ? theme.primary : theme.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            ref={searchRef}
            style={[
              styles.searchInput,
              {
                color: theme.text,
                backgroundColor: "transparent",
              },
            ]}
            placeholder="What would you like to learn today?"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={generateRoadmap}
            returnKeyType="search"
            selectionColor={theme.primary}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            {
              backgroundColor: searchQuery.trim()
                ? theme.primary
                : theme.border,
            },
            (!searchQuery.trim() || loading) && styles.generateButtonDisabled,
          ]}
          onPress={generateRoadmap}
          disabled={loading || !searchQuery.trim()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="sparkles" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Enhanced Roadmap Card Component
  const RoadmapCard = ({
    roadmap,
    index,
    onSelect,
    onDelete,
    theme,
    getProgressColor,
  }) => (
    <View
      style={[
        styles.enhancedRoadmapCard,
        {
          backgroundColor: theme.surface,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onSelect}
        style={styles.roadmapCardTouchable}
        activeOpacity={0.8}
      >
        {/* Header with title and actions */}
        <View style={styles.enhancedCardHeader}>
          <View style={styles.cardTitleSection}>
            <Text
              style={[styles.enhancedCardTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              {roadmap.topic}
            </Text>
            <View style={styles.cardMetaRow}>
              <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                {new Date(roadmap.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              {roadmap.lastUpdated !== roadmap.createdAt && (
                <View style={styles.updatedIndicator}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[styles.updatedText, { color: theme.textSecondary }]}
                  >
                    Updated
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={onDelete}
            style={[
              styles.enhancedDeleteButton,
              { backgroundColor: theme.error + "15" },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={styles.enhancedProgressSection}>
          <View style={styles.progressLabelRow}>
            <Text
              style={[styles.progressLabel, { color: theme.textSecondary }]}
            >
              Progress
            </Text>
            <Text
              style={[
                styles.enhancedProgressText,
                { color: getProgressColor(roadmap.progress || 0) },
              ]}
            >
              {Math.round(roadmap.progress || 0)}%
            </Text>
          </View>

          <View
            style={[
              styles.enhancedProgressBar,
              { backgroundColor: theme.border },
            ]}
          >
            <LinearGradient
              colors={[
                getProgressColor(roadmap.progress || 0),
                getProgressColor(roadmap.progress || 0) + "80",
              ]}
              style={[
                styles.enhancedProgressFill,
                { width: `${roadmap.progress || 0}%` },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.enhancedStatsSection}>
          <View
            style={[
              styles.enhancedStatItem,
              { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons name="list" size={16} color="#ffffff" />
            <Text style={[styles.enhancedStatText, { color: "#ffffff" }]}>
              {roadmap.steps?.length || 0}
            </Text>
            <Text style={[styles.enhancedStatLabel, { color: "#ffffff" }]}>
              Steps
            </Text>
          </View>

          <View
            style={[
              styles.enhancedStatItem,
              { backgroundColor: theme.success },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
            <Text style={[styles.enhancedStatText, { color: "#ffffff" }]}>
              {roadmap.steps?.filter((s) => s.done).length || 0}
            </Text>
            <Text style={[styles.enhancedStatLabel, { color: "#ffffff" }]}>
              Done
            </Text>
          </View>

          <View
            style={[styles.enhancedStatItem, { backgroundColor: theme.accent }]}
          >
            <Ionicons name="time" size={16} color="#ffffff" />
            <Text style={[styles.enhancedStatText, { color: "#ffffff" }]}>
              {roadmap.steps?.filter((s) => !s.done).length || 0}
            </Text>
            <Text style={[styles.enhancedStatLabel, { color: "#ffffff" }]}>
              Left
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Enhanced roadmap list
  const renderRoadmapsList = () => (
    <View style={styles.mainContent}>
      {roadmaps.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View
            style={[
              styles.emptyStateContent,
              {
                backgroundColor: theme.surface,
              },
            ]}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="map-outline" size={48} color={theme.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Start Your Learning Journey
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              Generate your first AI-powered roadmap and begin mastering new
              skills with personalized guidance.
            </Text>
            <TouchableOpacity
              onPress={() => searchRef.current?.focus()}
              style={[
                styles.emptyActionButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyActionText}>Create Roadmap</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={roadmaps}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.roadmapsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              progressBackgroundColor={theme.surface}
            />
          }
          renderItem={({ item, index }) => (
            <RoadmapCard
              roadmap={item}
              index={index}
              onSelect={() => setCurrentRoadmap(item)}
              onDelete={() => deleteRoadmap(item.id)}
              theme={theme}
              getProgressColor={getProgressColor}
            />
          )}
        />
      )}
    </View>
  );

  // Enhanced Step Card Component
  const renderEnhancedStepCard = (step, index) => {
    const isExpanded = expandedSteps.has(index);
    const hasCode = step.details && step.details.includes("Example:");

    return (
      <View
        key={step.id}
        style={[
          styles.enhancedStepCard,
          {
            backgroundColor: theme.surface,
            borderLeftColor: step.done ? theme.success : theme.primary,
          },
        ]}
      >
        {/* Step Header */}
        <View style={styles.enhancedStepHeader}>
          <TouchableOpacity
            onPress={() => toggleStep(index)}
            style={[
              styles.enhancedCheckbox,
              {
                backgroundColor: step.done ? theme.success : "transparent",
                borderColor: step.done ? theme.success : theme.border,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {step.done && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleExpanded(index)}
            style={styles.enhancedStepTitleContainer}
            activeOpacity={0.8}
          >
            <View style={styles.stepTitleRow}>
              <Text
                style={[
                  styles.enhancedStepTitle,
                  {
                    color: step.done ? theme.textSecondary : theme.text,
                    textDecorationLine: step.done ? "line-through" : "none",
                  },
                ]}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {step.title}
              </Text>
              <View style={styles.stepActions}>
                {hasCode && (
                  <View
                    style={[
                      styles.codeIndicator,
                      { backgroundColor: theme.accent + "20" },
                    ]}
                  >
                    <Ionicons name="code" size={12} color={theme.accent} />
                  </View>
                )}
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
            </View>

            {step.meta?.estimatedHours && (
              <Text
                style={[styles.stepDuration, { color: theme.textSecondary }]}
              >
                ⏱️ {step.meta.estimatedHours}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.enhancedStepContent}>
            {step.details && (
              <View style={styles.enhancedDetailsContainer}>
                <Text
                  style={[styles.enhancedDetailsText, { color: theme.text }]}
                >
                  {step.details.split("Example:")[0].trim()}
                </Text>

                {hasCode && (
                  <View style={styles.enhancedCodeContainer}>
                    <View style={styles.enhancedCodeHeader}>
                      <View style={styles.codeHeaderLeft}>
                        <Ionicons
                          name="code-slash"
                          size={16}
                          color={theme.accent}
                        />
                        <Text
                          style={[
                            styles.enhancedCodeLabel,
                            { color: theme.text },
                          ]}
                        >
                          Code Example
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const codeExample =
                            step.details.split("Example:")[1]?.trim() || "";
                          copyCode(codeExample);
                        }}
                        style={[
                          styles.enhancedCopyButton,
                          { backgroundColor: theme.primary + "15" },
                        ]}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={14}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.enhancedCopyButtonText,
                            { color: theme.primary },
                          ]}
                        >
                          Copy
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        const codeExample =
                          step.details.split("Example:")[1]?.trim() || "";
                        showCodeModal(codeExample);
                      }}
                      style={[
                        styles.enhancedCodePreview,
                        { backgroundColor: theme.background },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.enhancedCodeText, { color: theme.text }]}
                        numberOfLines={6}
                      >
                        {step.details.split("Example:")[1]?.trim() || ""}
                      </Text>
                      <View style={styles.enhancedExpandCodeButton}>
                        <Feather
                          name="maximize-2"
                          size={14}
                          color={theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.expandCodeText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Expand
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Resources */}
                {step.meta?.resources && step.meta.resources.length > 0 && (
                  <View style={styles.resourcesContainer}>
                    <Text
                      style={[styles.resourcesTitle, { color: theme.text }]}
                    >
                      📚 Recommended Resources
                    </Text>
                    {step.meta.resources.slice(0, 3).map((resource, idx) => (
                      <Text
                        key={idx}
                        style={[styles.resourceItem, { color: theme.primary }]}
                        numberOfLines={1}
                      >
                        • {resource}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Personal Notes */}
            <View style={styles.enhancedNotesContainer}>
              <Text style={[styles.enhancedNotesLabel, { color: theme.text }]}>
                📝 Personal Notes
              </Text>
              <TextInput
                style={[
                  styles.enhancedNotesInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Add your thoughts, insights, or questions here..."
                placeholderTextColor={theme.textSecondary}
                value={step.notes || ""}
                onChangeText={(text) => debouncedUpdateNotes(index, text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                selectionColor={theme.primary}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  // Enhanced Current Roadmap View
  const renderCurrentRoadmap = () => {
    if (!currentRoadmap) return null;

    return (
      <View style={styles.enhancedCurrentRoadmapContainer}>
        {/* Enhanced Header */}
        <LinearGradient
          colors={[theme.primary, theme.primary + "80"]}
          style={styles.enhancedRoadmapHeader}
        >
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.enhancedHeaderContent}>
              <TouchableOpacity
                onPress={() => setCurrentRoadmap(null)}
                style={[
                  styles.enhancedBackButton,
                  { backgroundColor: theme.surface },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={22} color={theme.text} />
              </TouchableOpacity>

              <View style={styles.enhancedHeaderTitleSection}>
                <Text
                  style={[styles.enhancedHeaderTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {currentRoadmap.topic}
                </Text>
                <View style={styles.enhancedHeaderMeta}>
                  <Text
                    style={[
                      styles.enhancedHeaderSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {currentRoadmap.steps?.length || 0} steps
                  </Text>
                  <View style={styles.headerDivider} />
                  <Text
                    style={[
                      styles.enhancedHeaderSubtitle,
                      { color: getProgressColor(currentRoadmap.progress || 0) },
                    ]}
                  >
                    {Math.round(currentRoadmap.progress || 0)}% complete
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.enhancedHeaderProgressContainer}>
              <View
                style={[
                  styles.enhancedHeaderProgressBar,
                  { backgroundColor: theme.border },
                ]}
              >
                <LinearGradient
                  colors={[
                    getProgressColor(currentRoadmap.progress || 0),
                    getProgressColor(currentRoadmap.progress || 0) + "80",
                  ]}
                  style={[
                    styles.enhancedHeaderProgressFill,
                    { width: `${currentRoadmap.progress || 0}%` },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Steps List */}
        <ScrollView
          style={styles.enhancedStepsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              progressBackgroundColor={theme.surface}
            />
          }
          contentContainerStyle={styles.stepsScrollContent}
        >
          {currentRoadmap.steps?.map((step, index) =>
            renderEnhancedStepCard(step, index)
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
          translucent={false}
        />

        {!currentRoadmap && renderSearchHeader()}

        {currentRoadmap ? renderCurrentRoadmap() : renderRoadmapsList()}

        {/* Loading Overlay */}
        {loading && (
          <LoadingSpinner message="🚀 Generating your personalized roadmap..." />
        )}

        {/* Enhanced Code Modal */}
        <Modal
          visible={codeModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setCodeModalVisible(false)}
        >
          <View
            style={[
              styles.enhancedCodeModal,
              { backgroundColor: theme.background },
            ]}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + "80"]}
              style={styles.enhancedCodeModalHeader}
            >
              <SafeAreaView style={styles.modalHeaderSafeArea}>
                <View style={styles.enhancedCodeModalHeaderContent}>
                  <Text
                    style={[
                      styles.enhancedCodeModalTitle,
                      { color: theme.text },
                    ]}
                  >
                    📄 Code Example
                  </Text>
                  <View style={styles.enhancedCodeModalActions}>
                    <TouchableOpacity
                      onPress={() => copyCode(selectedCode)}
                      style={[
                        styles.enhancedCodeModalButton,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Ionicons name="copy-outline" size={16} color="#fff" />
                      <Text style={styles.enhancedCodeModalButtonText}>
                        Copy
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCodeModalVisible(false)}
                      style={[
                        styles.enhancedCodeModalButton,
                        { backgroundColor: theme.textSecondary },
                      ]}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.enhancedCodeModalContent}>
              <View
                style={[
                  styles.enhancedCodeBlock,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Text
                  style={[styles.enhancedCodeBlockText, { color: theme.text }]}
                >
                  {selectedCode}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Enhanced Toast Message */}
        {toastMessage && (
          <View style={styles.enhancedToastContainer}>
            <LinearGradient
              colors={
                toastMessage.type === "success"
                  ? [theme.success, theme.success + "E0"]
                  : [theme.error, theme.error + "E0"]
              }
              style={styles.enhancedToast}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.enhancedToastText}>
                {toastMessage.text || toastMessage}
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  },

  // Header Styles (matching LearningScreen)
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  // Search Styles
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    minHeight: 20,
  },
  clearButton: {
    padding: 4,
  },
  generateButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 32,
    borderRadius: 24,
    maxWidth: width - 80,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  emptyActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Enhanced Roadmap Cards
  roadmapsList: {
    paddingBottom: 100,
  },
  enhancedRoadmapCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  roadmapCardTouchable: {
    padding: 20,
  },
  enhancedCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 8,
  },
  cardTitleSection: {
    flex: 1,
  },
  enhancedCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: "600",
  },
  updatedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  updatedText: {
    fontSize: 12,
    fontWeight: "500",
  },
  enhancedDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Enhanced Progress Section
  enhancedProgressSection: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  enhancedProgressText: {
    fontSize: 16,
    fontWeight: "700",
  },
  enhancedProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  enhancedProgressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Enhanced Stats Section
  enhancedStatsSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  enhancedStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  enhancedStatText: {
    fontSize: 16,
    fontWeight: "700",
  },
  enhancedStatLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Enhanced Current Roadmap
  enhancedCurrentRoadmapContainer: {
    flex: 1,
  },
  enhancedRoadmapHeader: {
    paddingBottom: 16,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  enhancedHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  enhancedBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedHeaderTitleSection: {
    flex: 1,
  },
  enhancedHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    lineHeight: 28,
  },
  enhancedHeaderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enhancedHeaderSubtitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#94a3b8",
  },
  enhancedHeaderProgressContainer: {
    marginTop: 8,
  },
  enhancedHeaderProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  enhancedHeaderProgressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Enhanced Steps
  enhancedStepsContainer: {
    flex: 1,
  },
  stepsScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  enhancedStepCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  enhancedStepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 16,
  },
  enhancedCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  enhancedStepTitleContainer: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  enhancedStepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginRight: 12,
  },
  stepActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepDuration: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Enhanced Step Content
  enhancedStepContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  enhancedDetailsContainer: {
    marginBottom: 16,
  },
  enhancedDetailsText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },

  // Enhanced Code Container
  enhancedCodeContainer: {
    marginTop: 16,
  },
  enhancedCodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  codeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enhancedCodeLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  enhancedCopyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  enhancedCopyButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  enhancedCodePreview: {
    borderRadius: 12,
    padding: 16,
    position: "relative",
  },
  enhancedCodeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  enhancedExpandCodeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  expandCodeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Resources
  resourcesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  resourceItem: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    lineHeight: 18,
  },

  // Enhanced Notes
  enhancedNotesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  enhancedNotesLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  enhancedNotesInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    maxHeight: 200,
  },

  // Enhanced Code Modal
  enhancedCodeModal: {
    flex: 1,
  },
  enhancedCodeModalHeader: {
    paddingBottom: 16,
  },
  modalHeaderSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  enhancedCodeModalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  enhancedCodeModalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  enhancedCodeModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  enhancedCodeModalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  enhancedCodeModalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  enhancedCodeModalContent: {
    flex: 1,
    padding: 20,
  },
  enhancedCodeBlock: {
    borderRadius: 16,
    padding: 20,
  },
  enhancedCodeBlockText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
    lineHeight: 22,
  },

  // Enhanced Toast
  enhancedToastContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 1001,
  },
  enhancedToast: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enhancedToastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default RoadmapScreen;
