import React from 'react';
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";

export const metadata = getSEOTags({
  title: "Longevity Hub",
  description: "Explore, learn, and connect on your journey to longevity."
});

const Hub = () => {
  return (
    <ClientLayout>
      <main className="p-4">
        <h1 className="text-3xl font-bold underline">Longevity Hub</h1>
        <section className="my-4">
          <h2 className="text-2xl">Peer-reviewed Contents</h2>
          {/* Placeholder for peer-reviewed contents */}
        </section>
        <section className="my-4">
          <h2 className="text-2xl">Marketplace</h2>
          {/* Placeholder for marketplace functionalities */}
        </section>
        <section className="my-4">
          <h2 className="text-2xl">Community Networking</h2>
          {/* Placeholder for networking and community interaction */}
        </section>
      </main>
    </ClientLayout>
  );
};

export default Hub;
