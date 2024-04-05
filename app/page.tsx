import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* Customize the Hero component to showcase the main value proposition of LongevityVerse */}
        <Hero data-title="Building the Longevity Community Together" data-subtitle="Maximizing the quality and purpose of life through a collaborative platform." />

        {/* Use the Problem component to highlight the key challenges that LongevityVerse addresses */}
        <Problem data-description="Fragmented longevity communities and the lack of centralized platforms for collaboration and prevention-focused information." />

        {/* Populate the FeaturesAccordion with unique selling points and features of LongevityVerse */}
        <FeaturesAccordion data-features={[
          "AI-driven Marketplace",
          "Peer-reviewed Longevity Insights",
          "Community and Networking",
          "Expert and Clinic Matching",
          "Product and Service Marketplace",
        ]} />

        {/* Adjust the Pricing component to reflect your subscription models or services */}
        <Pricing data-plans={[
          { name: "Basic", price: "Free", features: ["Access to basic resources", "Community access"] },
          { name: "Premium", price: "$29/month", features: ["Full resource library", "Expert consultations"] },
          // Add more plans as needed
        ]} />

        {/* Update the FAQ component with common questions about LongevityVerse */}
        <FAQ data-questions={[
          { question: "What is LongevityVerse?", answer: "A comprehensive platform for longevity enthusiasts to discover and engage with the latest in longevity science." },
          // Add more FAQs as needed
        ]} />

        {/* Customize the CTA with a clear call-to-action for your visitors */}
        <CTA data-text="Join our community and extend your life quality" data-buttonText="Get Started" data-buttonLink="/signup" />

      </main>
      {/* Make sure Footer contains the correct contact information and social links for LongevityVerse */}
      <Footer />
    </>
  );
}
