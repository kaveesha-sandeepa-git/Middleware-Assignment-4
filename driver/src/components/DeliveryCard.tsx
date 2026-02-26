import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type DeliveryStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED" | "FAILED";

export interface DeliveryStop {
  id: string;
  orderId: string;
  recipientName: string;
  address: string;
  window: string;
  distanceKm: number;
  status: DeliveryStatus;
  priority?: "NORMAL" | "HIGH";
}

interface Props {
  stop: DeliveryStop;
  onPress?: () => void;
}

export default function DeliveryCard({ stop, onPress }: Props) {
  const statusColor =
    stop.status === "DELIVERED"
      ? "#4ADE80"
      : stop.status === "FAILED"
      ? "#F97373"
      : stop.status === "IN_PROGRESS"
      ? "#38BDF8"
      : "#FACC15";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        stop.priority === "HIGH" && { borderColor: "#F97316" }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>#{stop.orderId}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{stop.status}</Text>
        </View>
      </View>

      <Text style={styles.name}>{stop.recipientName}</Text>
      <Text style={styles.address} numberOfLines={2}>
        {stop.address}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.meta}>
          ETA window: <Text style={styles.metaHighlight}>{stop.window}</Text>
        </Text>
        <Text style={styles.meta}>
          {stop.distanceKm.toFixed(1)}
          km
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 12
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  orderId: {
    color: "#E5E7EB",
    fontWeight: "600",
    fontSize: 14
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#022C22"
  },
  name: {
    color: "#CBD5F5",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  address: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 10
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  meta: {
    color: "#94A3B8",
    fontSize: 12
  },
  metaHighlight: {
    color: "#E5E7EB",
    fontWeight: "500"
  }
});

