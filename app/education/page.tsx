import React from 'react';
import { LayoutClient } from './LayoutClient';  // Adjust import path as necessary
import EducationItem from './EducationItem';    // A new component for individual items

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
      { id: 1, title: 'Quiz on Longevity Basics', questions: [] },
      // More quizzes...
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
                <EducationItem key={item.id} item={item} type={category} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </LayoutClient>
  );
};

export default EducationHub;
