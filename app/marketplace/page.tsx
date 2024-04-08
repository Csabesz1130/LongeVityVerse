// Import necessary components and libraries
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard'; // A new component for displaying products
import { getMarketplaceItems } from '@/libs/marketplace'; // API call to fetch marketplace items
import { useSession } from 'next-auth/react';

const Marketplace = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch marketplace items and set state
    getMarketplaceItems().then(setItems);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(item => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
