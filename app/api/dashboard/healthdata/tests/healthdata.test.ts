import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { POST, GET } from '../route';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";

jest.mock("@/libs/mongoose", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

describe('Health Data API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dashboard/healthdata', () => {
    it('should update health data for authenticated user', async () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          platform: 'appleHealth',
          data: { steps: 10000, heartRate: 70, sleepHours: 8 },
        },
      });

      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      
      (User.findOneAndUpdate as jest.MockedFunction<typeof User.findOneAndUpdate>).mockResolvedValue({
        email: 'test@example.com',
      } as any);

      const response = await POST(req as unknown as Request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ message: 'Health data updated successfully' });
    });

    it('should return 401 for unauthenticated user', async () => {
      const { req } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });

      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(null);

      const response = await POST(req as unknown as Request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /api/dashboard/healthdata', () => {
    it('should return health data for authenticated user', async () => {
      const mockHealthData = {
        appleHealth: { steps: 10000, heartRate: 70, sleepHours: 8 },
      };

      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      
      (User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue({
        healthData: mockHealthData,
      } as any);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockHealthData);
    });

    it('should return 401 for unauthenticated user', async () => {
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(null);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Unauthorized' });
    });
  });
});