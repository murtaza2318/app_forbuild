import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const BrandedHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightIconPress,
}: BrandedHeaderProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.topBar}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        )}
        <Image source={require('../../assets/logo3.png')} style={styles.logo} />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightButton}>
            <Ionicons name={rightIcon} size={24} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title && <Text style={[styles.title, { color: theme.colors.white }]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.white }]}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  rightButton: {
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  titleContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
}); 