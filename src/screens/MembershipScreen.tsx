import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type MembershipError = { message: string };

const MembershipScreen = () => {
  const { theme } = useTheme();
  const membershipPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 19.99,
      period: 'month',
      features: [
        '10% discount on all services',
        'Priority booking',
        'Monthly newsletter',
        'Basic customer support',
      ],
      color: theme.colors.secondary,
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 39.99,
      period: 'month',
      features: [
        '25% discount on all services',
        'Priority booking',
        'Free monthly styling consultation',
        'Exclusive access to new services',
        'Premium customer support',
        '15% discount on products',
      ],
      color: theme.colors.primary,
      popular: true,
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 79.99,
      period: 'month',
      features: [
        '35% discount on all services',
        'VIP priority booking',
        'Free weekly styling consultation',
        'Exclusive access to premium services',
        'Dedicated customer support',
        '25% discount on products',
        'Free home service once a month',
        'Complimentary grooming kit',
      ],
      color: theme.colors.warning,
      popular: false,
    },
  ];

  const MembershipCard = ({ plan }: { plan: any }) => (
    <View style={[styles.membershipCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }, plan.popular && styles.popularCard]}>
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.colors.warning }]}>
          <Text style={[styles.popularText, { color: theme.colors.text }]}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <Text style={[styles.planName, { color: theme.colors.text }]}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.colors.text }]}>${plan.price}</Text>
          <Text style={[styles.period, { color: theme.colors.textSecondary }]}>/{plan.period}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={plan.color} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          { backgroundColor: plan.color },
          plan.popular && styles.popularButton,
        ]}
      >
        <Text style={[styles.subscribeButtonText, { color: theme.colors.white }]}>Subscribe Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.white }]}>Membership Plans</Text>
        <Text style={[styles.subtitle, { color: theme.colors.white }]}>
          Choose the perfect plan for your grooming needs
        </Text>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Why Join Our Membership?</Text>
        
        <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Ionicons name="cut" size={24} color={theme.colors.primary} />
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>Exclusive Discounts</Text>
            <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
              Save up to 35% on all services and products
            </Text>
          </View>
        </View>

        <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Ionicons name="calendar" size={24} color={theme.colors.success} />
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>Priority Booking</Text>
            <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
              Get first access to appointment slots
            </Text>
          </View>
        </View>

        <View style={[styles.benefitCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Ionicons name="star" size={24} color={theme.colors.warning} />
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>Premium Services</Text>
            <Text style={[styles.benefitDescription, { color: theme.colors.textSecondary }]}>
              Access to exclusive styling consultations
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.plansSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Your Plan</Text>
        {membershipPlans.map((plan) => (
          <MembershipCard key={plan.id} plan={plan} />
        ))}
      </View>

      <View style={styles.faqSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Frequently Asked Questions</Text>
        
        <View style={[styles.faqItem, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>Can I cancel my membership anytime?</Text>
          <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
            Yes, you can cancel your membership at any time. Your benefits will continue until the end of your current billing period.
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>Do discounts apply to all services?</Text>
          <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
            Yes, membership discounts apply to all regular services. Some special promotions may have different terms.
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>Can I upgrade or downgrade my plan?</Text>
          <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
            Absolutely! You can change your plan at any time. Changes will take effect at your next billing cycle.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f9fafb', // Handled by inline style
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    // backgroundColor: 'white', // Handled by inline style
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    // color: '#1f2937', // Handled by inline style
  },
  subtitle: {
    fontSize: 16,
    // color: '#6b7280', // Handled by inline style
    marginTop: 4,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color: '#1f2937', // Handled by inline style
    marginBottom: 16,
  },
  benefitCard: {
    // backgroundColor: 'white', // Handled by inline style
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    // shadowColor: '#000', // Handled by inline style
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  benefitContent: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    // color: '#1f2937', // Handled by inline style
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    // color: '#6b7280', // Handled by inline style
  },
  plansSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  membershipCard: {
    // backgroundColor: 'white', // Handled by inline style
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  popularCard: {
    borderColor: '#d97706',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 10,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 4,
    marginBottom: 2,
  },
  featuresContainer: {
    padding: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  popularButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
  },
  faqItem: {
    // backgroundColor: 'white', // Handled by inline style
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // shadowColor: '#000', // Handled by inline style
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MembershipScreen;