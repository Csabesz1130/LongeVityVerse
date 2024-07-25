// File: components/UserProfile.tsx

import React, { useState } from 'react';
import { User } from '@/types';
import { subscribeUserToNewsletter } from '@/libs/beehiivIntegration';
import { Button } from '@/components/ui/Button';

interface UserProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isSubscribed, setIsSubscribed] = useState(user.isNewsletterSubscribed);

  const handleNewsletterSubscription = async () => {
    try {
      await subscribeUserToNewsletter(user.email, user.firstName, user.lastName);
      const updatedUser = { ...user, isNewsletterSubscribed: true };
      onUpdate(updatedUser);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
    }
  };

  return (
    <div>
      {/* Existing user profile fields */}
      <div>
        <h3>Longevity Newsletter</h3>
        {isSubscribed ? (
          <p>You are subscribed to our newsletter.</p>
        ) : (
          <Button onClick={handleNewsletterSubscription}>Subscribe to Newsletter</Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;