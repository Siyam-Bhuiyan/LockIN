import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import TaskItem from "./TaskItem";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const cardPadding = isTablet ? 28 : 24;

const ProjectCard = ({
  project,
  onTaskToggle,
  onTaskDelete,
  onTaskEdit,
  onAddTask,
  onDelete,
  onEdit,
}) => {
  const { theme, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Memoized calculations
  const taskStats = useMemo(() => {
    const tasks = project.tasks || [];
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks ? completedTasks / totalTasks : 0;

    return {
      completed: completedTasks,
      total: totalTasks,
      progress,
      remaining: totalTasks - completedTasks,
    };
  }, [project.tasks]);

  const toggleExpanded = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);

    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isExpanded, animation]);

  const getStatusConfig = useCallback(() => {
    const configs = {
      completed: {
        color: "#10B981",
        icon: "checkmark-circle",
        label: "Completed",
      },
      "in-progress": {
        color: "#F59E0B",
        icon: "play-circle",
        label: "In Progress",
      },
      planning: { color: "#3B82F6", icon: "bulb", label: "Planning" },
      "on-hold": { color: "#EF4444", icon: "pause-circle", label: "On Hold" },
    };
    return (
      configs[project.status] || {
        color: "#6B7280",
        icon: "help-circle",
        label: "Unknown",
      }
    );
  }, [project.status]);

  const getPriorityConfig = useCallback(() => {
    const configs = {
      High: { color: "#DC2626", level: 3 },
      Medium: { color: "#D97706", level: 2 },
      Low: { color: "#059669", level: 1 },
    };
    return configs[project.priority] || { color: "#6B7280", level: 0 };
  }, [project.priority]);

  const getTypeGradient = useCallback(() => {
    return project.type === "varsity"
      ? ["#667eea", "#764ba2"]
      : ["#f093fb", "#f5576c"];
  }, [project.type]);

  const getCardGradient = useCallback(() => {
    if (isDark) {
      return ["#1f2937", "#111827"];
    }
    return ["#ffffff", "#f8fafc"];
  }, [isDark]);

  const handleGitHubPress = useCallback(async () => {
    if (!project.githubLink) return;

    try {
      const supported = await Linking.canOpenURL(project.githubLink);
      if (supported) {
        await Linking.openURL(project.githubLink);
      } else {
        Alert.alert("Error", "Cannot open GitHub link");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open GitHub link");
    }
  }, [project.githubLink]);

  const handleLongPress = useCallback(() => {
    Alert.alert("Project Options", project.title, [
      { text: "Cancel", style: "cancel" },
      ...(onEdit ? [{ text: "Edit", onPress: () => onEdit(project) }] : []),
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(project.id),
      },
    ]);
  }, [project, onEdit, onDelete]);

  const statusConfig = getStatusConfig();
  const priorityConfig = getPriorityConfig();

  const tasksHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(400, taskStats.total * 90 + 140)],
  });

  const rotateArrow = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onLongPress={handleLongPress}
      activeOpacity={0.95}
    >
      <LinearGradient colors={getCardGradient()} style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleSection}>
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={2}
              >
                {project.title}
              </Text>
              <Text
                style={[styles.description, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {project.description || "No description provided"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {project.githubLink && (
              <TouchableOpacity
                onPress={handleGitHubPress}
                style={[styles.actionButton, { backgroundColor: "#24292e" }]}
              >
                <Ionicons name="logo-github" size={18} color="#ffffff" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={toggleExpanded}
              style={[styles.expandButton, { backgroundColor: theme.primary }]}
            >
              <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
                <Ionicons name="chevron-down" size={20} color="#ffffff" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge Row */}
        <View style={styles.badgeRow}>
          <View style={styles.leftBadges}>
            {/* Type Badge */}
            <LinearGradient colors={getTypeGradient()} style={styles.typeBadge}>
              <Ionicons
                name={project.type === "varsity" ? "school" : "person"}
                size={12}
                color="#ffffff"
              />
              <Text style={styles.typeText}>{project.type}</Text>
            </LinearGradient>

            {/* Priority Badge */}
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityConfig.color },
              ]}
            >
              <View style={styles.priorityDots}>
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.priorityDot,
                      {
                        backgroundColor:
                          i < priorityConfig.level
                            ? "#ffffff"
                            : "rgba(255,255,255,0.3)",
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.priorityText}>{project.priority}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.color },
            ]}
          >
            <Ionicons name={statusConfig.icon} size={12} color="#ffffff" />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.success}
              />
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                Progress
              </Text>
            </View>

            <View style={styles.taskCount}>
              <Text style={[styles.progressValue, { color: theme.primary }]}>
                {taskStats.completed}
              </Text>
              <Text
                style={[
                  styles.progressSeparator,
                  { color: theme.textSecondary },
                ]}
              >
                /
              </Text>
              <Text style={[styles.progressTotal, { color: theme.text }]}>
                {taskStats.total}
              </Text>
              <Text
                style={[styles.progressUnit, { color: theme.textSecondary }]}
              >
                tasks
              </Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarBackground,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${Math.round(taskStats.progress * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressFooter}>
            <Text style={[styles.percentageText, { color: theme.primary }]}>
              {Math.round(taskStats.progress * 100)}% Complete
            </Text>
            {taskStats.total > 0 && (
              <Text
                style={[styles.remainingText, { color: theme.textSecondary }]}
              >
                {taskStats.remaining} remaining
              </Text>
            )}
          </View>
        </View>

        {/* Metadata Row */}
        <View style={styles.metaRow}>
          {project.category && (
            <View style={styles.metaItem}>
              <Ionicons name="bookmark" size={14} color={theme.info} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {project.category}
              </Text>
            </View>
          )}

          {project.estimatedHours && (
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={theme.warning} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {project.estimatedHours}h
              </Text>
            </View>
          )}

          {project.techStack && (
            <View style={styles.metaItem}>
              <Ionicons name="code-slash" size={14} color={theme.primary} />
              <Text
                style={[styles.metaText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {project.techStack}
              </Text>
            </View>
          )}

          {project.collaborators && (
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={theme.secondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {project.collaborators}
              </Text>
            </View>
          )}
        </View>

        {/* Dates Row */}
        {(project.startDate || project.endDate) && (
          <View style={styles.datesRow}>
            {project.startDate && (
              <View style={styles.dateItem}>
                <Ionicons name="play" size={12} color={theme.success} />
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  Started: {project.startDate}
                </Text>
              </View>
            )}
            {project.endDate && (
              <View style={styles.dateItem}>
                <Ionicons name="flag" size={12} color={theme.warning} />
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  Due: {project.endDate}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Expandable Tasks Section */}
        <Animated.View style={[styles.tasksContainer, { height: tasksHeight }]}>
          <View style={[styles.tasksHeader, { borderTopColor: theme.border }]}>
            <View style={styles.tasksTitle}>
              <Ionicons name="list" size={18} color={theme.primary} />
              <Text style={[styles.tasksSectionTitle, { color: theme.text }]}>
                Tasks ({taskStats.total})
              </Text>
              {taskStats.total > 0 && (
                <View style={styles.tasksProgress}>
                  <View
                    style={[
                      styles.tasksProgressDot,
                      {
                        backgroundColor:
                          taskStats.progress === 1
                            ? theme.success
                            : taskStats.progress > 0.5
                            ? theme.warning
                            : theme.info,
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => onAddTask(project.id)}
              style={[
                styles.addTaskBtn,
                { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addTaskText, { color: theme.primary }]}>
                Add Task
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {taskStats.total === 0 ? (
              <View style={styles.emptyTasks}>
                <Ionicons
                  name="clipboard-outline"
                  size={40}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No tasks yet
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Tap "Add Task" to get started
                </Text>
              </View>
            ) : (
              project.tasks?.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onTaskToggle(project.id, task.id)}
                  onDelete={() => onTaskDelete(project.id, task.id)}
                  onEdit={
                    onTaskEdit ? () => onTaskEdit(project.id, task) : undefined
                  }
                  index={index}
                />
              ))
            )}
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    marginHorizontal: 0,
  },
  card: {
    borderRadius: 20,
    padding: cardPadding,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "800",
    lineHeight: isTablet ? 28 : 26,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  leftBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityDots: {
    flexDirection: "row",
    gap: 2,
  },
  priorityDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  priorityText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  taskCount: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressSeparator: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressUnit: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 2,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
    minWidth: "2%",
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: isTablet ? "22%" : "45%",
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  datesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tasksContainer: {
    overflow: "hidden",
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  tasksTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tasksSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  tasksProgress: {
    marginLeft: 4,
  },
  tasksProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addTaskText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tasksList: {
    gap: 8,
  },
  emptyTasks: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default ProjectCard;
