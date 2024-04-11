// pages/marketplace/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
// Correct the path as per your project structure. It might be something like:
import Layout from './components/layout';

// Define the type for item
type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    distributorURL: string;
};

// Correct the path for the ProductCard component as per your project structure
import { ProductCard } from '@/components/ProductCard';

//export { ProductCard };

const MarketplacePage = () => {
  // Use useState and useEffect as needed in your component
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // fetch or set items here
  }, []);

  return (
    <Layout>
      <div className="marketplace">
        {items.map((item: Item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </Layout>
  );
};

export default MarketplacePage;
