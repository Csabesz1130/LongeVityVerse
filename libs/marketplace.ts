// libs/marketplace.ts

export const getMarketplaceItems = () => {
    return Promise.resolve([
      {
        id: 1,
        name: "Longevity Supplement Pack",
        description: "A curated selection of supplements to support your longevity journey.",
        price: "99.99",
      },
      // Add more items as needed
    ]);
  };
  