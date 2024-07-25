// File: libs/beehiivIntegration.ts

import axios from 'axios';

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

export const beehiivApi = axios.create({  
  baseURL: 'https://api.beehiiv.com/v2',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BEEHIIV_API_KEY}`
  }
});

export const subscribeUserToNewsletter = async (email: string, firstName?: string, lastName?: string) => {
  try {
    const response = await beehiivApi.post(`/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      email,
      first_name: firstName,
      last_name: lastName,
      reactivate_existing: true
    });
    return response.data;
  } catch (error) {
    console.error('Error subscribing user to Beehiiv:', error);
    throw error;
  }
};

export const getLatestNewsletterIssue = async () => {
  try {
    const response = await beehiiv.get(`/publications/${BEEHIIV_PUBLICATION_ID}/posts?status=published&limit=1`);
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching latest newsletter from Beehiiv:', error);
    throw error;
  }
};