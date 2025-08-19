import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import StorageService from "../services/StorageService";
import { getDifficultyColor } from "../data/neetcodeProblems";

const { width } = Dimensions.get("window");

const ProblemDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { problem } = route.params;
  const [activeTab, setActiveTab] = useState("problem");
  const [userCode, setUserCode] = useState("");
  const [userApproach, setUserApproach] = useState("");
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [isApproachModalVisible, setIsApproachModalVisible] = useState(false);
  const [saved, setSaved] = useState({ code: false, approach: false });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const codeKey = `problem_${problem.id}_code`;
      const approachKey = `problem_${problem.id}_approach`;

      const savedCode = await StorageService.getItem(codeKey);
      const savedApproach = await StorageService.getItem(approachKey);

      if (savedCode) {
        setUserCode(savedCode);
        setSaved((prev) => ({ ...prev, code: true }));
      }
      if (savedApproach) {
        setUserApproach(savedApproach);
        setSaved((prev) => ({ ...prev, approach: true }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserCode = async () => {
    try {
      const codeKey = `problem_${problem.id}_code`;
      await StorageService.setItem(codeKey, userCode);
      setSaved((prev) => ({ ...prev, code: true }));
      setIsCodeModalVisible(false);
      Alert.alert("Success", "Code saved successfully!");
    } catch (error) {
      console.error("Error saving code:", error);
      Alert.alert("Error", "Failed to save code");
    }
  };

  const saveUserApproach = async () => {
    try {
      const approachKey = `problem_${problem.id}_approach`;
      await StorageService.setItem(approachKey, userApproach);
      setSaved((prev) => ({ ...prev, approach: true }));
      setIsApproachModalVisible(false);
      Alert.alert("Success", "Approach saved successfully!");
    } catch (error) {
      console.error("Error saving approach:", error);
      Alert.alert("Error", "Failed to save approach");
    }
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: isActive ? theme.primary : theme.surface },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: isActive ? "white" : theme.textSecondary },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ProblemContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.problemHeader}>
        <View style={styles.problemTitleContainer}>
          <Text style={[styles.problemTitle, { color: theme.text }]}>
            {problem.title}
          </Text>
          <View style={styles.problemMeta}>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    getDifficultyColor(problem.difficulty) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(problem.difficulty) },
                ]}
              >
                {problem.difficulty}
              </Text>
            </View>
            <Text style={[styles.categoryText, { color: theme.textTertiary }]}>
              {problem.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Description
        </Text>
        <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
          {problem.description}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Problem Details
        </Text>
        <Text style={[styles.detailedContent, { color: theme.textSecondary }]}>
          {problem.detailedDescription}
        </Text>
      </View>

      {problem.hints && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Hints
          </Text>
          {problem.hints.map((hint, index) => (
            <View key={index} style={styles.hintItem}>
              <View
                style={[
                  styles.hintNumber,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Text style={[styles.hintNumberText, { color: theme.primary }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                {hint}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Complexity
        </Text>
        <View style={styles.complexityContainer}>
          <View style={styles.complexityItem}>
            <Text
              style={[styles.complexityLabel, { color: theme.textTertiary }]}
            >
              Time Complexity:
            </Text>
            <Text style={[styles.complexityValue, { color: theme.text }]}>
              {problem.timeComplexity}
            </Text>
          </View>
          <View style={styles.complexityItem}>
            <Text
              style={[styles.complexityLabel, { color: theme.textTertiary }]}
            >
              Space Complexity:
            </Text>
            <Text style={[styles.complexityValue, { color: theme.text }]}>
              {problem.spaceComplexity}
            </Text>
          </View>
        </View>
      </View>

      {problem.tags && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tags</Text>
          <View style={styles.tagsContainer}>
            {problem.tags.map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: theme.accent + "15" }]}
              >
                <Text style={[styles.tagText, { color: theme.accent }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {problem.companies && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Companies
          </Text>
          <View style={styles.companiesContainer}>
            {problem.companies.map((company, index) => (
              <View
                key={index}
                style={[
                  styles.companyBadge,
                  { backgroundColor: theme.primary + "15" },
                ]}
              >
                <Text style={[styles.companyText, { color: theme.primary }]}>
                  {company}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {problem.followUp && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Follow-up
          </Text>
          <Text style={[styles.followUpText, { color: theme.textSecondary }]}>
            {problem.followUp}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const CodeContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.actionHeader}>
        <Text style={[styles.actionTitle, { color: theme.text }]}>
          Your Solution Code
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary + "15" }]}
          onPress={() => setIsCodeModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={theme.primary} />
          <Text style={[styles.addButtonText, { color: theme.primary }]}>
            {saved.code ? "Edit Code" : "Add Code"}
          </Text>
        </TouchableOpacity>
      </View>

      {userCode ? (
        <ScrollView
          style={styles.codeContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.codeText, { color: theme.text }]}>
            {userCode}
          </Text>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="code-slash" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
            No code added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Tap "Add Code" to write your solution
          </Text>
        </View>
      )}
    </View>
  );

  const ApproachContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.actionHeader}>
        <Text style={[styles.actionTitle, { color: theme.text }]}>
          Your Approach
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.accent + "15" }]}
          onPress={() => setIsApproachModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={theme.accent} />
          <Text style={[styles.addButtonText, { color: theme.accent }]}>
            {saved.approach ? "Edit Approach" : "Add Approach"}
          </Text>
        </TouchableOpacity>
      </View>

      {userApproach ? (
        <ScrollView
          style={styles.approachContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.approachText, { color: theme.textSecondary }]}>
            {userApproach}
          </Text>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bulb" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
            No approach added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Tap "Add Approach" to describe your solution strategy
          </Text>
        </View>
      )}
    </View>
  );

  const CodeModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isCodeModalVisible}
      onRequestClose={() => setIsCodeModalVisible(false)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsCodeModalVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Add Your Code
          </Text>
          <TouchableOpacity
            style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}
            onPress={saveUserCode}
          >
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.codeInput,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={userCode}
          onChangeText={setUserCode}
          placeholder="Write your solution code here..."
          placeholderTextColor={theme.textTertiary}
          multiline
          textAlignVertical="top"
        />
      </SafeAreaView>
    </Modal>
  );

  const ApproachModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isApproachModalVisible}
      onRequestClose={() => setIsApproachModalVisible(false)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsApproachModalVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Add Your Approach
          </Text>
          <TouchableOpacity
            style={[styles.modalSaveButton, { backgroundColor: theme.accent }]}
            onPress={saveUserApproach}
          >
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.approachInput,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={userApproach}
          onChangeText={setUserApproach}
          placeholder="Describe your approach and solution strategy..."
          placeholderTextColor={theme.textTertiary}
          multiline
          textAlignVertical="top"
        />
      </SafeAreaView>
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
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      flex: 1,
    },
    leetcodeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    leetcodeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.primary,
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 16,
      flex: 1,
      alignItems: "center",
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },
    tabContent: {
      flex: 1,
      padding: 24,
    },
    problemHeader: {
      marginBottom: 24,
    },
    problemTitleContainer: {
      gap: 12,
    },
    problemTitle: {
      fontSize: 24,
      fontWeight: "800",
      lineHeight: 32,
    },
    problemMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    difficultyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    difficultyText: {
      fontSize: 14,
      fontWeight: "700",
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "600",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },
    sectionContent: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
    },
    detailedContent: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500",
      fontFamily: "monospace",
    },
    hintItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      gap: 12,
    },
    hintNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    hintNumberText: {
      fontSize: 12,
      fontWeight: "700",
    },
    hintText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
    complexityContainer: {
      gap: 8,
    },
    complexityItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    complexityLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    complexityValue: {
      fontSize: 14,
      fontWeight: "700",
      fontFamily: "monospace",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "700",
    },
    companiesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    companyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    companyText: {
      fontSize: 12,
      fontWeight: "700",
    },
    followUpText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      fontStyle: "italic",
    },
    actionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    actionTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },
    codeContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: 400,
    },
    codeText: {
      fontFamily: "monospace",
      fontSize: 14,
      lineHeight: 20,
    },
    approachContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: 400,
    },
    approachText: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
    },
    emptySubtext: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    modalSaveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    modalSaveText: {
      color: "white",
      fontSize: 14,
      fontWeight: "700",
    },
    codeInput: {
      flex: 1,
      margin: 24,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      fontSize: 14,
      fontFamily: "monospace",
      lineHeight: 20,
    },
    approachInput: {
      flex: 1,
      margin: 24,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      fontSize: 14,
      lineHeight: 20,
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
        <Text style={styles.headerTitle}>{problem.title}</Text>
        <TouchableOpacity
          style={styles.leetcodeButton}
          onPress={() => {
            Alert.alert("LeetCode", `Open ${problem.title} on LeetCode?`);
          }}
        >
          <Ionicons name="open-outline" size={16} color={theme.primary} />
          <Text style={styles.leetcodeText}>LeetCode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TabButton
          title="Problem"
          isActive={activeTab === "problem"}
          onPress={() => setActiveTab("problem")}
        />
        <TabButton
          title="Code"
          isActive={activeTab === "code"}
          onPress={() => setActiveTab("code")}
        />
        <TabButton
          title="Approach"
          isActive={activeTab === "approach"}
          onPress={() => setActiveTab("approach")}
        />
      </View>

      {activeTab === "problem" && <ProblemContent />}
      {activeTab === "code" && <CodeContent />}
      {activeTab === "approach" && <ApproachContent />}

      <CodeModal />
      <ApproachModal />
    </SafeAreaView>
  );
};

export default ProblemDetailScreen;
