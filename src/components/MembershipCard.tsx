import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

interface MembershipCardProps {
  plan: MembershipPlan;
  onPress: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ plan, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        plan.isPopular && styles.popularContainer,
      ]}
      onPress={onPress}
    >
      {plan.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.popularText, { color: theme.colors.white }]}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>${plan.price}</Text>
          <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>/{plan.duration}</Text>
        </View>
      </View>

      <View style={styles.features}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onPress}
      >
        <Text style={[styles.buttonText, { color: theme.colors.white }]}>Choose Plan</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularContainer: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 16,
    marginLeft: 4,
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 