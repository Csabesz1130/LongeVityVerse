// File: components/LongevityNewsletter.tsx

import React, { useEffect, useState } from 'react';
import { getLatestNewsletterIssue } from '@/libs/beehiivIntegration';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const LongevityNewsletter: React.FC = () => {
  const [latestIssue, setLatestIssue] = useState<any>(null);

  useEffect(() => {
    const fetchLatestIssue = async () => {
      try {
        const issue = await getLatestNewsletterIssue();
        setLatestIssue(issue);
      } catch (error) {
        console.error('Failed to fetch latest newsletter:', error);
      }
    };

    fetchLatestIssue();
  }, []);

  if (!latestIssue) return <div>Loading newsletter...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Longevity Newsletter</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-bold mb-4">{latestIssue.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: latestIssue.preview_html }} />
        <a href={latestIssue.web_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          Read full newsletter
        </a>
      </CardContent>
    </Card>
  );
};

export default LongevityNewsletter;