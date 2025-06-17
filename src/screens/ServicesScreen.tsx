import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Service } from '../types';

const ServicesScreen = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('name');

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration.toString(),
        price: service.price.toString(),
        category: service.category || '',
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
      });
    }
    setModalVisible(true);
  };

  const saveService = async () => {
    if (!formData.name || !formData.duration || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        category: formData.category,
        is_active: true,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        Alert.alert('Success', 'Service updated successfully');
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;
        Alert.alert('Success', 'Service created successfully');
      }

      setModalVisible(false);
      fetchServices();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      fetchServices();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <View style={[styles.serviceCard, !service.is_active && styles.inactiveCard]}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
        <View style={styles.serviceActions}>
          {isAdmin && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openModal(service)}
              >
                <Ionicons name="pencil" size={16} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleServiceStatus(service)}
              >
                <Ionicons 
                  name={service.is_active ? "eye" : "eye-off"} 
                  size={16} 
                  color={service.is_active ? "#059669" : "#ef4444"} 
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{service.duration} min</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>${service.price}</Text>
        </View>
        {service.category && (
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{service.category}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Available barber services</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal()}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Service</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.servicesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading services...</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cut-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptySubtitle}>
              {isAdmin ? 'Add your first service to get started' : 'Services will appear here when available'}
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Service Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Add Service'}
            </Text>
            <TouchableOpacity onPress={saveService}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Classic Haircut"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Service description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                placeholder="e.g., 45"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="e.g., 25.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Haircut, Styling, Beard"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  servicesList: {
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
  serviceCard: {
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
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  serviceHeader: {
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
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default ServicesScreen;