import React from 'react';

// Define types for the education content
interface EducationContent {
  id: number;
  title: string;
  content: string;
}

// Define props for the EducationHub component
interface EducationHubProps {
  data: EducationContent[];
}

// Component to display education content
const EducationHub: React.FC<EducationHubProps> = ({ data }) => {
  return (
    <div>
      <h1>Education Hub</h1>
      {/* Render your education content */}
      {data.map((item: EducationContent, index: number) => (
        <div key={index}>
          <h2>{item.title}</h2>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  );
};

// Fetching data within the Page component
const Page: React.FC = async () => {
  const res = await fetch('https://api.example.com/education-content');
  const data: EducationContent[] = await res.json();
  
  return <EducationHub data={data} />;
};

export default Page;
