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
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import StorageService from "../services/StorageService";

const { width, height } = Dimensions.get("window");

const LearningScreen = () => {
  const { theme, isDark } = useTheme();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStack, setSelectedStack] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, progress, title
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-width));
  const [newVideo, setNewVideo] = useState({
    title: "",
    link: "",
    description: "",
    stack: "",
    totalVideos: "",
    lastWatchedVideo: "1",
    lastTimestamp: "",
    notes: "",
    category: "Course", // Course, Tutorial, Documentation, Other
    estimatedDuration: "",
    instructor: "",
  });

  const stacks = [
    "All",
    "React",
    "React Native",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "DevOps",
    "AI/ML",
    "Mobile Dev",
    "Web Dev",
    "Backend",
    "Frontend",
    "Other",
  ];

  const categories = [
    "Course",
    "Tutorial",
    "Documentation",
    "Lecture",
    "Workshop",
    "Other",
  ];

  const sortOptions = [
    { key: "newest", label: "Newest First", icon: "time-outline" },
    { key: "oldest", label: "Oldest First", icon: "hourglass-outline" },
    { key: "progress", label: "By Progress", icon: "trending-up-outline" },
    { key: "title", label: "Alphabetical", icon: "text-outline" },
    { key: "stack", label: "By Stack", icon: "layers-outline" },
  ];

  useEffect(() => {
    loadVideos();
    animateIn();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, selectedStack, searchQuery, sortBy]);

  const animateIn = () => {
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

  const loadVideos = async () => {
    const savedVideos = await StorageService.getVideos();
    setVideos(savedVideos);
  };

  const saveVideos = async (updatedVideos) => {
    await StorageService.saveVideos(updatedVideos);
    setVideos(updatedVideos);
  };

  const filterAndSortVideos = () => {
    let filtered = videos;

    // Filter by stack
    if (selectedStack !== "All") {
      filtered = filtered.filter((video) => video.stack === selectedStack);
    }

    // // Filter by search query
    // if (searchQuery.trim()) {
    //   const query = searchQuery.toLowerCase();
    //   filtered = filtered.filter(
    //     (video) =>
    //       video.title.toLowerCase().includes(query) ||
    //       video.description?.toLowerCase().includes(query) ||
    //       video.stack?.toLowerCase().includes(query) ||
    //       video.instructor?.toLowerCase().includes(query)
    //   );
    // }

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "progress":
          return getVideoProgress(b) - getVideoProgress(a);
        case "title":
          return a.title.localeCompare(b.title);
        case "stack":
          return (a.stack || "").localeCompare(b.stack || "");
        default:
          return 0;
      }
    });

    setFilteredVideos(filtered);
  };

  const addVideo = async () => {
    if (!newVideo.title.trim()) {
      Alert.alert("Error", "Please enter video/course title");
      return;
    }

    const video = {
      id: Date.now().toString(),
      ...newVideo,
      completed: false,
      totalVideos: newVideo.totalVideos ? parseInt(newVideo.totalVideos) : null,
      lastWatchedVideo: parseInt(newVideo.lastWatchedVideo) || 1,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    const updatedVideos = [...videos, video];
    await saveVideos(updatedVideos);
    setModalVisible(false);
    resetForm();

    // Show success message
    Alert.alert("Success", "Course/Video added successfully!");
  };

  const resetForm = () => {
    setNewVideo({
      title: "",
      link: "",
      description: "",
      stack: "",
      totalVideos: "",
      lastWatchedVideo: "1",
      lastTimestamp: "",
      notes: "",
      category: "Course",
      estimatedDuration: "",
      instructor: "",
    });
  };

  const updateVideoProgress = async (videoId, field, value) => {
    const updatedVideos = videos.map((video) =>
      video.id === videoId
        ? { ...video, [field]: value, lastAccessed: new Date().toISOString() }
        : video
    );
    await saveVideos(updatedVideos);
  };

  const toggleVideoCompletion = async (videoId) => {
    const updatedVideos = videos.map((video) =>
      video.id === videoId
        ? {
            ...video,
            completed: !video.completed,
            completedAt: !video.completed ? new Date().toISOString() : null,
            lastAccessed: new Date().toISOString(),
          }
        : video
    );
    await saveVideos(updatedVideos);
  };

  const deleteVideo = (videoId) => {
    Alert.alert(
      "Delete Learning Material",
      "Are you sure you want to delete this? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedVideos = videos.filter((v) => v.id !== videoId);
            await saveVideos(updatedVideos);
          },
        },
      ]
    );
  };

  const openLink = (link) => {
    if (link) {
      Linking.openURL(link).catch(() => {
        Alert.alert("Error", "Cannot open this link. Please check the URL.");
      });
    } else {
      Alert.alert("No Link", "No link provided for this item.");
    }
  };

  const getVideoProgress = (video) => {
    if (!video.totalVideos) return video.completed ? 1 : 0;
    return Math.min(video.lastWatchedVideo / video.totalVideos, 1);
  };

  const getProgressColor = (progress) => {
    if (progress === 1) return theme.success;
    if (progress >= 0.7) return theme.warning;
    if (progress >= 0.3) return theme.accent;
    return theme.primary;
  };

  const getStackColor = (stack) => {
    const colors = [
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#84cc16",
      "#f97316",
      "#ec4899",
      "#14b8a6",
      "#8b5cf6",
      "#f59e0b",
    ];
    const index = stacks.indexOf(stack) % colors.length;
    return colors[index];
  };

  const formatDuration = (duration) => {
    if (!duration) return "";
    return duration.includes("h") || duration.includes("m")
      ? duration
      : `${duration}h`;
  };

  const getCompletionStats = () => {
    const total = filteredVideos.length;
    const completed = filteredVideos.filter((v) => v.completed).length;
    const inProgress = filteredVideos.filter(
      (v) => !v.completed && getVideoProgress(v) > 0
    ).length;
    return { total, completed, inProgress };
  };

  const VideoCard = ({ video, index }) => {
    const progress = getVideoProgress(video);
    const progressColor = getProgressColor(progress);
    const [cardAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <Card
          style={[
            styles.videoCard,
            { borderLeftColor: getStackColor(video.stack), borderLeftWidth: 4 },
          ]}
        >
          {/* Header */}
          <View style={styles.videoHeader}>
            <View style={styles.videoInfo}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.videoTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {video.title}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteVideo(video.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={theme.error}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                {video.stack && (
                  <View
                    style={[
                      styles.stackTag,
                      { backgroundColor: getStackColor(video.stack) },
                    ]}
                  >
                    <Text style={styles.stackText}>{video.stack}</Text>
                  </View>
                )}
                {video.category && (
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: theme.secondary },
                    ]}
                  >
                    <Text style={styles.categoryText}>{video.category}</Text>
                  </View>
                )}
                {video.completed && (
                  <View
                    style={[
                      styles.completedBadge,
                      { backgroundColor: theme.success },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#ffffff"
                    />
                    <Text style={styles.completedText}>Complete</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Description & Instructor */}
          {(video.description || video.instructor) && (
            <View style={styles.infoSection}>
              {video.instructor && (
                <Text style={[styles.instructor, { color: theme.accent }]}>
                  👨‍🏫 {video.instructor}
                </Text>
              )}
              {video.description && (
                <Text
                  style={[styles.description, { color: theme.textSecondary }]}
                  numberOfLines={3}
                >
                  {video.description}
                </Text>
              )}
            </View>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                Progress
              </Text>
              {video.estimatedDuration && (
                <Text style={[styles.duration, { color: theme.textSecondary }]}>
                  🕐 {formatDuration(video.estimatedDuration)}
                </Text>
              )}
            </View>

            {video.totalVideos ? (
              <View style={styles.videoProgress}>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  Video {video.lastWatchedVideo} of {video.totalVideos} (
                  {Math.round(progress * 100)}%)
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: progressColor,
                          width: `${progress * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.simpleProgress}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: video.completed
                        ? theme.success
                        : theme.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name={video.completed ? "checkmark" : "play"}
                    size={14}
                    color="#ffffff"
                  />
                </View>
                <Text style={[styles.statusText, { color: theme.text }]}>
                  {video.completed ? "Completed" : "In Progress"}
                </Text>
              </View>
            )}

            {video.lastTimestamp && (
              <Text
                style={[styles.timestampText, { color: theme.textSecondary }]}
              >
                ⏰ Last position: {video.lastTimestamp}
              </Text>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controlsSection}>
            {video.totalVideos && (
              <View style={styles.videoControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: theme.surface },
                  ]}
                  onPress={() => {
                    const newVideo = Math.max(1, video.lastWatchedVideo - 1);
                    updateVideoProgress(video.id, "lastWatchedVideo", newVideo);
                  }}
                  disabled={video.lastWatchedVideo <= 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={
                      video.lastWatchedVideo <= 1
                        ? theme.textSecondary
                        : theme.text
                    }
                  />
                </TouchableOpacity>

                <View style={styles.videoNumberContainer}>
                  <Text style={[styles.videoNumber, { color: theme.text }]}>
                    {video.lastWatchedVideo}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: theme.surface },
                  ]}
                  onPress={() => {
                    const maxVideo =
                      video.totalVideos || video.lastWatchedVideo + 1;
                    const newVideo = Math.min(
                      maxVideo,
                      video.lastWatchedVideo + 1
                    );
                    updateVideoProgress(video.id, "lastWatchedVideo", newVideo);
                  }}
                  disabled={video.lastWatchedVideo >= video.totalVideos}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={
                      video.lastWatchedVideo >= video.totalVideos
                        ? theme.textSecondary
                        : theme.text
                    }
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionButtons}>
              {video.link && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.watchButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => openLink(video.link)}
                >
                  <Ionicons name="play-circle" size={16} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Watch</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.completeButton,
                  {
                    backgroundColor: video.completed
                      ? theme.success
                      : theme.secondary,
                  },
                ]}
                onPress={() => toggleVideoCompletion(video.id)}
              >
                <Ionicons
                  name={
                    video.completed ? "checkmark-circle" : "radio-button-off"
                  }
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.actionButtonText}>
                  {video.completed ? "Complete" : "Mark Done"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          {video.notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: theme.textSecondary }]}>
                📝 Notes:
              </Text>
              <Text
                style={[styles.notesText, { color: theme.text }]}
                numberOfLines={4}
              >
                {video.notes}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.createdDate, { color: theme.textSecondary }]}>
              Added {new Date(video.createdAt).toLocaleDateString()}
            </Text>
            {video.lastAccessed && (
              <Text
                style={[styles.lastAccessed, { color: theme.textSecondary }]}
              >
                Last viewed {new Date(video.lastAccessed).toLocaleDateString()}
              </Text>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const FilterChip = ({ stack, isSelected, onPress, count = 0 }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? theme.accent : theme.surface,
          borderColor: isSelected ? theme.accent : theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isSelected ? "#ffffff" : theme.text },
        ]}
      >
        {stack} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const SortModal = ({ visible, onClose }) => (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
    >
      <View style={styles.sortModalOverlay}>
        <View
          style={[styles.sortModalContent, { backgroundColor: theme.surface }]}
        >
          <Text style={[styles.sortModalTitle, { color: theme.text }]}>
            Sort by
          </Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                {
                  backgroundColor:
                    sortBy === option.key ? theme.accent + "20" : "transparent",
                },
              ]}
              onPress={() => {
                setSortBy(option.key);
                onClose();
              }}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={
                  sortBy === option.key ? theme.accent : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.sortOptionText,
                  { color: sortBy === option.key ? theme.accent : theme.text },
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={20} color={theme.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const stats = getCompletionStats();
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
    },
    headerActions: {
      flexDirection: "row",
      gap: 10,
    },
    headerButton: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      padding: 12,
    },
    // searchContainer: {
    //   flexDirection: "row",
    //   alignItems: "center",
    //   backgroundColor: theme.surface,
    //   borderRadius: 12,
    //   paddingHorizontal: 15,
    //   marginBottom: 15,
    //   borderWidth: 1,
    //   borderColor: theme.border,
    // },
    // searchInput: {
    //   flex: 1,
    //   height: 45,
    //   fontSize: 16,
    //   color: theme.text,
    //   paddingHorizontal: 10,
    // },
    // searchIcon: {
    //   marginRight: 5,
    // },
    // statsContainer: {
    //   flexDirection: "row",
    //   justifyContent: "space-between",
    //   marginBottom: 15,
    // },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 3,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.accent,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    filtersContainer: {
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    filtersHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    filtersTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortButtonText: {
      fontSize: 12,
      color: theme.text,
      marginLeft: 5,
    },
    filtersScrollView: {
      paddingVertical: 5,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "600",
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    videoCard: {
      marginBottom: 20,
      padding: 20,
    },
    videoHeader: {
      marginBottom: 15,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    videoTitle: {
      fontSize: 18,
      fontWeight: "bold",
      flex: 1,
      marginRight: 10,
      lineHeight: 24,
    },
    deleteButton: {
      padding: 5,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    stackTag: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    stackText: {
      fontSize: 11,
      color: "#ffffff",
      fontWeight: "600",
    },
    categoryTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 10,
      color: "#ffffff",
      fontWeight: "600",
    },
    completedBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completedText: {
      fontSize: 10,
      color: "#ffffff",
      fontWeight: "600",
      marginLeft: 4,
    },
    infoSection: {
      marginBottom: 15,
    },
    instructor: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 5,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
    },
    progressSection: {
      marginBottom: 15,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    duration: {
      fontSize: 12,
    },
    videoProgress: {
      marginBottom: 8,
    },
    progressText: {
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
    },
    progressBarContainer: {
      marginBottom: 5,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    simpleProgress: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    statusIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    timestampText: {
      fontSize: 12,
    },
    controlsSection: {
      marginBottom: 15,
    },
    videoControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
      gap: 15,
    },
    controlButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    videoNumberContainer: {
      backgroundColor: theme.accent,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 12,
    },
    videoNumber: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#ffffff",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 10,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#ffffff",
    },
    notesSection: {
      marginBottom: 15,
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: 8,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 5,
    },
    notesText: {
      fontSize: 13,
      lineHeight: 18,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    createdDate: {
      fontSize: 11,
    },
    lastAccessed: {
      fontSize: 11,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 15,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      color: theme.textSecondary,
      lineHeight: 20,
    },
    sortModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    sortModalContent: {
      width: width * 0.8,
      borderRadius: 16,
      padding: 20,
    },
    sortModalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
    },
    sortOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginBottom: 5,
    },
    sortOptionText: {
      flex: 1,
      fontSize: 16,
      marginLeft: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "92%",
      maxHeight: "85%",
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 0,
      overflow: "hidden",
    },
    modalHeader: {
      backgroundColor: theme.primary,
      paddingVertical: 20,
      paddingHorizontal: 25,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#ffffff",
    },
    modalBody: {
      padding: 25,
    },
    formSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    inputContainer: {
      marginBottom: 15,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    inputFocused: {
      borderColor: theme.accent,
      borderWidth: 2,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    stackSelector: {
      marginBottom: 15,
    },
    stackOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    stackOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    stackOptionText: {
      fontSize: 13,
      fontWeight: "600",
    },
    categorySelector: {
      marginBottom: 15,
    },
    categoryOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    categoryOptionText: {
      fontSize: 13,
      fontWeight: "600",
    },
    modalButtons: {
      flexDirection: "row",
      paddingHorizontal: 25,
      paddingBottom: 25,
      gap: 15,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    addVideoButton: {
      backgroundColor: theme.accent,
    },
    addVideoButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>🎥 Learning Hub</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSortModalVisible(true)}
            >
              <Ionicons name="filter-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {/* <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, tutorials, stacks..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View> */}

        {/* Stats */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.warning }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View> */}
      </Animated.View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Filter by Stack</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="swap-vertical" size={14} color={theme.text} />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollView}
        >
          {stacks.map((stack) => {
            const count =
              stack === "All"
                ? videos.length
                : videos.filter((v) => v.stack === stack).length;
            return (
              <FilterChip
                key={stack}
                stack={stack}
                count={count}
                isSelected={selectedStack === stack}
                onPress={() => setSelectedStack(stack)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Videos List */}
      <Animated.View
        style={[
          styles.scrollContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}

          {filteredVideos.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="library-outline"
                size={60}
                color={theme.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                {videos.length === 0
                  ? "Start Your Learning Journey"
                  : "No Results Found"}
              </Text>
              <Text style={styles.emptyText}>
                {videos.length === 0
                  ? "Add your first course or tutorial to begin tracking your progress and never lose your place again!"
                  : searchQuery
                  ? `No learning materials match "${searchQuery}"`
                  : `No ${selectedStack} materials found`}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Sort Modal */}
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
      />

      {/* Add Video Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Learning Material</Text>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Basic Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📋 Basic Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., React Complete Course, Python Basics"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.title}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, title: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Link</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YouTube, Udemy, Coursera, etc."
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.link}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, link: text })
                    }
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Instructor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Instructor or channel name"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.instructor}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, instructor: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Estimated Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 10h, 2 weeks, 30 days"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.estimatedDuration}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, estimatedDuration: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What will you learn? Key topics covered..."
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.description}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, description: text })
                    }
                    multiline
                  />
                </View>
              </View>

              {/* Category & Stack */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  🏷️ Category & Technology
                </Text>

                <View style={styles.categorySelector}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.categoryOptions}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          {
                            backgroundColor:
                              newVideo.category === category
                                ? theme.secondary
                                : "transparent",
                            borderColor: theme.secondary,
                          },
                        ]}
                        onPress={() => setNewVideo({ ...newVideo, category })}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            {
                              color:
                                newVideo.category === category
                                  ? "#ffffff"
                                  : theme.secondary,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.stackSelector}>
                  <Text style={styles.inputLabel}>Technology/Stack</Text>
                  <View style={styles.stackOptions}>
                    {stacks.slice(1).map((stack) => (
                      <TouchableOpacity
                        key={stack}
                        style={[
                          styles.stackOption,
                          {
                            backgroundColor:
                              newVideo.stack === stack
                                ? getStackColor(stack)
                                : "transparent",
                            borderColor: getStackColor(stack),
                          },
                        ]}
                        onPress={() => setNewVideo({ ...newVideo, stack })}
                      >
                        <Text
                          style={[
                            styles.stackOptionText,
                            {
                              color:
                                newVideo.stack === stack
                                  ? "#ffffff"
                                  : getStackColor(stack),
                            },
                          ]}
                        >
                          {stack}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Progress Tracking */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📊 Progress Tracking</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Total Videos/Lessons</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 50 (leave empty if unknown)"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.totalVideos}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, totalVideos: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Video/Lesson</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Starting from lesson 1"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.lastWatchedVideo}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, lastWatchedVideo: text })
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Last Timestamp</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 15:30, 1:25:45"
                    placeholderTextColor={theme.textSecondary}
                    value={newVideo.lastTimestamp}
                    onChangeText={(text) =>
                      setNewVideo({ ...newVideo, lastTimestamp: text })
                    }
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📝 Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Key learnings, important points, resources..."
                  placeholderTextColor={theme.textSecondary}
                  value={newVideo.notes}
                  onChangeText={(text) =>
                    setNewVideo({ ...newVideo, notes: text })
                  }
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addVideoButton]}
                onPress={addVideo}
              >
                <Text style={styles.addVideoButtonText}>Add Material</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LearningScreen;
