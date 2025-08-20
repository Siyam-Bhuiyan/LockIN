import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";
import ProgressBar from "../components/ui/ProgressBar";

const { width } = Dimensions.get("window");

const DailyTrackerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskHours, setNewTaskHours] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [weekProgress, setWeekProgress] = useState([]);
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [completedHoursToday, setCompletedHoursToday] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadDailyData();
    setTodayDate(getTodayDate());
    loadWeekProgress();
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const loadDailyData = async () => {
    try {
      const today = getTodayDate();
      const savedData = await StorageService.getItem(`dailyTracker_${today}`);

      if (savedData) {
        setDailyTasks(savedData.tasks || []);
        calculateHours(savedData.tasks || []);
      } else {
        setDailyTasks([]);
        setTotalHoursToday(0);
        setCompletedHoursToday(0);
      }

      const streakData = await StorageService.getItem("dailyTrackerStreak");
      setStreak(streakData?.streak || 0);
    } catch (error) {
      console.error("Error loading daily data:", error);
    }
  };

  const saveDailyData = async (tasks) => {
    try {
      const today = getTodayDate();
      const dataToSave = {
        date: today,
        tasks: tasks,
        savedAt: new Date().toISOString(),
      };

      await StorageService.setItem(`dailyTracker_${today}`, dataToSave);
      calculateHours(tasks);

      const allCompleted =
        tasks.length > 0 && tasks.every((task) => task.completed);
      if (allCompleted) {
        await updateStreak();
      }
    } catch (error) {
      console.error("Error saving daily data:", error);
    }
  };

  const updateStreak = async () => {
    try {
      const streakData = await StorageService.getItem("dailyTrackerStreak");
      const today = getTodayDate();

      if (streakData?.lastCompletedDate !== today) {
        const newStreak = (streakData?.streak || 0) + 1;
        await StorageService.setItem("dailyTrackerStreak", {
          streak: newStreak,
          lastCompletedDate: today,
        });
        setStreak(newStreak);
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const loadWeekProgress = async () => {
    try {
      const weekData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];

        const dayData = await StorageService.getItem(
          `dailyTracker_${dateString}`
        );
        const tasks = dayData?.tasks || [];
        const completedTasks = tasks.filter((task) => task.completed).length;
        const totalTasks = tasks.length;

        weekData.push({
          date: dateString,
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          completed: completedTasks,
          total: totalTasks,
          percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        });
      }

      setWeekProgress(weekData);
    } catch (error) {
      console.error("Error loading week progress:", error);
    }
  };

  const calculateHours = (tasks) => {
    const total = tasks.reduce(
      (sum, task) => sum + parseFloat(task.hours || 0),
      0
    );
    const completed = tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + parseFloat(task.hours || 0), 0);

    setTotalHoursToday(total);
    setCompletedHoursToday(completed);
  };

  const addNewTask = () => {
    if (!newTaskName.trim() || !newTaskHours.trim()) {
      Alert.alert("Error", "Please enter both task name and hours");
      return;
    }

    const hours = parseFloat(newTaskHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert("Error", "Please enter valid hours (greater than 0)");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      hours: hours,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedTasks);
    saveDailyData(updatedTasks);

    setNewTaskName("");
    setNewTaskHours("");
    setShowAddModal(false);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = dailyTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setDailyTasks(updatedTasks);
    saveDailyData(updatedTasks);
  };

  const deleteTask = (taskId) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedTasks = dailyTasks.filter((task) => task.id !== taskId);
          setDailyTasks(updatedTasks);
          saveDailyData(updatedTasks);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyData();
    await loadWeekProgress();
    setRefreshing(false);
  };

  const getTotalProgress = () => {
    if (totalHoursToday === 0) return 0;
    return (completedHoursToday / totalHoursToday) * 100;
  };

  const HeaderStats = () => (
    <LinearGradient
      colors={[theme.primary + "15", theme.primary + "08"]}
      style={styles.headerStats}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>
            {completedHoursToday.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Hours Done
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.success }]}>
            {totalHoursToday.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Hours
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>
            {streak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Day Streak
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressLabel, { color: theme.text }]}>
          Today's Progress: {getTotalProgress().toFixed(0)}%
        </Text>
        <ProgressBar
          progress={getTotalProgress() / 100}
          height={8}
          color={theme.primary}
          animated={true}
          style={styles.progressBar}
        />
      </View>
    </LinearGradient>
  );

  const WeeklyOverview = () => (
    <View style={[styles.weeklyCard, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Week Overview
      </Text>
      <View style={styles.weekGrid}>
        {weekProgress.map((day, index) => (
          <View key={index} style={styles.dayItem}>
            <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>
              {day.day}
            </Text>
            <View
              style={[
                styles.dayCircle,
                {
                  backgroundColor:
                    day.percentage > 0 ? theme.success + "20" : theme.border,
                  borderColor:
                    day.percentage > 0 ? theme.success : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayPercentage,
                  {
                    color:
                      day.percentage > 0 ? theme.success : theme.textTertiary,
                  },
                ]}
              >
                {day.percentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const TaskCard = ({ task }) => (
    <TouchableOpacity
      onPress={() => toggleTaskCompletion(task.id)}
      style={[
        styles.taskCard,
        {
          backgroundColor: task.completed
            ? theme.success + "15"
            : theme.surface,
          borderColor: task.completed ? theme.success + "30" : theme.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: task.completed ? theme.success : "transparent",
                borderColor: task.completed ? theme.success : theme.border,
              },
            ]}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskName,
                {
                  color: theme.text,
                  textDecorationLine: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.7 : 1,
                },
              ]}
            >
              {task.name}
            </Text>
            <Text style={[styles.taskHours, { color: theme.textSecondary }]}>
              {task.hours} {task.hours === 1 ? "hour" : "hours"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => deleteTask(task.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const AddTaskModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddModal}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add New Task
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Task Name
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g., CP Practice, Java Study..."
              placeholderTextColor={theme.textTertiary}
              value={newTaskName}
              onChangeText={setNewTaskName}
              multiline={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Hours to Spend
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g., 2.5"
              placeholderTextColor={theme.textTertiary}
              value={newTaskHours}
              onChangeText={setNewTaskHours}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            onPress={addNewTask}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Task</Text>
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
      paddingHorizontal: 24,
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitleContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
      marginTop: 2,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },
    headerStats: {
      marginVertical: 20,
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.primary + "20",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
      letterSpacing: -1,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    progressContainer: {
      marginTop: 8,
    },
    progressLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      textAlign: "center",
    },
    progressBar: {
      borderRadius: 4,
    },
    weeklyCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
    },
    weekGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dayItem: {
      alignItems: "center",
      flex: 1,
    },
    dayLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
    },
    dayCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    dayPercentage: {
      fontSize: 10,
      fontWeight: "700",
    },
    tasksSection: {
      marginBottom: 24,
    },
    taskCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    taskContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    taskInfo: {
      flex: 1,
    },
    taskName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    taskHours: {
      fontSize: 14,
      fontWeight: "500",
    },
    deleteButton: {
      padding: 8,
    },
    addTaskButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: "dashed",
      marginBottom: 24,
    },
    addTaskText: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
      marginBottom: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalContent: {
      width: "100%",
      borderRadius: 20,
      padding: 24,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "700",
    },
    closeButton: {
      padding: 4,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontWeight: "500",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    addButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.statusBar}
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Daily Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {getFormattedDate(todayDate)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HeaderStats />

          <WeeklyOverview />

          <View style={styles.tasksSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Today's Tasks
            </Text>

            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={[
                styles.addTaskButton,
                { borderColor: theme.primary + "50" },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
              <Text style={[styles.addTaskText, { color: theme.primary }]}>
                Add New Task
              </Text>
            </TouchableOpacity>

            {dailyTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  No tasks for today yet
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Add your first task to start tracking your daily progress!
                </Text>
              </View>
            ) : (
              dailyTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </View>
        </View>
      </ScrollView>

      <AddTaskModal />
    </SafeAreaView>
  );
};

export default DailyTrackerScreen;
