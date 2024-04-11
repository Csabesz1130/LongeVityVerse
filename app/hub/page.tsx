import { useState } from 'react';
import React from 'react';
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import { BookIcon, ShoppingCartIcon, UserGroupIcon } from '@heroicons/react/outline';

export const metadata = getSEOTags({
  title: "Longevity Hub",
  description: "Explore, learn, and connect on your journey to longevity."
});

const Hub = () => {
  return (
    <ClientLayout>
      <main className="p-4 md:p-8 lg:p-12">
        <h1 className="text-3xl font-bold mb-4">Longevity Hub</h1>
        <div className="mb-4">
          <input type="text" placeholder="Search..." className="border border-gray-300 px-4 py-2 rounded mr-2" />
          <select className="border border-gray-300 px-4 py-2 rounded">
            <option>All Categories</option>
            {/* Placeholder for category options */}
          </select>
        </div>
        <section className="my-8">
          <BookIcon className="h-6 w-6 inline-block mr-2" />
          <h2 className="text-2xl inline-block">Peer-reviewed Contents</h2>
          <p className="mt-2">Explore the latest research, articles, and insights on longevity, carefully curated by our expert community.</p>
          {/* Placeholder for preview of top peer-reviewed articles */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Explore Articles</button>
        </section>
        <section className="my-8">
          <ShoppingCartIcon className="h-6 w-6 inline-block mr-2" />
          <h2 className="text-2xl inline-block">Marketplace</h2>
          <p className="mt-2">Discover and purchase innovative longevity products and services.</p>
          {/* Placeholder for featured products or categories */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Browse Products</button>
        </section>
        <section className="my-8">
          <UserGroupIcon className="h-6 w-6 inline-block mr-2" />
          <h2 className="text-2xl inline-block">Community Networking</h2>
          <p className="mt-2">Connect with like-minded individuals, experts, and clinics in the longevity space.</p>
          {/* Placeholder for community highlights or discussions */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Join the Community</button>
        </section>
        <section className="my-8">
          <h2 className="text-2xl">Recommended for You</h2>
          {/* Placeholder for personalized content */}
        </section>
        <div className="my-8">
          <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Share on Facebook</button>
          <button className="bg-blue-400 text-white px-4 py-2 rounded">Share on Twitter</button>
        </div>
      </main>
    </ClientLayout>
  );
};

export default Hub;