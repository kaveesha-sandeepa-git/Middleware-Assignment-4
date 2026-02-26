import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProofOfDelivery">;

export default function ProofOfDeliveryScreen({ navigation }: Props) {
  const [note, setNote] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Proof of delivery</Text>
        <Text style={styles.subtitle}>
          Capture a signature or a photo and optionally leave a note.
        </Text>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Signature / photo capture placeholder
          </Text>
          <Text style={styles.placeholderHint}>
            Integrate this with your middleware service that stores POD blobs and
            notifies CMS/WMS.
          </Text>
        </View>

        <Text style={styles.label}>Driver note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. Left with security guard at gate"
          placeholderTextColor="#64748B"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Confirm delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    padding: 20
  },
  card: {
    backgroundColor: "#020617",
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937"
  },
  title: {
    color: "#E5E7EB",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4
  },
  subtitle: {
    color: "#64748B",
    marginBottom: 16
  },
  placeholderBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    backgroundColor: "#020617",
    padding: 16,
    marginBottom: 16
  },
  placeholderText: {
    color: "#CBD5F5",
    fontWeight: "500",
    marginBottom: 4
  },
  placeholderHint: {
    color: "#64748B",
    fontSize: 12
  },
  label: {
    color: "#CBD5F5",
    fontSize: 14,
    marginBottom: 4
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#E5E7EB",
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#020617"
  },
  button: {
    backgroundColor: "#22C55E",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: "auto"
  },
  buttonText: {
    color: "#022C22",
    fontWeight: "600",
    fontSize: 16
  }
});

