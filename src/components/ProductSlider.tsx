import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ProductSliderItem } from '../types';

interface ProductSliderProps {
  products: ProductSliderItem[];
  onProductPress: (product: ProductSliderItem) => void;
}

const { width } = Dimensions.get('window');

export const ProductSlider: React.FC<ProductSliderProps> = ({
  products,
  onProductPress,
}) => {
  return (
    <View style={styles.container}>
      {products.map((product) => (
        <TouchableOpacity
          key={product.id}
          style={styles.slide}
          onPress={() => onProductPress(product)}
        >
          <Image
            source={{ uri: product.image_url || 'https://via.placeholder.com/300x150?text=Product' }}
            style={styles.image}
          />
          <View style={styles.overlay}>
            <Text style={styles.title}>{product.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  slide: {
    width: width - (2 * 20),
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
}); 