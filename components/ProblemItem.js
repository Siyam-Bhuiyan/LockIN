import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./ui/Card";
import { useTheme } from "../context/ThemeContext";

const statusIcon = {
  Solved: "checkmark-circle",
  Unsolved: "close-circle",
  "To Revisit": "refresh-circle",
};

const difficultyColor = {
  Easy: "success",
  Medium: "warning",
  Hard: "error",
};

const ProblemItem = ({ problem, onPress, onEdit, onDelete }) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {problem.name}
          </Text>
          <Ionicons
            name={statusIcon[problem.status]}
            size={20}
            color={theme[difficultyColor[problem.difficulty]]}
          />
        </View>
        <Text style={[styles.platform, { color: theme.accent }]}>
          {problem.platform}
        </Text>
        {problem.link && (
          <Text style={[styles.link, { color: theme.accent }]}>
            {problem.link}
          </Text>
        )}
        <Text
          style={[
            styles.status,
            { color: theme[difficultyColor[problem.difficulty]] },
          ]}
        >
          {problem.status} • {problem.difficulty}
        </Text>
        {problem.notes && (
          <Text
            style={[styles.notes, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {problem.notes}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  platform: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  link: {
    fontSize: 12,
    marginTop: 2,
    textDecorationLine: "underline",
  },
  status: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "column",
    marginLeft: 12,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f3f4f6",
  },
});

export default ProblemItem;
