import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "ROUTE_CHANGE" | "HIGH_PRIORITY" | "SYSTEM";
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New high-priority delivery assigned",
    body: "Order SL-2026-0009 has been added to your route by dispatch.",
    time: "Just now",
    type: "HIGH_PRIORITY"
  },
  {
    id: "2",
    title: "Route updated",
    body: "Stop order has been re-optimised due to traffic near Nugegoda.",
    time: "8 min ago",
    type: "ROUTE_CHANGE"
  },
  {
    id: "3",
    title: "System info",
    body: "Remember to sync completed deliveries before ending your shift.",
    time: "1 hr ago",
    type: "SYSTEM"
  }
];

export default function NotificationsScreen() {
  const renderItem = ({ item }: { item: NotificationItem }) => {
    const accent =
      item.type === "HIGH_PRIORITY"
        ? "#F97316"
        : item.type === "ROUTE_CHANGE"
        ? "#22C55E"
        : "#38BDF8";

    return (
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020"
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4
  },
  title: {
    color: "#E5E7EB",
    fontWeight: "600",
    marginBottom: 2
  },
  body: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4
  },
  time: {
    color: "#64748B",
    fontSize: 11
  }
});

