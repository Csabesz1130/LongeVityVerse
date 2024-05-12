// Full example with getStaticProps included at the end of your page component file

import React from 'react';
import dynamic from 'next/dynamic';
import LayoutClient from '../../components/LayoutClient';

const EducationItem = dynamic(() => import('../../components/EducationItem'), {
  ssr: false
});

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface ContentItem {
  id: number;
  title: string;
  url?: string;
  docUrl?: string;
  questions?: Question[];
}

interface EducationContent {
  videos: ContentItem[];
  tutorials: ContentItem[];
  documents: ContentItem[];
  quizzes: ContentItem[];
  podcasts: ContentItem[];
}

const EducationHub = ({ educationContent }: { educationContent: EducationContent }) => {
  return (
    <LayoutClient>
      <div className="education-hub">
        <h1>Longevity Education Center</h1>
        {Object.entries(educationContent).map(([category, items]) => (
          <section key={category}>
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div className="items-grid">
              {items.map((item: ContentItem) => (
                <EducationItem key={item.id} item={item} type={category as 'videos' | 'tutorials' | 'documents' | 'quizzes' | 'podcasts'} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </LayoutClient>
  );
};

export default EducationHub;

// Assuming data-fetching from an API
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/education-content');
  const data = await res.json();

  return {
    props: {
      educationContent: data,
    },
    revalidate: 3600, // In seconds, will re-generate the page in the background if a new request comes in after 1 hour
  };
}
