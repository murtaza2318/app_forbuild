import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { Product } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { BrandedHeader } from '../components/BrandedHeader';

const ShopScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const categories = ['All', 'Hair Care', 'Styling', 'Beard Care', 'Tools'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      console.log('ShopScreen: Starting to fetch products...');
      
      // Try with is_active filter first, fallback if column doesn't exist
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (error && error.message.includes('is_active')) {
        console.log('Products: is_active column not found, fetching all products');
        const fallbackResponse = await supabase
          .from('products')
          .select('*')
          .order('name');
        data = fallbackResponse.data;
        error = fallbackResponse.error;
      }

      console.log('ShopScreen: Products response:', { data, error });

      if (error) {
        console.error('Products error:', error);
        Alert.alert('Error', 'Failed to load products. Please try again.');
      }

      setProducts(data || []);
      console.log('ShopScreen: Products set successfully, count:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
    setRefreshing(false);
    }, 2000);
  }, []);

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to place an order');
      return;
    }

    if (Object.keys(cart).length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Calculate total amount from cart object
      const totalAmount = Object.entries(cart).reduce((sum, [productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return sum + (product ? product.price * quantity : 0);
      }, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items from cart object
      const orderItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          order_id: order.id,
          product_id: productId,
          quantity: quantity,
          price_per_item: product ? product.price : 0,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      setCart({});
      setShowCart(false);

      Alert.alert(
        'Success',
        'Your order has been placed successfully!',
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('DealsHistory'),
          },
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const quantity = cart[product.id] || 0;

    return (
      <View style={[styles.productCard, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text }]}>{product.name}</Text>
          <Text style={[styles.productDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: theme.colors.primary }]}>${product.price.toFixed(2)}</Text>
            <View style={styles.quantityControls}>
              {quantity > 0 && (
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => removeFromCart(product.id)}
                >
                  <Ionicons name="remove" size={18} color="white" />
                </TouchableOpacity>
              )}
              {quantity > 0 && (
                <Text style={[styles.quantityText, { color: theme.colors.text }]}>{quantity}</Text>
              )}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => addToCart(product.id)}
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BrandedHeader
        title="Deals"
        subtitle="Exclusive offers and products"
        rightIcon="time-outline"
        onRightIconPress={() => navigation.navigate('DealsHistory')}
      />

      {/* Branded Section */}
      <View style={styles.brandedSection}>
        <Image source={require('../../assets/logo3.png')} style={styles.brandLogo} />
        <Text style={[styles.brandText, { color: theme.colors.text }]}>Premium Products</Text>
        <Text style={[styles.brandSubtext, { color: theme.colors.textSecondary }]}>Curated for your style</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border 
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              { 
                color: selectedCategory === category ? theme.colors.white : theme.colors.text 
              },
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <ScrollView 
        style={styles.productsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>

      {/* Cart Summary */}
      {getCartItemCount() > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{getCartItemCount()} items</Text>
            <Text style={styles.cartTotal}>${getCartTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleOrder}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
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
  brandedSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: theme.colors.surface,
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
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    marginTop: 12,
    marginHorizontal: 20,
    maxHeight: 50,
  },
  categoryButton: {
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productsContainer: {
    flex: 1,
    marginTop: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  productCard: {
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  cartSummary: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#cf814d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShopScreen;