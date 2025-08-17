import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useTheme } from '@/utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const STORAGE_KEY_START_DATE = 'habitTrackerStartDate';
const STORAGE_KEY_USAGE_DATA = 'habitTrackerUsageData';

interface DailyDataItem {
  day: string;
  date: string;
  count: number;
  dateObj: Date;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function LogbookScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [dailyData, setDailyData] = useState<DailyDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
  };

  const generateDailyData = (startDate: Date): DailyDataItem[] => {
    const today = new Date();
    const data: DailyDataItem[] = [];
    
    // Calculate difference in days
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Generate data for each day from start date to today
    for (let i = 0; i <= Math.min(diffDays, 30); i++) {
      const dateObj = new Date();
      dateObj.setDate(today.getDate() - i);
      
      const dayName = i === 0 ? 'Today' : DAYS_OF_WEEK[dateObj.getDay()];
      const formattedDate = formatDate(dateObj);
      
      data.push({
        day: dayName,
        date: formattedDate,
        count: 0, // Default count
        dateObj: new Date(dateObj) // Store date object for sorting and comparisons
      });
    }
    
    return data;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get start date (default to today if not set)
      const savedStartDate = await AsyncStorage.getItem(STORAGE_KEY_START_DATE);
      const startDate = savedStartDate ? new Date(savedStartDate) : new Date();
      
      // Generate daily data structure based on start date
      let newDailyData = generateDailyData(startDate);
      
      // Load any saved usage data
      const savedData = await AsyncStorage.getItem(STORAGE_KEY_USAGE_DATA);
      if (savedData) {
        const usageData = JSON.parse(savedData);
        
        // Merge saved counts with our generated daily data
        newDailyData = newDailyData.map(item => {
          const dateStr = item.dateObj.toDateString();
          if (usageData[dateStr]) {
            return { ...item, count: usageData[dateStr] };
          }
          return item;
        });
      }
      
      setDailyData(newDailyData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to empty array if there's an error
      setDailyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsageData = async (newData: DailyDataItem[]) => {
    try {
      // Convert array to object with dates as keys
      const usageData = newData.reduce((acc, item) => {
        const dateStr = item.dateObj.toDateString();
        acc[dateStr] = item.count;
        return acc;
      }, {} as Record<string, number>);
      
      await AsyncStorage.setItem(STORAGE_KEY_USAGE_DATA, JSON.stringify(usageData));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  };

  const updateChartData = () => {
    if (dailyData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0], color: () => 'rgba(0,0,0,0)', strokeWidth: 0 }]
      };
    }
    
    return {
      labels: [],
      datasets: [
        {
          data: [...dailyData].reverse().map(item => item.count).slice(0, 10),
          color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
          strokeWidth: 2
        }
      ],
    };
  };
  
  const incrementCount = (index: number) => {
    if (index < 0 || index >= dailyData.length) return;
    
    const newData = [...dailyData];
    newData[index].count += 1;
    setDailyData(newData);
    saveUsageData(newData);
  };
  
  const decrementCount = (index: number) => {
    if (index < 0 || index >= dailyData.length) return;
    
    const newData = [...dailyData];
    if (newData[index].count > 0) {
      newData[index].count -= 1;
      setDailyData(newData);
      saveUsageData(newData);
    }
  };

  // Get date range for chart label
  const getDateRangeLabel = () => {
    if (dailyData.length < 2) return '';
    
    const oldestShown = dailyData[Math.min(dailyData.length - 1, 9)];
    const newest = dailyData[0];
    
    if (!oldestShown || !newest) return '';
    
    return `${formatDate(oldestShown.dateObj)} - ${formatDate(newest.dateObj)}`;
  };

  // Navigate to settings
  const goToSettings = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.container}>        
        <View style={[styles.chartContainer, { backgroundColor: theme.cardBackground }]}>
          <LineChart
            data={updateChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: theme.cardBackground,
              backgroundGradientFrom: theme.cardBackground,
              backgroundGradientTo: theme.cardBackground,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, 0)`, // Hide labels completely
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: isDark ? '#fff' : '#000',
                fill: isDark ? '#fff' : '#000'
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                strokeWidth: 0,
                stroke: 'transparent'
              }
            }}
            bezier
            withHorizontalLines={false}
            withVerticalLines={false}
            withDots={true}
            withInnerLines={false}
            withOuterLines={false}
            withShadow={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              paddingRight: 0,
              paddingLeft: 0,
              marginLeft: 0,
              marginRight: 0
            }}
          />
          <Text style={[styles.chartFooter, { color: theme.textSecondary }]}>
            {getDateRangeLabel()}
          </Text>
        </View>
        
        <View style={styles.daysList}>
          {dailyData.map((item, index) => (
            <View key={index} style={[styles.dayItem, { borderBottomColor: theme.border }]}>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, { color: theme.text }]}>{item.day}</Text>
                <Text style={[styles.dayDate, { color: theme.textSecondary }]}>{item.date}</Text>
              </View>
              
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={[styles.counterButton, { backgroundColor: theme.buttonBackground }]}
                  onPress={() => decrementCount(index)}
                >
                  <Text style={[styles.buttonText, { color: theme.buttonText }]}>−</Text>
                </TouchableOpacity>
                
                <View style={[styles.counterCircle, { backgroundColor: theme.buttonBackground }]}>
                  <Text style={[styles.counterText, { color: theme.buttonText }]}>{item.count}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.counterButton, styles.addButton, { borderColor: theme.border }]}
                  onPress={() => incrementCount(index)}
                >
                  <Text style={[styles.buttonText, styles.addButtonText, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  chartContainer: {
    marginBottom: 30,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  chartFooter: {
    textAlign: 'center',
    marginTop: 8,
  },
  daysList: {
    marginBottom: 20,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 16,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButtonText: {
  },
  counterCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
}); 