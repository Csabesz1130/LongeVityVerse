// components/Layout.tsx

import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1>LongevityVerse Marketplace</h1>
      </header>
      <main className="flex-1 p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2024 LongevityVerse
      </footer>
    </div>
  );
};

export default Layout;
