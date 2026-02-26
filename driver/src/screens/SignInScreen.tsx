import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

export default function SignInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SwiftTrack Driver</Text>
      <Text style={styles.subtitle}>
        Sign in to start your delivery route.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="driver@swiftlogistics.lk"
          placeholderTextColor="#64748B"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#64748B"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          This screen is UI-only. Hook this to your middleware authentication
          service.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    paddingHorizontal: 24,
    justifyContent: "center"
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 24
  },
  card: {
    backgroundColor: "#050814",
    borderRadius: 16,
    padding: 20,
    gap: 12
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
    marginBottom: 12,
    backgroundColor: "#020617"
  },
  button: {
    backgroundColor: "#22C55E",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8
  },
  buttonText: {
    color: "#022C22",
    fontWeight: "600",
    fontSize: 16
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center"
  }
});

