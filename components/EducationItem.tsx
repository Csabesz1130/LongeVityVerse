import React from 'react';

interface ItemProps {
  id: number;
  title: string;
  url?: string;
  docUrl?: string;
}

interface EducationItemProps {
  item: ItemProps;
  type: 'videos' | 'tutorials' | 'documents' | 'quizzes' | 'podcasts';
}

const EducationItem: React.FC<EducationItemProps> = ({ item, type }) => {
  const startQuiz = (id: number) => {
    // Logic to start the quiz
    console.log(`Starting quiz with ID: ${id}`);
  };

  const renderContent = () => {
    switch (type) {
      case 'videos':
        return <video controls src={item.url}>{item.title}</video>;
      case 'tutorials':
      case 'podcasts':
      case 'documents':
        return <a href={item.docUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>;
      case 'quizzes':
        return <button onClick={() => startQuiz(item.id)}>{item.title}</button>;
      default:
        return <span>Unknown Type</span>;
    }
  };

  return (
    <div className="education-item">
      <h3>{item.title}</h3>
      {renderContent()}
    </div>
  );
};

export default EducationItem;
