import React from 'react';
import LayoutClient from '../../components/LayoutClient';
import EducationItem from '../../components/EducationItem';  // Assuming it's also in 'components'

const EducationHub = () => {
  // This could be fetched from an API in the future
  const educationContent = {
    videos: [
      { id: 1, title: 'Introduction to Longevity', url: 'path-to-video' },
      // More videos...
    ],
    tutorials: [
      { id: 1, title: 'Best Practices for a Healthy Lifestyle', docUrl: 'path-to-document' },
      // More tutorials...
    ],
    documents: [
      { id: 1, title: 'Detailed Study on Aging', docUrl: 'path-to-document' },
      // More documents...
    ],
    quizzes: [
      { id: 1, title: 'Quiz on Longevity Basics', questions: [] as any[] },
      // More quizzes...
    ],
    podcasts: [
      { id: 1, title: 'Longevity and You: Episode 1', docUrl: 'path-to-podcast' },
      // More podcasts...
    ]
  };

  return (
    <LayoutClient>
      <div className="education-hub">
        <h1>Longevity Education Center</h1>
        {Object.entries(educationContent).map(([category, items]) => (
          <section key={category}>
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div className="items-grid">
              {items.map(item => (
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
