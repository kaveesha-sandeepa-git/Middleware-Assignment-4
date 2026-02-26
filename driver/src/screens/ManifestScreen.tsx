import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import DeliveryCard, { DeliveryStop } from "../components/DeliveryCard";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MainTabs">;

const MOCK_STOPS: DeliveryStop[] = [
  {
    id: "1",
    orderId: "SL-2026-0001",
    recipientName: "Kasun Perera",
    address: "No. 12, Galle Road, Colombo 03",
    window: "09:00 - 10:00",
    distanceKm: 1.2,
    status: "IN_PROGRESS"
  },
  {
    id: "2",
    orderId: "SL-2026-0002",
    recipientName: "Ayesha Silva",
    address: "Apartment 5B, Ocean View, Marine Drive, Colombo 06",
    window: "10:00 - 11:00",
    distanceKm: 3.4,
    status: "PENDING",
    priority: "HIGH"
  },
  {
    id: "3",
    orderId: "SL-2026-0003",
    recipientName: "Tharindu Jayasinghe",
    address: "No. 45/1, Kotte Road, Nugegoda",
    window: "11:00 - 12:00",
    distanceKm: 7.1,
    status: "PENDING"
  }
];

export default function ManifestScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s manifest</Text>
        <Text style={styles.meta}>{MOCK_STOPS.length} stops</Text>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        data={MOCK_STOPS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeliveryCard
            stop={item}
            onPress={() => navigation.navigate("StopDetails", { stopId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    paddingTop: 8
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8
  },
  title: {
    color: "#E5E7EB",
    fontSize: 20,
    fontWeight: "700"
  },
  meta: {
    color: "#64748B",
    marginTop: 2
  }
});

