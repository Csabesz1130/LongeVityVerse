import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { POST, GET } from '../route';
import connectToDatabase from "@/libs/mongoose";
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
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          platform: 'appleHealth',
          data: { steps: 10000, heartRate: 70, sleepHours: 8 },
        },
      });

      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      await POST(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Health data updated successfully' });
    });

    it('should return 401 for unauthenticated user', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      await POST(req as any, res as any);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /api/dashboard/healthdata', () => {
    it('should return health data for authenticated user', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      const mockHealthData = {
        appleHealth: { steps: 10000, heartRate: 70, sleepHours: 8 },
      };

      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
      (User.findOne as jest.Mock).mockResolvedValue({ healthData: mockHealthData });

      await GET(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockHealthData);
    });

    it('should return 401 for unauthenticated user', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      await GET(req as any, res as any);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
    });
  });
});