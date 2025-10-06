import Source from '@/lib/db/models/Source';

export async function verifySource(url: string) {
  const domain = new URL(url).hostname.replace('www.', '');
  
  let source = await Source.findOne({ domain });
  
  if (!source) {
    // Create new source with basic scoring
    const score = calculateCredibilityScore(domain);
    
    source = await Source.create({
      domain,
      name: domain,
      type: determineSourceType(domain),
      credibilityScore: score,
      peerReviewed: isPeerReviewed(domain),
      lastChecked: new Date(),
    });
  }

  return source;
}

function calculateCredibilityScore(domain: string): number {
  // High-trust domains
  const highTrust = [
    'nature.com', 'science.org', 'cell.com', 'thelancet.com',
    'nejm.org', 'bmj.com', 'jamanetwork.com', 'nih.gov',
    'who.int', 'cdc.gov', 'pubmed.ncbi.nlm.nih.gov',
  ];
  
  if (highTrust.some(d => domain.includes(d))) return 95;
  
  // Academic institutions
  if (domain.endsWith('.edu')) return 85;
  
  // Government sources
  if (domain.endsWith('.gov')) return 90;
  
  // Default score
  return 50;
}

function determineSourceType(domain: string): string {
  if (domain.includes('journal') || domain.endsWith('.edu')) return 'journal';
  if (domain.endsWith('.gov')) return 'institutional';
  if (domain.includes('news')) return 'news';
  if (domain.includes('blog')) return 'blog';
  return 'news';
}

function isPeerReviewed(domain: string): boolean {
  const peerReviewed = [
    'nature.com', 'science.org', 'cell.com', 'thelancet.com',
    'nejm.org', 'bmj.com', 'jamanetwork.com',
  ];
  
  return peerReviewed.some(d => domain.includes(d));
}
