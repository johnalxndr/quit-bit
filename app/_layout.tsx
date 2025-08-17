import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import StripeProvider from "@/components/stripe-provider";
import { ThemeProvider, useTheme } from "@/utils/theme";

export const unstable_settings = {
  anchor: "index",
  initialRouteName: "index",
};

function AppStack() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <StripeProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Habit Quitter",
              headerShown: false,
              headerLargeTitle: false,
            }}
          />
          <Stack.Screen 
            name="logbook" 
            options={{
              title: "Usage Logbook",
              headerTitleStyle: {
                color: theme.headerText,
                fontWeight: "bold",
              },
              headerStyle: {
                backgroundColor: theme.headerBackground,
              },
              headerTintColor: theme.headerText,
              headerShadowVisible: false,
              animation: 'slide_from_right',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="settings" 
            options={{
              title: "Settings",
              headerTitleStyle: {
                color: theme.headerText,
                fontWeight: "bold",
              },
              headerStyle: {
                backgroundColor: theme.headerBackground,
              },
              headerTintColor: theme.headerText,
              headerShadowVisible: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </StripeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppStack />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

