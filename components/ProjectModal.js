import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Button from "./ui/Button";

const ProjectModal = ({
  visible,
  onClose,
  project,
  onSave,
  title = "Add Project",
}) => {
  const { theme, isDark } = useTheme();
  const [formData, setFormData] = React.useState({
    title: "",
    type: "varsity",
    githubLink: "",
    resources: "",
    description: "",
    category: "",
    estimatedHours: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "planning",
    tags: [],
    collaborators: "",
    techStack: "",
    ...project,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert("Please enter a project title");
      return;
    }
    onSave(formData);
  };

  const priorities = ["Low", "Medium", "High"];
  const statuses = ["planning", "in-progress", "completed", "on-hold"];
  const types = ["varsity", "personal"];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info Section */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Basic Information
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Project Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.title}
                onChangeText={(value) => updateField("title", value)}
                placeholder="Enter project title"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.description}
                onChangeText={(value) => updateField("description", value)}
                placeholder="Describe your project"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Type
                </Text>
                <View style={styles.segmentedControl}>
                  {types.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor:
                            formData.type === type
                              ? theme.primary
                              : "transparent",
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => updateField("type", type)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color:
                              formData.type === type
                                ? "#ffffff"
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Priority
                </Text>
                <View style={styles.segmentedControl}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor:
                            formData.priority === priority
                              ? theme.primary
                              : "transparent",
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => updateField("priority", priority)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color:
                              formData.priority === priority
                                ? "#ffffff"
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Technical Details Section */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Technical Details
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Category
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.category}
                onChangeText={(value) => updateField("category", value)}
                placeholder="e.g., Web Development, Mobile App"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Tech Stack
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.techStack}
                onChangeText={(value) => updateField("techStack", value)}
                placeholder="e.g., React Native, Node.js, MongoDB"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                GitHub Repository
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.githubLink}
                onChangeText={(value) => updateField("githubLink", value)}
                placeholder="https://github.com/username/repo"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Project Management Section */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Project Management
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Status
              </Text>
              <View style={styles.statusGrid}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor:
                          formData.status === status
                            ? theme.primary
                            : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateField("status", status)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            formData.status === status
                              ? "#ffffff"
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Start Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.startDate}
                  onChangeText={(value) => updateField("startDate", value)}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  End Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.endDate}
                  onChangeText={(value) => updateField("endDate", value)}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Estimated Hours
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.estimatedHours}
                onChangeText={(value) => updateField("estimatedHours", value)}
                placeholder="e.g., 40 hours"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Collaborators
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.collaborators}
                onChangeText={(value) => updateField("collaborators", value)}
                placeholder="Enter collaborator names"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.select({ ios: 50, android: 20 }),
    borderBottomWidth: 1,
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
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
});

export default ProjectModal;
