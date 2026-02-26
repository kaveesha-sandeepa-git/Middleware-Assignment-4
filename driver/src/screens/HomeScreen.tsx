import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DeliveryCard, { DeliveryStop } from "../components/DeliveryCard";

const MOCK_STOPS: DeliveryStop[] = [
  {
    id: "1",
    orderId: "SL-2026-0001",
    recipientName: "Kasun Perera",
    address: "No. 12, Galle Road,\nColombo 03",
    window: "09:00 - 10:00",
    distanceKm: 1.2,
    status: "IN_PROGRESS"
  },
  {
    id: "2",
    orderId: "SL-2026-0002",
    recipientName: "Ayesha Silva",
    address: "Apartment 5B, Ocean View,\nMarine Drive, Colombo 06",
    window: "10:00 - 11:00",
    distanceKm: 3.4,
    status: "PENDING",
    priority: "HIGH"
  }
];

export default function HomeScreen() {
  const completed = 5;
  const total = 18;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={styles.greeting}>Good morning, Kaveesha 👋</Text>
      <Text style={styles.subtle}>Route ID: CMB-EAST-ROUTE-14</Text>

      <View style={styles.summaryCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLabel}>Today&apos;s manifest</Text>
          <Text style={styles.summaryValue}>
            {completed}/{total}
          </Text>
          <Text style={styles.summaryHint}>Stops completed</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryLabel}>SLA risk</Text>
          <Text style={[styles.summaryValue, { color: "#FACC15" }]}>3</Text>
          <Text style={styles.summaryHint}>Deliveries close to cut-off</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Next stops</Text>
      {MOCK_STOPS.map((stop) => (
        <DeliveryCard key={stop.id} stop={stop} />
      ))}

      <Text style={styles.footerHint}>
        Hook this list to your middleware API that aggregates CMS/ROS/WMS data
        into the driver&apos;s route manifest.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020"
  },
  greeting: {
    color: "#E5E7EB",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4
  },
  subtle: {
    color: "#64748B",
    marginBottom: 20
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 16
  },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 4
  },
  summaryValue: {
    color: "#4ADE80",
    fontSize: 24,
    fontWeight: "700"
  },
  summaryHint: {
    color: "#64748B",
    fontSize: 12
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10
  },
  footerHint: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 12
  }
});

