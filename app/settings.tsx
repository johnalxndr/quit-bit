import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/utils/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'habitTrackerStartDate';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Load saved start date when component mounts
    loadStartDate();
  }, []);

  const loadStartDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedDate) {
        setStartDate(new Date(savedDate));
      }
    } catch (error) {
      console.error('Failed to load start date:', error);
    }
  };

  const saveStartDate = async (date: Date) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, date.toISOString());
    } catch (error) {
      console.error('Failed to save start date:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      saveStartDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  
  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        
        <View style={[styles.settingSection, { borderBottomColor: theme.border }]}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Tracking Start Date</Text>
          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
            onPress={showDatepicker}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>
              {startDate.toDateString()}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
            This date determines how many historical days to show in your logbook. By default, tracking starts from today.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.cardBackground }]}
          onPress={goBack}
        >
          <Text style={[styles.backButtonText, { color: theme.text }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingSection: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 10,
  },
  dateButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 