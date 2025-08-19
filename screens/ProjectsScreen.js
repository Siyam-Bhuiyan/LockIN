import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import TaskModal from "../components/TaskModal";

const { width: screenWidth } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

const ProjectsScreen = () => {
  const { theme, isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          project.techStack?.toLowerCase().includes(query) ||
          project.category?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((project) => project.type === filterType);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
          );
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );
        case "progress":
          const getProgress = (p) => {
            const total = p.tasks?.length || 0;
            const completed = p.tasks?.filter((t) => t.completed).length || 0;
            return total ? completed / total : 0;
          };
          return getProgress(b) - getProgress(a);
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, filterType, sortBy]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedProjects = await StorageService.getProjects();
      setProjects(savedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      Alert.alert("Error", "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProjects = useCallback(async (updatedProjects) => {
    try {
      await StorageService.saveProjects(updatedProjects);
      setProjects(updatedProjects);
    } catch (error) {
      console.error("Error saving projects:", error);
      Alert.alert("Error", "Failed to save projects");
      throw error;
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProjects();
    setIsRefreshing(false);
  }, [loadProjects]);

  // Task management functions with error handling
  const toggleTask = useCallback(
    async (projectId, taskId) => {
      try {
        const updatedProjects = projects.map((project) => {
          if (project.id === projectId) {
            const updatedTasks =
              project.tasks?.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ) || [];
            return {
              ...project,
              tasks: updatedTasks,
              updatedAt: new Date().toISOString(),
            };
          }
          return project;
        });
        await saveProjects(updatedProjects);
      } catch (error) {
        Alert.alert("Error", "Failed to update task");
      }
    },
    [projects, saveProjects]
  );

  const deleteTask = useCallback(
    async (projectId, taskId) => {
      try {
        const updatedProjects = projects.map((project) => {
          if (project.id === projectId) {
            const updatedTasks =
              project.tasks?.filter((task) => task.id !== taskId) || [];
            return {
              ...project,
              tasks: updatedTasks,
              updatedAt: new Date().toISOString(),
            };
          }
          return project;
        });
        await saveProjects(updatedProjects);
      } catch (error) {
        Alert.alert("Error", "Failed to delete task");
      }
    },
    [projects, saveProjects]
  );

  const handleAddTask = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setEditingTask(null);
    setTaskModalVisible(true);
  }, []);

  const handleEditTask = useCallback((projectId, task) => {
    setSelectedProjectId(projectId);
    setEditingTask(task);
    setTaskModalVisible(true);
  }, []);

  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        const updatedProjects = projects.map((project) => {
          if (project.id === selectedProjectId) {
            let updatedTasks;

            if (editingTask) {
              // Update existing task
              updatedTasks =
                project.tasks?.map((task) =>
                  task.id === editingTask.id ? taskData : task
                ) || [];
            } else {
              // Add new task
              updatedTasks = [...(project.tasks || []), taskData];
            }

            return {
              ...project,
              tasks: updatedTasks,
              updatedAt: new Date().toISOString(),
            };
          }
          return project;
        });

        await saveProjects(updatedProjects);
        setTaskModalVisible(false);
        setSelectedProjectId(null);
        setEditingTask(null);
      } catch (error) {
        console.error("Error saving task:", error);
        Alert.alert("Error", "Failed to save task");
      }
    },
    [projects, saveProjects, selectedProjectId, editingTask]
  );

  const handleTaskModalClose = useCallback(() => {
    setTaskModalVisible(false);
    setSelectedProjectId(null);
    setEditingTask(null);
  }, []);

  const handleProjectSave = useCallback(
    async (projectData) => {
      try {
        const newProject = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: [],
        };

        const updatedProjects = [newProject, ...projects];
        await saveProjects(updatedProjects);
        setModalVisible(false);
      } catch (error) {
        Alert.alert("Error", "Failed to save project");
      }
    },
    [projects, saveProjects]
  );

  const handleProjectDelete = useCallback(
    async (projectId) => {
      Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const updatedProjects = projects.filter(
                  (p) => p.id !== projectId
                );
                await saveProjects(updatedProjects);
              } catch (error) {
                Alert.alert("Error", "Failed to delete project");
              }
            },
          },
        ]
      );
    },
    [projects, saveProjects]
  );

  const renderFilterButton = useCallback(
    (label, value) => {
      const isActive = filterType === value;
      return (
        <TouchableOpacity
          key={value}
          style={[
            styles.filterButton,
            {
              backgroundColor: isActive ? theme.primary : "transparent",
              borderColor: isActive ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setFilterType(value)}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
        >
          <Text
            style={[
              styles.filterButtonText,
              { color: isActive ? "#ffffff" : theme.text },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [filterType, theme]
  );

  const renderSortOption = useCallback(() => {
    const sortOptions = [
      { label: "Recent", value: "recent", icon: "time" },
      { label: "A-Z", value: "alphabetical", icon: "text" },
      { label: "Priority", value: "priority", icon: "flag" },
      { label: "Progress", value: "progress", icon: "stats-chart" },
    ];

    return (
      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              {
                backgroundColor:
                  sortBy === option.value
                    ? `${theme.primary}20`
                    : "transparent",
              },
            ]}
            onPress={() => setSortBy(option.value)}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={
                sortBy === option.value ? theme.primary : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.sortText,
                {
                  color:
                    sortBy === option.value
                      ? theme.primary
                      : theme.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [sortBy, theme]);

  const renderProject = useCallback(
    ({ item }) => (
      <ProjectCard
        project={item}
        onTaskToggle={toggleTask}
        onTaskDelete={deleteTask}
        onTaskEdit={handleEditTask}
        onAddTask={handleAddTask}
        onDelete={handleProjectDelete}
      />
    ),
    [toggleTask, deleteTask, handleEditTask, handleAddTask, handleProjectDelete]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View
          style={[
            styles.emptyIconContainer,
            { backgroundColor: `${theme.primary}10` },
          ]}
        >
          <Ionicons
            name={searchQuery ? "search-outline" : "folder-outline"}
            size={64}
            color={theme.primary}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          {searchQuery ? "No projects found" : "No projects yet"}
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          {searchQuery
            ? "Try adjusting your search or filters"
            : "Start by creating your first project"}
        </Text>
        {!searchQuery && (
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.emptyButtonText}>Create Project</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [searchQuery, theme]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContent}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {projects.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Projects
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {projects.filter((p) => p.status === "completed").length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              {projects.filter((p) => p.status === "in-progress").length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              In Progress
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search projects, tags, or tech stack..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
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
        <View style={styles.filtersContainer}>
          <View style={styles.filterButtons}>
            {renderFilterButton("All", "all")}
            {renderFilterButton("Varsity", "varsity")}
            {renderFilterButton("Personal", "personal")}
          </View>
        </View>

        {/* Sort Options */}
        {renderSortOption()}
      </View>
    ),
    [projects, theme, searchQuery, renderFilterButton, renderSortOption]
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading projects...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Projects</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
            accessibilityLabel="Add new project"
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 280,
          offset: 280 * index,
          index,
        })}
      />

      {/* Add Project Modal */}
      <ProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleProjectSave}
        title="Add New Project"
      />

      {/* Task Modal */}
      <TaskModal
        visible={taskModalVisible}
        onClose={handleTaskModalClose}
        onSave={handleTaskSave}
        task={editingTask}
        title={editingTask ? "Edit Task" : "Add New Task"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "800",
    lineHeight: isTablet ? 40 : 34,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerContent: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  sortText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProjectsScreen;
