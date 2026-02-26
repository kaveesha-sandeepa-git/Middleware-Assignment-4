import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { DeliveryStop } from "../components/DeliveryCard";

type Props = NativeStackScreenProps<RootStackParamList, "StopDetails">;

const MOCK_STOP: DeliveryStop = {
  id: "1",
  orderId: "SL-2026-0001",
  recipientName: "Kasun Perera",
  address: "No. 12, Galle Road,\nColombo 03",
  window: "09:00 - 10:00",
  distanceKm: 1.2,
  status: "IN_PROGRESS"
};

export default function StopDetailsScreen({ navigation }: Props) {
  const stop = MOCK_STOP; // in real app, look up by stopId from route params

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
    >
      <View style={styles.card}>
        <Text style={styles.orderId}>Order #{stop.orderId}</Text>
        <Text style={styles.name}>{stop.recipientName}</Text>
        <Text style={styles.address}>{stop.address}</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time window</Text>
            <Text style={styles.value}>{stop.window}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>{stop.distanceKm.toFixed(1)} km</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Payment method</Text>
            <Text style={styles.value}>Cash on delivery (LKR 4,750.00)</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Update status</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#22C55E" }]}
            onPress={() =>
              navigation.navigate("ProofOfDelivery", { stopId: stop.id })
            }
          >
            <Text style={styles.actionText}>Mark as delivered</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F97316" }]}
          >
            <Text style={styles.actionText}>Failed attempt</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          When wired to your middleware, these actions should publish events that
          update CMS, ROS and WMS through your ESB/message broker.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020"
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 18
  },
  orderId: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  name: {
    color: "#CBD5F5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2
  },
  address: {
    color: "#64748B",
    marginBottom: 14
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10
  },
  label: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 2
  },
  value: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500"
  },
  actionsCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937"
  },
  actionsTitle: {
    color: "#E5E7EB",
    fontWeight: "600",
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center"
  },
  actionText: {
    color: "#020617",
    fontWeight: "600",
    fontSize: 14
  },
  hint: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 10
  }
});

