import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Service, Barber } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const BookScreen = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      console.log('BookScreen: Starting to fetch data...');
      
      // Fetch services - try with is_active filter, fallback if column doesn't exist
      const servicesResponse = await supabase.from('services').select('*');
      if (servicesResponse.error && servicesResponse.error.message.includes('is_active')) {
        console.log('Services: is_active column not found, fetching all services');
      }
      
      // Fetch barbers - try with is_active filter, fallback if column doesn't exist  
      let barbersResponse = await supabase.from('barbers').select('*').eq('is_active', true);
      if (barbersResponse.error && barbersResponse.error.message.includes('is_active')) {
        console.log('Barbers: is_active column not found, fetching all barbers');
        barbersResponse = await supabase.from('barbers').select('*');
      }

      console.log('BookScreen: Services response:', servicesResponse);
      console.log('BookScreen: Barbers response:', barbersResponse);

      if (servicesResponse.error) {
        console.error('Services error:', servicesResponse.error);
      }
      if (barbersResponse.error) {
        console.error('Barbers error:', barbersResponse.error);
      }

      setServices(servicesResponse.data || []);
      setBarbers(barbersResponse.data || []);
      
      console.log('BookScreen: Data set successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  const handleTimeSelection = (time: string) => {
    console.log('Time selected:', time);
    console.log('Time type:', typeof time);
    setSelectedTime(time);
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const bookAppointment = async () => {
    console.log('Starting booking process...');
    console.log('Current state:', {
      service: selectedService?.id,
      barber: selectedBarber?.id,
      date: selectedDate,
      time: selectedTime,
      timeType: typeof selectedTime
    });

    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      console.log('Validation failed:', {
        service: selectedService?.id,
        barber: selectedBarber?.id,
        date: selectedDate,
        time: selectedTime
      });
      Alert.alert('Error', 'Please select all required fields');
      return;
    }

    try {
      // Format the time to ensure it's in HH:mm format
      const [hours, minutes] = selectedTime.split(':');
      const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      
      console.log('BookScreen: Starting appointment booking...');
      console.log('User ID:', user?.id);
      console.log('Service:', selectedService);
      console.log('Barber:', selectedBarber);
      console.log('Date:', selectedDate);
      console.log('Original Time:', selectedTime);
      console.log('Formatted Time:', formattedTime);

      const appointmentData = {
        user_id: user?.id,
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        appointment_date: selectedDate,
        appointment_time: formattedTime,
        total_amount: selectedService.price || 0,
        status: 'scheduled',
      };

      console.log('Final appointment data:', appointmentData);

      const { error } = await supabase.from('appointments').insert(appointmentData);

      console.log('Appointment booking response:', { error });

      if (error) {
        console.error('Appointment booking error:', error);
        Alert.alert('Error', `Failed to book appointment: ${(error as Error).message || 'Unknown error'}`);
      } else {
        console.log('Appointment booked successfully');
        Alert.alert('Success', 'Appointment booked successfully!');
        // Reset form
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate('');
        setSelectedTime('');
      }
    } catch (error: unknown) {
      console.error('Booking error:', error);
      Alert.alert('Error', `Failed to book appointment: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={theme.colors.primary} // For iOS
          colors={[theme.colors.primary]} // For Android
        />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.white }]}>Book Appointment</Text>
        <Text style={[styles.subtitle, { color: theme.colors.white }]}>Choose your service and preferred time</Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Service</Text>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.selectionCard,
              { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow },
              selectedService?.id === service.id && [styles.selectedCard, { borderColor: theme.colors.primary }],
            ]}
            onPress={() => setSelectedService(service)}
          >
            <View style={styles.serviceTextContent}>
              <Text style={[styles.serviceName, { color: theme.colors.text }]}>{service.name}</Text>
              <Text style={[styles.serviceDescription, { color: theme.colors.textSecondary }]}>{service.description}</Text>
              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetail}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.serviceDetailText, { color: theme.colors.textSecondary }]}>{service.duration} min</Text>
                </View>
                <View style={styles.serviceDetail}>
                  <Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.serviceDetailText, { color: theme.colors.textSecondary }]}>${service.price}</Text>
                </View>
              </View>
            </View>
            <Image
              source={{ uri: service.image_url || 'https://picsum.photos/80' }}
              style={styles.serviceImage}
            />
            {selectedService?.id === service.id && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} style={styles.checkmarkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Barbers */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Barber</Text>
        {barbers.map((barber) => (
          <TouchableOpacity
            key={barber.id}
            style={[
              styles.selectionCard,
              { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow },
              selectedBarber?.id === barber.id && [styles.selectedCard, { borderColor: theme.colors.primary }],
            ]}
            onPress={() => setSelectedBarber(barber)}
          >
            <View style={styles.barberInfo}>
              <Text style={[styles.barberName, { color: theme.colors.text }]}>{barber.name}</Text>
              <Text style={[styles.barberSpecialties, { color: theme.colors.textSecondary }]}>
                Specialties: {barber.specialties?.join(', ') || 'General'}
              </Text>
            </View>
            {selectedBarber?.id === barber.id && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScrollContainer}>
          {getNextWeekDates().map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow },
                selectedDate === date && [styles.selectedDateButton, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateButtonText,
                { color: selectedDate === date ? theme.colors.white : theme.colors.text }
              ]}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Time</Text>
        <View style={styles.timeSlotsContainer}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlotButton,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow },
                selectedTime === time && [styles.selectedTimeSlot, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleTimeSelection(time)}
            >
              <Text style={[
                styles.timeSlotText,
                { color: selectedTime === time ? theme.colors.white : theme.colors.text }
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
          { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
          loading && styles.bookButtonDisabled
          ]}
          onPress={bookAppointment}
        disabled={loading}
        >
        <Text style={[styles.bookButtonText, { color: theme.colors.white }]}>Book Now</Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    // backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    // color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    // color: '#6c757d',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color: '#212529',
    marginBottom: 15,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
  },
  serviceInfo: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // flex: 1,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 16,
    resizeMode: 'cover',
  },
  serviceTextContent: {
    flex: 1,
  },
  checkmarkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  serviceDetails: {
    flexDirection: 'row',
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceDetailText: {
    fontSize: 14,
    marginLeft: 5,
  },
  barberInfo: {
    flex: 1,
    marginRight: 10,
  },
  barberName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  barberSpecialties: {
    fontSize: 14,
  },
  dateScrollContainer: {
    marginBottom: 15,
  },
  dateButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateButton: {
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTimeSlot: {
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bookButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bookButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BookScreen;