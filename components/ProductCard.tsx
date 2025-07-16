// components/ProductCard.tsx

import React from 'react';
import Image from 'next/image';

type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    distributorURL: string;
};

// components/ProductCard.tsx

export const ProductCard: React.FC<{ item: Item }> = ({ item }) => {
    return (
      <div className="border p-4 rounded-lg shadow-lg">
        <Image src={item.imageUrl} alt={item.name} width={400} height={300} className="w-full h-auto object-cover rounded-t-lg" />
        <div className="p-4">
          <h2 className="text-lg font-bold">{item.name}</h2>
          <p className="mb-4">{item.description}</p>
          <span className="text-md font-semibold">${item.price.toFixed(2)}</span>
          <div className="mt-4">
            <a 
              href={`/products/${item.id}`} // Assuming you have a routing setup for individual products
              className="block bg-blue-500 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    );
  };
  