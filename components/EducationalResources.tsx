// File: components/EducationalResources.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';
import DashboardApi from '@/libs/dashboardApi';
import { EducationalResource } from '@/types';

// interface Resource { // TODO: Remove if not needed
//   id: string;
//   title: string;
//   description: string;
//   type: 'article' | 'video' | 'podcast';
//   difficulty: 'beginner' | 'intermediate' | 'advanced';
//   url: string;
//   isSaved: boolean;
//   rating: number;
// }

interface EducationalResourcesProps {
    resources: EducationalResource[];
  }  

  const EducationalResources: React.FC<EducationalResourcesProps> = ({ resources: initialResources }) => {
    const [resources, setResources] = useState<EducationalResource[]>(initialResources);
    const [filteredResources, setFilteredResources] = useState<EducationalResource[]>(initialResources);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    const fetchResources = async () => {
      const data = await DashboardApi.getEducationalResources();
      setResources(data);
      setFilteredResources(data);
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const filtered = resources.filter(resource => 
      (typeFilter === 'all' || resource.type === typeFilter) &&
      (difficultyFilter === 'all' || resource.difficulty === difficultyFilter)
    );
    setFilteredResources(filtered);
  }, [typeFilter, difficultyFilter, resources]);

  const handleSave = async (id: string) => {
    await DashboardApi.saveResource(id);
    setResources(resources.map(r => r.id === id ? {...r, isSaved: !r.isSaved} : r));
  };

  const handleRate = async (id: string, rating: number) => {
    await DashboardApi.rateResource(id, rating);
    setResources(resources.map(r => r.id === id ? {...r, rating} : r));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educational Resources</CardTitle>
        <div className="flex gap-4">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <SelectOption value="all">All Types</SelectOption>
            <SelectOption value="article">Articles</SelectOption>
            <SelectOption value="video">Videos</SelectOption>
            <SelectOption value="podcast">Podcasts</SelectOption>
          </Select>
          <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <SelectOption value="all">All Levels</SelectOption>
            <SelectOption value="beginner">Beginner</SelectOption>
            <SelectOption value="intermediate">Intermediate</SelectOption>
            <SelectOption value="advanced">Advanced</SelectOption>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredResources.map((resource) => (
          <div key={resource.id} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{resource.title}</h3>
            <p className="text-sm text-gray-600">{resource.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="mr-2">{resource.type}</span>
                <span>{resource.difficulty}</span>
              </div>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => handleSave(resource.id)}
                  className="mr-2"
                >
                  {resource.isSaved ? 'Unsave' : 'Save for Later'}
                </Button>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`cursor-pointer ${star <= resource.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => handleRate(resource.id, star)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EducationalResources;