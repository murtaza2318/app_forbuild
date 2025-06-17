import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  total_appointments: number;
  total_spent: number;
  last_appointment: string;
  status: 'active' | 'inactive';
}

const CustomerManagementScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filterCustomers = () => {
    let filtered = customers;

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.full_name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query)
      );
    }

    setFilteredCustomers(filtered);
  };

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, selectedFilter, filterCustomers]);

  const fetchCustomers = async () => {
    try {
      // Fetch profiles with appointment and order statistics
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          created_at
        `);

      if (profiles) {
        // Fetch appointment statistics for each customer
        const customersWithStats = await Promise.all(
          profiles.map(async (profile) => {
            const [appointmentsResult, ordersResult] = await Promise.all([
              supabase
                .from('appointments')
                .select('*, services(price)')
                .eq('customer_id', profile.id),
              supabase
                .from('orders')
                .select('total_amount')
                .eq('customer_id', profile.id)
            ]);

            const appointments = appointmentsResult.data || [];
            const orders = ordersResult.data || [];

            const totalAppointments = appointments.length;
            const appointmentSpent = appointments
              .filter(a => a.status === 'completed')
              .reduce((sum, a) => sum + (a.services?.price || 0), 0);
            const orderSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
            const totalSpent = appointmentSpent + orderSpent;

            const lastAppointment = appointments
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            const daysSinceLastAppointment = lastAppointment 
              ? Math.floor((Date.now() - new Date(lastAppointment.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 999;

            return {
              ...profile,
              total_appointments: totalAppointments,
              total_spent: totalSpent,
              last_appointment: lastAppointment?.created_at || '',
              status: (daysSinceLastAppointment > 90 || totalAppointments === 0) ? 'inactive' : 'active'
            } as Customer;
          })
        );

        // Sort by total spent (highest first)
        customersWithStats.sort((a, b) => b.total_spent - a.total_spent);
        setCustomers(customersWithStats);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const sendMessage = (customer: Customer) => {
    Alert.alert(
      'Send Message',
      `Send a message to ${customer.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Alert.alert('Info', 'Email feature coming soon') },
        { text: 'SMS', onPress: () => Alert.alert('Info', 'SMS feature coming soon') },
      ]
    );
  };

  const viewCustomerDetails = (customer: Customer) => {
    Alert.alert(
      'Customer Details',
      `Name: ${customer.full_name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Appointments: ${customer.total_appointments}\nTotal Spent: $${customer.total_spent.toFixed(2)}\nStatus: ${customer.status}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => Alert.alert('Info', 'Edit feature coming soon') },
      ]
    );
  };

  const FilterButton = ({ filter, label }: { filter: 'all' | 'active' | 'inactive'; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CustomerCard = ({ customer }: { customer: Customer }) => {
    const daysSinceLastAppointment = customer.last_appointment 
      ? Math.floor((Date.now() - new Date(customer.last_appointment).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <TouchableOpacity 
        style={styles.customerCard}
        onPress={() => viewCustomerDetails(customer)}
      >
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.avatarText}>
              {customer.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.full_name || 'Unknown'}</Text>
            <Text style={styles.customerEmail}>{customer.email}</Text>
            {customer.phone && <Text style={styles.customerPhone}>{customer.phone}</Text>}
          </View>

          <View style={styles.customerStatus}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: customer.status === 'active' ? '#059669' : '#ef4444' }
            ]}>
              <Text style={styles.statusText}>{customer.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.customerStats}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.statText}>{customer.total_appointments} appointments</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text style={styles.statText}>${customer.total_spent.toFixed(2)} spent</Text>
          </View>
          
          {daysSinceLastAppointment !== null && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>
                {daysSinceLastAppointment === 0 ? 'Today' : 
                 daysSinceLastAppointment === 1 ? 'Yesterday' :
                 `${daysSinceLastAppointment} days ago`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.customerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => sendMessage(customer)}
          >
            <Ionicons name="mail-outline" size={16} color="#2563eb" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Book appointment feature coming soon')}
          >
            <Ionicons name="calendar-outline" size={16} color="#059669" />
            <Text style={styles.actionButtonText}>Book</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => viewCustomerDetails(customer)}
          >
            <Ionicons name="eye-outline" size={16} color="#7c3aed" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>Customer Management</Text>
          <Text style={styles.subtitle}>Manage your customer base</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton filter="all" label={`All (${customers.length})`} />
        <FilterButton filter="active" label={`Active (${customers.filter(c => c.status === 'active').length})`} />
        <FilterButton filter="inactive" label={`Inactive (${customers.filter(c => c.status === 'inactive').length})`} />
      </View>

      {/* Customer List */}
      <ScrollView
        style={styles.customersList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No customers match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  customersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
  },
  customerStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  customerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default CustomerManagementScreen;