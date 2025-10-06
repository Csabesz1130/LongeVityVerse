import mongoose from 'mongoose';

const MarketplaceItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [String],
  tags: [String],
  rating: Number,
  reviews: Number,
  createdAt: Date,
});

const MarketplaceItem = mongoose.models.MarketplaceItem || mongoose.model('MarketplaceItem', MarketplaceItemSchema);

const marketplaceTemplates = [
  { title: 'NAD+ Precursor Supplement', category: 'supplement', price: 49.99, tags: ['NAD+', 'cellular health', 'energy'] },
  { title: 'Longevity Blood Test Panel', category: 'testing', price: 299.99, tags: ['biomarkers', 'testing', 'health'] },
  { title: 'Personalized Nutrition Plan', category: 'service', price: 199.99, tags: ['nutrition', 'personalized', 'diet'] },
  { title: 'Fitness Tracker Pro', category: 'device', price: 149.99, tags: ['wearable', 'tracking', 'fitness'] },
  { title: 'Longevity Coaching (1 Month)', category: 'coaching', price: 499.99, tags: ['coaching', 'guidance', 'personalized'] },
];

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedMarketplace(options: SeedOptions, users: any[]) {
  const items: any[] = [];
  const itemCount = options.minimal ? 3 : options.production ? 0 : marketplaceTemplates.length;
  if (itemCount === 0) return [];
  for (let i = 0; i < itemCount; i++) {
    const template = marketplaceTemplates[i];
    const vendor = users[Math.floor(Math.random() * users.length)];
    const item = await MarketplaceItem.create({
      ...template,
      description: generateLorem(100),
      vendor: vendor._id,
      images: [`https://picsum.photos/seed/${i}/400/300`],
      rating: Math.floor(Math.random() * 20 + 80) / 20,
      reviews: Math.floor(Math.random() * 100),
      createdAt: new Date(),
    });
    items.push(item);
  }
  return items;
}

function generateLorem(words: number): string {
  const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
  let result = '';
  for (let i = 0; i < words; i++) { result += lorem[Math.floor(Math.random() * lorem.length)] + ' '; }
  return result.trim();
}


