import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  LayoutAnimation,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const TaskItem = ({ task, onToggle, onDelete, onEdit, index = 0 }) => {
  const { theme, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const taskConfig = useMemo(() => {
    const priorityConfigs = {
      High: { color: "#FF4757", icon: "alert-circle", level: 3 },
      Medium: { color: "#FFA726", icon: "warning", level: 2 },
      Low: { color: "#66BB6A", icon: "checkmark-circle", level: 1 },
    };

    const statusConfigs = {
      completed: {
        color: theme.success,
        icon: "checkmark-circle-outline",
        label: "Done",
      },
      "in-progress": {
        color: theme.warning,
        icon: "play-circle-outline",
        label: "Active",
      },
      todo: { color: theme.info, icon: "ellipse-outline", label: "Todo" },
      blocked: {
        color: theme.error,
        icon: "close-circle-outline",
        label: "Blocked",
      },
    };

    return {
      priority: priorityConfigs[task.priority] || {
        color: theme.textSecondary,
        icon: "help-circle",
        level: 0,
      },
      status: statusConfigs[task.status] || {
        color: theme.textSecondary,
        icon: "help-circle",
        label: "Unknown",
      },
    };
  }, [task.priority, task.status, theme]);

  const handlePress = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  }, [onToggle]);

  const handleLongPress = useCallback(() => {
    Alert.alert("Task Options", task.title, [
      { text: "Cancel", style: "cancel" },
      ...(onEdit ? [{ text: "Edit", onPress: () => onEdit(task) }] : []),
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: onDelete,
              },
            ]
          );
        },
      },
    ]);
  }, [task, onEdit, onDelete]);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays === -1) return "Yesterday";
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < 0 && diffDays >= -7)
        return `${Math.abs(diffDays)} days ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }, []);

  const isOverdue = useMemo(() => {
    if (!task.deadline || task.completed) return false;
    return new Date(task.deadline) < new Date();
  }, [task.deadline, task.completed]);

  const getContainerStyle = useCallback(() => {
    const baseStyle = {
      backgroundColor: task.completed ? `${theme.success}08` : theme.surface,
      borderColor: task.completed
        ? theme.success
        : isOverdue
        ? theme.error
        : theme.border,
      opacity: task.completed ? 0.85 : 1,
    };

    if (isOverdue && !task.completed) {
      baseStyle.borderWidth = 2;
      baseStyle.backgroundColor = `${theme.error}05`;
    }

    return baseStyle;
  }, [task.completed, isOverdue, theme]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.container, getContainerStyle()]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        delayLongPress={500}
      >
        <LinearGradient
          colors={[
            task.completed
              ? `${theme.success}03`
              : isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.8)",
            task.completed
              ? `${theme.success}01`
              : isDark
              ? "rgba(255,255,255,0.01)"
              : "rgba(248,250,252,0.4)",
          ]}
          style={styles.gradientOverlay}
        >
          {/* Checkbox */}
          <TouchableOpacity onPress={handlePress} style={styles.checkbox}>
            <Animated.View
              style={[
                styles.checkboxCircle,
                {
                  backgroundColor: task.completed
                    ? theme.success
                    : "transparent",
                  borderColor: task.completed ? theme.success : theme.border,
                  borderWidth: task.completed ? 0 : 2,
                },
              ]}
            >
              {task.completed && (
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            {/* Title and Priority Row */}
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: task.completed ? theme.textSecondary : theme.text,
                    textDecorationLine: task.completed
                      ? "line-through"
                      : "none",
                  },
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>

              {task.priority && (
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: taskConfig.priority.color },
                  ]}
                >
                  <View style={styles.priorityIndicator}>
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.priorityDot,
                          {
                            backgroundColor:
                              i < taskConfig.priority.level
                                ? "#ffffff"
                                : "rgba(255,255,255,0.3)",
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {task.description && (
              <Text
                style={[styles.description, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}

            {/* Meta Information */}
            <View style={styles.metaRow}>
              <View style={styles.metaLeft}>
                {/* Status */}
                {task.status && (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name={taskConfig.status.icon}
                      size={12}
                      color={taskConfig.status.color}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: taskConfig.status.color },
                      ]}
                    >
                      {taskConfig.status.label}
                    </Text>
                  </View>
                )}

                {/* Deadline */}
                {task.deadline && (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={isOverdue ? theme.error : theme.warning}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        {
                          color: isOverdue ? theme.error : theme.warning,
                          fontWeight: isOverdue ? "600" : "500",
                        },
                      ]}
                    >
                      {formatDate(task.deadline)}
                    </Text>
                    {isOverdue && !task.completed && (
                      <View
                        style={[
                          styles.overdueIndicator,
                          { backgroundColor: theme.error },
                        ]}
                      />
                    )}
                  </View>
                )}

                {/* Estimated Time */}
                {task.estimatedTime && (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="hourglass-outline"
                      size={12}
                      color={theme.info}
                    />
                    <Text
                      style={[styles.metaText, { color: theme.textSecondary }]}
                    >
                      {task.estimatedTime}
                    </Text>
                  </View>
                )}
              </View>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {task.tags.slice(0, 2).map((tag, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.tag,
                        { backgroundColor: `${theme.primary}15` },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: theme.primary }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                  {task.tags.length > 2 && (
                    <Text
                      style={[
                        styles.moreTagsText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      +{task.tags.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Progress Bar (if task has subtasks) */}
            {task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksProgress}>
                <View style={styles.progressRow}>
                  <Text
                    style={[
                      styles.subtasksLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Subtasks
                  </Text>
                  <Text
                    style={[styles.subtasksCount, { color: theme.primary }]}
                  >
                    {task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length}
                  </Text>
                </View>
                <View
                  style={[
                    styles.subtasksBar,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <View
                    style={[
                      styles.subtasksBarFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${
                          (task.subtasks.filter((st) => st.completed).length /
                            task.subtasks.length) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Delete Task",
                  "Are you sure you want to delete this task?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: onDelete,
                    },
                  ]
                );
              }}
              style={[
                styles.actionBtn,
                { backgroundColor: `${theme.error}15` },
              ]}
            >
              <Ionicons name="trash-outline" size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: "hidden",
  },
  gradientOverlay: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
    lineHeight: isTablet ? 20 : 18,
    flex: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    marginTop: 2,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  priorityIndicator: {
    flexDirection: "row",
    gap: 1,
  },
  priorityDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },
  priorityText: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    gap: 8,
  },
  metaLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  metaText: {
    fontSize: 10,
    fontWeight: "500",
  },
  overdueIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "600",
  },
  moreTagsText: {
    fontSize: 9,
    fontWeight: "500",
  },
  subtasksProgress: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subtasksLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  subtasksCount: {
    fontSize: 10,
    fontWeight: "700",
  },
  subtasksBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  subtasksBarFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  actions: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TaskItem;
