import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./ui/Card";
import { useTheme } from "../context/ThemeContext";

const VideoItem = ({ video, onPress, onEdit, onDelete }) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {video.title}
          </Text>
          <Ionicons
            name={video.completed ? "checkmark-circle" : "play-circle-outline"}
            size={20}
            color={video.completed ? theme.success : theme.accent}
          />
        </View>
        <Text
          style={[styles.desc, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {video.description}
        </Text>
        {video.link && (
          <Text style={[styles.link, { color: theme.accent }]}>
            {video.link}
          </Text>
        )}
        {video.lastWatched && (
          <Text style={[styles.lastWatched, { color: theme.warning }]}>
            Last watched: {video.lastWatched}
          </Text>
        )}
        {video.stack && (
          <Text style={[styles.stack, { color: theme.primary }]}>
            Stack: {video.stack.join(", ")}
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
  desc: {
    fontSize: 13,
    marginTop: 4,
  },
  link: {
    fontSize: 12,
    marginTop: 2,
    textDecorationLine: "underline",
  },
  lastWatched: {
    fontSize: 12,
    marginTop: 2,
  },
  stack: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
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

export default VideoItem;
