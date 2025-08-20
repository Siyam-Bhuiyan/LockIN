import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StorageService from "../services/StorageService";

const CPTrackerScreen = () => {
  const { theme } = useTheme();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    platform: "All",
    status: "All",
    difficulty: "All",
  });
  const [newProblem, setNewProblem] = useState({
    name: "",
    platform: "LeetCode",
    link: "",
    difficulty: "Medium",
    status: "Unsolved",
    notes: "",
    tags: "",
  });

  const platforms = [
    "All",
    "LeetCode",
    "Codeforces",
    "AtCoder",
    "HackerRank",
    "Other",
  ];
  const statuses = ["All", "Solved", "Unsolved", "To Revisit"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, filters]);

  const loadProblems = async () => {
    const savedProblems = await StorageService.getProblems();
    setProblems(savedProblems);
  };

  const saveProblems = async (updatedProblems) => {
    await StorageService.saveProblems(updatedProblems);
    setProblems(updatedProblems);
  };

  const filterProblems = () => {
    let filtered = problems;

    if (filters.platform !== "All") {
      filtered = filtered.filter((p) => p.platform === filters.platform);
    }
    if (filters.status !== "All") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }
    if (filters.difficulty !== "All") {
      filtered = filtered.filter((p) => p.difficulty === filters.difficulty);
    }

    setFilteredProblems(filtered);
  };

  const addProblem = async () => {
    if (!newProblem.name.trim()) {
      Alert.alert("Error", "Please enter problem name");
      return;
    }

    const problem = {
      id: Date.now().toString(),
      ...newProblem,
      createdAt: new Date().toISOString(),
    };

    const updatedProblems = [...problems, problem];
    await saveProblems(updatedProblems);
    setModalVisible(false);
    setNewProblem({
      name: "",
      platform: "LeetCode",
      link: "",
      difficulty: "Medium",
      status: "Unsolved",
      notes: "",
      tags: "",
    });
  };

  const updateProblemStatus = async (problemId, newStatus) => {
    const updatedProblems = problems.map((problem) =>
      problem.id === problemId ? { ...problem, status: newStatus } : problem
    );
    await saveProblems(updatedProblems);
  };

  const deleteProblem = (problemId) => {
    Alert.alert(
      "Delete Problem",
      "Are you sure you want to delete this problem?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedProblems = problems.filter((p) => p.id !== problemId);
            await saveProblems(updatedProblems);
          },
        },
      ]
    );
  };

  const openLink = (link) => {
    if (link) {
      Linking.openURL(link).catch(() => {
        Alert.alert("Error", "Cannot open this link");
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Solved":
        return theme.success;
      case "To Revisit":
        return theme.warning;
      default:
        return theme.error;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return theme.success;
      case "Hard":
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const ProblemCard = ({ problem }) => (
    <Card style={styles.problemCard}>
      <View style={styles.problemHeader}>
        <View style={styles.problemTitleRow}>
          <Text
            style={[styles.problemName, { color: theme.text }]}
            numberOfLines={1}
          >
            {problem.name}
          </Text>
          <TouchableOpacity
            onPress={() => deleteProblem(problem.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.problemMeta}>
          <View style={styles.tagsRow}>
            <View
              style={[
                styles.platformTag,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.primary }]}>
                {problem.platform}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyTag,
                {
                  backgroundColor:
                    getDifficultyColor(problem.difficulty) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: getDifficultyColor(problem.difficulty) },
                ]}
              >
                {problem.difficulty}
              </Text>
            </View>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: getStatusColor(problem.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: getStatusColor(problem.status) },
                ]}
              >
                {problem.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {(problem.tags || problem.notes) && (
        <View style={styles.problemDetails}>
          {problem.tags && (
            <Text
              style={[styles.detailText, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              🏷️ {problem.tags}
            </Text>
          )}
          {problem.notes && (
            <Text
              style={[styles.detailText, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              📝 {problem.notes}
            </Text>
          )}
        </View>
      )}

      <View style={styles.problemActions}>
        {problem.link && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => openLink(problem.link)}
          >
            <Ionicons name="link-outline" size={14} color="#ffffff" />
            <Text style={styles.actionText}>Open</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor:
                problem.status === "Solved" ? theme.success : theme.secondary,
            },
          ]}
          onPress={() =>
            updateProblemStatus(
              problem.id,
              problem.status === "Solved" ? "Unsolved" : "Solved"
            )
          }
        >
          <Ionicons
            name={
              problem.status === "Solved" ? "checkmark-outline" : "play-outline"
            }
            size={14}
            color="#ffffff"
          />
          <Text style={styles.actionText}>
            {problem.status === "Solved" ? "Solved" : "Solve"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.warning }]}
          onPress={() => updateProblemStatus(problem.id, "To Revisit")}
        >
          <Ionicons name="bookmark-outline" size={14} color="#ffffff" />
          <Text style={styles.actionText}>Revisit</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const FilterChip = ({ label, value, options, onSelect }) => (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: theme.text }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  value === option ? theme.accent : theme.background,
                borderColor: value === option ? theme.accent : theme.border,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: value === option ? "#ffffff" : theme.text },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const FilterModal = () => (
    <Modal
      isVisible={filterModalVisible}
      onBackdropPress={() => setFilterModalVisible(false)}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.filterModalContent}>
        <View style={styles.filterModalHeader}>
          <Text style={[styles.filterModalTitle, { color: theme.text }]}>
            Filter Problems
          </Text>
          <TouchableOpacity
            onPress={() => setFilterModalVisible(false)}
            style={styles.filterModalClose}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <FilterChip
          label="Platform"
          value={filters.platform}
          options={platforms}
          onSelect={(option) => setFilters({ ...filters, platform: option })}
        />
        <FilterChip
          label="Status"
          value={filters.status}
          options={statuses}
          onSelect={(option) => setFilters({ ...filters, status: option })}
        />
        <FilterChip
          label="Difficulty"
          value={filters.difficulty}
          options={difficulties}
          onSelect={(option) => setFilters({ ...filters, difficulty: option })}
        />

        <View style={styles.filterModalActions}>
          <TouchableOpacity
            style={[styles.filterResetButton, { borderColor: theme.border }]}
            onPress={() =>
              setFilters({ platform: "All", status: "All", difficulty: "All" })
            }
          >
            <Text
              style={[styles.filterResetText, { color: theme.textSecondary }]}
            >
              Reset Filters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterApplyButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.filterApplyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      position: "relative",
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    filterIndicator: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    addButton: {
      backgroundColor: theme.success,
      borderRadius: 12,
      padding: 10,
    },
    filtersContainer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    filterGroup: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    filterScrollView: {
      flexGrow: 0,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: "600",
    },
    // Filter Modal Styles
    filterModalContent: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 20,
      maxHeight: "70%",
    },
    filterModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    filterModalTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    filterModalClose: {
      padding: 4,
    },
    filterModalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },
    filterResetButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
    },
    filterResetText: {
      fontSize: 14,
      fontWeight: "600",
    },
    filterApplyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    filterApplyText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#ffffff",
    },
    statsContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
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
    problemCard: {
      marginBottom: 12,
    },
    problemHeader: {
      marginBottom: 12,
    },
    problemTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    problemName: {
      fontSize: 16,
      fontWeight: "700",
      flex: 1,
      marginRight: 12,
    },
    problemMeta: {
      marginBottom: 8,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    platformTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    difficultyTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 11,
      fontWeight: "600",
    },
    deleteButton: {
      padding: 4,
    },
    problemDetails: {
      marginBottom: 12,
      gap: 4,
    },
    detailText: {
      fontSize: 12,
      lineHeight: 16,
    },
    problemActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      color: theme.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      maxHeight: "85%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    selectorContainer: {
      marginBottom: 16,
    },
    selectorLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    selectorRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    selectorOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    selectorOptionText: {
      fontSize: 14,
      fontWeight: "600",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
  });

  const getStats = () => {
    const solved = problems.filter((p) => p.status === "Solved").length;
    const toRevisit = problems.filter((p) => p.status === "To Revisit").length;
    const unsolved = problems.filter((p) => p.status === "Unsolved").length;
    return { solved, toRevisit, unsolved, total: problems.length };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 CP Tracker</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter-outline" size={20} color={theme.text} />
            <Text style={[styles.filterButtonText, { color: theme.text }]}>
              Filter
            </Text>
            {(filters.platform !== "All" ||
              filters.status !== "All" ||
              filters.difficulty !== "All") && (
              <View
                style={[
                  styles.filterIndicator,
                  { backgroundColor: theme.accent },
                ]}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {stats.solved}
            </Text>
            <Text style={styles.statLabel}>Solved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              {stats.toRevisit}
            </Text>
            <Text style={styles.statLabel}>To Revisit</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.error }]}>
              {stats.unsolved}
            </Text>
            <Text style={styles.statLabel}>Unsolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {filteredProblems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}

        {filteredProblems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {problems.length === 0
                ? "No problems yet. Add your first problem!"
                : "No problems match the current filters"}
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal />

      {/* Add Problem Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Problem</Text>

              <TextInput
                style={styles.input}
                placeholder="Problem Name"
                placeholderTextColor={theme.textSecondary}
                value={newProblem.name}
                onChangeText={(text) =>
                  setNewProblem({ ...newProblem, name: text })
                }
              />

              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Platform</Text>
                <View style={styles.selectorRow}>
                  {platforms.slice(1).map((platform) => (
                    <TouchableOpacity
                      key={platform}
                      style={[
                        styles.selectorOption,
                        {
                          backgroundColor:
                            newProblem.platform === platform
                              ? theme.primary
                              : "transparent",
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => setNewProblem({ ...newProblem, platform })}
                    >
                      <Text
                        style={[
                          styles.selectorOptionText,
                          {
                            color:
                              newProblem.platform === platform
                                ? "#ffffff"
                                : theme.primary,
                          },
                        ]}
                      >
                        {platform}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Difficulty</Text>
                <View style={styles.selectorRow}>
                  {difficulties.slice(1).map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.selectorOption,
                        {
                          backgroundColor:
                            newProblem.difficulty === difficulty
                              ? getDifficultyColor(difficulty)
                              : "transparent",
                          borderColor: getDifficultyColor(difficulty),
                        },
                      ]}
                      onPress={() =>
                        setNewProblem({ ...newProblem, difficulty })
                      }
                    >
                      <Text
                        style={[
                          styles.selectorOptionText,
                          {
                            color:
                              newProblem.difficulty === difficulty
                                ? "#ffffff"
                                : getDifficultyColor(difficulty),
                          },
                        ]}
                      >
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Problem Link (optional)"
                placeholderTextColor={theme.textSecondary}
                value={newProblem.link}
                onChangeText={(text) =>
                  setNewProblem({ ...newProblem, link: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (e.g., Array, DP, Graph)"
                placeholderTextColor={theme.textSecondary}
                value={newProblem.tags}
                onChangeText={(text) =>
                  setNewProblem({ ...newProblem, tags: text })
                }
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (approach, learnings, etc.)"
                placeholderTextColor={theme.textSecondary}
                value={newProblem.notes}
                onChangeText={(text) =>
                  setNewProblem({ ...newProblem, notes: text })
                }
                multiline
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Add Problem"
                  onPress={addProblem}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CPTrackerScreen;
