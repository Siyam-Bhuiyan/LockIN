import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const TaskModal = ({
  visible,
  onClose,
  onSave,
  task = null,
  title = "Add New Task",
}) => {
  const { theme, isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "todo",
    deadline: "",
    estimatedTime: "",
    tags: [],
    subtasks: [],
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  const priorities = [
    { value: "Low", color: "#66BB6A", icon: "arrow-down" },
    { value: "Medium", color: "#FFA726", icon: "remove" },
    { value: "High", color: "#FF4757", icon: "arrow-up" },
  ];

  const statuses = [
    {
      value: "todo",
      label: "To Do",
      color: theme.info,
      icon: "ellipse-outline",
    },
    {
      value: "in-progress",
      label: "In Progress",
      color: theme.warning,
      icon: "play-circle-outline",
    },
    {
      value: "completed",
      label: "Completed",
      color: theme.success,
      icon: "checkmark-circle-outline",
    },
    {
      value: "blocked",
      label: "Blocked",
      color: theme.error,
      icon: "close-circle-outline",
    },
  ];

  // Initialize form data when modal opens or task changes
  useEffect(() => {
    if (visible) {
      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "Medium",
          status: task.status || "todo",
          deadline: task.deadline || "",
          estimatedTime: task.estimatedTime || "",
          tags: task.tags || [],
          subtasks: task.subtasks || [],
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [visible, task]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "todo",
      deadline: "",
      estimatedTime: "",
      tags: [],
      subtasks: [],
    });
    setTagInput("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate < today && formData.status !== "completed") {
        newErrors.deadline =
          "Deadline cannot be in the past for non-completed tasks";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      id: task?.id || Date.now().toString(),
      completed: formData.status === "completed",
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(taskData);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    updateField(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const getPriorityConfig = (priority) => {
    return priorities.find((p) => p.value === priority) || priorities[1];
  };

  const getStatusConfig = (status) => {
    return statuses.find((s) => s.value === status) || statuses[0];
  };

  const renderFormField = (
    label,
    field,
    placeholder,
    multiline = false,
    keyboardType = "default"
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label}{" "}
        {field === "title" && <Text style={{ color: theme.error }}>*</Text>}
      </Text>
      <TextInput
        style={[
          multiline ? styles.textArea : styles.input,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
            color: theme.text,
            borderColor: errors[field] ? theme.error : theme.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={formData[field]}
        onChangeText={(text) => updateField(field, text)}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        returnKeyType={multiline ? "default" : "next"}
      />
      {errors[field] && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {errors[field]}
        </Text>
      )}
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
      <View style={styles.optionsContainer}>
        {priorities.map((priority) => {
          const isSelected = formData.priority === priority.value;
          return (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected ? priority.color : "transparent",
                  borderColor: priority.color,
                },
              ]}
              onPress={() => updateField("priority", priority.value)}
            >
              <Ionicons
                name={priority.icon}
                size={16}
                color={isSelected ? "#ffffff" : priority.color}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? "#ffffff" : theme.text },
                ]}
              >
                {priority.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>Status</Text>
      <View style={styles.optionsContainer}>
        {statuses.map((status) => {
          const isSelected = formData.status === status.value;
          return (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected ? status.color : "transparent",
                  borderColor: status.color,
                },
              ]}
              onPress={() => updateField("status", status.value)}
            >
              <Ionicons
                name={status.icon}
                size={16}
                color={isSelected ? "#ffffff" : status.color}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? "#ffffff" : theme.text },
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTagsSection = () => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>Tags</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={[
            styles.tagInput,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.04)",
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Add a tag..."
          placeholderTextColor={theme.textSecondary}
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addTagButton, { backgroundColor: theme.primary }]}
          onPress={addTag}
          disabled={!tagInput.trim()}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {formData.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {formData.tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tag, { backgroundColor: theme.primary + "20" }]}
              onPress={() => removeTag(tag)}
            >
              <Text style={[styles.tagText, { color: theme.primary }]}>
                {tag}
              </Text>
              <Ionicons name="close" size={14} color={theme.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.6}
      useNativeDriverForBackdrop
    >
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        {/* Handle Bar */}
        <View
          style={[styles.handleBar, { backgroundColor: theme.textSecondary }]}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderFormField("Task Title", "title", "Enter task title...")}
          {renderFormField(
            "Description",
            "description",
            "Enter task description...",
            true
          )}

          <View style={styles.row}>
            <View style={styles.halfWidth}>{renderPrioritySelector()}</View>
            <View style={styles.halfWidth}>{renderStatusSelector()}</View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderFormField("Deadline", "deadline", "YYYY-MM-DD")}
            </View>
            <View style={styles.halfWidth}>
              {renderFormField(
                "Estimated Time",
                "estimatedTime",
                "e.g., 2h 30m"
              )}
            </View>
          </View>

          {renderTagsSection()}

          {/* Task Preview */}
          {formData.title.trim() && (
            <View
              style={[
                styles.previewSection,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.previewTitle, { color: theme.text }]}>
                Preview
              </Text>
              <View
                style={[
                  styles.previewCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.previewHeader}>
                  <Text
                    style={[styles.previewTaskTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {formData.title}
                  </Text>
                  <View
                    style={[
                      styles.previewPriority,
                      {
                        backgroundColor: getPriorityConfig(formData.priority)
                          .color,
                      },
                    ]}
                  >
                    <Text style={styles.previewPriorityText}>
                      {formData.priority}
                    </Text>
                  </View>
                </View>
                {formData.description && (
                  <Text
                    style={[
                      styles.previewDescription,
                      { color: theme.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {formData.description}
                  </Text>
                )}
                <View style={styles.previewMeta}>
                  <View
                    style={[
                      styles.previewStatus,
                      {
                        backgroundColor: getStatusConfig(formData.status).color,
                      },
                    ]}
                  >
                    <Text style={styles.previewStatusText}>
                      {getStatusConfig(formData.status).label}
                    </Text>
                  </View>
                  {formData.deadline && (
                    <Text
                      style={[
                        styles.previewDeadline,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Due: {formData.deadline}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.border }]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                opacity: formData.title.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleSave}
            disabled={!formData.title.trim()}
          >
            <LinearGradient
              colors={["#007AFF", "#0056CC"]}
              style={styles.saveGradient}
            >
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {task ? "Update Task" : "Add Task"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.select({ ios: 34, android: 20 }),
    maxHeight: "92%",
    minHeight: "60%",
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: "top",
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    minWidth: isTablet ? 120 : 100,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  previewCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewTaskTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  previewPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewPriorityText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewStatusText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  previewDeadline: {
    fontSize: 10,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default TaskModal;
