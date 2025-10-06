import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  website: String,
  createdAt: Date,
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedOrganizations(options: SeedOptions) {
  const organizations = [
    { name: 'LongevityVerse', type: 'platform', description: 'Main platform organization', website: 'https://longevityverse.com' },
  ];

  if (!options.minimal) {
    organizations.push(
      { name: 'Longevity Research Institute', type: 'research', description: 'Leading research organization in longevity science', website: 'https://longevity-research.org' },
      { name: 'HealthSpan Clinic', type: 'clinic', description: 'Specialized longevity medical clinic', website: 'https://healthspan-clinic.com' },
      { name: 'Vitality Wellness Center', type: 'wellness', description: 'Holistic wellness and longevity center', website: 'https://vitality-wellness.com' }
    );
  }

  const created: any[] = [];
  for (const org of organizations) {
    const doc = await Organization.create({ ...org, createdAt: new Date() });
    created.push(doc);
  }
  return created;
}


