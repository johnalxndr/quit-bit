import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define our theme colors
export const lightTheme = {
  background: '#fff',
  text: '#222',
  textSecondary: '#666',
  cardBackground: '#f5f5f5',
  border: '#e0e0e0',
  primary: '#222',
  accent: '#fff',
  buttonBackground: '#222',
  buttonText: '#fff',
  secondaryButtonBackground: '#fff',
  secondaryButtonText: '#222',
  headerBackground: '#fff',
  headerText: '#222',
};

export const darkTheme = {
  background: '#121212',
  text: '#fff',
  textSecondary: '#ccc',
  cardBackground: '#222',
  border: '#333',
  primary: '#fff',
  accent: '#222',
  buttonBackground: '#333',
  buttonText: '#fff',
  secondaryButtonBackground: '#222',
  secondaryButtonText: '#fff',
  headerBackground: '#121212',
  headerText: '#fff',
};

type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    colorScheme === 'dark' ? darkTheme : lightTheme
  );
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 