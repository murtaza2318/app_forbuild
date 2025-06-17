import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

const DealsManagementScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxBookings, setMaxBookings] = useState('');

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      Alert.alert('Error', 'Failed to load deals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals();
  };

  const handleAddDeal = async () => {
    try {
      const { error } = await supabase.from('deals').insert([
        {
          title,
          description,
          price: parseFloat(price),
          original_price: parseFloat(originalPrice),
          image_url: imageUrl,
          start_date: startDate,
          end_date: endDate,
          max_bookings: maxBookings ? parseInt(maxBookings) : null,
          is_active: true,
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Deal added successfully');
      setShowAddModal(false);
      resetForm();
      fetchDeals();
    } catch (error) {
      console.error('Error adding deal:', error);
      Alert.alert('Error', 'Failed to add deal');
    }
  };

  const handleUpdateDeal = async () => {
    if (!selectedDeal) return;

    try {
      const { error } = await supabase
        .from('deals')
        .update({
          title,
          description,
          price: parseFloat(price),
          original_price: parseFloat(originalPrice),
          image_url: imageUrl,
          start_date: startDate,
          end_date: endDate,
          max_bookings: maxBookings ? parseInt(maxBookings) : null,
        })
        .eq('id', selectedDeal.id);

      if (error) throw error;

      Alert.alert('Success', 'Deal updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal:', error);
      Alert.alert('Error', 'Failed to update deal');
    }
  };

  const handleToggleActive = async (deal: any) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id);

      if (error) throw error;

      fetchDeals();
    } catch (error) {
      console.error('Error toggling deal status:', error);
      Alert.alert('Error', 'Failed to update deal status');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setStartDate('');
    setEndDate('');
    setMaxBookings('');
    setSelectedDeal(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const DealCard = ({ deal }: { deal: any }) => (
    <View style={[styles.dealCard, { backgroundColor: theme.colors.surface }]}>
      <Image
        source={{ uri: deal.image_url || 'https://via.placeholder.com/100' }}
        style={styles.dealImage}
      />
      <View style={styles.dealInfo}>
        <Text style={[styles.dealTitle, { color: theme.colors.text }]}>{deal.title}</Text>
        <Text style={[styles.dealDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {deal.description}
        </Text>
        <View style={styles.dealDetails}>
          <View style={styles.priceContainer}>
            <Text style={[styles.currentPrice, { color: theme.colors.primary }]}>
              ${deal.price.toFixed(2)}
            </Text>
            <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
              ${deal.original_price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDate(deal.start_date)} - {formatDate(deal.end_date)}
            </Text>
          </View>
        </View>
        <View style={styles.dealActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setSelectedDeal(deal);
              setTitle(deal.title);
              setDescription(deal.description);
              setPrice(deal.price.toString());
              setOriginalPrice(deal.original_price.toString());
              setImageUrl(deal.image_url || '');
              setStartDate(deal.start_date);
              setEndDate(deal.end_date);
              setMaxBookings(deal.max_bookings?.toString() || '');
              setShowEditModal(true);
            }}
          >
            <Ionicons name="pencil" size={20} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: deal.is_active ? theme.colors.error : theme.colors.success },
            ]}
            onPress={() => handleToggleActive(deal)}
          >
            <Ionicons
              name={deal.is_active ? 'close-circle' : 'checkmark-circle'}
              size={20}
              color="white"
            />
            <Text style={styles.actionButtonText}>
              {deal.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const DealFormModal = ({ isEdit = false }) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
      }}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {isEdit ? 'Edit Deal' : 'Add New Deal'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter deal title"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter deal description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Price</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter price"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Original Price</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  placeholder="Enter original price"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Image URL</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Enter image URL"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Start Date</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>End Date</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Max Bookings</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                value={maxBookings}
                onChangeText={setMaxBookings}
                placeholder="Enter max bookings (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={isEdit ? handleUpdateDeal : handleAddDeal}
            >
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Deal' : 'Add Deal'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading deals...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.white }]}>Manage Deals</Text>
        <Text style={[styles.subtitle, { color: theme.colors.white }]}>
          Create and manage special offers
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Deal</Text>
        </TouchableOpacity>

        {deals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
              No deals yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
              Add your first deal to get started
            </Text>
          </View>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))
        )}
      </ScrollView>

      <DealFormModal />
      <DealFormModal isEdit />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dealCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  dealInfo: {
    padding: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  dealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
  },
  dealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DealsManagementScreen; 