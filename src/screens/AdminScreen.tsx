import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

type AdminError = { message: string };

const AdminScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [appointments, customers, products, orders, services] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalAppointments: appointments.count || 0,
        totalCustomers: customers.count || 0,
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalServices: services.count || 0,
      });
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', (error as AdminError).message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{loading ? '...' : value}</Text>
        </View>
        <Ionicons name={icon} size={32} color={color} />
      </View>
    </View>
  );

  const QuickAction = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage your barber shop</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon="calendar"
          color="#2563eb"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="people"
          color="#059669"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="bag"
          color="#d97706"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="receipt"
          color="#7c3aed"
        />
        <StatCard
          title="Total Services"
          value={stats.totalServices}
          icon="cut"
          color="#dc2626"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="View Appointments"
            icon="calendar-outline"
            color="#2563eb"
            onPress={() => navigation.navigate('Appointments' as never)}
          />
          <QuickAction
            title="Manage Deals"
            icon="bag-outline"
            color="#d97706"
            onPress={() => navigation.navigate('DealsManagement' as never)}
          />
          <QuickAction
            title="Customer Management"
            icon="people-outline"
            color="#059669"
            onPress={() => navigation.navigate('CustomerManagement' as never)}
          />
          <QuickAction
            title="Order History"
            icon="receipt-outline"
            color="#7c3aed"
            onPress={() => navigation.navigate('Orders' as never)}
          />
          <QuickAction
            title="Manage Services"
            icon="cut-outline"
            color="#dc2626"
            onPress={() => navigation.navigate('Services' as never)}
          />
          <QuickAction
            title="View Reports"
            icon="analytics-outline"
            color="#8b5cf6"
            onPress={() => navigation.navigate('Reports' as never)}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            📱 For full admin functionality, please use the web dashboard
          </Text>
          <Text style={styles.activitySubtext}>
            This mobile admin panel provides basic overview. Use the web interface for detailed management.
          </Text>
        </View>
      </View>

      {/* Admin Notice */}
      <View style={styles.section}>
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Admin Access</Text>
            <Text style={styles.noticeText}>
              For full admin capabilities including detailed tables, bulk operations, and advanced management features, please use the web dashboard.
            </Text>
          </View>
        </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    marginBottom: 8,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  noticeCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});

export default AdminScreen;