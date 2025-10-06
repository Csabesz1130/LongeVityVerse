import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import User from '@/models/User';

export async function withOrganizationScope(
  request: NextRequest,
  handler: (req: NextRequest, orgId: string) => Promise<NextResponse>
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's organization
  const user = await User.findOne({ email: session.user.email });
  
  if (!user?.organization) {
    return NextResponse.json(
      { error: 'No organization assigned' },
      { status: 403 }
    );
  }

  // All queries in this request will be scoped to the organization
  return handler(request, user.organization.toString());
}
