import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Order } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const OrdersScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(data as Order[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'processing':
        return theme.colors.primary;
      case 'shipped':
        return theme.colors.secondary;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'build-outline';
      case 'shipped':
        return 'airplane-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const isExpanded = expandedOrders.has(order.id);
    
    return (
      <View style={[styles.orderCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order.id)}
        >
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: theme.colors.text }]}>Order #{order.id.slice(-8)}</Text>
            <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons
                name={getStatusIcon(order.status)}
                size={16}
                color={theme.colors.white}
              />
              <Text style={[styles.statusText, { color: theme.colors.white }]}>{order.status}</Text>
            </View>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Quick Summary */}
        <View style={[styles.orderSummary, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>${order.total_amount.toFixed(2)}</Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="receipt-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Order ID:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{order.id}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Placed:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Payment:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Card ending in ****</Text>
              </View>
            </View>

            <View style={[styles.orderItems, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.itemsHeader, { color: theme.colors.text }]}>Items Ordered:</Text>
              {order.order_items?.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.products?.name}</Text>
                    <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
                      {item.products?.description || 'Premium barber product'}
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary }]}>Qty: {item.quantity}</Text>
                    <Text style={[styles.itemPrice, { color: theme.colors.text }]}>${item.price.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.orderFooter, { borderTopColor: theme.colors.border }]}>
              <View style={styles.totalBreakdown}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Subtotal:</Text>
                  <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                    ${(order.total_amount * 0.9).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Tax:</Text>
                  <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                    ${(order.total_amount * 0.1).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.finalTotalLabel, { color: theme.colors.text }]}>Total:</Text>
                  <Text style={[styles.finalTotalAmount, { color: theme.colors.primary }]}>${order.total_amount.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Download Receipt</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Ionicons name="refresh-outline" size={16} color={theme.colors.success} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Reorder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Order History</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track your purchases</Text>
        </View>
      </View>

      <ScrollView
        style={styles.ordersList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
      >
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={{ color: theme.colors.text }}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="bag-outline" size={64} color={theme.colors.border} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No orders found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
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
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  ordersList: {
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
    paddingBottom: 12,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIcon: {
    marginLeft: 4,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemCount: {
    fontSize: 14,
  },
  expandedContent: {
    paddingTop: 16,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  itemsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  totalBreakdown: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 14,
  },
  finalTotal: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
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
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  orderItems: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;