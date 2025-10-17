import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => boolean;
  updateStock: (productId: string, newStock: number) => void;
  adjustStock: (productId: string, amount: number) => boolean;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'cash-register-products';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = window.localStorage.getItem(STORAGE_KEY);
      return storedProducts ? JSON.parse(storedProducts) : [];
    } catch (error) {
      console.error("Error reading products from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Error writing products to localStorage", error);
    }
  }, [products]);

  const addProduct = useCallback((product: Product): boolean => {
    if (products.some(p => p.id === product.id)) {
      alert("Un produit avec ce code QR existe déjà.");
      return false;
    }
    setProducts(prevProducts => [...prevProducts, product]);
    return true;
  }, [products]);

  const updateStock = useCallback((productId: string, newStock: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
      )
    );
  }, []);

  const adjustStock = useCallback((productId: string, amount: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const newStock = product.stock + amount;
    if (newStock < 0) {
      return false; // Not enough stock
    }

    updateStock(productId, newStock);
    return true;
  }, [products, updateStock]);

  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, [products]);

  const value = { products, addProduct, updateStock, getProductById, adjustStock };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
