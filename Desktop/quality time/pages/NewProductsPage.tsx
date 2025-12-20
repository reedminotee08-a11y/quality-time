import React from 'react';
import ProductDisplay from '../components/ProductDisplay';
import { Product } from '../types';

interface NewProductsPageProps {
  addToCart: (product: Product) => void;
}

const NewProductsPage: React.FC<NewProductsPageProps> = ({ addToCart }) => {
  return (
    <ProductDisplay 
      addToCart={addToCart}
      viewMode="grid"
      showFilters={true}
    />
  );
};

export default NewProductsPage;
