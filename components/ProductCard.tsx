// components/ProductCard.tsx

import { ItemType } from '../types'; // Import the 'ItemType' type from the appropriate module

const ProductCard = ({ item }: { item: ItemType }) => {
    return (
        <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p>{item.description}</p>
            <div className="mt-2">
                <span className="text-md font-semibold">${item.price}</span>
            </div>
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add to Cart
            </button>
        </div>
    );
};
  
  export default ProductCard;
  