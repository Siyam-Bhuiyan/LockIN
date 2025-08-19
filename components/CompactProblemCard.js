import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getDifficultyColor } from "../data/neetcodeProblems";

const CompactProblemCard = ({
  problem,
  isCompleted,
  onToggleStatus,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    titleContainer: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
      textDecorationLine: isCompleted ? "line-through" : "none",
      opacity: isCompleted ? 0.6 : 1,
    },
    category: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textTertiary,
    },
    rightSection: {
      alignItems: "flex-end",
      gap: 8,
    },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: getDifficultyColor(problem.difficulty) + "20",
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "700",
      color: getDifficultyColor(problem.difficulty),
    },
    statusButton: {
      padding: 4,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      flex: 1,
    },
    tag: {
      backgroundColor: theme.accent + "10",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    tagText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.accent,
    },
    viewButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 4,
    },
    viewButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.primary,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{problem.title}</Text>
          <Text style={styles.category}>{problem.category}</Text>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{problem.difficulty}</Text>
          </View>
          <TouchableOpacity
            style={styles.statusButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleStatus(problem.id);
            }}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isCompleted ? theme.success : theme.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {problem.tags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {problem.tags?.length > 3 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{problem.tags.length - 3}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View</Text>
          <Ionicons name="chevron-forward" size={12} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CompactProblemCard;
