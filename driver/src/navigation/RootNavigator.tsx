import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import SignInScreen from "../screens/SignInScreen";
import HomeScreen from "../screens/HomeScreen";
import ManifestScreen from "../screens/ManifestScreen";
import StopDetailsScreen from "../screens/StopDetailsScreen";
import ProofOfDeliveryScreen from "../screens/ProofOfDeliveryScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  StopDetails: { stopId: string };
  ProofOfDelivery: { stopId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Manifest: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#050814", borderTopColor: "#151B2E" },
        tabBarActiveTintColor: "#4ADE80",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "Home") iconName = "speedometer-outline";
          if (route.name === "Manifest") iconName = "list-outline";
          if (route.name === "Notifications") iconName = "notifications-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Manifest" component={ManifestScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isSignedIn = true; // TODO: replace with real auth state

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#050814" },
        headerTintColor: "#E5E7EB",
        contentStyle: { backgroundColor: "#0B1020" }
      }}
    >
      {!isSignedIn ? (
        <Stack.Screen
          name="Auth"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StopDetails"
            component={StopDetailsScreen}
            options={{ title: "Stop details" }}
          />
          <Stack.Screen
            name="ProofOfDelivery"
            component={ProofOfDeliveryScreen}
            options={{ title: "Proof of delivery" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

