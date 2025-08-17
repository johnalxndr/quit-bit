import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_USAGE_DATA = 'habitTrackerUsageData';

export default function HabitTracker() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  
  useEffect(() => {
    loadTodayCount();
  }, []);
  
  const loadTodayCount = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toDateString();
      const savedData = await AsyncStorage.getItem(STORAGE_KEY_USAGE_DATA);
      
      if (savedData) {
        const usageData = JSON.parse(savedData);
        if (usageData[today]) {
          setCount(usageData[today]);
        }
      }
    } catch (error) {
      console.error('Failed to load today\'s count:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveTodayCount = async (newCount: number) => {
    try {
      const today = new Date().toDateString();
      const savedData = await AsyncStorage.getItem(STORAGE_KEY_USAGE_DATA);
      let usageData: Record<string, number> = {};
      
      // Safely parse JSON
      if (savedData) {
        try {
          usageData = JSON.parse(savedData);
        } catch (parseError) {
          console.error('Error parsing usage data:', parseError);
          usageData = {};
        }
      }
      
      usageData[today] = newCount;
      await AsyncStorage.setItem(STORAGE_KEY_USAGE_DATA, JSON.stringify(usageData));
    } catch (error) {
      console.error('Failed to save today\'s count:', error);
    }
  };
  
  const addUsage = () => {
    const newCount = count + 1;
    setCount(newCount);
    saveTodayCount(newCount);
  };
  
  const removeUsage = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      saveTodayCount(newCount);
    }
  };

  const getMessage = () => {
    if (count === 0) {
      return {
        title: "You haven't logged any usage today!",
        subtitle: "Keep it up!"
      };
    } else if (count === 1) {
      return {
        title: "You've logged 1 usage today",
        subtitle: "Try to reduce it tomorrow"
      };
    } else {
      return {
        title: `You've logged ${count} usages today`,
        subtitle: "Try to reduce it tomorrow"
      };
    }
  };
  
  const navigateToLogbook = () => {
    router.push('/logbook');
  };
  
  const message = getMessage();
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={[styles.messageTitle, { color: theme.text }]}>{message.title}</Text>
        <Text style={[styles.messageSubtitle, { color: theme.textSecondary }]}>{message.subtitle}</Text>
      </View>
      
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={[styles.minusButton, { backgroundColor: theme.buttonBackground }]}
          onPress={removeUsage}
        >
          <Text style={[styles.minusButtonText, { color: theme.buttonText }]}>−</Text>
        </TouchableOpacity>
        
        <View style={[styles.counterCircle, { backgroundColor: theme.buttonBackground }]}>
          <Text style={[styles.counterText, { color: theme.buttonText }]}>{count}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.plusButton, { 
            backgroundColor: theme.secondaryButtonBackground,
            borderColor: theme.border
          }]}
          onPress={addUsage}
        >
          <Text style={[styles.plusButtonText, { color: theme.secondaryButtonText }]}>+</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.pastDaysButton}
        onPress={navigateToLogbook}
      >
        <Text style={[styles.pastDaysText, { color: theme.text }]}>See past days →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 40,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageSubtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  minusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  minusButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  plusButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  pastDaysButton: {
    marginTop: 40,
  },
  pastDaysText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  }
}); 