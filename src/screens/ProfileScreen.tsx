import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

type ProfileError = { message: string };

const ProfileScreen = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState({
    upcoming: 0,
    completed: 0,
    total: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: user.email || '',
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', (error as ProfileError).message);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch appointment stats
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .eq('customer_id', user.id);

      if (appointments) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointments.filter(
          (apt) => apt.appointment_date >= today && apt.status === 'scheduled'
        ).length;
        const completed = appointments.filter(
          (apt) => apt.status === 'completed'
        ).length;

        setAppointmentStats({
          upcoming,
          completed,
          total: appointments.length,
        });
      }

      // Fetch order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', user.id);

      if (orders) {
        const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
        setOrderStats({
          total: orders.length,
          totalSpent,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: 'calendar-outline',
      title: 'My Appointments',
      subtitle: 'View and manage appointments',
      onPress: () => {
        navigation.navigate('Appointments');
      },
    },
    {
      icon: 'bag-outline',
      title: 'Order History',
      subtitle: 'View past orders',
      onPress: () => {
        navigation.navigate('Orders');
      },
    },
    {
      icon: 'diamond-outline',
      title: 'Membership',
      subtitle: 'Manage your membership',
      onPress: () => {
        navigation.navigate('Main', { screen: 'Membership' });
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notification Preferences',
      subtitle: 'Manage your notification settings',
      onPress: () => {
        navigation.navigate('NotificationPreferences');
      },
    },
    ...(isAdmin ? [{
      icon: 'analytics-outline',
      title: 'My Reports',
      subtitle: 'View your activity reports',
      onPress: () => {
        navigation.navigate('Reports');
      },
    }] : []),
    {
      icon: isDark ? 'sunny-outline' : 'moon-outline',
      title: 'Dark Mode',
      subtitle: isDark ? 'Switch to light mode' : 'Switch to dark mode',
      onPress: toggleTheme,
      showToggle: true,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {
        Alert.alert('Support', 'Contact us at support@barberapp.com');
      },
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => {
        Alert.alert('About', 'BarberApp v1.0.0\nYour grooming companion');
      },
    },
  ];

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color={theme.colors.textSecondary} />
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      {item.showToggle ? (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={isDark ? theme.colors.white : theme.colors.surface}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: theme.colors.white }]}>Profile</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.profileHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }]}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="person" size={32} color={theme.colors.textSecondary} />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <Ionicons
                name={editing ? 'close' : 'pencil'}
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileForm}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border 
                  },
                  !editing && styles.inputDisabled
                ]}
                value={profile.full_name}
                onChangeText={(text: string) => setProfile({ ...profile, full_name: text })}
                editable={editing}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border 
                  },
                  styles.inputDisabled
                ]}
                value={profile.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Phone</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.text,
                    borderColor: theme.colors.border 
                  },
                  !editing && styles.inputDisabled
                ]}
                value={profile.phone}
                onChangeText={(text: string) => setProfile({ ...profile, phone: text })}
                editable={editing}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            {editing && (
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  { backgroundColor: theme.colors.primary },
                  loading && styles.saveButtonDisabled
                ]}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{appointmentStats.upcoming}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{appointmentStats.completed}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="bag" size={24} color={theme.colors.warning} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{orderStats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="cash" size={24} color={theme.colors.secondary} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>${orderStats.totalSpent.toFixed(0)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Spent</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity style={[styles.signOutMenuItem, { backgroundColor: theme.colors.surface }]} onPress={signOut}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.menuItemTitle, { color: theme.colors.error }]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
  signOutMenuItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  profileSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 8,
  },
});

export default ProfileScreen;