// components/ProductCard.tsx

import React from 'react';

type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
};

// The item prop is now strongly typed with the 'Item' type
const ProductCard: React.FC<{ item: Item }> = ({ item }) => {
    return (
        <div>Implement the card UI here</div>
    );
};

export default ProductCard;
