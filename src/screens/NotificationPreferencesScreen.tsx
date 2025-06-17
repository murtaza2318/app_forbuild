import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

interface NotificationPreferences {
  appointment_reminders: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  new_services: boolean;
  membership_updates: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface NotificationError {
  message: string;
}

const NotificationPreferencesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    appointment_reminders: true,
    order_updates: true,
    promotional_offers: false,
    new_services: false,
    membership_updates: true,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences(data);
      }
    } catch (error: unknown) {
      console.error('Error fetching preferences:', error);
      Alert.alert('Error', (error as NotificationError).message);
    }
  };

  const updatePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Notification preferences updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const PreferenceItem = ({ 
    title, 
    subtitle, 
    icon, 
    value, 
    onToggle,
    color = '#2563eb'
  }: {
    title: string;
    subtitle: string;
    icon: string;
    value: boolean;
    onToggle: () => void;
    color?: string;
  }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.preferenceText}>
          <Text style={styles.preferenceTitle}>{title}</Text>
          <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: `${color}40` }}
        thumbColor={value ? color : '#f4f3f4'}
      />
    </View>
  );

  const notificationTypes = [
    {
      title: 'Appointment Reminders',
      subtitle: 'Get notified before your appointments',
      icon: 'calendar-outline',
      key: 'appointment_reminders' as keyof NotificationPreferences,
      color: '#2563eb',
    },
    {
      title: 'Order Updates',
      subtitle: 'Track your order status and delivery',
      icon: 'bag-outline',
      key: 'order_updates' as keyof NotificationPreferences,
      color: '#059669',
    },
    {
      title: 'Promotional Offers',
      subtitle: 'Special deals and discounts',
      icon: 'pricetag-outline',
      key: 'promotional_offers' as keyof NotificationPreferences,
      color: '#dc2626',
    },
    {
      title: 'New Services',
      subtitle: 'Be first to know about new services',
      icon: 'sparkles-outline',
      key: 'new_services' as keyof NotificationPreferences,
      color: '#7c3aed',
    },
    {
      title: 'Membership Updates',
      subtitle: 'Membership benefits and renewals',
      icon: 'diamond-outline',
      key: 'membership_updates' as keyof NotificationPreferences,
      color: '#d97706',
    },
  ];

  const deliveryMethods = [
    {
      title: 'Push Notifications',
      subtitle: 'Instant notifications on your device',
      icon: 'phone-portrait-outline',
      key: 'push_notifications' as keyof NotificationPreferences,
      color: '#2563eb',
    },
    {
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: 'mail-outline',
      key: 'email_notifications' as keyof NotificationPreferences,
      color: '#059669',
    },
    {
      title: 'SMS Notifications',
      subtitle: 'Text messages for urgent updates',
      icon: 'chatbubble-outline',
      key: 'sms_notifications' as keyof NotificationPreferences,
      color: '#dc2626',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Notification Preferences</Text>
          <Text style={styles.subtitle}>Customize your notifications</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to notify you about</Text>
          <Text style={styles.sectionSubtitle}>
            Choose which types of notifications you'd like to receive
          </Text>
          
          {notificationTypes.map((item) => (
            <PreferenceItem
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              value={preferences[item.key]}
              onToggle={() => togglePreference(item.key)}
              color={item.color}
            />
          ))}
        </View>

        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to notify you</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred notification delivery methods
          </Text>
          
          {deliveryMethods.map((item) => (
            <PreferenceItem
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              value={preferences[item.key]}
              onToggle={() => togglePreference(item.key)}
              color={item.color}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              const allOn = Object.values(preferences).every(v => v);
              const newPrefs = Object.keys(preferences).reduce((acc, key) => ({
                ...acc,
                [key]: !allOn
              }), {} as NotificationPreferences);
              setPreferences(newPrefs);
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#2563eb" />
            <Text style={styles.quickActionText}>
              {Object.values(preferences).every(v => v) ? 'Turn Off All' : 'Turn On All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              setPreferences({
                appointment_reminders: true,
                order_updates: true,
                promotional_offers: false,
                new_services: false,
                membership_updates: true,
                push_notifications: true,
                email_notifications: true,
                sms_notifications: false,
              });
            }}
          >
            <Ionicons name="refresh-outline" size={20} color="#059669" />
            <Text style={styles.quickActionText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={updatePreferences}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  saveSection: {
    padding: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationPreferencesScreen;