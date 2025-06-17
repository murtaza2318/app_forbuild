import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { Appointment, Deal, DealSliderItem, ProductSliderItem } from '../types';
import { BrandedHeader } from '../components/BrandedHeader';
import { QuickActionCard } from '../components/QuickActionCard';
import { ProductSlider } from '../components/ProductSlider';
import { MembershipCard } from '../components/MembershipCard';

type HomeError = { message: string };

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [products, setProducts] = useState<ProductSliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch next appointment
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          barbers (name),
          services (name, duration, price)
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(1);

      if (appointments && appointments.length > 0) {
        setNextAppointment(appointments[0] as Appointment);
      }

      // Fetch active products for the slider
      const { data: fetchedProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, image_url')
        .eq('is_active', true);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(fetchedProducts || []);
      }
    } catch (error: unknown) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', (error as HomeError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  
    const interval = setInterval(() => {
      if (products.length > 0) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % products.length;
          flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
          return nextIndex;
        });
      }
    }, 5000); // <-- You forgot the delay time here. Use 5000ms (5s) or what suits your needs.
  
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [products]); // <-- Missing dependency array
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  const ServiceCard = ({ name, duration, price, rating }: any) => (
    <View style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, { color: theme.colors.text }]}>{name}</Text>
        <View style={styles.serviceDetails}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.serviceDetailText, { color: theme.colors.textSecondary }]}>{duration} min</Text>
        </View>
      </View>
      <View style={styles.servicePricing}>
        <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>${price}</Text>
        <View style={styles.serviceRating}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>{rating}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <BrandedHeader
        title="Welcome back!"
        subtitle="Ready for your next grooming session?"
        rightIcon="log-out-outline"
        onRightIconPress={signOut}
      />

      {/* Branded Section */}
      <View style={[styles.brandedSection, { backgroundColor: theme.colors.surface }]}>
        <Image source={require('../../assets/logo3.png')} style={styles.brandLogo} />
        <Text style={[styles.brandText, { color: theme.colors.text }]}>Alpha Men Saloon</Text>
        <Text style={[styles.brandSubtext, { color: theme.colors.textSecondary }]}>Where Style Meets Excellence</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="calendar"
            title="Book Now"
            subtitle="Schedule appointment"
            color="#2563eb"
            onPress={() => navigation.navigate('Appointment' as never)}
          />
          <QuickActionCard
            icon="bag"
            title="Deals"
            subtitle="Hair products"
            color="#059669"
            onPress={() => navigation.navigate('Deals' as never)}
          />
        </View>
      </View>

      {/* Product Slider */}
      {products.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured Deals</Text>
          <FlatList
            ref={flatListRef}
            data={products}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.dealSlide}
                onPress={() => navigation.navigate('Main', { screen: 'Deals' })}
              >
                <Image 
                  source={{ uri: item.image_url || 'https://via.placeholder.com/300x150?text=Product' }}
                  style={styles.dealImage}
                />
                <View style={styles.dealOverlay}>
                  <Text style={styles.dealTitle}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.dealSliderContent}
            getItemLayout={(_, index) => ({
              length: width - (2 * 20),
              offset: (width - (2 * 20)) * index,
              index,
            })}
          />
        </View>
      )}

      {/* Next Appointment */}
      {nextAppointment && (
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Next Appointment</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.appointmentRow}>
                <Text style={[styles.appointmentService, { color: theme.colors.text }]}>{nextAppointment.services?.name}</Text>
                <Text style={[styles.appointmentDuration, { color: theme.colors.textSecondary }]}>{nextAppointment.services?.duration} min</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={[styles.appointmentBarber, { color: theme.colors.textSecondary }]}>with {nextAppointment.barbers?.name}</Text>
                <Text style={[styles.appointmentDateTime, { color: theme.colors.textSecondary }]}>
                  {new Date(nextAppointment.appointment_date).toLocaleDateString()} at {nextAppointment.appointment_time}
                </Text>
              </View>
              <TouchableOpacity style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.viewDetailsText, { color: theme.colors.white }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Membership Upsell */}
      <View style={styles.section}>
        <View style={[styles.card, styles.membershipCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.membershipContent}>
            <View>
              <View style={styles.membershipHeader}>
                <Ionicons name="diamond" size={16} color="#d97706" />
                <Text style={[styles.membershipTitle, { color: theme.colors.text }]}>Premium Membership</Text>
              </View>
              <Text style={[styles.membershipSubtitle, { color: theme.colors.textSecondary }]}>Save up to 25% on all services</Text>
            </View>
            <TouchableOpacity
              style={[styles.membershipButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Membership' as never)}
            >
              <Text style={[styles.membershipButtonText, { color: theme.colors.white }]}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Featured Services */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Popular Services</Text>
          <View style={styles.servicesContainer}>
            <ServiceCard
              name="Classic Haircut"
              duration={45}
              price="25.00"
              rating="4.8"
            />
            <ServiceCard
              name="Premium Cut & Style"
              duration={60}
              price="40.00"
              rating="4.9"
            />
          </View>
          <TouchableOpacity
            style={[styles.bookServiceButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Appointment' as never)}
          >
            <Text style={[styles.bookServiceText, { color: theme.colors.white }]}>Book a Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandedSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dealSliderContent: {
    // Removed paddingRight as slides will span full content width
  },
  dealSlide: {
    width: width - (2 * 20), // (Screen width - (paddingHorizontal * 2))
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    // Removed marginRight as slides will span full content width
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dealOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  appointmentDetails: {
    marginTop: 8,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '500',
  },
  appointmentDuration: {
    fontSize: 14,
  },
  appointmentBarber: {
    fontSize: 14,
  },
  appointmentDateTime: {
    fontSize: 14,
  },
  viewDetailsButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '600',
  },
  membershipCard: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  membershipContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  membershipSubtitle: {
    fontSize: 13,
    maxWidth: '80%',
  },
  membershipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  membershipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  servicesContainer: {
    marginTop: 16,
    gap: 12,
  },
  serviceCard: {
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    fontSize: 13,
    marginLeft: 4,
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
  },
  bookServiceButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookServiceText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;