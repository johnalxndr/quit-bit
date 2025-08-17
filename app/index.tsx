import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import HabitTracker from "@/components/habit-tracker";
import { useTheme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HabitQuitPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={[styles.settingsButton, { top: insets.top + 10 }]}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings-outline" size={28} color={theme.text} />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <HabitTracker />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButton: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: 160,
  }
});
