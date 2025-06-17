import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    white: string;
    black: string;
    shadow: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#cf814d',
    secondary: '#cf814d',
    background: '#f9fafb',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    white: '#ffffff',
    black: '#000000',
    shadow: '#000000',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#cf814d',
    secondary: '#cf814d',
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#475569',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
    white: '#ffffff',
    black: '#000000',
    shadow: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // If no theme is saved, default to dark and save this preference for next launches
        setIsDark(true);
        await AsyncStorage.setItem('theme', 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};