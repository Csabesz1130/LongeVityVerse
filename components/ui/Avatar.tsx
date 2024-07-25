// File: components/ui/Avatar.tsx

import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback }) => {
  return (
    <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
      {src ? (
        <img className="w-full h-full object-cover" src={src} alt={alt} />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600">
          {fallback}
        </div>
      )}
    </div>
  );
};

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img {...props} className="w-full h-full object-cover" />
);

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600">
    {children}
  </div>
);