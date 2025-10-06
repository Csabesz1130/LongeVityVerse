'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReviewCriteria {
  scientificAccuracy: number;
  relevanceToLongevity: number;
  clarity: number;
  citations: number;
  novelty: number;
}

export default function ReviewForm({ contentId }: { contentId: string }) {
  const [criteria, setCriteria] = useState<ReviewCriteria>({
    scientificAccuracy: 0,
    relevanceToLongevity: 0,
    clarity: 0,
    citations: 0,
    novelty: 0,
  });
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(['']);
  const [status, setStatus] = useState<'approved' | 'rejected' | 'revision_requested'>('approved');

  const handleSubmit = async () => {
    const response = await fetch(`/api/content/${contentId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criteria,
        comments,
        suggestions: suggestions.filter(s => s.trim()),
        status,
        requiresRevision: status === 'revision_requested',
      }),
    });

    if (response.ok) {
      alert('Review submitted successfully!');
    }
  };

  const totalScore = Object.values(criteria).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Criteria Sliders */}
          {Object.entries(criteria).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()} (0-20)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={value}
                onChange={(e) =>
                  setCriteria({ ...criteria, [key]: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-sm text-gray-500">{value}/20</span>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-lg font-semibold">
              Total Score: {totalScore}/100
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  totalScore >= 80 ? 'bg-green-500' :
                  totalScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${totalScore}%` }}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-32 p-2 border rounded"
              placeholder="Provide detailed feedback..."
            />
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggestions for Improvement</label>
            {suggestions.map((suggestion, idx) => (
              <input
                key={idx}
                type="text"
                value={suggestion}
                onChange={(e) => {
                  const newSuggestions = [...suggestions];
                  newSuggestions[idx] = e.target.value;
                  setSuggestions(newSuggestions);
                }}
                className="w-full p-2 border rounded"
                placeholder={`Suggestion ${idx + 1}`}
              />
            ))}
            <Button
              onClick={() => setSuggestions([...suggestions, ''])}
              variant="outline"
              size="sm"
            >
              + Add Suggestion
            </Button>
          </div>

          {/* Decision */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Decision</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="approved">Approve</option>
              <option value="revision_requested">Request Revision</option>
              <option value="rejected">Reject</option>
            </select>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
