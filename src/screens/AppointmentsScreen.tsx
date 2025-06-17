import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Appointment } from '../types';

type AppointmentError = { message: string };

const AppointmentsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, [user, filter]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          barbers (name),
          services (name, duration, price)
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (filter === 'upcoming') {
        query = query.gte('appointment_date', new Date().toISOString().split('T')[0]);
      } else if (filter === 'past') {
        query = query.lt('appointment_date', new Date().toISOString().split('T')[0]);
      }

      const { data } = await query;
      setAppointments(data as Appointment[] || []);
    } catch (error: unknown) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', (error as AppointmentError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const cancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId);

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Success', 'Appointment cancelled successfully');
                fetchAppointments();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#2563eb';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const isUpcoming = new Date(appointment.appointment_date) >= new Date();
    const canCancel = appointment.status === 'scheduled' && isUpcoming;

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{appointment.services?.name}</Text>
            <Text style={styles.barberName}>with {appointment.barbers?.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Ionicons
              name={getStatusIcon(appointment.status)}
              size={16}
              color="white"
            />
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {appointment.appointment_time} ({appointment.services?.duration} min)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>${appointment.services?.price}</Text>
          </View>
        </View>

        {canCancel && (
          <View style={styles.appointmentActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelAppointment(appointment.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const FilterButton = ({ title, value, active }: any) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.activeFilterButton]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, active && styles.activeFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
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
          <Text style={styles.title}>My Appointments</Text>
          <Text style={styles.subtitle}>Manage your bookings</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton title="Upcoming" value="upcoming" active={filter === 'upcoming'} />
        <FilterButton title="Past" value="past" active={filter === 'past'} />
        <FilterButton title="All" value="all" active={filter === 'all'} />
      </View>

      <ScrollView
        style={styles.appointmentsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading appointments...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'upcoming'
                ? "You don't have any upcoming appointments"
                : filter === 'past'
                ? "You don't have any past appointments"
                : "You haven't booked any appointments yet"}
            </Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
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
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  barberName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  appointmentActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
});

export default AppointmentsScreen;