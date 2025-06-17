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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';

type DealHistoryError = { message: string };

const DealsHistoryScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', (error as DealHistoryError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'cancelled':
        return '#dc2626';
      default:
        return theme.colors.textSecondary;
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        setSelectedOrder(order);
        setShowDetails(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderDate, { color: theme.colors.text }]}>
            {formatDate(order.created_at)}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            />
            <Text style={[styles.orderStatus, { color: theme.colors.textSecondary }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.orderTotal, { color: theme.colors.primary }]}>
          ${order.total_amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.orderItems}>
        {order.order_items.slice(0, 2).map((item: any) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>
              {item.product.name}
            </Text>
            <View style={styles.itemDetails}>
              <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>
                Qty: {item.quantity}
              </Text>
              <Text style={[styles.itemPrice, { color: theme.colors.textSecondary }]}>
                ${(item.price_per_item * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
        {order.order_items.length > 2 && (
          <Text style={[styles.moreItems, { color: theme.colors.primary }]}>
            +{order.order_items.length - 2} more items
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const OrderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetails(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Order Details
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedOrder && (
              <>
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Order ID
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {selectedOrder.id}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Order Date
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatDate(selectedOrder.created_at)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Status
                  </Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(selectedOrder.status) },
                      ]}
                    />
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Items
                  </Text>
                  {selectedOrder.order_items.map((item: any) => (
                    <View key={item.id} style={styles.detailItem}>
                      <Image
                        source={{ uri: item.product.image_url || 'https://via.placeholder.com/50' }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: theme.colors.text }]}>
                          {item.product.name}
                        </Text>
                        <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                          {item.product.description}
                        </Text>
                        <View style={styles.itemDetails}>
                          <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>
                            Quantity: {item.quantity}
                          </Text>
                          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
                            ${(item.price_per_item * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.totalSection}>
                  <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                    Total Amount
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                    ${selectedOrder.total_amount.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.title, { color: theme.colors.white }]}>Deals History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.white }]}>
          View your past purchases
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
              No purchases yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
              Your deal history will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </ScrollView>

      <OrderDetailsModal />
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
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderStatus: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  orderItem: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
  },
  moreItems: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
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
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
});

export default DealsHistoryScreen; 