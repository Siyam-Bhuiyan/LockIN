import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import TaskItem from "./TaskItem";

const ExpandedProjectView = ({
  project,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onClose,
}) => {
  const { theme, isDark } = useTheme();

  const getStatusColor = () => {
    switch (project.status) {
      case "completed":
        return theme.success;
      case "in-progress":
        return theme.warning;
      case "planning":
        return theme.info;
      default:
        return theme.primary;
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case "High":
        return "#FF4757";
      case "Medium":
        return "#FFA726";
      case "Low":
        return "#66BB6A";
      default:
        return theme.textSecondary;
    }
  };

  const completedTasks = project.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progress = totalTasks ? completedTasks / totalTasks : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[
          isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
          isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.8)",
        ]}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {project.title}
          </Text>
          <TouchableOpacity
            onPress={onAddTask}
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Project Info Section */}
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.badgesRow}>
              <View style={styles.badges}>
                <View
                  style={[
                    styles.typeTag,
                    {
                      backgroundColor:
                        project.type === "varsity"
                          ? theme.primary
                          : theme.secondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={project.type === "varsity" ? "school" : "person"}
                    size={12}
                    color="#ffffff"
                  />
                  <Text style={styles.typeText}>{project.type}</Text>
                </View>

                {project.priority && (
                  <View
                    style={[
                      styles.priorityTag,
                      { backgroundColor: getPriorityColor() },
                    ]}
                  >
                    <Ionicons name="flag" size={10} color="#ffffff" />
                    <Text style={styles.priorityText}>{project.priority}</Text>
                  </View>
                )}

                {project.status && (
                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: getStatusColor() },
                    ]}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: "#ffffff" }]}
                    />
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                )}
              </View>
            </View>

            {project.description && (
              <Text
                style={[styles.description, { color: theme.textSecondary }]}
              >
                {project.description}
              </Text>
            )}

            {/* Progress Overview */}
            <View style={styles.progressOverview}>
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.success}
                  />
                  <Text style={[styles.statValue, { color: theme.success }]}>
                    {completedTasks}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    Complete
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color={theme.warning} />
                  <Text style={[styles.statValue, { color: theme.warning }]}>
                    {totalTasks - completedTasks}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    Remaining
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={theme.primary}
                  />
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    Progress
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            {(project.category || project.techStack || project.github) && (
              <View style={styles.additionalInfo}>
                {project.category && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="folder-outline"
                      size={16}
                      color={theme.accent}
                    />
                    <Text
                      style={[styles.infoText, { color: theme.textSecondary }]}
                    >
                      {project.category}
                    </Text>
                  </View>
                )}
                {project.techStack && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="code-outline"
                      size={16}
                      color={theme.info}
                    />
                    <Text
                      style={[styles.infoText, { color: theme.textSecondary }]}
                    >
                      {project.techStack}
                    </Text>
                  </View>
                )}
                {project.github && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="logo-github"
                      size={16}
                      color={theme.accent}
                    />
                    <Text
                      style={[styles.infoText, { color: theme.accent }]}
                      numberOfLines={1}
                    >
                      {project.github}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Tasks Section */}
          <View style={[styles.tasksCard, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="list" size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Tasks ({totalTasks})
                </Text>
              </View>
              <TouchableOpacity
                onPress={onAddTask}
                style={[
                  styles.addTaskBtn,
                  { backgroundColor: `${theme.primary}15` },
                ]}
              >
                <Ionicons name="add" size={16} color={theme.primary} />
                <Text style={[styles.addTaskText, { color: theme.primary }]}>
                  Add Task
                </Text>
              </TouchableOpacity>
            </View>

            {project.tasks && project.tasks.length > 0 ? (
              <View style={styles.tasksList}>
                {project.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask(project.id, task.id)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(project.id, task.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTasks}>
                <Ionicons
                  name="clipboard-outline"
                  size={48}
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
                  Add your first task to get started
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    gap: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  badgesRow: {
    marginBottom: 16,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  priorityTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  progressOverview: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  additionalInfo: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  tasksCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tasksList: {
    gap: 8,
  },
  emptyTasks: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default ExpandedProjectView;
