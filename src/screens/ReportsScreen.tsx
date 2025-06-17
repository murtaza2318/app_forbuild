import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

interface ReportData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topServices: Array<{ name: string; count: number; revenue: number }>;
  monthlyStats: Array<{ month: string; appointments: number; revenue: number }>;
}

interface ReportError {
  message: string;
}

const ReportsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [reportData, setReportData] = useState<ReportData>({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topServices: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      const now = new Date();
      let startDate: Date;

      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // Fetch appointments data
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price)
        `)
        .gte('created_at', startDate.toISOString());

      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Calculate statistics
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
      
      const appointmentRevenue = appointments
        ?.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0;
      
      const orderRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
      const totalRevenue = appointmentRevenue + orderRevenue;
      
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? orderRevenue / totalOrders : 0;

      // Top services
      const serviceStats = appointments
        ?.filter(a => a.status === 'completed')
        .reduce((acc, a) => {
          const serviceName = a.services?.name || 'Unknown';
          const servicePrice = a.services?.price || 0;
          
          if (!acc[serviceName]) {
            acc[serviceName] = { count: 0, revenue: 0 };
          }
          acc[serviceName].count++;
          acc[serviceName].revenue += servicePrice;
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>) || {};

      const topServices = Object.entries(serviceStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Monthly stats (simplified for demo)
      const monthlyStats = [
        { month: 'Jan', appointments: Math.floor(totalAppointments * 0.8), revenue: totalRevenue * 0.8 },
        { month: 'Feb', appointments: Math.floor(totalAppointments * 0.9), revenue: totalRevenue * 0.9 },
        { month: 'Mar', appointments: totalAppointments, revenue: totalRevenue },
      ];

      setReportData({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topServices,
        monthlyStats,
      });
    } catch (error: unknown) {
      console.error('Error fetching report data:', error);
      Alert.alert('Error', (error as ReportError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  const PeriodButton = ({ period, label }: { period: 'week' | 'month' | 'year'; label: string }) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.activePeriodButton]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[styles.periodText, selectedPeriod === period && styles.activePeriodText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ServiceItem = ({ service, index }: { service: any; index: number }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceStats}>
          {service.count} bookings • ${service.revenue.toFixed(2)} revenue
        </Text>
      </View>
      <View style={styles.serviceRevenue}>
        <Text style={styles.revenueAmount}>${service.revenue.toFixed(2)}</Text>
      </View>
    </View>
  );

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
          <Text style={styles.title}>Reports & Analytics</Text>
          <Text style={styles.subtitle}>Business insights and performance</Text>
        </View>
      </View>

      {/* Period Selection */}
      <View style={styles.periodSelector}>
        <PeriodButton period="week" label="This Week" />
        <PeriodButton period="month" label="This Month" />
        <PeriodButton period="year" label="This Year" />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Appointments"
              value={loading ? '...' : reportData.totalAppointments}
              icon="calendar"
              color="#2563eb"
              subtitle={`${reportData.completedAppointments} completed`}
            />
            
            <StatCard
              title="Total Revenue"
              value={loading ? '...' : `$${reportData.totalRevenue.toFixed(2)}`}
              icon="cash"
              color="#059669"
              subtitle="All sources"
            />
            
            <StatCard
              title="Total Orders"
              value={loading ? '...' : reportData.totalOrders}
              icon="bag"
              color="#d97706"
              subtitle={`$${reportData.averageOrderValue.toFixed(2)} avg`}
            />
            
            <StatCard
              title="Completion Rate"
              value={loading ? '...' : `${reportData.totalAppointments > 0 ? 
                Math.round((reportData.completedAppointments / reportData.totalAppointments) * 100) : 0}%`}
              icon="checkmark-circle"
              color="#7c3aed"
              subtitle={`${reportData.cancelledAppointments} cancelled`}
            />
          </View>
        </View>

        {/* Top Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Services</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : reportData.topServices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No service data available</Text>
            </View>
          ) : (
            <View style={styles.servicesList}>
              {reportData.topServices.map((service, index) => (
                <ServiceItem key={service.name} service={service} index={index} />
              ))}
            </View>
          )}
        </View>

        {/* Monthly Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          
          <View style={styles.trendsContainer}>
            {reportData.monthlyStats.map((month, index) => (
              <View key={month.month} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{month.month}</Text>
                <View style={styles.trendBars}>
                  <View style={styles.trendBar}>
                    <View 
                      style={[
                        styles.trendBarFill, 
                        { 
                          height: `${(month.appointments / Math.max(...reportData.monthlyStats.map(m => m.appointments))) * 100}%`,
                          backgroundColor: '#2563eb'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.trendValue}>{month.appointments}</Text>
                </View>
                <Text style={styles.trendRevenue}>${month.revenue.toFixed(0)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Share</Text>
          
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#2563eb" />
            <Text style={styles.exportButtonText}>Download PDF Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="share-outline" size={20} color="#059669" />
            <Text style={styles.exportButtonText}>Share Report</Text>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  activePeriodButton: {
    backgroundColor: '#2563eb',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activePeriodText: {
    color: 'white',
  },
  content: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
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
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  servicesList: {
    paddingHorizontal: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  serviceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceStats: {
    fontSize: 12,
  },
  serviceRevenue: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendMonth: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  trendBars: {
    alignItems: 'center',
    marginBottom: 8,
  },
  trendBar: {
    width: 24,
    height: 60,
    borderRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendRevenue: {
    fontSize: 10,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
});

export default ReportsScreen;