import Reviewer from '@/lib/db/models/Reviewer';

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedReviewers(options: SeedOptions, users: any[]) {
  const reviewers: any[] = [];
  const reviewerUsers = users.filter((u: any) => u.role === 'reviewer');
  for (const user of reviewerUsers) {
    const reviewer = await Reviewer.create({
      userId: user._id,
      expertise: ['longevity', 'aging', 'nutrition', 'exercise'][Math.floor(Math.random() * 4)],
      credentials: [
        { degree: 'PhD', institution: 'Stanford University', yearCompleted: 2015 },
        { degree: 'MD', institution: 'Harvard Medical School', yearCompleted: 2010 },
      ],
      publications: [
        { title: 'The Role of NAD+ in Cellular Aging', journal: 'Nature Aging', year: 2022, doi: '10.1038/s43587-022-00001-1' },
      ],
      availability: true,
      maxReviewsPerMonth: 10,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    });
    reviewers.push(reviewer);
  }
  return reviewers;
}


